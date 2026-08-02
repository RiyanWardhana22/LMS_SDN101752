import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { Star, Fire } from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";
import { getSubjectTheme } from "../../utils/subjectThemes";

// Komponen Skeleton Loading untuk node peta
function SkeletonNode() {
  return (
    <div className="relative mb-14 flex flex-col items-center w-full">
      <div className="mb-3 px-4 py-1.5 rounded-xl bg-neutral-200 w-24 h-6 animate-pulse"></div>
      <div className="w-24 h-24 rounded-full bg-neutral-200 animate-pulse border-4 border-white"></div>
      <div className="mt-4 w-32 h-3 rounded-full bg-neutral-200 animate-pulse"></div>
    </div>
  );
}

export default function BerandaSiswa() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {
    nama: "Siswa",
    xp: 0,
    id: null,
    rombel_id: null,
  };

  const [wilayah, setWilayah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi fetch data - bisa dipanggil ulang
  const fetchPeta = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const siswaId = user.id;
      if (!siswaId) {
        throw new Error("Siswa tidak teridentifikasi. Silakan login ulang.");
      }

      const url = `${apiEndpoint("api/siswa/peta_belajar.php")}?siswa_id=${siswaId}`;
      console.log("[BerandaSiswa] Fetching:", url);

      const response = await fetch(url);

      // Cek jika response tidak OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[BerandaSiswa] Error response:", errorText);
        
        if (errorText.includes('<html') || errorText.includes('PHP') || errorText.includes('<br')) {
          throw new Error(`Server error (${response.status}). Silakan cek koneksi atau hubungi admin.`);
        }
        
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 150)}`);
      }

      const data = await response.json();
      console.log("[BerandaSiswa] Response data:", data);

      if (data.status === "success") {
        setWilayah(data.data || []);
      } else {
        setError(data.message || "Gagal memuat data peta belajar");
      }
    } catch (err) {
      console.error("[BerandaSiswa] Error:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Fetch data saat mount
  useEffect(() => {
    fetchPeta();
  }, [fetchPeta]);

  // REFETCH saat kembali dari halaman lain (misal setelah submit tugas)
  useEffect(() => {
    // Jika ada state dari navigasi bahwa user baru saja submit
    if (location.state?.justSubmitted) {
      console.log("[BerandaSiswa] Detected justSubmitted, refetching...");
      fetchPeta();
      // Clear state agar tidak refetch terus
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, fetchPeta]);

  // Hitung statistik
  const selesaiCount = wilayah.filter((w) => w.status === "selesai").length;
  const totalWilayah = wilayah.length;
  const progressPercent = totalWilayah > 0 ? (selesaiCount / totalWilayah) * 100 : 0;

  // Handler navigasi ke detail wilayah
  const handleWilayahClick = (mataPelajaran) => {
    navigate(`/siswa/wilayah/${encodeURIComponent(mataPelajaran)}`);
  };

  return (
    <StudentLayout>
      {/* === Hero / Motivasi === */}
      <div
        className="mb-6 p-5 rounded-3xl text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)",
          boxShadow: "0 8px 24px rgba(255,107,53,0.30)",
        }}
      >
        <div className="relative z-10">
          <p className="text-sm font-bold opacity-80 mb-0.5">Selamat datang kembali! 🎉</p>
          <h1
            className="text-2xl font-black leading-tight mb-3"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Ayo selesaikan petualanganmu, {user.nama?.split(" ")[0] || "Siswa"}!
          </h1>

          {/* Mini progress bar */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "white",
                }}
              />
            </div>
            <span className="text-xs font-black opacity-90">
              {selesaiCount}/{totalWilayah} Wilayah
            </span>
          </div>
        </div>

        {/* Dekorasi latar */}
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none">🗺️</div>
      </div>

      {/* === Peta Petualangan === */}
      <h2
        className="text-center text-xl font-black mb-2"
        style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}
      >
        🗺️ Peta Petualangan
      </h2>
      <p className="text-center text-sm font-bold mb-8" style={{ color: "var(--color-neutral-500)" }}>
        Tap wilayah untuk mulai belajar!
      </p>

      <div className="relative pb-10 flex flex-col items-center">
        {/* Garis jalur putus-putus */}
        <div
          className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0 border-l-8 border-dashed -z-10"
          style={{ borderColor: "var(--color-neutral-300)" }}
        />

        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, idx) => <SkeletonNode key={idx} />)
        ) : error ? (
          // Error state
          <div className="text-center py-8 px-4" style={{ color: "var(--color-error)" }}>
            <p className="text-5xl mb-3">⚠️</p>
            <p className="font-bold text-lg mb-2">Oops! Terjadi Kesalahan</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-neutral-500)" }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--color-primary)",
                boxShadow: "var(--shadow-button-primary)",
              }}
            >
              🔄 Coba Lagi
            </button>
          </div>
        ) : wilayah.length === 0 ? (
          // Empty state
          <div className="text-center py-8" style={{ color: "var(--color-neutral-500)" }}>
            <p className="text-5xl mb-3">📭</p>
            <p className="font-black text-lg" style={{ color: "var(--color-neutral-900)" }}>
              Belum ada materi atau tugas
            </p>
            <p className="font-bold text-sm">Gurumu belum menambahkan konten untuk kelasmu.</p>
          </div>
        ) : (
          // Render wilayah
          wilayah.map((wilayahItem, index) => {
            const theme = getSubjectTheme(wilayahItem.mata_pelajaran);
            const isLeft = index % 2 === 0;
            const shift = index === 0 ? "" : isLeft ? "-translate-x-12" : "translate-x-12";
            const isCompleted = wilayahItem.status === "selesai";

            return (
              <div
                key={wilayahItem.mata_pelajaran}
                className={`relative mb-14 flex flex-col items-center w-full ${shift}`}
              >
                {/* Label nama wilayah */}
                <div
                  className="mb-3 px-4 py-1.5 rounded-xl font-bold text-sm border-2 bg-white transition-all"
                  style={{
                    borderColor: theme.color,
                    color: theme.color,
                    boxShadow: `0 2px 8px ${theme.color}30`,
                  }}
                >
                  {wilayahItem.mata_pelajaran}
                </div>

                {/* Node / Tombol Pulau */}
                <button
                  onClick={() => handleWilayahClick(wilayahItem.mata_pelajaran)}
                  className={`
                    relative w-24 h-24 rounded-full flex items-center justify-center text-4xl 
                    transition-all duration-200 active:scale-95 cursor-pointer
                    ${!isCompleted ? "animate-bounce" : ""}
                  `}
                  style={{
                    backgroundColor: theme.color,
                    boxShadow: `0 8px 0 ${theme.shadowColor}`,
                    border: "4px solid white",
                  }}
                >
                  <span>{theme.icon}</span>

                  {/* Bintang jika selesai */}
                  {isCompleted && (
                    <div
                      className="absolute -bottom-2 -right-2 rounded-full p-1 border-2 bg-white animate-pop"
                      style={{ borderColor: "var(--color-accent-yellow)" }}
                    >
                      <Star weight="fill" size={20} style={{ color: "var(--color-accent-yellow)" }} />
                    </div>
                  )}

                  {/* Badge progress jika aktif */}
                  {!isCompleted && (
                    <div
                      className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {wilayahItem.progress_percent}%
                    </div>
                  )}
                </button>

                {/* Progress bar jika aktif */}
                {!isCompleted && (
                  <div className="mt-4 flex flex-col items-center gap-1">
                    <div
                      className="w-32 h-3 rounded-full overflow-hidden border"
                      style={{
                        backgroundColor: "var(--color-neutral-300)",
                        borderColor: "var(--color-neutral-300)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${wilayahItem.progress_percent}%`,
                          backgroundColor: theme.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
                      {wilayahItem.progress_percent}% selesai
                    </span>
                  </div>
                )}

                {/* Bintang 3 jika sudah selesai */}
                {isCompleted && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} weight="fill" size={14} style={{ color: "var(--color-accent-yellow)" }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Peti harta karun di ujung */}
        <div
          className="mt-4 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl z-10"
          style={{
            background: "linear-gradient(135deg, #FFD700, #F39C12)",
            boxShadow: "0 8px 0 #D68910, 0 0 24px rgba(255,215,0,0.40)",
            border: "4px solid white",
          }}
        >
          🎁
        </div>
        <p className="mt-3 text-xs font-black" style={{ color: "var(--color-neutral-500)" }}>
          Selesaikan semua wilayah untuk membuka hadiah!
        </p>
      </div>
    </StudentLayout>
  );
}
