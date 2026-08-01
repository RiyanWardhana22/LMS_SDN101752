import { useState, useEffect } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import { Trophy, LockKey, Star, Medal } from "@phosphor-icons/react";
import { getLevel } from "../../utils/level";
import { apiEndpoint } from "../../config/api";

// Konfigurasi badge
const ALL_BADGES = [
  {
    id: "bintang-pertama",
    icon: "🌟",
    label: "Bintang Pertama",
    desc: "Kumpulkan tugas pertamamu!",
    condition: (data) => data.total_tugas >= 1,
  },
  {
    id: "nilai-sempurna",
    icon: "💪",
    label: "Nilai Sempurna",
    desc: "Raih nilai 100 di salah satu tugas!",
    condition: (data) => data.nilai_terbaik === 100,
  },
  {
    id: "rajin-belajar",
    icon: "📖",
    label: "Rajin Belajar",
    desc: "Kumpulkan 5 tugas!",
    condition: (data) => data.total_tugas >= 5,
  },
  {
    id: "pencari-ilmu",
    icon: "🔍",
    label: "Pencari Ilmu",
    desc: "Kumpulkan 10 tugas!",
    condition: (data) => data.total_tugas >= 10,
  },
  {
    id: "juara-kelas",
    icon: "🏆",
    label: "Juara Kelas",
    desc: "Dapatkan nilai rata-rata 90 atau lebih!",
    condition: (data) => data.rata_rata_nilai >= 90,
  },
  {
    id: "penjelajah-ar",
    icon: "🚀",
    label: "Penjelajah AR",
    desc: "Selesaikan modul Augmented Reality!",
    condition: () => false,
    comingSoon: true,
  },
  {
    id: "pembaca-sejati",
    icon: "📚",
    label: "Pembaca Sejati",
    desc: "Baca 10 materi pembelajaran!",
    condition: () => false,
    comingSoon: true,
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-neutral-100">
      <div className="skeleton h-6 w-32 rounded-xl mb-4" />
      <div className="skeleton h-4 w-full rounded mb-3" />
      <div className="skeleton h-4 w-3/4 rounded mb-6" />
      <div className="skeleton h-4 w-full rounded mb-3" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  );
}

