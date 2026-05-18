import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Plus,
  MagnifyingGlass,
  Funnel,
  Trash,
  PencilSimple,
  Eye,
  BookOpen,
} from "@phosphor-icons/react";

export default function ManajemenMateri() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const fetchMateri = async () => {
    if (!user.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost/lms_sdn101752/literasi-backend/api/materi/read.php?guru_id=${user.id}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setMateriList(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Gagal memuat data dari server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, []);
  const handleDelete = async (id, judul) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Apakah Anda yakin ingin menghapus materi "${judul}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, hapus!",
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/materi/delete.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        await Swal.fire({
          title: "Deleted!",
          text: data.message,
          icon: "success",
        });
        setMateriList(materiList.filter((materi) => materi.id !== id));
      } else {
        await Swal.fire({
          title: "Gagal menghapus",
          text: data.message,
          icon: "error",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Terjadi kesalahan jaringan.",
        icon: "error",
      });
    }
  };
  const filteredMateri = materiList.filter((materi) =>
    materi.judul.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const getMapelColor = (mapel) => {
    if (mapel.includes("IPA")) return "#2ecc71";
    if (mapel.includes("Matematika")) return "#4ecdc4";
    if (mapel.includes("IPS")) return "#e67e22";
    return "#ff6b9d";
  };

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
        <button
          onClick={() => navigate("/guru/materi/tambah")}
          className="btn-primary py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm whitespace-nowrap cursor-pointer"
        >
          <Plus weight="bold" size={20} />
          Buat Materi Baru
        </button>
      </div>

      {/* Toolbar Pencarian */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Cari judul materi dari database..."
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

      {/* Kondisi Loading */}
      {isLoading && (
        <div className="text-center py-12 font-bold text-neutral-500 animate-pulse">
          Sedang mengambil data materi dari database...
        </div>
      )}

      {/* Kondisi Data Kosong */}
      {!isLoading && filteredMateri.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-neutral-400">
          <BookOpen size={48} weight="thin" className="mb-3 opacity-60" />
          <p className="font-bold">Belum ada materi yang sesuai ditemukan.</p>
        </div>
      )}

      {/* Render Grid Cards dari Database */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMateri.map((materi) => (
            <div
              key={materi.id}
              className="bg-white rounded-3xl p-6 border-2 border-neutral-100 shadow-[0_2px_12px_rgba(26,26,46,0.04)] hover:border-neutral-200 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                  style={{
                    backgroundColor: getMapelColor(materi.mata_pelajaran),
                  }}
                >
                  {materi.mata_pelajaran}
                </span>
                <div
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${materi.visibilitas === "publik" ? "bg-[#eafaf1] text-[#2ecc71]" : "bg-neutral-100 text-neutral-500"}`}
                >
                  {materi.visibilitas === "publik" ? "Aktif" : "Draft"}
                </div>
              </div>

              <h3 className="text-xl font-black text-neutral-900 mb-2 Logikading-tight group-hover:text-[#ff6b35] transition-colors line-clamp-2">
                {materi.judul}
              </h3>

              <div className="flex flex-col gap-2 mt-auto mb-6 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-neutral-300"></span>{" "}
                  {materi.kelas}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mt-2">
                  Dibuat pada:{" "}
                  {new Date(materi.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Tombol Operasional Lengkap */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => navigate(`/guru/materi/edit/${materi.id}`)}
                  className="flex-1 py-2 bg-neutral-50 hover:bg-[#ff6b35] hover:text-white text-neutral-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-neutral-200 hover:border-[#ff6b35] cursor-pointer"
                >
                  <PencilSimple weight="bold" size={16} /> Edit
                </button>
                <button className="p-2 bg-neutral-50 hover:bg-[#3498db] hover:text-white text-neutral-600 rounded-xl transition-colors border border-neutral-200 hover:border-[#3498db] cursor-pointer">
                  <Eye weight="bold" size={18} />
                </button>
                <button
                  onClick={() => handleDelete(materi.id, materi.judul)}
                  className="p-2 bg-neutral-50 hover:bg-[#e74c3c] hover:text-white text-neutral-600 rounded-xl transition-colors border border-neutral-200 hover:border-[#e74c3c] cursor-pointer"
                >
                  <Trash weight="bold" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
