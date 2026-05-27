import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  UsersThree,
  Trophy,
  Medal,
  Star,
  Student,
} from "@phosphor-icons/react";

export default function ManajemenSiswa() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "http://localhost/lms_sdn101752/literasi-backend/api/kelas/students.php",
        );
        const data = await response.json();

        if (data.status === "success") {
          setStudents(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: data.message });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Koneksi Terputus",
          text: "Gagal memuat data siswa.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);
  const highestXP =
    students.length > 0 ? Math.max(...students.map((s) => s.xp)) : 100;
  const safeHighestXP = highestXP === 0 ? 100 : highestXP;
  const getRankBadge = (index) => {
    if (index === 0)
      return (
        <div className="p-2 bg-yellow-100 text-yellow-500 rounded-full shadow-sm">
          <Trophy weight="fill" size={24} />
        </div>
      );
    if (index === 1)
      return (
        <div className="p-2 bg-gray-100 text-gray-400 rounded-full shadow-sm">
          <Medal weight="fill" size={24} />
        </div>
      );
    if (index === 2)
      return (
        <div className="p-2 bg-orange-100 text-[#d35400] rounded-full shadow-sm">
          <Medal weight="fill" size={24} />
        </div>
      );
    return (
      <div className="w-10 h-10 flex items-center justify-center font-black text-neutral-400">
        {index + 1}
      </div>
    );
  };

  return (
    <DashboardLayout role="guru" title="Manajemen Kelas">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-8">
        <div className="bg-gradient-to-r from-[#3498db] to-[#9b59b6] rounded-3xl p-8 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              Papan Peringkat Kelas 🏆
            </h2>
            <p className="font-medium opacity-90 max-w-lg leading-relaxed text-sm">
              Pantau keaktifan siswa Anda melalui perolehan Experience Points
              (XP). Siswa akan mendapatkan XP saat menyelesaikan tugas dan kuis!
            </p>
          </div>
          <UsersThree
            weight="duotone"
            size={140}
            className="absolute -right-4 -bottom-8 opacity-20 transform -rotate-12 hidden md:block"
          />
        </div>

        {/* Tabel Leaderboard */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20 font-bold text-neutral-400 animate-pulse">
              Menyusun papan peringkat...
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Student
                weight="thin"
                size={64}
                className="text-neutral-300 mb-4"
              />
              <p className="text-neutral-400 font-bold text-lg">
                Belum ada siswa yang terdaftar di kelas Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <div className="flex flex-col gap-4">
                {students.map((siswa, index) => {
                  const xpPercentage = Math.round(
                    (siswa.xp / safeHighestXP) * 100,
                  );
                  const isTop3 = index < 3;

                  return (
                    <div
                      key={siswa.id}
                      className={`flex items-center gap-4 md:gap-6 p-4 rounded-2xl border-2 transition-all duration-300 ${isTop3 ? "border-neutral-100 bg-neutral-50 shadow-sm" : "border-transparent bg-white hover:bg-neutral-50"}`}
                    >
                      {/* 1. Badge Peringkat */}
                      <div className="w-12 flex justify-center shrink-0">
                        {getRankBadge(index)}
                      </div>

                      {/* 2. Foto Profil & Nama */}
                      <div className="flex items-center gap-4 w-48 md:w-64 shrink-0">
                        {siswa.foto_profile ? (
                          <img
                            src={siswa.foto_profile}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4ecdc4] to-[#2ecc71] flex items-center justify-center text-white font-black text-lg shadow-sm border-2 border-white">
                            {siswa.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="font-black text-neutral-900 text-base truncate">
                            {siswa.nama}
                          </h4>
                          <p className="text-xs font-bold text-neutral-400 truncate">
                            {siswa.email || siswa.username}
                          </p>
                        </div>
                      </div>

                      {/* 3. XP Bar Gamifikasi */}
                      <div className="flex-1 hidden sm:flex items-center gap-4">
                        <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-[#4ecdc4] to-[#3498db]"}`}
                            style={{ width: `${xpPercentage}%` }}
                          >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Total Angka XP */}
                      <div className="w-24 text-right shrink-0">
                        <span className="flex items-center justify-end gap-1 font-black text-lg text-neutral-800">
                          {siswa.xp}{" "}
                          <Star
                            weight="fill"
                            className={
                              index === 0 ? "text-yellow-500" : "text-[#4ecdc4]"
                            }
                            size={20}
                          />
                        </span>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Total XP
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