export default function Prestasi() {
  const user = JSON.parse(localStorage.getItem("user")) || { xp: 0, id: null };
  const [prestasiData, setPrestasiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrestasi = async () => {
      try {
        if (!user.id) {
          throw new Error("User ID tidak ditemukan");
        }
        
        const response = await fetch(apiEndpoint(`api/siswa/prestasi.php?siswa_id=${user.id}`));
        const data = await response.json();
        
        if (data.status === "success") {
          setPrestasiData(data.data);
          
          // 🔥 SYNC XP dari database ke localStorage
          if (data.data.xp !== undefined) {
            const currentUser = JSON.parse(localStorage.getItem("user")) || {};
            if (currentUser.xp !== data.data.xp) {
              currentUser.xp = data.data.xp;
              localStorage.setItem("user", JSON.stringify(currentUser));
              console.log("[Prestasi] XP synced from database:", data.data.xp);
            }
          }
        } else {
          Swal.fire({ 
            icon: "error", 
            title: "Oops", 
            text: data.message || "Gagal memuat data prestasi." 
          });
        }
      } catch (error) {
        console.error("Error fetch prestasi:", error);
        Swal.fire({ 
          icon: "error", 
          title: "Koneksi Gagal", 
          text: "Tidak dapat memuat data dari server." 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrestasi();
  }, [user.id]);

  // Gunakan data dari API, fallback ke localStorage jika belum ada
  const totalXP = prestasiData?.xp ?? user.xp ?? 0;
  const level = getLevel(totalXP);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="mb-6 text-center">
          <div className="skeleton h-9 w-48 mx-auto rounded-xl mb-2" />
          <div className="skeleton h-5 w-64 mx-auto rounded-lg" />
        </div>
        <SkeletonCard />
        <div className="mt-6">
          <SkeletonCard />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* === Header === */}
      <div className="mb-6 text-center">
        <h1
          className="text-3xl font-black mb-1"
          style={{
            fontFamily: "'Fredoka One', sans-serif",
            color: "var(--color-neutral-900)",
          }}
        >
          🏆 Prestasiku
        </h1>
        <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
          Lihat level, badge, dan pencapaian belajarmu!
        </p>
      </div>

      {/* === Card Level & XP === */}
      <div
        className="bg-white rounded-3xl p-7 mb-6"
        style={{
          boxShadow: "var(--shadow-card)",
          border: "2px solid var(--color-neutral-100)",
        }}
      >
        {/* Ikon + Label Level */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #FF8C5A)",
              boxShadow: "0 4px 16px rgba(255,107,53,0.30)",
              color: "white",
            }}
          >
            {level.icon || "🎯"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>
              Level {level.level || 1}
            </p>
            <h2
              className="text-xl font-black"
              style={{
                fontFamily: "'Fredoka One', sans-serif",
                color: "var(--color-neutral-900)",
              }}
            >
              {level.label || "Pembelajar"}
            </h2>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
              XP Progress
            </span>
            <span className="text-xs font-black" style={{ color: "var(--color-primary)" }}>
              ⚡ {totalXP} XP
            </span>
          </div>
          <div
            className="h-4 rounded-full overflow-hidden border"
            style={{
              backgroundColor: "var(--color-neutral-300)",
              borderColor: "var(--color-neutral-300)",
            }}
          >
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-700"
              style={{
                width: `${level.percent || 0}%`,
                background: "linear-gradient(90deg, #FF6B35, #FF8C5A)",
              }}
            >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
              {level.currentMin || 0} XP
            </span>
            {level.isMax ? (
              <span
                className="text-[10px] font-black"
                style={{ color: "var(--color-accent-green)" }}
              >
                🎉 Level Maksimal!
              </span>
            ) : (
              <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
                {level.nextThreshold || 100} XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* === Statistik Ringkas === */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="bg-white rounded-2xl p-5 text-center"
          style={{
            boxShadow: "var(--shadow-card)",
            border: "2px solid var(--color-neutral-100)",
          }}
        >
          <p className="text-3xl font-black" style={{ color: "var(--color-primary)" }}>
            {prestasiData?.total_tugas || 0}
          </p>
          <p className="text-xs font-bold mt-1" style={{ color: "var(--color-neutral-500)" }}>
            Tugas Dikumpulkan
          </p>
        </div>
        <div
          className="bg-white rounded-2xl p-5 text-center"
          style={{
            boxShadow: "var(--shadow-card)",
            border: "2px solid var(--color-neutral-100)",
          }}
        >
          <p className="text-3xl font-black" style={{ color: "var(--color-accent-green)" }}>
            {prestasiData?.nilai_terbaik || "-"}
          </p>
          <p className="text-xs font-bold mt-1" style={{ color: "var(--color-neutral-500)" }}>
            Nilai Terbaik
          </p>
        </div>
      </div>

      {/* === Statistik Tambahan === */}
      {prestasiData?.rata_rata_nilai !== undefined && (
        <div
          className="bg-white rounded-2xl p-4 mb-6 text-center"
          style={{
            boxShadow: "var(--shadow-card)",
            border: "2px solid var(--color-neutral-100)",
          }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
            Rata-rata Nilai
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--color-primary)" }}>
            {prestasiData.rata_rata_nilai}
          </p>
        </div>
      )}

      {/* === Badge Pencapaian === */}
      <div>
        <h3
          className="text-lg font-black mb-4"
          style={{
            fontFamily: "'Fredoka One', sans-serif",
            color: "var(--color-neutral-900)",
          }}
        >
          🎖️ Badge Pencapaian
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = !badge.comingSoon && badge.condition(prestasiData || {});
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center p-5 rounded-2xl transition-all"
                style={{
                  backgroundColor: "white",
                  border: "2px solid var(--color-neutral-100)",
                  boxShadow: "var(--shadow-card)",
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                {/* Lingkaran badge */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-3 relative"
                  style={{
                    background: isUnlocked
                      ? "linear-gradient(135deg, #FFD700, #FF6B35)"
                      : "var(--color-neutral-300)",
                    boxShadow: isUnlocked
                      ? "0 4px 16px rgba(255,215,0,0.40)"
                      : "none",
                  }}
                >
                  <span>{badge.icon}</span>
                  {!isUnlocked && (
                    <LockKey
                      weight="fill"
                      size={14}
                      className="absolute -bottom-1 -right-1"
                      style={{ color: "var(--color-neutral-500)" }}
                    />
                  )}
                </div>
                <p
                  className="text-xs font-black text-center mb-1"
                  style={{
                    color: isUnlocked ? "var(--color-neutral-900)" : "var(--color-neutral-500)",
                  }}
                >
                  {badge.label}
                </p>
                <p
                  className="text-[10px] font-bold text-center"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  {badge.comingSoon ? "Segera hadir ✨" : badge.desc}
                </p>
                {isUnlocked && (
                  <div
                    className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase"
                    style={{ backgroundColor: "var(--color-accent-green)", color: "white" }}
                  >
                    ✅ Terbuka
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}