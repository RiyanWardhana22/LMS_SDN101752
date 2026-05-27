import { NavLink, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Users,
  BookOpen,
  ChalkboardTeacher,
  WarningCircle,
  SignOut,
  ShieldCheck,
  X,
  ChartLineUp,
} from "@phosphor-icons/react";
import { BsPersonFillGear } from "react-icons/bs";
import { FaClipboardList } from "react-icons/fa";

export default function Sidebar({ role, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  const adminMenu = [
    {
      name: "Dasbor Utama",
      path: "/admin/dashboard",
    },
    {
      name: "Manajemen Pengguna",
      path: "/admin/users",
    },
    {
      name: "Laporan Sekolah",
      path: "/admin/reports",
    },
    {
      name: "Mode Darurat",
      path: "/admin/emergency",
    },
  ];

  const guruMenu = [
    {
      name: "Dashboard",
      path: "/guru/dashboard",
    },
    {
      name: "Manajemen Materi",
      path: "/guru/materi",
    },
    {
      name: "Tugas & Kuis",
      path: "/guru/tugas",
    },
    {
      name: "Buku Nilai & Analitik",
      path: "/guru/buku-nilai",
    },
    {
      name: "Siswa & Peringkat",
      path: "/guru/siswa",
    },
    {
      name: "Workshop AI",
      path: "/guru/workshop-ai",
    },
    {
      name: "Pengaturan Profil",
      path: "/guru/pengaturan",
    },
  ];

  const menuItems = role === "admin" ? adminMenu : guruMenu;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed lg:static top-0 left-0 w-[240px] h-[100dvh] bg-[#1a1a2e] p-6 flex flex-col gap-2 text-[#c8c8e0] shadow-2xl lg:shadow-xl z-50 transform transition-transform duration-300 ease-spring ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-wider">
              Litera<span className="text-[#ff6b35]">SI</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-neutral-400 hover:text-white p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto hidden-scrollbar">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              onClick={onClose}
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

        {/* Area Bawah (Logout) */}
        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 border-2 border-solid rounded-xl font-extrabold text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-all"
          >
            KELUAR
          </button>
        </div>
      </aside>
    </>
  );
}
