const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, role, name, specialty } = req.body;
        if (!username || !password || !name) {
            return res.status(400).json({ message: 'Champs requis manquants (username, password, name).' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role, name, specialty });
        await newUser.save();
        // If the user is a patient, create a Patient document linked to this user
        if (role === 'patient') {
            const Patient = require('../models/Patient');
            const patientData = {
                name,
                user: newUser._id,
                contact: username,
                age: req.body.age || null,
                gender: req.body.gender || null,
                address: req.body.address || ''
            };
            const newPatient = new Patient(patientData);
            await newPatient.save();
        }
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        // Duplicate key (unique username) safety net
        if (err && err.code === 11000) {
            return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé." });
        }
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Champs requis manquants (username, password).' });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET manquant côté serveur (fichier .env).' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username, role: user.role, name: user.name, specialty: user.specialty } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('_id name specialty availability');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;
        const userId = req.user.id;

        if (!availability) {
            return res.status(400).json({ message: 'Availability data is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { availability },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Availability updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};