// File: backend/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// RAHASIA NEGARA: Kunci untuk membuat dan memvalidasi token JWT
// Di dunia nyata, ini disimpan di file .env yang tidak boleh bocor.
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// 1. REGISTER (Membuat User Baru)
const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: "Data tidak lengkap!" });
        }

        // Mengecek apakah username sudah dipakai
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "Username sudah terdaftar!" });
        }

        // HASHING: Mengacak password sebelum disimpan ke database
        const salt = await bcrypt.genSalt(10); // Tingkat kerumitan acakan
        const hashedPassword = await bcrypt.hash(password, salt);

        // Menyimpan user ke database dengan password yang sudah diacak
        const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
        const result = await pool.query(query, [username, hashedPassword, role]);

        res.status(201).json({ message: "User berhasil dibuat!", user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mendaftar" });
    }
};

// 2. LOGIN (Mendapatkan Token)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari user di database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Username atau password salah!" }); // 401 = Unauthorized
        }

        const user = result.rows[0];

        // VERIFIKASI: Bandingkan password input dengan password acak di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Username atau password salah!" });
        }

        // MEMBUAT TOKEN (Gelang Tiket)
        // Kita menyelipkan ID dan Role pengguna ke dalam token ini
        const payload = {
            id: user.id,
            role: user.role
        };

        // Token ini akan kadaluarsa dalam 1 hari
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        // Kirim token ke frontend
        res.json({ 
            message: "Login berhasil!", 
            token: token,
            user: { username: user.username, role: user.role }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal login" });
    }
};

// 3. MENGAMBIL DAFTAR USER (Khusus Admin)
const getUsers = async (req, res) => {
    try {
        // Konsep Keamanan: Kita HANYA mengambil id, username, dan role. 
        // JANGAN PERNAH melakukan 'SELECT *' yang akan ikut mengirimkan password hash ke Frontend!
        const query = 'SELECT id, username, role, created_at FROM users ORDER BY id ASC';
        const result = await pool.query(query);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengambil data pengguna" });
    }
};

// 4. MENGUBAH PASSWORD (Untuk semua user yang sudah login)
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // req.user.id ini didapatkan dari Satpam (verifyToken middleware)
        const userId = req.user.id; 

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Password lama dan baru wajib diisi!" });
        }

        // 1. Ambil data user dari database berdasarkan ID
        const userQuery = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan!" });
        }

        const user = userQuery.rows[0];

        // 2. Verifikasi kecocokan password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Password lama salah!" });
        }

        // 3. Acak (Hash) password baru
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update database dengan password baru
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

        res.json({ message: "Password berhasil diperbarui!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengubah password" });
    }
};

module.exports = { register, login, getUsers, changePassword, JWT_SECRET };