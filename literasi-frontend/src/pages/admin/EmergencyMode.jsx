import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Warning, CalendarBlank, ShieldCheck, Power } from "@phosphor-icons/react";

export default function EmergencyMode() {
    // State untuk mode darurat
    const [isEmergency, setIsEmergency] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');

    // Simulasi mengambil status dari database saat halaman dimuat
    useEffect(() => {
        // Nanti ini dihubungkan ke API (misal: fetch('/api/admin/settings.php'))
        const currentStatus = localStorage.getItem('emergency_mode') === 'true';
        setIsEmergency(currentStatus);
    }, []);

    const toggleEmergency = () => {
        setLoading(true);
        // Simulasi proses API
        setTimeout(() => {
            const newStatus = !isEmergency;
            setIsEmergency(newStatus);
            localStorage.setItem('emergency_mode', newStatus); // Simpan status
            setLoading(false);
            
            if (newStatus) {
                alert("🚨 MODE DARURAT DIAKTIFKAN! Seluruh sistem kini beralih ke mode Belajar Dari Rumah.");
            } else {
                alert("✅ Mode Darurat dimatikan. Sistem kembali ke mode tatap muka normal.");
            }
        }, 800);
    };

    const handleSchedule = (e) => {
        e.preventDefault();
        if(!scheduleDate) return alert("Pilih tanggal terlebih dahulu!");
        alert(`Berhasil! Mode darurat dijadwalkan otomatis aktif pada: ${scheduleDate}`);
        setScheduleDate('');
    };

    return (
        <DashboardLayout role="admin" title="Mode Darurat">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">Manajemen Mode Darurat</h2>
                <p className="text-neutral-500 font-medium">Pusat kendali untuk mengalihkan sistem ke mode Belajar Dari Rumah secara instan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel Utama Saklar Darurat */}
                <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${isEmergency ? 'bg-red-50 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`p-6 rounded-full mb-6 transition-colors duration-500 ${isEmergency ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                            {isEmergency ? <Warning size={64} weight="fill" /> : <ShieldCheck size={64} weight="fill" />}
                        </div>
                        
                        <h3 className={`text-2xl font-black mb-2 ${isEmergency ? 'text-red-600' : 'text-gray-800'}`}>
                            {isEmergency ? 'MODE DARURAT AKTIF' : 'SISTEM NORMAL'}
                        </h3>
                        <p className="text-gray-500 font-medium mb-8 max-w-sm">
                            {isEmergency 
                                ? 'Seluruh antarmuka siswa telah dialihkan ke mode Belajar Dari Rumah (BDR).' 
                                : 'Aktivitas belajar mengajar berjalan seperti biasa di sekolah.'}
                        </p>

                        <button 
                            onClick={toggleEmergency}
                            disabled={loading}
                            className={`relative overflow-hidden group px-12 py-4 rounded-full font-black text-lg text-white transition-all duration-300 ${isEmergency ? 'bg-gray-800 hover:bg-gray-900' : 'bg-red-600 hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
                        >
                            <span className="flex items-center gap-3 relative z-10">
                                <Power size={24} weight="bold" />
                                {loading ? 'Memproses...' : (isEmergency ? 'MATIKAN MODE DARURAT' : 'AKTIFKAN MODE DARURAT')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Panel Penjadwalan */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <CalendarBlank size={28} weight="fill" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Penjadwalan Otomatis</h3>
                    </div>
                    
                    <p className="text-gray-500 font-medium mb-6">
                        Jadwalkan aktivasi Mode Darurat jika ada prediksi cuaca buruk (banjir, badai) atau bencana alam di hari-hari mendatang.
                    </p>

                    <form onSubmit={handleSchedule} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Aktivasi</label>
                            <input 
                                type="date" 
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" 
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            Simpan Jadwal
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                        <Warning size={24} className="text-yellow-600 shrink-0" weight="fill" />
                        <p className="text-sm font-medium text-yellow-800">
                            Fitur ini akan menonaktifkan fitur tatap muka di perangkat siswa dan menampilkan pesan peringatan di halaman login mereka.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}