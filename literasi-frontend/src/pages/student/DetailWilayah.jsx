// src/pages/student/DetailWilayah.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { ArrowLeft, BookOpen, Pencil } from "@phosphor-icons/react";
import { getSubjectTheme } from "../../utils/subjectThemes";
import { apiEndpoint } from "../../config/api";

export default function DetailWilayah() {
  const navigate = useNavigate();
  const { mataPelajaran } = useParams();
  const decodedMapel = decodeURIComponent(mataPelajaran);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wilayahData, setWilayahData] = useState(null);

  // Ambil data peta belajar dari API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem("user")) || {};
        const siswaId = user.id;

        if (!siswaId) {
          throw new Error("Siswa tidak teridentifikasi. Silakan login ulang.");
        }

        const url = `${apiEndpoint("api/siswa/peta_belajar.php")}?siswa_id=${siswaId}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[DetailWilayah] Error response:", errorText);
          throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();

        if (data.status === "success") {
          // Cari data mata pelajaran yang sesuai
          const found = data.data.find(
            (item) => item.mata_pelajaran === decodedMapel
          );

          if (found) {
            setWilayahData(found);
          } else {
            setError(`Mata pelajaran "${decodedMapel}" tidak ditemukan.`);
          }
        } else {
          setError(data.message || "Gagal memuat data");
        }
      } catch (err) {
        console.error("[DetailWilayah] Error:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (decodedMapel) {
      fetchDetail();
    }
  }, [decodedMapel]);

  const theme = getSubjectTheme(decodedMapel);

  const handleBack = () => {
    navigate("/siswa/beranda");
  };

  const handlePilihMateri = () => {
    navigate(`/siswa/materi?mapel=${encodeURIComponent(decodedMapel)}`);
  };

  const handlePilihTugas = () => {
    navigate(`/siswa/evaluasi?mapel=${encodeURIComponent(decodedMapel)}`);
  };

  return (
    <StudentLayout>
      <div className="page-enter">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl font-bold transition-all hover:bg-neutral-100"
          style={{ color: "var(--color-neutral-500)" }}
        >
          <ArrowLeft size={20} weight="bold" />
          <span className="text-sm">Kembali ke Beranda</span>
        </button>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--color-primary)" }} />
            <p className="mt-4 font-bold" style={{ color: "var(--color-neutral-500)" }}>
              Memuat data...
            </p>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12 px-4" style={{ color: "var(--color-error)" }}>
            <p className="text-5xl mb-4">⚠️</p>
            <p className="font-bold text-lg mb-2">Oops! Terjadi Kesalahan</p>
            <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
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
        ) : (
          // Content
          <>
            {/* Header dengan Icon Mapel */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                style={{
                  backgroundColor: theme.color,
                  boxShadow: `0 8px 0 ${theme.shadowColor}`,
                }}
              >
                <span className="text-white">{theme.icon}</span>
              </div>
              <div>
                <h1
                  className="text-3xl font-black"
                  style={{
                    fontFamily: "'Fredoka One', sans-serif",
                    color: "var(--color-neutral-900)",
                  }}
                >
                  {decodedMapel}
                </h1>
                <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
                  Pilih salah satu untuk mulai belajar!
                </p>
              </div>
            </div>

            {/* Progress Ringkasan */}
            {wilayahData && (
              <div
                className="mb-8 p-4 rounded-2xl flex items-center justify-between"
                style={{
                  backgroundColor: "var(--color-neutral-50)",
                  border: "2px solid var(--color-neutral-200)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white"
                    style={{ backgroundColor: theme.color }}
                  >
                    {wilayahData.progress_percent}%
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
                      Progress Belajar
                    </p>
                    <p className="text-sm font-black" style={{ color: "var(--color-neutral-900)" }}>
                      {wilayahData.tugas_selesai}/{wilayahData.total_tugas} Tugas Selesai
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dua Card Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Materi */}
              <button
                className="p-8 rounded-3xl text-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                style={{
                  backgroundColor: "white",
                  border: "3px solid var(--color-neutral-200)",
                  boxShadow: "var(--shadow-card)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.color;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${theme.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-neutral-200)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
                onClick={handlePilihMateri}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                <h3 className="text-2xl font-black mb-2" style={{ color: "var(--color-neutral-900)" }}>
                  Materi
                </h3>
                <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
                  {wilayahData?.total_materi || 0} Materi Tersedia
                </p>
                <div
                  className="mt-4 px-6 py-2 rounded-full text-sm font-black text-white inline-block transition-all group-hover:scale-105"
                  style={{ backgroundColor: theme.color }}
                >
                  <BookOpen weight="bold" size={16} className="inline mr-2" />
                  Baca Sekarang
                </div>
              </button>

              {/* Card Tugasku */}
              <button
                className="p-8 rounded-3xl text-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                style={{
                  backgroundColor: "white",
                  border: "3px solid var(--color-neutral-200)",
                  boxShadow: "var(--shadow-card)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.color;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${theme.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-neutral-200)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
                onClick={handlePilihTugas}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✏️</div>
                <h3 className="text-2xl font-black mb-2" style={{ color: "var(--color-neutral-900)" }}>
                  Tugasku
                </h3>
                <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
                  {wilayahData?.tugas_selesai || 0}/{wilayahData?.total_tugas || 0} Selesai
                </p>
                <div
                  className="mt-4 px-6 py-2 rounded-full text-sm font-black text-white inline-block transition-all group-hover:scale-105"
                  style={{ backgroundColor: theme.color }}
                >
                  <Pencil weight="bold" size={16} className="inline mr-2" />
                  Kerjakan Sekarang
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}