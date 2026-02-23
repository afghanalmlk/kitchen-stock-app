// File: src/App.jsx (Pastikan import Dashboard ditambahkan di atas)
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // TAMBAHKAN IMPORT INI

function App() {
    // ... (kode state dan handleLogin tetap sama persis) ...
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);
    const [username, setUsername] = useState(localStorage.getItem('username') || null);

    const handleLoginSuccess = (newToken, newRole, newUsername) => {
        setToken(newToken); setUserRole(newRole); setUsername(newUsername);
    };

    const handleLogout = () => {
        localStorage.clear();
        setToken(null); setUserRole(null); setUsername(null);
    };

    if (!token) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
                <h2>👨‍🍳 Sistem Manajemen Stok Dapur</h2>
                <div>
                    <span style={{ fontWeight: 'bold', marginRight: '15px' }}>
                        Halo, {username} ({userRole})
                    </span>
                    <button onClick={handleLogout} style={{ backgroundColor: 'var(--danger)' }}>
                        Logout
                    </button>
                </div>
            </div>
            
            {/* KITA PANGGIL KOMPONEN DASHBOARD DI SINI */}
            {/* Kita meminjamkan (passing props) token dan userRole agar Dashboard bisa bekerja */}
            <Dashboard token={token} userRole={userRole} />
            
        </div>
    );
}

export default App;