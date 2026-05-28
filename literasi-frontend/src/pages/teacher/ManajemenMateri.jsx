import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Plus,
  PencilSimple,
  Trash,
  Eye,
  Copy,
  UsersThree,
} from "@phosphor-icons/react";

export default function ManajemenMateri() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchMateri = async () => {
    try {
      const response = await fetch(
        `http://localhost/lms_sdn101752/literasi-backend/api/materi/read.php?guru_id=${user.id}`,
      );
      const data = await response.json();
      if (data.status === "success") setMateriList(data.data);
    } catch (error) {
      console.error("Gagal memuat materi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) fetchMateri();
  }, [user.id]);

  const handleDuplicate = async (id, judul) => {
    Swal.fire({
      title: "Gandakan Materi?",
      text: `Anda akan membuat salinan dari materi "${judul}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff6b35",
      confirmButtonText: "Ya, Gandakan!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://localhost/lms_sdn101752/literasi-backend/api/materi/duplicate.php",
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
            fetchMateri();
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
      title: "Hapus Materi?",
      text: `Materi "${judul}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://localhost/lms_sdn101752/literasi-backend/api/materi/delete.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
          );
          const data = await response.json();
          if (data.status === "success") {
            setMateriList(materiList.filter((m) => m.id !== id));
            Swal.fire("Terhapus!", "Materi berhasil dihapus.", "success");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghapus materi.", "error");
        }
      }
    });
  };

  return (
    <DashboardLayout role="guru" title="Pusat Materi">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900">
            Materi Pembelajaran
          </h2>
          <button
            onClick={() => navigate("/guru/materi/baru")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b35] hover:bg-[#e0531f] text-white font-bold rounded-xl shadow-[0_4px_0_#b83f12] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus weight="bold" size={20} /> Buat Materi
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20 font-bold text-neutral-400">
              Memuat data materi...
            </div>
          ) : materiList.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 font-medium">
              Belum ada materi. Mulai dengan membuat materi baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                    <th className="p-5 w-1/3">Judul Materi</th>
                    <th className="p-5">Target Kelas</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm font-semibold">
                  {materiList.map((materi) => (
                    <tr
                      key={materi.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-5">
                        <div
                          className="font-black text-neutral-800 text-base mb-1 truncate w-64"
                          title={materi.judul}
                        >
                          {materi.judul}
                        </div>
                        <div className="text-xs font-bold text-neutral-400">
                          {materi.mata_pelajaran}
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
                              {materi.nama_kelas || "Belum Diatur"}
                            </span>
                            {materi.kode_unik && (
                              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                                KODE: {materi.kode_unik}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${materi.visibilitas === "publik" ? "bg-[#eafaf1] text-[#2ecc71]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                        >
                          {materi.visibilitas}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/guru/materi/edit/${materi.id}`)
                            }
                            className="p-2 bg-neutral-100 hover:bg-[#3498db] hover:text-white text-neutral-600 rounded-xl transition-colors cursor-pointer"
                            title="Edit Materi"
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          {/* TOMBOL DUPLIKAT BARU */}
                          <button
                            onClick={() =>
                              handleDuplicate(materi.id, materi.judul)
                            }
                            className="p-2 bg-neutral-100 hover:bg-[#9b59b6] hover:text-white text-neutral-600 rounded-xl transition-colors cursor-pointer"
                            title="Duplikat Materi"
                          >
                            <Copy size={18} weight="bold" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(materi.id, materi.judul)
                            }
                            className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Permanen"
                          >
                            <Trash size={18} weight="bold" />
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
