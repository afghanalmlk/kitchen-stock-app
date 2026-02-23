// File: backend/controllers/stockController.js
const pool = require('../config/db');

// 1. Mengambil semua bahan beserta kalkulasi stok saat ini
const getStock = async (req, res) => {
    try {
        // Konsep: Kita menghitung stok secara dinamis dari riwayat transaksi.
        // Jika 'IN' maka ditambah, jika 'OUT' maka dikurang.
        const query = `
            SELECT i.id, i.name, i.unit, i.min_stock,
                   COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.quantity ELSE -t.quantity END), 0) AS current_stock
            FROM ingredients i
            LEFT JOIN transactions t ON i.id = t.ingredient_id
            GROUP BY i.id
            ORDER BY i.name;
        `;
        const result = await pool.query(query);
        res.json(result.rows); // Mengirim data ke frontend dalam bentuk JSON
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
};

// 2. Menambah bahan baku baru
const addIngredient = async (req, res) => {
    try {
        const { name, unit, min_stock } = req.body; // Mengambil data yang dikirim frontend
        
        // Validasi dasar
        if (!name || !unit) {
            return res.status(400).json({ error: "Nama dan unit wajib diisi!" });
        }

        // Konsep: Menggunakan $1, $2 (Parameterized Query) SANGAT WAJIB
        // Ini untuk mencegah serangan hacker bernama SQL Injection.
        const query = 'INSERT INTO ingredients (name, unit, min_stock) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [name, unit, min_stock || 0]);
        
        res.status(201).json(result.rows[0]); // 201 artinya "Created" (Berhasil dibuat)
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menambah bahan" });
    }
};

// 3. Menambah transaksi (Stok Masuk / Keluar)
const addTransaction = async (req, res) => {
    try {
        const { ingredient_id, type, quantity } = req.body;

        // Validasi
        if (!ingredient_id || !type || !quantity) {
            return res.status(400).json({ error: "Data transaksi tidak lengkap!" });
        }
        if (type !== 'IN' && type !== 'OUT') {
            return res.status(400).json({ error: "Tipe transaksi harus IN atau OUT!" });
        }

        const query = 'INSERT INTO transactions (ingredient_id, type, quantity) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [ingredient_id, type, quantity]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mencatat transaksi" });
    }
};

// 4. Menghapus bahan (DELETE)
const deleteIngredient = async (req, res) => {
    try {
        // Mengambil ID dari parameter URL (misal: /ingredients/5, maka id = 5)
        const { id } = req.params; 

        // Eksekusi query hapus
        const query = 'DELETE FROM ingredients WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        // Cek apakah bahan yang mau dihapus itu ada
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bahan tidak ditemukan" });
        }

        res.json({ message: "Bahan dan seluruh riwayat transaksinya berhasil dihapus!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menghapus bahan" });
    }
};
// Mengekspor fungsi agar bisa digunakan di file lain
module.exports = { getStock, addIngredient, addTransaction, deleteIngredient };