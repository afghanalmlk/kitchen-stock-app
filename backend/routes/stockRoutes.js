// File: backend/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { getStock, addIngredient, addTransaction, deleteIngredient } = require('../controllers/stockController');

// Import Middleware Satpam
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ATURAN AKSES:
// 1. Semua rute di bawah ini WAJIB pakai verifyToken (harus login).
// 2. Rute Tambah Bahan dan Hapus Bahan WAJIB pakai isAdmin (harus Admin).

router.get('/ingredients', verifyToken, getStock); 
router.post('/ingredients', verifyToken, isAdmin, addIngredient); 
router.delete('/ingredients/:id', verifyToken, isAdmin, deleteIngredient); 
router.post('/transactions', verifyToken, addTransaction); // Staff boleh akses ini

module.exports = router;