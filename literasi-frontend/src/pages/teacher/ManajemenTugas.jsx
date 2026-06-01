import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Plus,
  PencilSimple,
  Trash,
  UsersThree,
  Copy,
} from "@phosphor-icons/react";

export default function ManajemenTugas() {
  const navigate = useNavigate();
  const [tugasList, setTugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchTugas = async () => {
    try {
      const response = await fetch(
        `http://localhost/lms_sdn101752/literasi-backend/api/tugas/read.php?guru_id=${user.id}`,
      );
      const data = await response.json();
      if (data.status === "success") setTugasList(data.data);
    } catch (error) {
      console.error("Gagal memuat tugas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) fetchTugas();
  }, [user.id]);

  const handleDuplicate = async (id, judul) => {
    Swal.fire({
      title: "Gandakan Tugas/Kuis?",
      text: `Anda akan membuat salinan dari "${judul}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3498db",
      confirmButtonText: "Ya, Gandakan!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://localhost/lms_sdn101752/literasi-backend/api/tugas/duplicate.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
          );
          const data = await response.json();
          if (data.status === "success") {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            fetchTugas();
          } else {
            Swal.fire("Gagal", data.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server.", "error");
        }
      }
    });
  };

  const handleDelete = async (id, judul) => {
    Swal.fire({
      title: "Hapus Tugas?",
      text: `Evaluasi "${judul}" akan dihapus beserta nilai siswa di dalamnya.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://localhost/lms_sdn101752/literasi-backend/api/tugas/delete.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
          );
          const data = await response.json();
          if (data.status === "success") {
            setTugasList(tugasList.filter((t) => t.id !== id));
            Swal.fire("Terhapus!", "Evaluasi berhasil dihapus.", "success");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghapus.", "error");
        }
      }
    });
  };

  return (
    <DashboardLayout role="guru" title="Pusat Evaluasi">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900">Tugas & Kuis</h2>
          <button
            onClick={() => navigate("/guru/tugas/tambah")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl shadow-[0_4px_0_#1e8449] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus weight="bold" size={20} /> Buat Baru
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20 font-bold text-neutral-400">
              Memuat data...
            </div>
          ) : tugasList.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 font-medium">
              Belum ada tugas atau kuis.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                    <th className="p-5 w-1/3">Informasi Evaluasi</th>
                    <th className="p-5">Target Kelas</th>
                    <th className="p-5 text-center">Tenggat Waktu</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm font-semibold">
                  {tugasList.map((tugas) => (
                    <tr
                      key={tugas.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${tugas.tipe === "kuis" ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                          >
                            {tugas.tipe}
                          </span>
                        </div>
                        <div
                          className="font-black text-neutral-800 text-base truncate w-64"
                          title={tugas.judul}
                        >
                          {tugas.judul}
                        </div>
                      </td>

                      {/* KOLOM BADGE ROMBEL BARU */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#ebf5fb] text-[#3498db] p-2 rounded-xl">
                            <UsersThree weight="fill" size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-700">
                              {tugas.nama_kelas || "Belum Diatur"}
                            </span>
                            {tugas.kode_unik && (
                              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                                KODE: {tugas.kode_unik}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold">
                          {new Date(tugas.tenggat).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/guru/tugas/koreksi/${tugas.id}`)
                            }
                            className="px-3 py-1.5 bg-[#eafaf1] hover:bg-[#2ecc71] hover:text-white text-[#2ecc71] text-xs font-black rounded-xl transition-colors cursor-pointer border border-[#2ecc71]/20"
                          >
                            Lihat Hasil
                          </button>

                          {/* TOMBOL DUPLIKAT BARU */}
                          <button
                            onClick={() =>
                              handleDuplicate(tugas.id, tugas.judul)
                            }
                            className="p-2 bg-neutral-100 hover:bg-[#9b59b6] hover:text-white text-neutral-600 rounded-xl transition-colors cursor-pointer"
                            title="Duplikat Evaluasi"
                          >
                            <Copy size={16} weight="bold" />
                          </button>

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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
