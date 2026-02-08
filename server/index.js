const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Servir les fichiers uploads de manière statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
let mongoServer;

const connectDB = async () => {
  try {
    // Pour le développement, utiliser MongoDB en mémoire
    if (process.env.NODE_ENV !== 'production') {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB (Memory) Connected');
    } else {
      // En production, utiliser la connexion Atlas
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms_db');
      console.log('MongoDB Connected');
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));

app.get('/', (req, res) => {
  res.send('Healthcare Management System API');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
