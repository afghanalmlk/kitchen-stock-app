// File: backend/config/db.js
require('dotenv').config(); // Memanggil dotenv
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Wajib untuk koneksi cloud seperti Neon
    }
});

pool.connect((err, client, release) => {
    if (err) return console.error('Gagal terkoneksi ke cloud database:', err.stack);
    console.log('Berhasil terkoneksi ke Cloud Database Neon!');
    release();
});

module.exports = pool;