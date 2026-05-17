import { NavLink, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Users,
  BookOpen,
  ChalkboardTeacher,
  WarningCircle,
  SignOut,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function Sidebar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  const adminMenu = [
    {
      name: "Dasbor Utama",
      path: "/admin/dashboard",
      icon: <SquaresFour weight="fill" size={24} />,
    },
    {
      name: "Manajemen Pengguna",
      path: "/admin/users",
      icon: <Users weight="fill" size={24} />,
    },
    {
      name: "Laporan Sekolah",
      path: "/admin/reports",
      icon: <BookOpen weight="fill" size={24} />,
    },
    {
      name: "Mode Darurat",
      path: "/admin/emergency",
      icon: <WarningCircle weight="fill" size={24} />,
    },
  ];

  const guruMenu = [
    {
      name: "Meja Kerja",
      path: "/guru/dashboard",
      icon: <SquaresFour weight="fill" size={24} />,
    },
    {
      name: "Manajemen Materi",
      path: "/guru/materi",
      icon: <BookOpen weight="fill" size={24} />,
    },
    {
      name: "Workshop AI",
      path: "/guru/workshop-ai",
      icon: <ChalkboardTeacher weight="fill" size={24} />,
    },
  ];

  const menuItems = role === "admin" ? adminMenu : guruMenu;

  return (
    <aside className="w-[240px] min-h-screen bg-[#1a1a2e] p-6 flex flex-col gap-2 text-[#c8c8e0] shadow-xl z-20">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] flex items-center justify-center text-white font-black">
          L
        </div>
        <h2 className="text-2xl font-black text-white tracking-wider">
          Litera<span className="text-[#ff6b35]">SI</span>
        </h2>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#ff6b35] text-white shadow-[0_4px_0_#e54e1b]"
                  : "hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Area Bawah (Logout & Badge Role) */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
          <ShieldCheck size={20} className="text-[#4ecdc4]" />
          <span className="text-sm font-bold text-white capitalize">
            {role} System
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-all"
        >
          <SignOut weight="bold" size={24} />
          Keluar Aplikasi
        </button>
      </div>
    </aside>
  );
}
