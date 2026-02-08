const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    available: { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor', 'staff', 'patient'], default: 'staff' },
    name: { type: String, required: true },
    specialty: { type: String, default: null },
    availability: {
        Monday: daySchema,
        Tuesday: daySchema,
        Wednesday: daySchema,
        Thursday: daySchema,
        Friday: daySchema,
        Saturday: daySchema,
        Sunday: daySchema
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
