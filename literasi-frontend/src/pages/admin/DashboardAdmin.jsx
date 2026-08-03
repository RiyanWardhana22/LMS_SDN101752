import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Users, ChartBar, ChalkboardTeacher, WarningCircle } from "@phosphor-icons/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom'; // Tambahan untuk navigasi

export default function DashboardAdmin() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // STATE BARU: Untuk melacak status Mode Darurat
    const [isEmergency, setIsEmergency] = useState(false);
    
    const navigate = useNavigate();

    // 1. Ambil Data Statistik & Cek Status Darurat
    useEffect(() => {
        // Cek status darurat dari localStorage (sinkron dengan halaman EmergencyMode)
        const emergencyStatus = localStorage.getItem('emergency_mode') === 'true';
        setIsEmergency(emergencyStatus);

        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost/LMS_SDN101752/literasi-backend/api/admin/dashboard_stats.php');
                const result = await response.json();
                
                if (result.status === 'success') {
                    setStats(result.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 2. Fungsi Toggle Darurat dari Dashboard
    const handleToggleEmergency = () => {
        const newStatus = !isEmergency;
        setIsEmergency(newStatus);
        localStorage.setItem('emergency_mode', newStatus); // Simpan status agar terbaca di halaman lain
        
        if (newStatus) {
            alert("🚨 MODE DARURAT DIAKTIFKAN dari Dashboard!");
        } else {
            alert("✅ Mode Darurat dimatikan.");
        }
    };

    return (
        <DashboardLayout role="admin" title="Executive Dashboard">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">Ringkasan Aktivitas Sekolah</h2>
                <p className="text-neutral-500 font-medium">Pantau perkembangan kelas dan keaktifan sistem secara langsung.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-neutral-400 font-bold animate-pulse">
                    Mengambil Data Executive...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Card 1: Siswa Aktif */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-3 text-neutral-500 mb-4">
                                <div className="p-2 bg-[#eafaf1] rounded-lg">
                                    <Users weight="fill" size={24} className="text-[#2ecc71]" />
                                </div>
                                <h3 className="font-bold text-sm">Siswa Aktif (Minggu ini)</h3>
                            </div>
                            <p className="text-4xl font-black text-neutral-900">{stats?.siswa_aktif_mingguan || 0}</p>
                            <p className="text-xs text-[#2ecc71] font-bold mt-2">Siswa mengakses & kerjakan tugas</p>
                        </div>

                        {/* Card 2: Total Materi */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-3 text-neutral-500 mb-4">
                                <div className="p-2 bg-[#ebf5fb] rounded-lg">
                                    <ChartBar weight="fill" size={24} className="text-[#3498db]" />
                                </div>
                                <h3 className="font-bold text-sm">Total Materi Tersedia</h3>
                            </div>
                            <p className="text-4xl font-black text-neutral-900">
                                {stats?.guru_aktif?.reduce((acc, curr) => acc + parseInt(curr.total_materi), 0) || 0}
                            </p>
                            <p className="text-xs text-[#3498db] font-bold mt-2">Dibuat oleh para guru</p>
                        </div>

                        {/* Card 3: Guru Aktif */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-3 text-neutral-500 mb-4">
                                <div className="p-2 bg-[#fef9e7] rounded-lg">
                                    <ChalkboardTeacher weight="fill" size={24} className="text-[#f39c12]" />
                                </div>
                                <h3 className="font-bold text-sm">Guru Teraktif</h3>
                            </div>
                            <p className="text-2xl font-black text-neutral-900 truncate">
                                {stats?.guru_aktif?.[0]?.nama || "Belum ada"}
                            </p>
                            <p className="text-xs text-neutral-500 font-bold mt-2">Kontributor materi terbanyak</p>
                        </div>

                        {/* Card 4: Status Darurat (SUDAH DINAMIS) */}
                        <div className={`rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border-2 transition-all duration-300 ${isEmergency ? 'bg-red-50 border-red-500' : 'bg-white border-[#e74c3c]/20 hover:border-[#e74c3c]/50'}`}>
                            <div className="flex items-center gap-3 text-neutral-500 mb-4">
                                <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-500 text-white animate-pulse' : 'bg-[#fdedec] text-[#e74c3c]'}`}>
                                    <WarningCircle weight="fill" size={24} />
                                </div>
                                <h3 className={`font-bold text-sm ${isEmergency ? 'text-red-700' : 'text-[#e74c3c]'}`}>Status Mode Darurat</h3>
                            </div>
                            <p className={`text-2xl font-black mt-2 ${isEmergency ? 'text-red-700' : 'text-[#e74c3c]'}`}>
                                {isEmergency ? 'AKTIF' : 'NONAKTIF'}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <button 
                                    onClick={handleToggleEmergency}
                                    className={`flex-1 py-2 font-bold text-sm rounded-xl transition-colors border ${isEmergency ? 'bg-gray-800 text-white hover:bg-gray-900 border-gray-900' : 'bg-[#fff5f5] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white border-[#ff8a80]'}`}
                                >
                                    {isEmergency ? 'Matikan' : 'Aktifkan'}
                                </button>
                                <button 
                                    onClick={() => navigate('/admin/emergency')}
                                    className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Area Grafik Visual (Recharts) - Tetap sama */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Chart 1: Rata-rata Kelas */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] border border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-800 mb-6">Perbandingan Nilai Rata-rata Kelas</h3>
                            <div className="h-72 w-full">
                                {stats?.rata_rata_kelas?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.rata_rata_kelas}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="nama_kelas" tick={{fill: '#6b7280', fontSize: 12}} />
                                            <YAxis tick={{fill: '#6b7280', fontSize: 12}} />
                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Bar dataKey="rata_rata" fill="#3498db" name="Nilai Rata-rata" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-neutral-400">Belum ada data nilai.</div>
                                )}
                            </div>
                        </div>

                        {/* Chart 2: Tren Penggunaan */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] border border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-800 mb-6">Tren Aktivitas Belajar (Bulanan)</h3>
                            <div className="h-72 w-full">
                                {stats?.tren_bulanan?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.tren_bulanan}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="bulan" tick={{fill: '#6b7280', fontSize: 12}} />
                                            <YAxis tick={{fill: '#6b7280', fontSize: 12}} />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Line type="monotone" dataKey="total_aktivitas" stroke="#2ecc71" strokeWidth={4} dot={{r: 6, fill: '#2ecc71', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} name="Total Pengerjaan" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-neutral-400">Belum ada data aktivitas bulanan.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}