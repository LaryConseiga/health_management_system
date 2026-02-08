const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
    try {
        // If the requester is a patient, set the patient field from their linked Patient document
        const payload = { ...req.body };
        if (req.user && req.user.role === 'patient') {
            const Patient = require('../models/Patient');
            const patientRecord = await Patient.findOne({ user: req.user.id });
            if (!patientRecord) return res.status(404).json({ message: 'Patient record not found' });
            payload.patient = patientRecord._id;
        }
        // map doctorId -> doctor field if provided
        if (payload.doctorId) {
            payload.doctor = payload.doctorId;
            delete payload.doctorId;
        }
        const newAppointment = new Appointment(payload);
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        // If patient, return only their appointments
        let query = {};
        if (req.user && req.user.role === 'patient') {
            const Patient = require('../models/Patient');
            const patientRecord = await Patient.findOne({ user: req.user.id });
            if (!patientRecord) return res.status(404).json({ message: 'Patient record not found' });
            query.patient = patientRecord._id;
        }
        const appointments = await Appointment.find(query).populate('patient').populate('doctor');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
