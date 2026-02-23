// File: backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getUsers, changePassword } = require('../controllers/authController');

// Import Satpam kita!
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ATURAN BARU:
// Rute login tetap publik (siapa saja boleh mencoba masuk ke pintu depan)
router.post('/login', login);       
router.post('/register', verifyToken, isAdmin, register); 
router.get('/users', verifyToken, isAdmin, getUsers);

router.put('/change-password', verifyToken, changePassword);

module.exports = router;