import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  DownloadSimple,
  Table,
  Funnel,
  UsersThree,
  BookBookmark,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function BukuNilai() {
  const [rombelList, setRombelList] = useState([]);
  const [selectedRombel, setSelectedRombel] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("Semua");

  const [siswaList, setSiswaList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [scoresMap, setScoresMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const res = await fetch(apiEndpoint("api/kelas/read_rombel.php"));
        const data = await res.json();
        if (data.status === "success") setRombelList(data.data);
      } catch (error) {
        console.error("Gagal memuat rombel", error);
      }
    };
    fetchRombel();
  }, []);

  useEffect(() => {
    if (!selectedRombel) return;

    const fetchGradebook = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          apiEndpoint(`api/tugas/gradebook.php?rombel_id=${selectedRombel}`),
        );
        const data = await res.json();
        if (data.status === "success") {
          setSiswaList(data.siswa);
          setTasksList(data.tasks);
          setScoresMap(data.scores || {});
          setSelectedMapel("Semua");
        } else {
          Swal.fire("Gagal", data.message, "error");
        }
      } catch (error) {
        console.error("Gagal memuat gradebook", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGradebook();
  }, [selectedRombel]);

  const uniqueMapel = [
    "Semua",
    ...new Set(tasksList.map((t) => t.mata_pelajaran || "Umum")),
  ];

  const filteredTasks =
    selectedMapel === "Semua"
      ? tasksList
      : tasksList.filter((t) => (t.mata_pelajaran || "Umum") === selectedMapel);

  const hitungRataRataSiswa = (siswaId) => {
    if (filteredTasks.length === 0) return 0;
    let totalNilai = 0;
    let tugasDikerjakan = 0;

    filteredTasks.forEach((task) => {
      const nilai = scoresMap[siswaId]?.[task.id];
      if (nilai !== undefined && nilai !== null) {
        totalNilai += parseFloat(nilai);
        tugasDikerjakan++;
      }
    });

    return tugasDikerjakan === 0 ? 0 : Math.round(totalNilai / tugasDikerjakan);
  };

  const exportToCSV = () => {
    if (siswaList.length === 0)
      return Swal.fire("Kosong", "Tidak ada data untuk diekspor", "warning");

    let csvContent = "Nama Siswa,Username/NISN,";
    filteredTasks.forEach((task) => {
      csvContent += `"${task.judul} (${task.tipe})",`;
    });
    csvContent += "Rata-Rata\n";

    siswaList.forEach((siswa) => {
      let row = `"${siswa.nama}","${siswa.username}",`;
      filteredTasks.forEach((task) => {
        const nilai = scoresMap[siswa.id]?.[task.id];
        row += `"${nilai !== undefined ? nilai : "-"}",`;
      });
      row += `"${hitungRataRataSiswa(siswa.id)}"\n`;
      csvContent += row;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Buku_Nilai_Kelas_${selectedRombel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role="guru" title="Buku Nilai & Analitik">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-[#3498db] focus-within:ring-2 focus-within:ring-[#3498db]/10 transition-all">
              <UsersThree weight="fill" className="text-slate-400" size={18} />
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm w-full pr-4"
              >
                <option value="" disabled>
                  -- Pilih Kelas --
                </option>
                {rombelList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            {tasksList.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-[#3498db] focus-within:ring-2 focus-within:ring-[#3498db]/10 transition-all">
                <Funnel weight="fill" className="text-slate-400" size={18} />
                <select
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm w-full pr-4"
                >
                  {uniqueMapel.map((mapel) => (
                    <option key={mapel} value={mapel}>
                      {mapel}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={exportToCSV}
            disabled={siswaList.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <DownloadSimple weight="bold" size={18} /> Ekspor Excel
          </button>
        </div>

        {!selectedRombel ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Table size={48} weight="duotone" className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Buku Nilai Otomatis
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Silakan pilih kelas di atas untuk melihat rekapitulasi nilai
              siswa.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse">
            Menyusun matriks nilai...
          </div>
        ) : siswaList.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Kelas Kosong
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Belum ada siswa yang tergabung di kelas ini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 w-72 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                      Siswa & Identitas
                    </th>

                    {filteredTasks.length === 0 ? (
                      <th className="p-4 text-slate-400 font-medium italic normal-case text-center">
                        Belum ada evaluasi
                      </th>
                    ) : (
                      filteredTasks.map((task) => (
                        <th
                          key={task.id}
                          className="p-4 text-center border-r border-slate-200 min-w-[140px] max-w-[200px]"
                        >
                          <div
                            className="truncate text-slate-700 font-bold text-xs mb-2"
                            title={task.judul}
                          >
                            {task.judul}
                          </div>
                          <div
                            className={`text-[9px] px-2.5 py-0.5 rounded-full inline-block border ${task.tipe === "kuis" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
                          >
                            {task.tipe}
                          </div>
                        </th>
                      ))
                    )}

                    <th className="p-4 text-center bg-slate-100/50 text-slate-600 border-l border-slate-200">
                      Rata-Rata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {siswaList.map((siswa, index) => {
                    const rataRata = hitungRataRataSiswa(siswa.id);
                    return (
                      <tr
                        key={siswa.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="p-4 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 group-hover:bg-slate-50/80 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0">
                            {index + 1}
                          </div>
                          <div className="truncate w-52">
                            <div
                              className="font-bold text-slate-800 truncate text-sm"
                              title={siswa.nama}
                            >
                              {siswa.nama}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                              {siswa.username}
                            </div>
                          </div>
                        </td>
                        {filteredTasks.map((task) => {
                          const nilai = scoresMap[siswa.id]?.[task.id];
                          const hasNilai =
                            nilai !== undefined && nilai !== null;
                          return (
                            <td
                              key={task.id}
                              className="p-4 text-center border-r border-slate-100"
                            >
                              {hasNilai ? (
                                <span
                                  className={`font-bold ${nilai < 70 ? "text-rose-500" : "text-emerald-600"}`}
                                >
                                  {nilai}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-4 text-center bg-slate-50 font-bold text-slate-800 border-l border-slate-200 text-base group-hover:bg-slate-100/50 transition-colors">
                          {rataRata}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
