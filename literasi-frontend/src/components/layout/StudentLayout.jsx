import { NavLink } from "react-router-dom";
import { House, Books, Pencil, Trophy, User } from "@phosphor-icons/react";
export default function StudentLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || { nama: "Siswa" };
  const navItems = [
    { name: "Beranda", path: "/siswa/beranda", icon: House },
    { name: "Materi", path: "/siswa/materi", icon: Books },
    { name: "Tugasku", path: "/siswa/tugasku", icon: Pencil },
    { name: "Prestasi", path: "/siswa/prestasi", icon: Trophy },
    { name: "Profilku", path: "/siswa/profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f0fafa] pb-24 font-['Nunito']">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-neutral-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4ecdc4] to-[#3498db] rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xl">
            🎒
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500">Halo,</p>
            <p className="text-lg font-black text-neutral-900 leading-none">
              {user.nama}!
            </p>
          </div>
        </div>

        {/* XP Bar & Level */}
        <div className="flex items-center gap-3 bg-[#fff3ee] px-3 py-1.5 rounded-2xl border-2 border-[#ff8c5a]">
          <span className="text-[#ff6b35] text-xl animate-pulse">⚡</span>
          <div>
            <p className="text-xs font-black text-[#ff6b35]">245 XP</p>
            <div className="w-16 h-2 bg-white rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-[#ff6b35] w-[60%] rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="pt-6 px-4 max-w-md mx-auto">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-neutral-100 px-2 py-2 pb-4 z-50 flex justify-around items-center max-w-md mx-auto rounded-t-3xl shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive
                    ? "text-[#ff6b35] font-black scale-110"
                    : "text-neutral-400 font-bold hover:bg-neutral-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon weight={isActive ? "fill" : "bold"} size={28} />
                  <span className="text-[10px] tracking-wide uppercase">
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
