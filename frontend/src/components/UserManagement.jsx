// File: src/components/UserManagement.jsx
import { useState, useEffect } from 'react';

function UserManagement({ token }) {
    const [users, setUsers] = useState([]);
    const [regUser, setRegUser] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regRole, setRegRole] = useState('staff');

    const API_URL = 'http://localhost:3000/api';

    // Helper untuk Fetch
    const fetchWithAuth = async (url, options = {}) => {
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['Content-Type'] = 'application/json';
        const response = await fetch(url, options);
        return response;
    };

    // Mengambil data user saat komponen pertama dimunculkan
    const fetchUsers = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/auth/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Fungsi Mendaftarkan Staff Baru
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`${API_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ username: regUser, password: regPass, role: regRole })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("Berhasil mendaftarkan pengguna baru!");
                setRegUser(''); setRegPass(''); // Kosongkan form
                fetchUsers(); // Refresh tabel user
            } else {
                alert(`Gagal: ${data.error}`);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <h3>➕ Daftarkan Akses Pegawai Baru</h3>
            <form onSubmit={handleRegister} className="form-group" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <input type="text" placeholder="Username Pegawai" value={regUser} onChange={(e) => setRegUser(e.target.value)} required />
                <input type="password" placeholder="Password Sementara" value={regPass} onChange={(e) => setRegPass(e.target.value)} required />
                <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                    <option value="staff">Staff (Hanya Input Transaksi)</option>
                    <option value="admin">Admin (Hak Akses Penuh)</option>
                </select>
                <button type="submit" style={{ background: '#2196F3' }}>Buat Akun</button>
            </form>

            <hr style={{ margin: '30px 0', border: '1px solid #eee' }} />

            <h3>📋 Daftar Pengguna Sistem</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role Akses</th>
                        <th>Tanggal Terdaftar</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td><b>{u.username}</b></td>
                            <td>
                                <span style={{ 
                                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: 'white',
                                    background: u.role === 'admin' ? 'var(--danger)' : '#2196F3' 
                                }}>
                                    {u.role.toUpperCase()}
                                </span>
                            </td>
                            <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagement;