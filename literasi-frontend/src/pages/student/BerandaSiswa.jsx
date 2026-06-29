import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { LockKey, Star, Fire } from "@phosphor-icons/react";

export default function BerandaSiswa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { nama: "Siswa", xp: 0 };

  const wilayahBelajar = [
    { id: 1, nama: "Hutan Bahasa",      warna: "#FF6B9D", shadowColor: "#C2185B", icon: "📖", status: "selesai", stars: 3, mapel: "Bahasa Indonesia" },
    { id: 2, nama: "Pulau Matematika",  warna: "#4ECDC4", shadowColor: "#30B5AC", icon: "➗", status: "aktif",   progress: 60, mapel: "Matematika" },
    { id: 3, nama: "Kota Sains (IPA)",  warna: "#2ECC71", shadowColor: "#27AE60", icon: "🔬", status: "terkunci", mapel: "IPA" },
    { id: 4, nama: "Desa Sosial (IPS)", warna: "#E67E22", shadowColor: "#D35400", icon: "🌍", status: "terkunci", mapel: "IPS" },
    { id: 5, nama: "Puncak PKn",        warna: "#E74C3C", shadowColor: "#C0392B", icon: "🇮🇩", status: "terkunci", mapel: "PKn" },
  ];

  // Hitung berapa wilayah sudah selesai
  const selesaiCount = wilayahBelajar.filter((w) => w.status === "selesai").length;

  return (
    <StudentLayout>
      {/* === Hero / Motivasi === */}
      <div className="mb-6 p-5 rounded-3xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)", boxShadow: "0 8px 24px rgba(255,107,53,0.30)" }}>
        <div className="relative z-10">
          <p className="text-sm font-bold opacity-80 mb-0.5">Selamat datang kembali! 🎉</p>
          <h1 className="text-2xl font-black leading-tight mb-3" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            Ayo selesaikan petualanganmu, {user.nama.split(" ")[0]}!
          </h1>
          {/* Mini progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
              <div className="h-full rounded-full" style={{ width: `${(selesaiCount / wilayahBelajar.length) * 100}%`, backgroundColor: "white" }} />
            </div>
            <span className="text-xs font-black opacity-90">{selesaiCount}/{wilayahBelajar.length} Wilayah</span>
          </div>
        </div>
        {/* Dekorasi latar */}
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none">🗺️</div>
      </div>

      {/* === Streak Bar === */}
      <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: "var(--color-warning-bg)", border: "2px solid #F39C12" }}>
        <Fire weight="fill" size={28} className="flex-shrink-0" style={{ color: "#F39C12" }} />
        <div>
          <p className="text-sm font-black" style={{ color: "var(--color-neutral-900)" }}>
            🔥 Terus semangat belajar setiap hari!
          </p>
          <p className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
            Kerjakan tugas & baca materi untuk mempertahankan streak-mu
          </p>
        </div>
      </div>

      {/* === Peta Petualangan === */}
      <h2 className="text-center text-xl font-black mb-2" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
        🗺️ Peta Petualangan
      </h2>
      <p className="text-center text-sm font-bold mb-8" style={{ color: "var(--color-neutral-500)" }}>
        Tap wilayah yang aktif untuk mulai belajar!
      </p>

      <div className="relative pb-10 flex flex-col items-center">
        {/* Garis jalur putus-putus */}
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0 border-l-8 border-dashed -z-10" style={{ borderColor: "var(--color-neutral-300)" }}></div>

        {wilayahBelajar.map((wilayah, index) => {
          const isLeft = index % 2 === 0;
          const shift = index === 0 ? "" : isLeft ? "-translate-x-12" : "translate-x-12";

          return (
            <div key={wilayah.id} className={`relative mb-14 flex flex-col items-center w-full ${shift}`}>

              {/* Label nama wilayah */}
              <div
                className="mb-3 px-4 py-1.5 rounded-xl font-bold text-sm border-2 bg-white"
                style={{
                  borderColor: wilayah.status !== "terkunci" ? wilayah.warna : "var(--color-neutral-300)",
                  color:       wilayah.status !== "terkunci" ? wilayah.warna : "var(--color-neutral-500)",
                  boxShadow:   wilayah.status !== "terkunci" ? `0 2px 8px ${wilayah.warna}30` : "none",
                }}
              >
                {wilayah.nama}
              </div>

              {/* Node / Tombol Pulau */}
              <button
                onClick={() => {
                  if (wilayah.status === "aktif") navigate("/siswa/ar");
                }}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-200 active:scale-95 ${
                  wilayah.status === "aktif" ? "animate-bounce cursor-pointer" : "cursor-default"
                }`}
                style={{
                  backgroundColor: wilayah.status === "terkunci" ? "#E5E7EB" : wilayah.warna,
                  boxShadow:       wilayah.status === "terkunci"
                    ? "0 6px 0 #D1D5DB"
                    : `0 8px 0 ${wilayah.shadowColor}`,
                  border: "4px solid white",
                }}
              >
                {wilayah.status === "terkunci" ? (
                  <LockKey weight="fill" size={32} style={{ color: "var(--color-neutral-500)" }} />
                ) : (
                  <span>{wilayah.icon}</span>
                )}

                {/* Bintang jika selesai */}
                {wilayah.status === "selesai" && (
                  <div className="absolute -bottom-2 -right-2 rounded-full p-1 border-2 bg-white" style={{ borderColor: "var(--color-accent-yellow)" }}>
                    <Star weight="fill" size={20} style={{ color: "var(--color-accent-yellow)" }} />
                  </div>
                )}

                {/* Badge XP untuk wilayah aktif */}
                {wilayah.status === "aktif" && (
                  <div className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                    AKTIF
                  </div>
                )}
              </button>

              {/* Progress bar jika aktif */}
              {wilayah.status === "aktif" && (
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="w-32 h-3 rounded-full overflow-hidden border" style={{ backgroundColor: "var(--color-neutral-300)", borderColor: "var(--color-neutral-300)" }}>
                    <div className="h-full rounded-full" style={{ width: `${wilayah.progress}%`, backgroundColor: wilayah.warna, transition: "width 1s var(--ease-spring)" }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: "var(--color-neutral-500)" }}>
                    {wilayah.progress}% selesai
                  </span>
                </div>
              )}

              {/* Bintang 3 jika sudah selesai */}
              {wilayah.status === "selesai" && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3].map((s) => (
                    <Star key={s} weight="fill" size={14} style={{ color: "var(--color-accent-yellow)" }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Peti harta karun di ujung */}
        <div className="mt-4 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl z-10" style={{ background: "linear-gradient(135deg, #FFD700, #F39C12)", boxShadow: "0 8px 0 #D68910, 0 0 24px rgba(255,215,0,0.40)", border: "4px solid white" }}>
          🎁
        </div>
        <p className="mt-3 text-xs font-black" style={{ color: "var(--color-neutral-500)" }}>
          Selesaikan semua wilayah untuk membuka hadiah!
        </p>
      </div>
    </StudentLayout>
  );
}