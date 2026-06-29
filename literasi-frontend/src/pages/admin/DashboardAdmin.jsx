import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Users,
  ChartBar,
  ChalkboardTeacher,
  WarningCircle,
} from "@phosphor-icons/react";

export default function DashboardAdmin() {
  return (
    <DashboardLayout role="admin" title="Executive Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-neutral-900 mb-2">
          Ringkasan Aktivitas Sekolah
        </h2>
        <p className="text-neutral-500 font-medium">
          Pantau perkembangan kelas dan keaktifan sistem secara langsung.
        </p>
      </div>

      {/* Grid 4 Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Siswa Aktif */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#eafaf1] rounded-lg">
              <Users weight="fill" size={24} className="text-[#2ecc71]" />
            </div>
            <h3 className="font-bold text-sm">Siswa Aktif (Minggu ini)</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900">342</p>
          <p className="text-xs text-[#2ecc71] font-bold mt-2">
            ↑ 12% dari minggu lalu
          </p>
        </div>

        {/* Card 2: Rata-rata Nilai */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#ebf5fb] rounded-lg">
              <ChartBar weight="fill" size={24} className="text-[#3498db]" />
            </div>
            <h3 className="font-bold text-sm">Distribusi Nilai Rata-rata</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900">82.5</p>
          <p className="text-xs text-[#2ecc71] font-bold mt-2">
            ↑ Meningkat stabil
          </p>
        </div>

        {/* Card 3: Guru Aktif */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#fef9e7] rounded-lg">
              <ChalkboardTeacher
                weight="fill"
                size={24}
                className="text-[#f39c12]"
              />
            </div>
            <h3 className="font-bold text-sm">Pembuatan Konten Baru</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900">18</p>
          <p className="text-xs text-neutral-500 font-bold mt-2">
            Modul dibuat minggu ini
          </p>
        </div>

        {/* Card 4: Status Darurat */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border-2 border-[#e74c3c]/20 hover:border-[#e74c3c]/50 transition-colors">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#fdedec] rounded-lg animate-pulse">
              <WarningCircle
                weight="fill"
                size={24}
                className="text-[#e74c3c]"
              />
            </div>
            <h3 className="font-bold text-sm text-[#e74c3c]">
              Status Mode Darurat
            </h3>
          </div>
          <p className="text-2xl font-black text-[#e74c3c] mt-2">NONAKTIF</p>
          <button className="w-full mt-4 py-2 bg-[#fff5f5] text-[#e74c3c] font-bold text-sm rounded-xl hover:bg-[#e74c3c] hover:text-white transition-colors border border-[#ff8a80]">
            Aktifkan Mode
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
