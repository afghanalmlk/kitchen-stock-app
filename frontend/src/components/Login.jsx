// File: src/components/Login.jsx
import { useState } from 'react';

// Komponen Login menerima 'props' bernama onLoginSuccess dari App.jsx
function Login({ onLoginSuccess }) {
    // State untuk menyimpan ketikan user di form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Mencegah browser refresh
        setErrorMsg(''); // Reset pesan error sebelum mencoba login

        try {
            // Kita tembak API backend yang masih setia menyala di port 3000
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();

            if (response.ok) {
                // 1. Simpan token ke brankas browser (localStorage)
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('username', data.user.username);
                
                // 2. Lapor ke App.jsx bahwa login sukses, sekalian kirim datanya!
                onLoginSuccess(data.token, data.user.role, data.user.username);
            } else {
                // Jika gagal (misal salah password), tampilkan pesan error dari backend
                setErrorMsg(data.error);
            }
        } catch (err) {
            setErrorMsg("Gagal terhubung ke server backend. Pastikan server Node.js menyala.");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }} className="container">
            <h2>🔐 Gerbang Dapur</h2>
            
            {/* Conditional Rendering: Tampilkan tag <p> ini HANYA JIKA ada errorMsg */}
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            
            <form onSubmit={handleLogin} className="form-group" style={{ flexDirection: 'column' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} // Mengikat ketikan ke state
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                />
                <button type="submit" style={{ width: '100%' }}>Masuk</button>
            </form>
        </div>
    );
}

export default Login;