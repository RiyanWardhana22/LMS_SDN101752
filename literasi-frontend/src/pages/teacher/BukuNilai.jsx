import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  UsersThree,
  Funnel,
  Target,
  Brain,
  WarningCircle,
  Lightbulb,
  TrendDown,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { apiEndpoint } from "../../config/api";
import Swal from "sweetalert2";

export default function BukuNilai() {
  const [rombelList, setRombelList] = useState([]);
  const [selectedRombel, setSelectedRombel] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("Semua");
  const [siswaList, setSiswaList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [scoresMap, setScoresMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // KKM (Kriteria Ketuntasan Minimal) - Bisa disesuaikan
  const KKM = 70;

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

  // ==========================================
  // LOGIKA ANALITIK KNOWLEDGE GAP
  // ==========================================

  // 1. Analisis Per Topik (Tugas/Kuis)
  const taskAnalytics = useMemo(() => {
    return filteredTasks.map((task) => {
      let total = 0;
      let count = 0;
      siswaList.forEach((siswa) => {
        const nilai = scoresMap[siswa.id]?.[task.id];
        if (nilai !== undefined && nilai !== null) {
          total += parseFloat(nilai);
          count++;
        }
      });
      const avg = count > 0 ? Math.round(total / count) : 0;
      return {
        ...task,
        label_pendek:
          task.judul.length > 12
            ? task.judul.substring(0, 12) + "..."
            : task.judul,
        rata_rata: avg,
        jumlah_mengerjakan: count,
        isKritis: avg > 0 && avg < KKM,
      };
    });
  }, [filteredTasks, siswaList, scoresMap]);

  // 2. Cari Topik Terlemah & Terkuat
  const topikTerlemah = [...taskAnalytics]
    .filter((t) => t.jumlah_mengerjakan > 0)
    .sort((a, b) => a.rata_rata - b.rata_rata)[0];

  const topikTerkuat = [...taskAnalytics]
    .filter((t) => t.jumlah_mengerjakan > 0)
    .sort((a, b) => b.rata_rata - a.rata_rata)[0];

  // 3. Analisis Siswa (Mencari siapa yang butuh bimbingan)
  const studentAnalytics = useMemo(() => {
    return siswaList
      .map((siswa) => {
        let total = 0;
        let count = 0;
        let weakTopics = [];

        filteredTasks.forEach((task) => {
          const nilai = scoresMap[siswa.id]?.[task.id];
          if (nilai !== undefined && nilai !== null) {
            total += parseFloat(nilai);
            count++;
            if (nilai < KKM) weakTopics.push(task.judul);
          }
        });

        const rata_rata = count > 0 ? Math.round(total / count) : 0;
        return {
          ...siswa,
          rata_rata,
          weakTopics,
          isAtRisk: count > 0 && rata_rata < KKM,
        };
      })
      .filter((s) => s.isAtRisk)
      .sort((a, b) => a.rata_rata - b.rata_rata); // Urutkan dari nilai terendah
  }, [siswaList, filteredTasks, scoresMap]);

  return (
    <DashboardLayout role="guru" title="Analitik Pemahaman Siswa">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-6">
        {/* ========================================== */}
        {/* HEADER & FILTER */}
        {/* ========================================== */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">
              Peta Pemahaman Topik
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Kenali celah materi dan temukan siswa yang butuh bimbingan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#3498db] transition-all w-full sm:w-48">
              <UsersThree weight="fill" className="text-slate-400" size={18} />
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm w-full appearance-none"
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
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#3498db] transition-all w-full sm:w-48">
                <Funnel weight="fill" className="text-slate-400" size={18} />
                <select
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm w-full appearance-none"
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
        </div>

        {!selectedRombel ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <Brain size={48} weight="duotone" className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Analitik Cerdas
            </h3>
            <p className="font-bold text-slate-500">
              Pilih kelas terlebih dahulu untuk melihat celah pemahaman siswa di
              setiap materi.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse">
            Menganalisis hasil belajar siswa...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Belum Ada Data
            </h3>
            <p className="font-bold text-slate-500">
              Kelas ini belum memiliki evaluasi atau kuis untuk dianalisis.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* ========================================== */}
            {/* SUMMARY CARDS (Topik Kuat vs Lemah) */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Topik Terlemah */}
              <div className="bg-white rounded-3xl p-6 border-2 border-rose-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                    <WarningCircle weight="fill" size={28} />
                  </div>
                  <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                    Kritis
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Topik Paling Sulit
                  </p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate">
                    {topikTerlemah?.rata_rata > 0
                      ? topikTerlemah.judul
                      : "Belum Ada"}
                  </h3>
                  <p className="text-sm font-bold text-rose-600">
                    Rata-rata: {topikTerlemah?.rata_rata || 0}
                  </p>
                </div>
                <TrendDown
                  weight="duotone"
                  size={120}
                  className="absolute -right-6 -bottom-6 text-rose-50 opacity-50 group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Topik Terkuat */}
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                    <Target weight="fill" size={28} />
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Dikuasai
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Topik Paling Dikuasai
                  </p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate">
                    {topikTerkuat?.rata_rata > 0
                      ? topikTerkuat.judul
                      : "Belum Ada"}
                  </h3>
                  <p className="text-sm font-bold text-emerald-600">
                    Rata-rata: {topikTerkuat?.rata_rata || 0}
                  </p>
                </div>
                <CheckCircle
                  weight="duotone"
                  size={120}
                  className="absolute -right-6 -bottom-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Siswa Butuh Bimbingan */}
              <div className="bg-slate-900 rounded-3xl p-6 shadow-md relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-white/10 text-white rounded-2xl">
                    <Brain weight="fill" size={28} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Siswa Butuh Bimbingan
                  </p>
                  <h3 className="text-4xl font-black text-white leading-tight mb-1">
                    {studentAnalytics.length}{" "}
                    <span className="text-base text-slate-400 font-bold">
                      Anak
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {/* ========================================== */}
            {/* GRAFIK BAR: TINGKAT PEMAHAMAN PER TOPIK */}
            {/* ========================================== */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-[#fff3ee] text-[#ff6b35] rounded-xl">
                  <Lightbulb weight="fill" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Grafik Penguasaan Materi
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    Batang merah menunjukkan materi yang butuh diulas kembali di
                    kelas (Rata-rata &lt; {KKM}).
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskAnalytics}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="label_pendek"
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        `${value} Poin`,
                        "Rata-Rata Kelas",
                      ]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.judul || label
                      }
                    />
                    {/* Garis KKM */}
                    <ReferenceLine
                      y={KKM}
                      stroke="#cbd5e1"
                      strokeDasharray="5 5"
                      label={{
                        position: "insideTopLeft",
                        value: `Batas KKM (${KKM})`,
                        fill: "#94a3b8",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    />
                    <Bar
                      dataKey="rata_rata"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      animationDuration={1500}
                    >
                      {taskAnalytics.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.rata_rata === 0
                              ? "#e2e8f0" // Belum ada yang ngerjakan
                              : entry.rata_rata < KKM
                                ? "#fb7185" // Merah (Di bawah KKM)
                                : "#2ecc71" // Hijau (Di atas KKM)
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================== */}
            {/* DAFTAR SISWA PRIORITAS BIMBINGAN */}
            {/* ========================================== */}
            {studentAnalytics.length > 0 && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
                <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-rose-600">
                      Siswa Prioritas Bimbingan
                    </h3>
                    <p className="text-xs font-bold text-rose-400">
                      Siswa dengan rata-rata total di bawah KKM ({KKM})
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentAnalytics.map((siswa, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 font-black flex items-center justify-center text-lg">
                            {siswa.rata_rata}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-800 text-[15px]">
                            {siswa.nama}
                          </h4>
                          <p className="text-xs font-bold text-slate-400 mb-2">
                            Materi yang belum dikuasai:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {siswa.weakTopics.map((topik, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200"
                              >
                                {topik}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
