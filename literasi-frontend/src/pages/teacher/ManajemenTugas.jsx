import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Plus,
  ClipboardText,
  CalendarBlank,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";

export default function ManajemenTugas() {
  const navigate = useNavigate();
  const [tugasList, setTugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchTugas = async () => {
    if (!user.id) return;
    try {
      const res = await fetch(
        `http://localhost/lms_sdn101752/literasi-backend/api/tugas/read.php?guru_id=${user.id}`,
      );
      const data = await res.json();
      if (data.status === "success") setTugasList(data.data);
    } catch (err) {
      console.error("Gagal memuat data evaluasi", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    optimizeTugas();
  }, []);
  const optimizeTugas = () => {
    fetchTugas();
  };

  const handleDelete = (id, judul) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Evaluasi "${judul}" akan dihapus permanen beserta seluruh nilai siswa!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#ffffff",
      customClass: { popup: "rounded-3xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            "http://localhost/lms_sdn101752/literasi-backend/api/tugas/delete.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
          );
          const data = await res.json();

          if (data.status === "success") {
            Swal.fire({
              title: "Terhapus!",
              text: data.message,
              icon: "success",
              confirmButtonColor: "#ff6b35",
              timer: 1500,
            });
            setTugasList(tugasList.filter((t) => t.id !== id));
          } else {
            Swal.fire({ icon: "error", title: "Gagal", text: data.message });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Gagal terhubung ke server.",
          });
        }
      }
    });
  };

  return (
    <DashboardLayout role="guru" title="Manajemen Tugas & Kuis">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">
            Evaluasi Kelas
          </h2>
          <p className="text-neutral-500 font-medium">
            Buat tugas esai atau kuis interaktif pilihan ganda untuk menguji
            pemahaman siswa.
          </p>
        </div>
        <button
          onClick={() => navigate("/guru/tugas/tambah")}
          className="btn-primary py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold whitespace-nowrap cursor-pointer"
        >
          <Plus weight="bold" size={20} /> Tambah Tugas
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 font-bold text-neutral-400 animate-pulse">
          Memuat meja evaluasi...
        </div>
      ) : tugasList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-neutral-400">
          <ClipboardText
            size={56}
            weight="thin"
            className="mb-3 text-neutral-300"
          />
          <p className="font-bold">
            Belum ada tugas atau kuis yang diterbitkan.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                  <th className="p-5">Judul Evaluasi</th>
                  <th className="p-5">Tipe</th>
                  <th className="p-5">Tenggat Waktu</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm font-semibold text-neutral-700">
                {tugasList.map((tugas) => (
                  <tr
                    key={tugas.id}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    <td className="p-5 font-bold text-neutral-900">
                      {tugas.judul}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${tugas.tipe === "kuis" ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                      >
                        {tugas.tipe}
                      </span>
                    </td>
                    <td className="p-5 text-neutral-500">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <CalendarBlank size={16} weight="bold" />
                        {new Date(tugas.tenggat).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-600 transition-colors cursor-pointer">
                          <PencilSimple size={16} weight="bold" />
                        </button>
                        <button
                          onClick={() => handleDelete(tugas.id, tugas.judul)}
                          className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
