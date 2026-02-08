const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(verifyToken);

router.post('/',
    authorizeRoles('admin', 'doctor', 'staff'),
    upload.array('documents', 10), // Permet jusqu'à 10 fichiers avec le nom de champ 'documents'
    patientController.createPatient
);
router.get('/', authorizeRoles('admin', 'doctor', 'staff'), patientController.getPatients);
router.get('/:id', authorizeRoles('admin', 'doctor', 'staff'), patientController.getPatientById);
router.put('/:id',
    authorizeRoles('admin', 'doctor'),
    upload.array('documents', 10),
    patientController.updatePatient
);
router.post('/:id/documents',
    authorizeRoles('admin', 'doctor', 'staff'),
    upload.array('documents', 10),
    patientController.addDocuments
);
router.post('/:id/consultation-notes',
    authorizeRoles('doctor', 'admin'),
    patientController.addConsultationNotes
);
router.delete('/:id', authorizeRoles('admin'), patientController.deletePatient);

module.exports = router;
