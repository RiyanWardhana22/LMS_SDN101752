import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  UsersThree,
  Trophy,
  Medal,
  Star,
  Student,
  Table as TableIcon,
  PencilSimple,
  Key,
  UserMinus,
  UserPlus,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function ManajemenSiswa() {
  const [rombelList, setRombelList] = useState([]);
  const [selectedRombel, setSelectedRombel] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("leaderboard");
  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const res = await fetch(apiEndpoint("api/kelas/read_rombel.php"));
        const data = await res.json();
        if (data.status === "success") setRombelList(data.data);
      } catch (error) {
        console.error("Gagal memuat rombel", error);
      }
    };
    fetchRombel();
  }, []);

  const fetchStudents = async () => {
    if (!selectedRombel) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        apiEndpoint(`api/kelas/students.php?rombel_id=${selectedRombel}`),
      );
      const data = await response.json();
      if (data.status === "success") setStudents(data.data);
    } catch (error) {
      console.error("Gagal memuat data siswa", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedRombel]);

  const handleTambahSiswa = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Tambah Siswa Baru",
      html:
        '<input id="swal-nama" class="swal2-input" placeholder="Nama Lengkap Siswa">' +
        '<input id="swal-pin" type="password" class="swal2-input text-center font-black tracking-widest" placeholder="PIN 4 Angka" maxlength="4">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Tambahkan",
      confirmButtonColor: "#2ecc71",
      preConfirm: () => {
        return {
          nama: document.getElementById("swal-nama").value,
          pin: document.getElementById("swal-pin").value,
        };
      },
    });

    if (formValues) {
      if (!formValues.nama || formValues.pin.length < 4)
        return Swal.fire("Error", "Nama dan PIN 4 Angka wajib diisi!", "error");

      try {
        const res = await fetch(apiEndpoint("api/kelas/create_siswa.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formValues.nama,
            pin: formValues.pin,
            rombel_id: selectedRombel,
          }),
        });
        const data = await res.json();
        if (data.status === "success") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 2000,
          });
          fetchStudents();
        } else Swal.fire("Gagal", data.message, "error");
      } catch (err) {
        Swal.fire("Error", "Koneksi gagal", "error");
      }
    }
  };

  const handleEditNama = async (siswa) => {
    const { value: namaBaru } = await Swal.fire({
      title: "Edit Nama Siswa",
      input: "text",
      inputValue: siswa.nama,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      confirmButtonColor: "#3498db",
    });

    if (namaBaru && namaBaru !== siswa.nama) {
      try {
        const res = await fetch(apiEndpoint("api/kelas/update_siswa.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: siswa.id, nama: namaBaru }),
        });
        const data = await res.json();
        if (data.status === "success") fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResetPIN = async (siswa) => {
    const { value: pinBaru } = await Swal.fire({
      title: `Reset PIN ${siswa.nama}`,
      text: "Masukkan 4 angka sandi baru untuk siswa ini.",
      input: "text",
      inputAttributes: { maxlength: 4, pattern: "[0-9]*" },
      showCancelButton: true,
      confirmButtonText: "Ganti PIN",
      confirmButtonColor: "#f39c12",
    });

    if (pinBaru && pinBaru.length === 4) {
      try {
        const res = await fetch(apiEndpoint("api/kelas/update_siswa.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: siswa.id, pin: pinBaru }),
        });
        const data = await res.json();
        if (data.status === "success") {
          Swal.fire("Berhasil", `PIN baru adalah: ${pinBaru}`, "success");
          fetchStudents();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteSiswa = async (siswa) => {
    Swal.fire({
      title: "Keluarkan Siswa?",
      text: `Anda yakin ingin menghapus ${siswa.nama} dari kelas ini? Semua data tugasnya akan hilang.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Ya, Keluarkan!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(apiEndpoint("api/kelas/delete_siswa.php"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: siswa.id }),
          });
          const data = await res.json();
          if (data.status === "success") {
            Swal.fire("Dikeluarkan!", "Siswa telah dihapus.", "success");
            fetchStudents();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

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
    <DashboardLayout role="guru" title="Manajemen Kelas & Siswa">
      <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-[#3498db] transition-all flex-1 md:flex-none">
              <UsersThree weight="fill" className="text-slate-400" size={18} />
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm w-full md:w-48"
              >
                <option value="" disabled>
                  -- Pilih Kelas --
                </option>
                {rombelList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedRombel && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode("leaderboard")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === "leaderboard" ? "bg-white text-yellow-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Peringkat
                </button>
                <button
                  onClick={() => setViewMode("admin")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === "admin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Tabel Admin
                </button>
              </div>

              {viewMode === "admin" && (
                <button
                  onClick={handleTambahSiswa}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus weight="bold" size={16} /> Tambah Siswa
                </button>
              )}
            </div>
          )}
        </div>

        {!selectedRombel ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center mt-4">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Student size={48} weight="duotone" className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Manajemen Siswa
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Pilih kelas di atas untuk melihat daftar siswa dan papan
              peringkat.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse">
            Memuat data siswa...
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Kelas Kosong
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Belum ada siswa yang mendaftar atau ditambahkan ke kelas ini.
            </p>
            <button
              onClick={handleTambahSiswa}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl cursor-pointer"
            >
              + Tambah Siswa Pertama
            </button>
          </div>
        ) : viewMode === "leaderboard" ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in p-6">
            <div className="flex flex-col gap-4">
              {students.map((siswa, index) => {
                const xpPercentage = Math.round(
                  (siswa.xp / safeHighestXP) * 100,
                );
                const isTop3 = index < 3;

                return (
                  <div
                    key={siswa.id}
                    className={`flex items-center gap-4 md:gap-6 p-4 rounded-2xl border-2 transition-all duration-300 ${isTop3 ? "border-yellow-100 bg-yellow-50/30" : "border-transparent bg-white hover:bg-slate-50"}`}
                  >
                    <div className="w-12 flex justify-center shrink-0">
                      {getRankBadge(index)}
                    </div>

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
                        <h4 className="font-black text-slate-800 text-base truncate">
                          {siswa.nama}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 truncate">
                          Total XP {siswa.xp}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 hidden sm:flex items-center gap-4">
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-[#4ecdc4] to-[#3498db]"}`}
                          style={{ width: `${xpPercentage}%` }}
                        >
                          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">No</th>
                    <th className="p-4">Identitas Siswa</th>
                    <th className="p-4 text-center">Data Login</th>
                    <th className="p-4 text-center">Perolehan XP</th>
                    <th className="p-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {students.map((siswa, index) => (
                    <tr
                      key={siswa.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4 text-center text-slate-400 font-bold">
                        {index + 1}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="font-bold text-slate-800 text-sm truncate w-48">
                          {siswa.nama}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] text-slate-400 font-semibold mb-0.5">
                            Username:{" "}
                            <span className="text-slate-700">
                              {siswa.username}
                            </span>
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border border-slate-200">
                            PIN: {siswa.pin || "----"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                          <Star weight="fill" /> {siswa.xp} XP
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditNama(siswa)}
                            className="p-2 bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-600 rounded-lg transition-colors"
                            title="Edit Nama"
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleResetPIN(siswa)}
                            className="p-2 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 rounded-lg transition-colors"
                            title="Reset PIN"
                          >
                            <Key size={16} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDeleteSiswa(siswa)}
                            className="p-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-lg transition-colors"
                            title="Keluarkan Siswa"
                          >
                            <UserMinus size={16} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
