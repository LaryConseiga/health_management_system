const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    age: { type: Number, required: false, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false, default: null },
    contact: { type: String, required: false, default: '' },
    address: { type: String },
    medicalHistory: [{ type: String }],
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [{ 
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],
    consultationNotes: [{
        date: { type: Date, default: Date.now },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String, required: true },
        diagnosis: { type: String },
        prescription: { type: String },
        followUpDate: { type: Date }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
