import { NavLink } from "react-router-dom";
import { House, Books, Pencil, Trophy, User } from "@phosphor-icons/react";

// Definisi level berdasarkan total XP
const LEVEL_CONFIG = [
  { min: 0,    max: 100,  label: "🌱 Benih Ilmu",       color: "#2ECC71", nextXP: 100  },
  { min: 101,  max: 300,  label: "🌿 Tunas Cerdas",      color: "#4ECDC4", nextXP: 300  },
  { min: 301,  max: 600,  label: "🌳 Pohon Pengetahuan", color: "#3498DB", nextXP: 600  },
  { min: 601,  max: 1000, label: "⭐ Bintang Literasi",  color: "#F39C12", nextXP: 1000 },
  { min: 1001, max: 1500, label: "🚀 Penjelajah Ilmu",   color: "#9B59B6", nextXP: 1500 },
  { min: 1501, max: Infinity, label: "👑 Juara Belajar", color: "#FF6B35", nextXP: null },
];

function getLevel(xp) {
  const level = LEVEL_CONFIG.find((l) => xp >= l.min && xp <= l.max) || LEVEL_CONFIG[0];
  const progressInLevel = xp - level.min;
  const rangeInLevel = level.nextXP ? level.max - level.min : 1;
  const percent = level.nextXP ? Math.min((progressInLevel / rangeInLevel) * 100, 100) : 100;
  return { ...level, percent };
}

export default function StudentLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || { nama: "Siswa", xp: 0 };
  const xp = user.xp || 0;
  const level = getLevel(xp);

  const navItems = [
    { name: "Beranda",  path: "/siswa/beranda",  icon: House  },
    { name: "Materi",   path: "/siswa/materi",   icon: Books  },
    { name: "Tugasku",  path: "/siswa/evaluasi", icon: Pencil },
    { name: "Prestasi", path: "/siswa/prestasi", icon: Trophy },
    { name: "Profilku", path: "/siswa/profil",   icon: User   },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--color-neutral-50)", fontFamily: "'Nunito', sans-serif" }}>

      {/* === HEADER === */}
      <header className="sticky top-0 z-50 bg-white px-4 py-3 flex justify-between items-center" style={{ borderBottom: "4px solid var(--color-neutral-100)", boxShadow: "0 2px 12px rgba(26,26,46,0.06)" }}>
        {/* Avatar + Nama */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, #4ECDC4, #3498DB)", boxShadow: "0 2px 8px rgba(78,205,196,0.35)" }}>
            🎒
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>Halo,</p>
            <p className="text-lg font-black leading-tight" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
              {user.nama}!
            </p>
          </div>
        </div>

        {/* XP + Level Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2" style={{ backgroundColor: "var(--color-primary-bg)", borderColor: "var(--color-primary-light)" }}>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs font-black" style={{ color: "var(--color-primary)" }}>⚡ {xp} XP</span>
            </div>
            {/* XP Progress Bar */}
            <div className="w-20 h-2.5 rounded-full overflow-hidden mt-0.5 relative" style={{ backgroundColor: "var(--color-neutral-300)" }}>
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-700"
                style={{ width: `${level.percent}%`, backgroundColor: level.color }}
              >
                {/* Shimmer */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shimmer 1.5s infinite" }} />
              </div>
            </div>
            <p className="text-[9px] font-bold mt-0.5 text-right" style={{ color: "var(--color-neutral-500)" }}>
              {level.label}
            </p>
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="pt-6 px-4 max-w-md mx-auto page-enter">
        {children}
      </main>

      {/* === BOTTOM NAV === */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white z-50 flex justify-around items-center max-w-md mx-auto rounded-t-3xl px-2 py-2 pb-5" style={{ borderTop: "2px solid var(--color-neutral-100)", boxShadow: "0 -4px 20px rgba(26,26,46,0.08)" }}>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150 ${
                  isActive ? "scale-110" : "hover:bg-neutral-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    weight={isActive ? "fill" : "bold"}
                    size={28}
                    style={{ color: isActive ? "var(--color-primary)" : "var(--color-neutral-500)" }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-wide"
                    style={{
                      fontWeight: isActive ? 900 : 700,
                      color: isActive ? "var(--color-primary)" : "var(--color-neutral-500)",
                    }}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}