import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Users, UserList, UserCircleGear, TrendUp, GraduationCap, DownloadSimple, FileCsv, ChalkboardTeacher } from "@phosphor-icons/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Reports() {
    const [reportData, setReportData] = useState({
        summary: { siswa: 0, guru: 0, admin: 0 },
        distribusi_kelas: [],
        rata_rata_nilai: [],
        aktivitas: []
    });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('semester_ini');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost/LMS_SDN101752/literasi-backend/api/admin/reports.php');
                const result = await response.json();
                if (result.status === 'success') {
                    setReportData(result.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data laporan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [timeFilter]);

    // Fungsi untuk memicu download dari API export_reports.php
    const handleDownload = (type) => {
        window.open(`http://localhost/LMS_SDN101752/literasi-backend/api/admin/export_reports.php?type=${type}`, '_blank');
    };

    return (
        <DashboardLayout role="admin" title="Laporan Sekolah">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 mb-2">Laporan & Analitik</h2>
                    <p className="text-neutral-500 font-medium">Pantau statistik pengguna, performa akademik, dan aktivitas belajar.</p>
                </div>
                <div>
                    <select 
                        value={timeFilter} 
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 p-3 font-bold cursor-pointer shadow-sm"
                    >
                        <option value="semester_ini">Semester Ini</option>
                        <option value="bulan_ini">Bulan Ini</option>
                        <option value="tahun_lalu">Tahun Ajaran Lalu</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400 font-bold animate-pulse">Menyiapkan laporan analitik...</div>
            ) : (
                <>
                    {/* Kartu Ringkasan (Summary Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={32} weight="fill" /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Total Siswa</p>
                                <h3 className="text-3xl font-black text-gray-900">{reportData.summary.siswa}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><UserList size={32} weight="fill" /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Total Guru</p>
                                <h3 className="text-3xl font-black text-gray-900">{reportData.summary.guru}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><UserCircleGear size={32} weight="fill" /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Total Staf / Admin</p>
                                <h3 className="text-3xl font-black text-gray-900">{reportData.summary.admin}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Area Grafik Bar & Line */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Grafik Batang: Distribusi Siswa */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Distribusi Siswa per Kelas</h3>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.distribusi_kelas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="nama_kelas" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="total_siswa" fill="#3498db" radius={[4, 4, 0, 0]} name="Jumlah Siswa" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grafik Batang Kedua: Rata-rata Nilai Akademik */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Rata-Rata Nilai Akademik per Kelas</h3>
                                <GraduationCap size={24} className="text-purple-500" />
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.rata_rata_nilai} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="nama_kelas" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="rata_rata" fill="#9b59b6" radius={[4, 4, 0, 0]} name="Rata-Rata Nilai" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Grafik Garis Penuh Lebar: Tren Aktivitas */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Tren Aktivitas Login Sistem</h3>
                            <TrendUp size={24} className="text-green-500" />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.aktivitas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="kunjungan" stroke="#2ecc71" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Total Login" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PUSAT UNDUHAN LAPORAN (PENGABDIAN MASYARAKAT) */}
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Dokumentasi & Ekspor Laporan</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Unduh rekapitulasi data otomatis dalam format CSV/Excel untuk keperluan laporan akhir Pengabdian Masyarakat kampus.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tombol Laporan Bulanan */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-max mb-4">
                                    <TrendUp size={28} weight="fill" />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Laporan Penggunaan LMS</h4>
                                <p className="text-xs text-gray-500 mb-6">Tren keaktifan login dan akses materi dari bulan ke bulan.</p>
                                <button 
                                    onClick={() => handleDownload('bulanan')}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <DownloadSimple size={18} weight="bold" /> Unduh Laporan
                                </button>
                            </div>

                            {/* Tombol Laporan Capaian */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-max mb-4">
                                    <GraduationCap size={28} weight="fill" />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Capaian per Kelas</h4>
                                <p className="text-xs text-gray-500 mb-6">Rekap nilai rata-rata siswa, ketuntasan, dan jumlah tugas.</p>
                                <button 
                                    onClick={() => handleDownload('capaian')}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
                                >
                                    <FileCsv size={18} weight="bold" /> Unduh Excel (.csv)
                                </button>
                            </div>

                            {/* Tombol Laporan Keaktifan Guru */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl w-max mb-4">
                                    <ChalkboardTeacher size={28} weight="fill" />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Keaktifan Guru</h4>
                                <p className="text-xs text-gray-500 mb-6">Statistik pembuatan materi dan interaksi guru dengan siswa.</p>
                                <button 
                                    onClick={() => handleDownload('guru')}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors"
                                >
                                    <FileCsv size={18} weight="bold" /> Unduh Excel (.csv)
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}