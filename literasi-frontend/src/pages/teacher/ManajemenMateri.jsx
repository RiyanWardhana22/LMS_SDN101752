import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Plus,
  BookOpen,
  MagnifyingGlass,
  Funnel,
  Trash,
  PencilSimple,
  Eye,
} from "@phosphor-icons/react";

export default function ManajemenMateri() {
  const [searchQuery, setSearchQuery] = useState("");
  const [materiList] = useState([
    {
      id: 1,
      judul: "Mengenal Siklus Air",
      mapel: "IPA",
      kelas: "Kelas 4",
      tipe: "AR + Teks",
      status: "Aktif",
      date: "17 Mei 2026",
      color: "#2ecc71",
    },
    {
      id: 2,
      judul: "Pecahan Sederhana",
      mapel: "Matematika",
      kelas: "Kelas 3",
      tipe: "Video",
      status: "Draft",
      date: "15 Mei 2026",
      color: "#4ecdc4",
    },
    {
      id: 3,
      judul: "Perjuangan Kemerdekaan",
      mapel: "IPS",
      kelas: "Kelas 5",
      tipe: "Teks Berilustrasi",
      status: "Aktif",
      date: "10 Mei 2026",
      color: "#e67e22",
    },
    {
      id: 4,
      judul: "Puisi Tentang Alam",
      mapel: "Bahasa Indonesia",
      kelas: "Kelas 4",
      tipe: "Audio + Teks",
      status: "Aktif",
      date: "05 Mei 2026",
      color: "#ff6b9d",
    },
  ]);

  return (
    <DashboardLayout role="guru" title="Manajemen Materi">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">
            Pustaka Materi
          </h2>
          <p className="text-neutral-500 font-medium">
            Kelola bahan ajar, modul AR, dan video pembelajaran untuk kelasmu.
          </p>
        </div>
        <button className="btn-primary py-3 px-6 cursor-pointer rounded-2xl flex items-center justify-center gap-2 text-sm whitespace-nowrap">
          <Plus weight="bold" size={20} />
          Buat Materi Baru
        </button>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Cari judul materi..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-neutral-50 border-2 border-neutral-200 text-neutral-600 font-bold text-sm rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2">
          <Funnel weight="bold" size={20} />
          Filter
        </button>
      </div>

      {/* Daftar Materi (Grid Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {materiList.map((materi) => (
          <div
            key={materi.id}
            className="bg-white rounded-3xl p-6 border-2 border-neutral-100 shadow-[0_2px_12px_rgba(26,26,46,0.04)] hover:border-neutral-200 group flex flex-col"
          >
            {/* Badge Status & Mata Pelajaran */}
            <div className="flex justify-between items-start mb-4">
              <span
                className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: materi.color }}
              >
                {materi.mapel}
              </span>
              <div
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${materi.status === "Aktif" ? "bg-[#eafaf1] text-[#2ecc71]" : "bg-neutral-100 text-neutral-500"}`}
              >
                {materi.status}
              </div>
            </div>

            {/* Judul & Info Utama */}
            <h3 className="text-xl font-black text-neutral-900 mb-2 leading-tight group-hover:text-[#ff6b35] transition-colors">
              {materi.judul}
            </h3>

            <div className="flex flex-col gap-2 mt-auto mb-6 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-neutral-300"></span>{" "}
                {materi.kelas}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-neutral-300"></span>{" "}
                {materi.tipe}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mt-2">
                Dibuat pada {materi.date}
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex gap-2 mt-auto">
              <button className="flex-1 py-2 bg-neutral-50 hover:bg-[#ff6b35] hover:text-white text-neutral-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-neutral-200 hover:border-[#ff6b35]">
                <PencilSimple weight="bold" size={16} /> Edit
              </button>
              <button className="p-2 bg-neutral-50 hover:bg-[#3498db] hover:text-white text-neutral-600 rounded-xl transition-colors border border-neutral-200 hover:border-[#3498db]">
                <Eye weight="bold" size={18} />
              </button>
              <button className="p-2 bg-neutral-50 hover:bg-[#e74c3c] hover:text-white text-neutral-600 rounded-xl transition-colors border border-neutral-200 hover:border-[#e74c3c]">
                <Trash weight="bold" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
