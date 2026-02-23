// File: backend/server.js
const express = require('express');
const cors = require('cors');
require('./config/db'); // Cukup memanggil untuk memastikan koneksi berjalan
const stockRoutes = require('./routes/stockRoutes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Menggunakan Routes yang sudah kita buat
// Semua endpoint di stockRoutes akan diawali dengan '/api'
app.use('/api', stockRoutes); 
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server menyala di http://localhost:${PORT}`);
});