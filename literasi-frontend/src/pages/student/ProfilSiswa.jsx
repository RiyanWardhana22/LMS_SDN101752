import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { SignOut, ShieldCheck, BookOpen } from "@phosphor-icons/react";
import { getLevel } from "../../utils/level";
import { apiEndpoint } from "../../config/api";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-7 border-2 border-neutral-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div>
          <div className="skeleton h-6 w-40 rounded-xl mb-2" />
          <div className="skeleton h-4 w-24 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-4 w-full rounded mb-3" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  );
}

export default function ProfilSiswa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(apiEndpoint(`api/siswa/profile.php?siswa_id=${user.id}`));
        const data = await response.json();
        if (data.status === "success") {
          setProfileData(data.data);
        } else {
          // Fallback ke data localStorage jika endpoint gagal
          setProfileData({
            nama: user.nama || "Siswa",
            kode_unik: user.kode_unik || "-",
            xp: user.xp || 0,
            kelas: "-",
          });
        }
      } catch {
        // Fallback ke data localStorage
        setProfileData({
          nama: user.nama || "Siswa",
          kode_unik: user.kode_unik || "-",
          xp: user.xp || 0,
          kelas: "-",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Akun?",
      text: "Kamu harus masukkan kode kelas lagi nanti ya!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E74C3C",
      cancelButtonColor: "#95A5A6",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Tetap Disini",
      customClass: { popup: "rounded-3xl" },
    });

    if (result.isConfirmed) {
      localStorage.removeItem("user");
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sampai jumpa lagi! 👋",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => navigate("/"));
    }
  };

  const totalXP = profileData?.xp || user.xp || 0;
  const level = getLevel(totalXP);
  const nama = profileData?.nama || user.nama || "Siswa";

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="mb-6 text-center">
          <div className="skeleton h-9 w-40 mx-auto rounded-xl mb-2" />
          <div className="skeleton h-5 w-56 mx-auto rounded-lg" />
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
            fontSize: "var(--text-student-hero, 2.25rem)",
          }}
        >
          👤 Profilku
        </h1>
        <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
          Informasi akun dan progres belajarmu
        </p>
      </div>

      {/* === Card Profil Utama === */}
      <div
        className="bg-white rounded-3xl p-7 mb-6 text-center"
        style={{
          boxShadow: "var(--shadow-card)",
          border: "2px solid var(--color-neutral-100)",
        }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white mb-4 border-4 border-white"
            style={{
              background: "var(--gradient-primary, linear-gradient(135deg, #4ECDC4, #3498DB))",
              boxShadow: "0 4px 16px rgba(78,205,196,0.30)",
              fontFamily: "'Fredoka One', sans-serif",
            }}
          >
            {nama.charAt(0).toUpperCase()}
          </div>

          {/* Nama */}
          <h2
            className="text-2xl font-black mb-1"
            style={{
              fontFamily: "'Fredoka One', sans-serif",
              color: "var(--color-neutral-900)",
            }}
          >
            {nama}
          </h2>

          {/* Badge info */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {profileData?.kelas && profileData.kelas !== "-" && (
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-primary-bg)",
                  color: "var(--color-primary)",
                }}
              >
                <BookOpen weight="bold" size={12} className="inline mr-1" />
                {profileData.kelas}
              </span>
            )}
            <span
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                backgroundColor: "var(--color-info-bg)",
                color: "var(--color-info)",
              }}
            >
              <ShieldCheck weight="bold" size={12} className="inline mr-1" />
              Kode: {profileData?.kode_unik || user.kode_unik || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* === Card Level & XP Ringkas === */}
      <div
        className="bg-white rounded-3xl p-7 mb-6"
        style={{
          boxShadow: "var(--shadow-card)",
          border: "2px solid var(--color-neutral-100)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: "var(--gradient-primary, linear-gradient(135deg, #FF6B35, #FF8C5A))",
              boxShadow: "0 4px 12px rgba(255,107,53,0.25)",
              color: "white",
            }}
          >
            {level.icon}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>
              Level {level.level}
            </p>
            <p className="text-lg font-black" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
              {level.label}
            </p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-lg font-black" style={{ color: "var(--color-primary)" }}>
              ⚡ {totalXP}
            </span>
            <p className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
              Total XP
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full overflow-hidden border" style={{ backgroundColor: "var(--color-neutral-300)", borderColor: "var(--color-neutral-300)" }}>
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{
              width: `${level.percent}%`,
              background: "var(--gradient-primary, linear-gradient(90deg, #FF6B35, #FF8C5A))",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
            {level.currentMin} XP
          </span>
          {level.isMax ? (
            <span className="text-[10px] font-black" style={{ color: "var(--color-accent-green)" }}>
              🎉 Level Maksimal!
            </span>
          ) : (
            <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
              {level.nextThreshold} XP
            </span>
          )}
        </div>
      </div>

      {/* === Tombol Keluar === */}
      <button
        onClick={handleLogout}
        className="w-full px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{
          backgroundColor: "white",
          color: "var(--color-error)",
          border: "2.5px solid var(--color-error)",
          boxShadow: "0 4px 0 #C0392B",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-error-bg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        <SignOut weight="bold" size={22} />
        Keluar dari Akun
      </button>
    </StudentLayout>
  );
}