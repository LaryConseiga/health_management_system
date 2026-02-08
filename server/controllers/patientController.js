const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');

exports.createPatient = async (req, res) => {
    try {
        const patientData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            gender: req.body.gender,
            contact: req.body.contact,
            address: req.body.address || '',
            medicalHistory: req.body.medicalHistory ? 
                (Array.isArray(req.body.medicalHistory) ? req.body.medicalHistory : 
                 req.body.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)) : [],
            assignedDoctor: req.body.assignedDoctor || null
        };

        // Gérer les fichiers uploadés
        if (req.files && req.files.length > 0) {
            patientData.documents = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: `/uploads/${file.filename}`
            }));
        }

        const newPatient = new Patient(patientData);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        // Supprimer les fichiers uploadés en cas d'erreur
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '../uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const patientData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            gender: req.body.gender,
            contact: req.body.contact,
            address: req.body.address || '',
            medicalHistory: req.body.medicalHistory ? 
                (Array.isArray(req.body.medicalHistory) ? req.body.medicalHistory : 
                 req.body.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)) : [],
            assignedDoctor: req.body.assignedDoctor || null
        };

        // Récupérer le patient existant pour conserver les documents
        const existingPatient = await Patient.findById(req.params.id);
        if (!existingPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Ajouter les nouveaux fichiers aux documents existants
        if (req.files && req.files.length > 0) {
            const newDocuments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: `/uploads/${file.filename}`
            }));
            patientData.documents = [...(existingPatient.documents || []), ...newDocuments];
        } else {
            patientData.documents = existingPatient.documents || [];
        }

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, patientData, { new: true });
        res.json(updatedPatient);
    } catch (err) {
        // Supprimer les fichiers uploadés en cas d'erreur
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '../uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.addDocuments = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Ajouter les nouveaux fichiers aux documents existants
        if (req.files && req.files.length > 0) {
            const newDocuments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: `/uploads/${file.filename}`
            }));
            
            patient.documents = [...(patient.documents || []), ...newDocuments];
            await patient.save();
            
            res.json({ 
                message: 'Documents ajoutés avec succès',
                patient: patient 
            });
        } else {
            res.status(400).json({ message: 'Aucun fichier fourni' });
        }
    } catch (err) {
        // Supprimer les fichiers uploadés en cas d'erreur
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '../uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.addConsultationNotes = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const { notes, diagnosis, prescription, followUpDate } = req.body;
        
        if (!notes) {
            return res.status(400).json({ message: 'Les notes de consultation sont requises' });
        }

        const consultationNote = {
            date: new Date(),
            doctor: req.user.id, // ID du docteur depuis le token
            notes: notes,
            diagnosis: diagnosis || '',
            prescription: prescription || '',
            followUpDate: followUpDate ? new Date(followUpDate) : null
        };

        patient.consultationNotes = [...(patient.consultationNotes || []), consultationNote];
        await patient.save();

        res.json({ 
            message: 'Notes de consultation ajoutées avec succès',
            patient: patient 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyInfo = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user.id }).populate('consultationNotes.doctor', 'name');
        if (!patient) return res.status(404).json({ message: 'Patient record not found' });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
