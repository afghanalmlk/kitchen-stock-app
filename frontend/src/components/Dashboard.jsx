// File: src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import Profile from './Profile'; // IMPORT KOMPONEN PROFIL

function Dashboard({ token, userRole }) {
    // STATE BARU: Untuk mengatur tab mana yang sedang aktif
    const [activeTab, setActiveTab] = useState('stock'); // Defaultnya selalu di menu stok

    // ... (Semua state bahan dan transaksi TETAP SAMA seperti sebelumnya) ...
    const [ingredients, setIngredients] = useState([]);
    const [ingName, setIngName] = useState('');
    const [ingUnit, setIngUnit] = useState('');
    const [ingMinStock, setIngMinStock] = useState('');
    const [transIngredient, setTransIngredient] = useState('');
    const [transType, setTransType] = useState('IN');
    const [transQty, setTransQty] = useState('');

    const API_URL = 'http://localhost:3000/api';

    // ... (Fungsi fetchWithAuth, fetchStockData, handleAddIngredient, handleAddTransaction, handleDelete TETAP SAMA) ...
    const fetchWithAuth = async (url, options = {}) => {
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['Content-Type'] = 'application/json';
        const response = await fetch(url, options);
        if (response.status === 401 || response.status === 403) {
            alert("Akses ditolak atau sesi habis."); throw new Error('Unauthorized');
        }
        return response;
    };

    const fetchStockData = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/ingredients`);
            setIngredients(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchStockData(); }, []);

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth(`${API_URL}/ingredients`, {
                method: 'POST', body: JSON.stringify({ name: ingName, unit: ingUnit, min_stock: ingMinStock })
            });
            setIngName(''); setIngUnit(''); setIngMinStock(''); fetchStockData();
        } catch (err) { console.error(err); }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth(`${API_URL}/transactions`, {
                method: 'POST', body: JSON.stringify({ ingredient_id: transIngredient, type: transType, quantity: transQty })
            });
            setTransQty(''); fetchStockData();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin hapus?")) {
            await fetchWithAuth(`${API_URL}/ingredients/${id}`, { method: 'DELETE' });
            fetchStockData();
        }
    };

    return (
        <div>
            {/* AREA MENU TAB NAVIGASI (Sekarang muncul untuk semua user) */}
            <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('stock')} 
                    style={{ background: activeTab === 'stock' ? 'var(--primary)' : '#95a5a6' }}
                >
                    📦 Menu Stok
                </button>
                
                {/* Tombol Profil untuk Semua User */}
                <button 
                    onClick={() => setActiveTab('profile')} 
                    style={{ background: activeTab === 'profile' ? '#FF9800' : '#95a5a6' }}
                >
                    ⚙️ Profil Saya
                </button>

                {/* Tombol Users HANYA untuk Admin */}
                {userRole === 'admin' && (
                    <button 
                        onClick={() => setActiveTab('users')} 
                        style={{ background: activeTab === 'users' ? 'var(--danger)' : '#95a5a6' }}
                    >
                        👥 Kelola Pengguna
                    </button>
                )}
            </div>

            {/* CONDITIONAL RENDERING LAYAR BERDASARKAN TAB */}
            {activeTab === 'profile' ? (
                <Profile token={token} userRole={userRole} />
            ) : activeTab === 'users' && userRole === 'admin' ? (
                <UserManagement token={token} />
            ) : (
                // JIKA BUKAN TAB PENGGUNA (ATAU JIKA STAFF), RENDER MENU STOK SEPERTI BIASA
                <div>
                    {userRole === 'admin' && (
                        <div>
                            <h3>Tambah Bahan Masakan Baru (Khusus Admin)</h3>
                            <form onSubmit={handleAddIngredient} className="form-group">
                                <input type="text" placeholder="Nama Bahan" value={ingName} onChange={(e) => setIngName(e.target.value)} required />
                                <input type="text" placeholder="Satuan" value={ingUnit} onChange={(e) => setIngUnit(e.target.value)} required />
                                <input type="number" placeholder="Min Stok" value={ingMinStock} onChange={(e) => setIngMinStock(e.target.value)} required min="0" />
                                <button type="submit">+ Tambah Bahan</button>
                            </form>
                            <hr style={{ border: '1px solid #eee', margin: '30px 0' }} />
                        </div>
                    )}

                    <h3>Catat Barang Masuk / Keluar</h3>
                    <form onSubmit={handleAddTransaction} className="form-group">
                        <select value={transIngredient} onChange={(e) => setTransIngredient(e.target.value)} required>
                            <option value="" disabled>-- Pilih Bahan --</option>
                            {ingredients.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} (Stok: {item.current_stock} {item.unit})
                                </option>
                            ))}
                        </select>
                        <select value={transType} onChange={(e) => setTransType(e.target.value)} required>
                            <option value="IN">Masuk (IN) 📥</option>
                            <option value="OUT">Keluar (OUT) 📤</option>
                        </select>
                        <input type="number" placeholder="Jumlah" value={transQty} onChange={(e) => setTransQty(e.target.value)} required min="1" />
                        <button type="submit">Catat Transaksi</button>
                    </form>

                    <h3>Data Stok Terkini</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Bahan</th><th>Stok</th><th>Satuan</th><th>Min</th><th>Status</th>
                                {userRole === 'admin' && <th>Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map(item => {
                                const isLow = parseInt(item.current_stock) <= item.min_stock;
                                return (
                                    <tr key={item.id} className={isLow ? 'low-stock' : ''}>
                                        <td>{item.name}</td><td><b>{item.current_stock}</b></td><td>{item.unit}</td><td>{item.min_stock}</td><td>{isLow ? '⚠️ Kritis' : '✅ Aman'}</td>
                                        {userRole === 'admin' && (
                                            <td><button onClick={() => handleDelete(item.id)} style={{ background: 'var(--danger)', padding: '5px' }}>Hapus</button></td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Dashboard;