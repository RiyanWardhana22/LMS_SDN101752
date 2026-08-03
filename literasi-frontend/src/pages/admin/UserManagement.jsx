import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { UserPlus, FileCsv, PencilSimple, Trash, X, DownloadSimple } from "@phosphor-icons/react";
import Papa from 'papaparse'; 

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [rombels, setRombels] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    
    const fileInputRef = useRef(null);
    
    // TAMBAHKAN EMAIL DI SINI
    const [formData, setFormData] = useState({
        nama: '', role: 'siswa', username: '', email: '', password: '', pin: '', rombel_id: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const url = filterRole 
                ? `http://localhost/LMS_SDN101752/literasi-backend/api/admin/users.php?role=${filterRole}`
                : `http://localhost/LMS_SDN101752/literasi-backend/api/admin/users.php`;
                
            const response = await fetch(url);
            const result = await response.json();
            if (result.status === 'success') setUsers(result.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRombels = async () => {
        try {
            const response = await fetch('http://localhost/LMS_SDN101752/literasi-backend/api/admin/rombels.php');
            const result = await response.json();
            if (result.status === 'success') setRombels(result.data);
        } catch (error) {
            console.error("Gagal mengambil data kelas:", error);
        }
    };

    useEffect(() => { 
        fetchUsers(); 
        fetchRombels(); 
    }, [filterRole]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditId(null);
        setFormData({ nama: '', role: 'siswa', username: '', email: '', password: '', pin: '', rombel_id: '' });
    };

    const handleAddClick = () => {
        closeModal(); 
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setIsEditMode(true);
        setEditId(user.id);
        setFormData({
            nama: user.nama,
            role: user.role,
            username: user.username || '',
            email: user.email || '', // MASUKKAN DATA EMAIL LAMA
            password: '',
            pin: user.pin || '',
            rombel_id: user.rombel_id || '' 
        });
        setIsModalOpen(true);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // PAYLOAD DIPERBARUI UNTUK MEMBAWA EMAIL
        const payload = formData.role === 'siswa' 
            ? { nama: formData.nama, role: formData.role, pin: formData.pin, rombel_id: formData.rombel_id }
            : { nama: formData.nama, role: formData.role, username: formData.username, email: formData.email, password: formData.password };

        if (isEditMode) payload.id = editId;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch('http://localhost/LMS_SDN101752/literasi-backend/api/admin/users.php', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok && result.status === 'success') {
                alert(result.message);
                closeModal();
                fetchUsers();
            } else {
                alert(result.message || 'Gagal menyimpan data.');
            }
        } catch (error) {
            alert('Terjadi kesalahan pada server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id, nama) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data "${nama}"?`)) return;

        try {
            const response = await fetch(`http://localhost/LMS_SDN101752/literasi-backend/api/admin/users.php?id=${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                alert("Data berhasil dihapus!");
                fetchUsers();
            } else {
                alert(result.message || "Gagal menghapus data.");
            }
        } catch (error) {
            alert("Terjadi kesalahan jaringan saat menghapus data.");
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Nama,PIN,ID_Kelas\nBudi Santoso,1234,1\nSiti Aminah,5678,1";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Template_Import_Siswa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSubmitting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data;
                const formattedData = data.map(row => ({
                    nama: row.Nama || row.nama || '',
                    pin: row.PIN || row.pin || '',
                    rombel_id: row.ID_Kelas || row.id_kelas || ''
                })).filter(item => item.nama && item.pin && item.rombel_id);

                if (formattedData.length === 0) {
                    alert("Format CSV salah atau kosong. Pastikan memiliki kolom: Nama, PIN, dan ID_Kelas.");
                    setIsSubmitting(false);
                    e.target.value = null;
                    return;
                }

                try {
                    const response = await fetch('http://localhost/LMS_SDN101752/literasi-backend/api/admin/users.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'import_siswa', siswa: formattedData })
                    });
                    const result = await response.json();
                    
                    if (response.ok && result.status === 'success') {
                        alert(result.message);
                        fetchUsers();
                    } else {
                        alert(result.message || "Gagal mengimpor data.");
                    }
                } catch (error) {
                    alert("Terjadi kesalahan koneksi saat impor.");
                } finally {
                    setIsSubmitting(false);
                    e.target.value = null;
                }
            }
        });
    };

    return (
        <DashboardLayout role="admin" title="Manajemen Pengguna">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 mb-2">Manajemen Pengguna</h2>
                    <p className="text-neutral-500 font-medium">Kelola data siswa, guru, dan admin sekolah.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
                        <DownloadSimple weight="bold" size={20} /> Template CSV
                    </button>
                    <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportCSV} />
                    <button onClick={() => fileInputRef.current.click()} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] text-white font-bold rounded-xl hover:bg-[#27ae60] transition-colors shadow-sm disabled:opacity-50">
                        <FileCsv weight="bold" size={20} /> {isSubmitting ? 'Memproses...' : 'Import CSV'}
                    </button>
                    <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-[#3498db] text-white font-bold rounded-xl hover:bg-[#2980b9] transition-colors shadow-sm">
                        <UserPlus weight="bold" size={20} /> Tambah Manual
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] border border-neutral-100 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex gap-4">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 block w-full md:w-48 p-2.5 font-medium cursor-pointer">
                        <option value="">Semua Peran</option>
                        <option value="siswa">Siswa</option>
                        <option value="guru">Guru</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-neutral-100">
                            <tr>
                                <th className="px-6 py-4">Informasi Akun</th>
                                <th className="px-6 py-4">Peran</th>
                                <th className="px-6 py-4">Kredensial Siswa</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium animate-pulse">Memuat data...</td></tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b border-neutral-50 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{user.nama}</div>
                                            {/* TAMPILKAN EMAIL DI TABEL JIKA ADA */}
                                            {user.username && <div className="text-xs text-gray-500">@{user.username}</div>}
                                            {user.email && <div className="text-xs text-blue-500">{user.email}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'guru' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'siswa' ? (
                                                <div>
                                                    <span className="block text-xs font-bold text-gray-500">Kelas: <span className="text-gray-800">{user.nama_kelas || `ID ${user.rombel_id || '-'}`}</span></span>
                                                    <span className="block text-xs font-bold text-gray-500">PIN: <span className="text-red-500">{user.pin}</span></span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            <button onClick={() => handleEditClick(user)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Edit Data">
                                                <PencilSimple size={18} weight="bold" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id, user.nama)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Hapus Data">
                                                <Trash size={18} weight="bold" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-8 text-center">Tidak ada data.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM (TAMBAH / EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEditMode ? 'Edit' : 'Tambah'} {formData.role === 'siswa' ? 'Siswa' : 'Staf'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} weight="bold" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Peran (Role)</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} disabled={isEditMode} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 disabled:opacity-50">
                                    <option value="siswa">🧑‍🎓 Siswa</option>
                                    <option value="guru">👨‍🏫 Guru</option>
                                    <option value="admin">👨‍💻 Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Budi Santoso" />
                            </div>

                            {formData.role === 'siswa' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Kelas</label>
                                        <select name="rombel_id" required value={formData.rombel_id} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                            <option value="" disabled>-- Pilih Kelas --</option>
                                            {rombels.map((rombel) => (
                                                <option key={rombel.id} value={rombel.id}>{rombel.nama_kelas}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">PIN (4 Digit)</label>
                                        <input type="text" maxLength="4" pattern="\d{4}" name="pin" required value={formData.pin} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg tracking-[0.5em] font-bold text-center" placeholder="1234" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* INPUT EMAIL DITAMBAHKAN DI SINI */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email (Untuk OTP)</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="guru@sekolah.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                                        <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder="guru_budi" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Password {isEditMode && '(Opsional)'}</label>
                                        <input type="password" name="password" required={!isEditMode} value={formData.password} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "••••••••"} />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}