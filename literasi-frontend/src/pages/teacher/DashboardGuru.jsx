import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiEndpoint } from "../../config/api";
import {
  Users,
  Notebook,
  ChartLine,
  BookBookmark,
  Plus,
  Megaphone,
  FileText,
  Sparkle,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function DashboardGuru() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    tugasAktif: 0,
    materiAktif: 0,
    rataRata: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return "Selamat Pagi";
    if (hour >= 12 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Materi Aktif Milik Guru
        const resMateri = await fetch(
          apiEndpoint(`api/materi/read.php?guru_id=${user.id}`),
        );
        const dataMateri = await resMateri.json();
        const materiCount =
          dataMateri.status === "success" ? dataMateri.data.length : 0;

        // 2. Fetch Tugas/Kuis Aktif Milik Guru
        const resTugas = await fetch(
          apiEndpoint(`api/tugas/read.php?guru_id=${user.id}`),
        );
        const dataTugas = await resTugas.json();
        const tugasList = dataTugas.status === "success" ? dataTugas.data : [];
        const tugasCount = tugasList.length;

        // 3. Fetch Rombel, Siswa, dan Nilai untuk Rata-rata & Total Siswa
        const resRombel = await fetch(apiEndpoint("api/kelas/read_rombel.php"));
        const dataRombel = await resRombel.json();
        const rombelList =
          dataRombel.status === "success" ? dataRombel.data : [];

        let totalSiswaAll = 0;
        let totalNilaiAll = 0;
        let countNilaiAll = 0;
        let allSubmissions = [];

        for (const rombel of rombelList) {
          // Hitung total siswa per rombel
          const resSiswa = await fetch(
            apiEndpoint(`api/kelas/students.php?rombel_id=${rombel.id}`),
          );
          const dataSiswa = await resSiswa.json();
          if (dataSiswa.status === "success") {
            totalSiswaAll += dataSiswa.data.length;
          }

          // Tarik rekap nilai untuk rata-rata kelas
          const resGb = await fetch(
            apiEndpoint(`api/tugas/gradebook.php?rombel_id=${rombel.id}`),
          );
          const dataGb = await resGb.json();
          if (dataGb.status === "success" && dataGb.scores) {
            Object.values(dataGb.scores).forEach((taskScores) => {
              Object.values(taskScores).forEach((val) => {
                if (val !== undefined && val !== null && !isNaN(val)) {
                  totalNilaiAll += parseFloat(val);
                  countNilaiAll++;
                }
              });
            });
          }
        }

        const rataRataKelas =
          countNilaiAll > 0
            ? (totalNilaiAll / countNilaiAll).toFixed(1)
            : "0.0";

        // 4. Tarik Aktivitas Terbaru (Pengumpulan Tugas oleh Siswa)
        for (const tugas of tugasList) {
          const resSub = await fetch(
            apiEndpoint(`api/tugas/submissions.php?tugas_id=${tugas.id}`),
          );
          const dataSub = await resSub.json();
          if (dataSub.status === "success" && dataSub.data) {
            dataSub.data.forEach((sub) => {
              allSubmissions.push({
                id: sub.id,
                namaSiswa: sub.nama_siswa,
                judulTugas: tugas.judul,
                tipeTugas: tugas.tipe,
                nilai: sub.nilai,
                waktu: sub.dikumpulkan_pada,
                tugasId: tugas.id,
              });
            });
          }
        }

        // Urutkan aktivitas dari yang paling baru
        allSubmissions.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

        setStats({
          totalSiswa: totalSiswaAll,
          tugasAktif: tugasCount,
          materiAktif: materiCount,
          rataRata: rataRataKelas,
        });

        setRecentActivities(allSubmissions.slice(0, 5)); // Ambil 5 aktivitas teratas
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.id) fetchDashboardData();
  }, [user.id]);

  return (
    <DashboardLayout role="guru" title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500">
              <Users weight="fill" size={24} />
            </div>
            <h3 className="font-bold text-sm">Siswa Terdaftar</h3>
          </div>
          {isLoading ? (
            <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
          ) : (
            <>
              <p className="text-3xl font-black text-slate-800">
                {stats.totalSiswa}{" "}
                <span className="text-lg text-slate-400 font-bold">Anak</span>
              </p>
              <p className="text-xs text-emerald-500 font-bold mt-2">
                Seluruh rombel aktif
              </p>
            </>
          )}
        </div>

        {/* Card 2: Evaluasi & Kuis */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 relative overflow-hidden hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">
            AKTIF
          </div>
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
              <Notebook weight="fill" size={24} />
            </div>
            <h3 className="font-bold text-sm">Evaluasi & Kuis</h3>
          </div>
          {isLoading ? (
            <div className="h-10 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
          ) : (
            <>
              <p className="text-3xl font-black text-slate-800">
                {stats.tugasAktif}
              </p>
              <button
                onClick={() => navigate("/guru/tugas")}
                className="text-xs text-rose-500 font-bold mt-2 hover:underline cursor-pointer"
              >
                Kelola Tugas →
              </button>
            </>
          )}
        </div>

        {/* Card 3: Rata-rata Kelas */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
              <ChartLine weight="fill" size={24} />
            </div>
            <h3 className="font-bold text-sm">Rata-rata Kelas</h3>
          </div>
          {isLoading ? (
            <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
          ) : (
            <>
              <p className="text-3xl font-black text-slate-800">
                {stats.rataRata}
              </p>
              <p className="text-xs text-blue-500 font-bold mt-2">
                Berdasarkan rekap nilai
              </p>
            </>
          )}
        </div>

        {/* Card 4: Modul Materi */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500">
              <BookBookmark weight="fill" size={24} />
            </div>
            <h3 className="font-bold text-sm">Modul Materi</h3>
          </div>
          {isLoading ? (
            <div className="h-10 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
          ) : (
            <>
              <p className="text-3xl font-black text-slate-800">
                {stats.materiAktif}
              </p>
              <button
                onClick={() => navigate("/guru/materi")}
                className="text-xs text-orange-500 font-bold mt-2 hover:underline cursor-pointer"
              >
                Lihat Pustaka →
              </button>
            </>
          )}
        </div>
      </div>

      {/* GRID BAWAH: AKSI CEPAT & FEED AKTIVITAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiri: Aksi Cepat */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-xl font-black text-slate-800 mb-2">Aksi Cepat</h3>

          <button
            onClick={() => navigate("/guru/tugas/tambah")}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-[#ff6b35] hover:bg-[#fff3ee] transition-all group text-left shadow-sm cursor-pointer"
          >
            <div className="p-3 bg-[#ff6b35] text-white rounded-2xl group-hover:scale-110 transition-transform shadow-md">
              <FileText weight="bold" size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Buat Evaluasi Baru
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Rancang tugas esai / kuis PG
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/guru/materi/tambah")}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-[#4ecdc4] hover:bg-[#f0fafa] transition-all group text-left shadow-sm cursor-pointer"
          >
            <div className="p-3 bg-[#4ecdc4] text-white rounded-2xl group-hover:scale-110 transition-transform shadow-md">
              <Plus weight="bold" size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Tambah Materi Belajar
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Unggah bacaan atau modul AR
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/guru/buku-nilai")}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-[#3498db] hover:bg-[#ebf5fb] transition-all group text-left shadow-sm cursor-pointer"
          >
            <div className="p-3 bg-[#3498db] text-white rounded-2xl group-hover:scale-110 transition-transform shadow-md">
              <ChartLine weight="bold" size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Buku Nilai & Analitik
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Rekapitulasi dan ekspor nilai
              </p>
            </div>
          </button>
        </div>

        {/* Kanan: Feed Aktivitas Terbaru dari Database */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">
              Aktivitas Kelas Terbaru
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 font-bold animate-pulse">
              Memuat aktivitas siswa...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada siswa yang mengumpulkan tugas atau kuis hari ini.
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 shadow-sm">
                    {act.namaSiswa.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {act.namaSiswa} mengumpulkan{" "}
                      <span className="text-indigo-600">
                        "{act.judulTugas}"
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {new Date(act.waktu).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/guru/tugas/koreksi/${act.tugasId}`)
                    }
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
