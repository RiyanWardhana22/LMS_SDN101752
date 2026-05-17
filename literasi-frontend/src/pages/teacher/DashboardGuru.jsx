import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Users,
  Notebook,
  ChartLine,
  BookBookmark,
  Plus,
  Megaphone,
  FileText,
} from "@phosphor-icons/react";

export default function DashboardGuru() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <DashboardLayout role="guru" title="Meja Kerja Digital">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-neutral-900 mb-2">
          Selamat pagi, {user?.username || "Guru"}! 👋
        </h2>
        <p className="text-neutral-500 font-medium">
          Ini adalah ringkasan aktivitas kelasmu hari ini.
        </p>
      </div>

      {/* 4 Kartu Statistik Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Siswa Aktif */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#eafaf1] rounded-lg">
              <Users weight="fill" size={24} className="text-[#2ecc71]" />
            </div>
            <h3 className="font-bold text-sm">Siswa Aktif</h3>
          </div>
          <p className="text-3xl font-black text-neutral-900">
            32 <span className="text-lg text-neutral-400 font-bold">/ 36</span>
          </p>
          <p className="text-xs text-neutral-500 font-bold mt-2">
            Hadir hari ini
          </p>
        </div>

        {/* Card 2: Tugas Belum Dikoreksi (Dengan Badge Urgent) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
          {/* Badge Merah untuk Perhatian Khusus */}
          <div className="absolute top-0 right-0 bg-[#e74c3c] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">
            URGENT
          </div>

          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#fdedec] rounded-lg animate-pulse">
              <Notebook weight="fill" size={24} className="text-[#e74c3c]" />
            </div>
            <h3 className="font-bold text-sm">Perlu Dikoreksi</h3>
          </div>
          <p className="text-3xl font-black text-neutral-900">12</p>
          <button className="text-xs text-[#e74c3c] font-bold mt-2 hover:underline">
            Koreksi Sekarang →
          </button>
        </div>

        {/* Card 3: Rata-rata Nilai */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#ebf5fb] rounded-lg">
              <ChartLine weight="fill" size={24} className="text-[#3498db]" />
            </div>
            <h3 className="font-bold text-sm">Rata-rata Kelas</h3>
          </div>
          <p className="text-3xl font-black text-neutral-900">85.4</p>
          <p className="text-xs text-[#2ecc71] font-bold mt-2">
            ↑ Naik 2.1 poin
          </p>
        </div>

        {/* Card 4: Materi Aktif */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,26,46,0.06)] p-6 border border-neutral-100 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-neutral-500 mb-4">
            <div className="p-2 bg-[#fef9e7] rounded-lg">
              <BookBookmark
                weight="fill"
                size={24}
                className="text-[#f39c12]"
              />
            </div>
            <h3 className="font-bold text-sm">Materi Aktif</h3>
          </div>
          <p className="text-3xl font-black text-neutral-900">4</p>
          <p className="text-xs text-neutral-500 font-bold mt-2">
            Modul sedang dipelajari
          </p>
        </div>
      </div>

      {/* Grid Bawah: Tombol Cepat & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiri: Tombol Aksi Cepat */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-xl font-black text-neutral-900 mb-2">
            Aksi Cepat
          </h3>

          <button className="flex items-center gap-3 p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-[#ff6b35] hover:bg-[#fff3ee] transition-colors group text-left shadow-sm">
            <div className="p-2 bg-[#ff6b35] text-white rounded-xl group-hover:scale-110 transition-transform">
              <FileText weight="bold" size={20} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">
                Buat Tugas Baru
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                Berikan latihan soal kelas
              </p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-[#4ecdc4] hover:bg-[#f0fafa] transition-colors group text-left shadow-sm">
            <div className="p-2 bg-[#4ecdc4] text-white rounded-xl group-hover:scale-110 transition-transform">
              <Plus weight="bold" size={20} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">
                Tambah Materi
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                Unggah bacaan atau modul AR
              </p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-[#3498db] hover:bg-[#ebf5fb] transition-colors group text-left shadow-sm">
            <div className="p-2 bg-[#3498db] text-white rounded-xl group-hover:scale-110 transition-transform">
              <Megaphone weight="bold" size={20} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">
                Kirim Pengumuman
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                Pesan broadcast ke siswa
              </p>
            </div>
          </button>
        </div>

        {/* Kanan: Feed Aktivitas Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
          <h3 className="text-xl font-black text-neutral-900 mb-6">
            Aktivitas Kelas Terbaru
          </h3>

          <div className="flex flex-col gap-6">
            {/* Aktivitas 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#eafaf1] flex items-center justify-center text-xl shrink-0 border-2 border-white shadow-sm">
                🧑‍🎓
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-900">
                  Budi mengumpulkan tugas{" "}
                  <span className="text-[#3498db]">"Membaca Puisi"</span>
                </p>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  10 menit yang lalu
                </p>
              </div>
              <button className="px-4 py-1.5 bg-[#fff3ee] text-[#ff6b35] font-bold text-xs rounded-lg hover:bg-[#ff6b35] hover:text-white transition-colors">
                Lihat
              </button>
            </div>

            {/* Aktivitas 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#fef9e7] flex items-center justify-center text-xl shrink-0 border-2 border-white shadow-sm">
                👧
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-900">
                  Siti menyelesaikan kuis{" "}
                  <span className="text-[#3498db]">"Siklus Air"</span>
                </p>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Hari ini, 09:15 WIB
                </p>
              </div>
              <div className="px-3 py-1 bg-[#eafaf1] text-[#2ecc71] font-black text-xs rounded-lg shadow-sm border border-[#2ecc71]/20">
                Nilai: 100
              </div>
            </div>

            {/* Aktivitas 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#fdedec] flex items-center justify-center text-xl shrink-0 border-2 border-white shadow-sm">
                👦
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-900">
                  Anton bertanya di materi{" "}
                  <span className="text-[#3498db]">"Pecahan Matematika"</span>
                </p>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Kemarin, 14:30 WIB
                </p>
              </div>
              <button className="px-4 py-1.5 bg-[#f0fafa] text-[#4ecdc4] font-bold text-xs rounded-lg hover:bg-[#4ecdc4] hover:text-white transition-colors">
                Balas
              </button>
            </div>
          </div>

          <button className="w-full mt-6 py-3 border-2 border-neutral-100 rounded-xl text-sm font-bold text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
