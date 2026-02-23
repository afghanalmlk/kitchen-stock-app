// File: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

// Satpam 1: Mengecek apakah user punya tiket (Token) yang sah
const verifyToken = (req, res, next) => {
    // Mengambil token dari header request (format standar: "Bearer <token>")
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: "Akses ditolak! Token tidak ditemukan." });
    }

    // Memisahkan kata "Bearer" dan mengambil token aslinya
    const token = authHeader.split(' ')[1];

    try {
        // Memverifikasi keaslian token menggunakan kunci rahasia
        const verified = jwt.verify(token, JWT_SECRET);
        
        // Menyisipkan data user (id dan role) ke dalam request
        req.user = verified; 
        
        // Mempersilakan request lanjut ke Controller
        next(); 
    } catch (err) {
        res.status(400).json({ error: "Token tidak valid atau sudah kadaluarsa!" });
    }
};

// Satpam 2: Mengecek apakah user adalah Admin
const isAdmin = (req, res, next) => {
    // Kita asumsikan verifyToken sudah dijalankan sebelumnya
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Akses ditolak! Hanya Admin yang boleh melakukan ini." });
    }
    next();
};

module.exports = { verifyToken, isAdmin };