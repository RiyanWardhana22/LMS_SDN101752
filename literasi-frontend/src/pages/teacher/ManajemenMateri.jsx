import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiEndpoint } from "../../config/api";
import {
  Plus,
  PencilSimple,
  Trash,
  Copy,
  UsersThree,
  BookBookmark,
  ArrowLeft,
  FolderOpen,
} from "@phosphor-icons/react";

export default function ManajemenMateri() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [rombelList, setRombelList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedRombelId, setSelectedRombelId] = useState("");
  const [activeTab, setActiveTab] = useState("materi");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchSemuaData = async () => {
    setIsLoading(true);
    try {
      const [resMateri, resTugas, resRombel] = await Promise.all([
        fetch(apiEndpoint("api/materi/read.php")),
        fetch(apiEndpoint("api/tugas/read.php")),
        fetch(apiEndpoint("api/kelas/read_rombel.php")),
      ]);

      const dataMateri = await resMateri.json();
      const dataTugas = await resTugas.json();
      const dataRombel = await resRombel.json();

      if (dataMateri.status === "success") setMateriList(dataMateri.data);
      if (dataTugas.status === "success") setTugasList(dataTugas.data);
      if (dataRombel.status === "success") setRombelList(dataRombel.data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) fetchSemuaData();
  }, [user.id]);

  // Filter data berdasarkan kelas yang dipilih
  const filteredMateri = selectedRombelId
    ? materiList.filter((m) => m.rombel_id == selectedRombelId)
    : [];
  const filteredTugas = selectedRombelId
    ? tugasList.filter((t) => t.rombel_id == selectedRombelId)
    : [];

  const albumMap = {};
  filteredMateri.forEach((m) => {
    const key = `${m.mata_pelajaran || "Umum"}_${m.rombel_id}`;
    if (!albumMap[key])
      albumMap[key] = {
        id_kunci: key,
        mata_pelajaran: m.mata_pelajaran || "Umum",
        rombel_id: m.rombel_id,
        nama_kelas: m.nama_kelas,
        materi_items: [],
        tugas_items: [],
      };
    albumMap[key].materi_items.push(m);
  });

  filteredTugas.forEach((t) => {
    const key = `${t.mata_pelajaran || "Umum"}_${t.rombel_id}`;
    if (!albumMap[key])
      albumMap[key] = {
        id_kunci: key,
        mata_pelajaran: t.mata_pelajaran || "Umum",
        rombel_id: t.rombel_id,
        nama_kelas: t.nama_kelas,
        materi_items: [],
        tugas_items: [],
      };
    albumMap[key].tugas_items.push(t);
  });

  const albumList = Object.values(albumMap);

  const handleDuplicateMateri = async (id, judul) => {
    Swal.fire({
      title: "Gandakan Materi?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff6b35",
      confirmButtonText: "Ya!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const response = await fetch(apiEndpoint("api/materi/duplicate.php"), {
          method: "POST",
          body: JSON.stringify({ id }),
        });
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
          fetchSemuaData();
        }
      }
    });
  };

  const handleDeleteMateri = async (id, judul) => {
    Swal.fire({
      title: "Hapus Materi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Hapus!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const response = await fetch(apiEndpoint("api/materi/delete.php"), {
          method: "POST",
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (data.status === "success") {
          setMateriList(materiList.filter((m) => m.id !== id));
          Swal.fire("Terhapus!", "", "success");
        }
      }
    });
  };

  const handleDuplicateTugas = async (id, judul) => {
    Swal.fire({
      title: "Gandakan Evaluasi?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3498db",
      confirmButtonText: "Ya!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const response = await fetch(apiEndpoint("api/tugas/duplicate.php"), {
          method: "POST",
          body: JSON.stringify({ id }),
        });
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
          fetchSemuaData();
        }
      }
    });
  };

  const handleDeleteTugas = async (id, judul) => {
    Swal.fire({
      title: "Hapus Evaluasi?",
      text: "Nilai siswa juga akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Hapus!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const response = await fetch(apiEndpoint("api/tugas/delete.php"), {
          method: "POST",
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (data.status === "success") {
          setTugasList(tugasList.filter((t) => t.id !== id));
          Swal.fire("Terhapus!", "", "success");
        }
      }
    });
  };

  const renderDetailView = () => {
    const folderData = albumList.find(
      (a) => a.id_kunci === selectedFolder.id_kunci,
    );
    const m_items = folderData ? folderData.materi_items : [];
    const t_items = folderData ? folderData.tugas_items : [];

    return (
      <div className="animate-fade-in flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedFolder(null)}
              className="p-2 bg-neutral-100 hover:bg-[#ff6b35] hover:text-white text-neutral-600 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft weight="bold" size={24} />
            </button>
            <div>
              <h2 className="text-xl font-black text-neutral-900 leading-none mb-1">
                {selectedFolder.mata_pelajaran}
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                {selectedFolder.nama_kelas}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              activeTab === "materi"
                ? navigate("/guru/materi/tambah")
                : navigate("/guru/tugas/tambah")
            }
            className={`flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-xl active:translate-y-1 active:shadow-none transition-all cursor-pointer ${activeTab === "materi" ? "bg-[#ff6b35] hover:bg-[#e0531f] shadow-[0_4px_0_#b83f12]" : "bg-[#3498db] hover:bg-[#2980b9] shadow-[0_4px_0_#2471a3]"}`}
          >
            <Plus weight="bold" size={20} /> Tambah{" "}
            {activeTab === "materi" ? "Materi" : "Tugas"}
          </button>
        </div>

        <div className="flex bg-white border border-neutral-200 p-1.5 rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("materi")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer ${activeTab === "materi" ? "bg-[#fff3ee] text-[#ff6b35]" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            Materi Belajar ({m_items.length})
          </button>
          <button
            onClick={() => setActiveTab("tugas")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer ${activeTab === "tugas" ? "bg-[#ebf5fb] text-[#3498db]" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            Evaluasi & Kuis ({t_items.length})
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "materi" ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                    <th className="p-5">Judul Materi</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm font-semibold">
                  {m_items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-10 text-center text-neutral-400"
                      >
                        Belum ada materi di folder ini.
                      </td>
                    </tr>
                  ) : (
                    m_items.map((materi) => (
                      <tr key={materi.id} className="hover:bg-neutral-50">
                        <td className="p-5 font-black text-neutral-800 text-base">
                          {materi.judul}
                        </td>
                        <td className="p-5 text-center">
                          <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-[#eafaf1] text-[#2ecc71]">
                            {materi.visibilitas}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/guru/materi/edit/${materi.id}`)
                              }
                              className="p-2 bg-neutral-100 hover:bg-[#ff6b35] hover:text-white text-neutral-600 rounded-xl cursor-pointer"
                            >
                              <PencilSimple size={18} weight="bold" />
                            </button>
                            <button
                              onClick={() =>
                                handleDuplicateMateri(materi.id, materi.judul)
                              }
                              className="p-2 bg-neutral-100 hover:bg-[#9b59b6] hover:text-white text-neutral-600 rounded-xl cursor-pointer"
                            >
                              <Copy size={18} weight="bold" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMateri(materi.id, materi.judul)
                              }
                              className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl cursor-pointer"
                            >
                              <Trash size={18} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                    <th className="p-5">Informasi Evaluasi</th>
                    <th className="p-5 text-center">Tenggat Waktu</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm font-semibold">
                  {t_items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-10 text-center text-neutral-400"
                      >
                        Belum ada tugas atau kuis di folder ini.
                      </td>
                    </tr>
                  ) : (
                    t_items.map((tugas) => (
                      <tr key={tugas.id} className="hover:bg-neutral-50">
                        <td className="p-5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase mb-1 inline-block ${tugas.tipe === "kuis" ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                          >
                            {tugas.tipe}
                          </span>
                          <div className="font-black text-neutral-800 text-base">
                            {tugas.judul}
                          </div>
                        </td>
                        <td className="p-5 text-center text-xs font-bold text-neutral-500">
                          {new Date(tugas.tenggat).toLocaleString("id-ID")}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/guru/tugas/koreksi/${tugas.id}`)
                              }
                              className="px-3 py-1.5 bg-[#eafaf1] hover:bg-[#2ecc71] hover:text-white text-[#2ecc71] text-xs font-black rounded-xl cursor-pointer border border-[#2ecc71]/20"
                            >
                              Lihat Hasil
                            </button>
                            <button
                              onClick={() =>
                                handleDuplicateTugas(tugas.id, tugas.judul)
                              }
                              className="p-2 bg-neutral-100 hover:bg-[#9b59b6] hover:text-white text-neutral-600 rounded-xl cursor-pointer"
                            >
                              <Copy size={16} weight="bold" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTugas(tugas.id, tugas.judul)
                              }
                              className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl cursor-pointer"
                            >
                              <Trash size={16} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAlbumView = () => (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Header Baru dengan Fitur Dropdown Pilihan Kelas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 mb-1">
            Pusat Pembelajaran
          </h2>
          <p className="text-sm font-bold text-neutral-500">
            Pilih kelas untuk mengelola materi dan tugas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedRombelId}
            onChange={(e) => setSelectedRombelId(e.target.value)}
            className="bg-neutral-50 border-2 border-neutral-100 text-neutral-700 text-sm rounded-xl focus:ring-0 focus:border-[#3498db] p-3 font-bold cursor-pointer w-full sm:w-64 outline-none transition-all appearance-none"
          >
            <option value="" disabled>
              -- Pilih Kelas --
            </option>
            {rombelList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama_kelas} {r.kode_unik ? `(Kode: ${r.kode_unik})` : ""}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate("/guru/materi/tambah")}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#ff6b35] hover:bg-[#e0531f] text-white font-bold rounded-xl shadow-[0_4px_0_#b83f12] active:translate-y-1 active:shadow-none transition-all cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Plus weight="bold" size={20} /> Materi Baru
          </button>
        </div>
      </div>

      {/* Tampilan Konten Berdasarkan Status Pilihan Kelas */}
      {!selectedRombelId ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-neutral-100 shadow-sm flex flex-col items-center mt-4">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <UsersThree size={48} weight="duotone" className="text-[#3498db]" />
          </div>
          <h3 className="text-xl font-black text-neutral-900 mb-2">
            Pilih Kelas Terlebih Dahulu
          </h3>
          <p className="font-bold text-neutral-500">
            Silakan pilih kelas pada menu dropdown di atas untuk menampilkan
            daftar mata pelajaran.
          </p>
        </div>
      ) : albumList.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-neutral-100 shadow-sm flex flex-col items-center mt-4">
          <BookBookmark
            size={64}
            weight="thin"
            className="text-neutral-300 mb-4"
          />
          <h3 className="text-xl font-black text-neutral-900 mb-2">
            Belum Ada Mata Pelajaran
          </h3>
          <p className="font-bold text-neutral-500">
            Buat materi atau tugas pertama Anda di kelas ini untuk membangun
            album secara otomatis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {albumList.map((album, index) => (
            <button
              key={album.id_kunci}
              onClick={() => setSelectedFolder(album)}
              className="bg-white p-6 rounded-3xl border-2 border-neutral-100 hover:border-[#ff6b35] hover:shadow-[0_8px_0_#ff6b35] hover:-translate-y-1 transition-all cursor-pointer text-left group flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-4 rounded-2xl ${index % 2 === 0 ? "bg-[#fff3ee] text-[#ff6b35]" : "bg-[#ebf5fb] text-[#3498db]"} group-hover:scale-110 transition-transform duration-300`}
                >
                  <FolderOpen weight="fill" size={32} />
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="bg-neutral-100 text-neutral-600 font-black text-[10px] px-2 py-1 rounded-lg border border-neutral-200">
                    {album.materi_items.length} Materi
                  </span>
                  <span className="bg-neutral-100 text-neutral-600 font-black text-[10px] px-2 py-1 rounded-lg border border-neutral-200">
                    {album.tugas_items.length} Tugas
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 mb-1 group-hover:text-[#ff6b35] transition-colors line-clamp-1">
                  {album.mata_pelajaran}
                </h3>
                <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-500">
                  {album.nama_kelas}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout role="guru" title="Pusat Pembelajaran">
      <div className="max-w-6xl mx-auto pb-12">
        {isLoading ? (
          <div className="text-center py-20 font-bold text-neutral-400 animate-pulse">
            Memuat ruang kelas...
          </div>
        ) : selectedFolder ? (
          renderDetailView()
        ) : (
          renderAlbumView()
        )}
      </div>
    </DashboardLayout>
  );
}
