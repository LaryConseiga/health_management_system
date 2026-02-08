const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/availability', verifyToken, authController.updateAvailability);

router.get('/doctors', authController.getDoctors);

module.exports = router;
