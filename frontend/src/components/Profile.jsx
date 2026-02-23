// File: src/components/Profile.jsx
import { useState } from 'react';

function Profile({ token, userRole }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Mengambil username dari memori browser untuk ditampilkan
    const username = localStorage.getItem('username');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                setOldPassword(''); // Kosongkan inputan jika sukses
                setNewPassword('');
            } else {
                alert(`Gagal: ${data.error}`);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Terjadi kesalahan sistem.");
        }
    };

    return (
        <div>
            <h3>⚙️ Pengaturan Akun</h3>
            <div style={{ background: '#e3f2fd', padding: '10px 15px', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' }}>
                <p style={{ margin: 0 }}>Profil Anda: <b>{username}</b> | Akses: <b>{userRole.toUpperCase()}</b></p>
            </div>

            <form onSubmit={handleChangePassword} className="form-group" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', flexDirection: 'column', maxWidth: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Ubah Password</h4>
                <input 
                    type="password" 
                    placeholder="Password Lama" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password Baru" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength="3"
                />
                <button type="submit" style={{ background: '#FF9800', marginTop: '10px' }}>
                    Simpan Password Baru
                </button>
            </form>
        </div>
    );
}

export default Profile;