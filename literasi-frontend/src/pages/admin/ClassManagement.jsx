import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Chalkboard,
  Plus,
  PencilSimple,
  Trash,
  X,
  UserRectangle,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]); // State untuk menampung daftar guru
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    id: "",
    nama_kelas: "",
    kode_unik: "",
    guru_id: "",
  });

  // State Khusus Fitur Mention Guru
  const [guruInput, setGuruInput] = useState("");
  const [showMention, setShowMention] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mengambil data kelas dan data guru secara paralel
      const [resClasses, resTeachers] = await Promise.all([
        fetch(apiEndpoint("api/admin/rombels.php")),
        fetch(apiEndpoint("api/admin/users.php?role=guru")),
      ]);

      const dataClasses = await resClasses.json();
      const dataTeachers = await resTeachers.json();

      if (dataClasses.status === "success") setClasses(dataClasses.data);
      if (dataTeachers.status === "success") setTeachers(dataTeachers.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: "", nama_kelas: "", kode_unik: "", guru_id: "" });
    setGuruInput("");
    setShowMention(false);
    setIsModalOpen(true);
  };

  const openEditModal = (rombel) => {
    setIsEditMode(true);
    setFormData({
      id: rombel.id,
      nama_kelas: rombel.nama_kelas,
      kode_unik: rombel.kode_unik || "",
      guru_id: rombel.guru_id || "",
    });
    // Set tampilan nama guru jika sebelumnya sudah ada
    setGuruInput(rombel.guru_nama ? `@${rombel.guru_nama}` : "");
    setShowMention(false);
    setIsModalOpen(true);
  };

  // Fungsi untuk menangani input guru dan deteksi "@"
  const handleGuruChange = (e) => {
    const val = e.target.value;
    setGuruInput(val);

    // Deteksi jika pengguna mengetik "@"
    const match = val.match(/@(.*)$/);
    if (match !== null) {
      setShowMention(true);
      setTeacherSearch(match[1].toLowerCase()); // Ambil teks setelah @ untuk pencarian
    } else {
      setShowMention(false);
      setFormData({ ...formData, guru_id: "" }); // Reset ID guru jika @ dihapus
    }
  };

  // Fungsi untuk memilih guru dari dropdown mention
  const selectTeacher = (teacher) => {
    setGuruInput(`@${teacher.nama}`);
    setFormData({ ...formData, guru_id: teacher.id });
    setShowMention(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiEndpoint("api/admin/rombels.php"), {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert(result.message);
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(result.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      alert("Kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus kelas "${nama}"? (Siswa di kelas ini akan kehilangan status kelasnya)`,
      )
    )
      return;

    try {
      const response = await fetch(
        apiEndpoint(`api/admin/rombels.php?id=${id}`),
        { method: "DELETE" },
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        alert("Kelas berhasil dihapus.");
        fetchData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Kesalahan jaringan.");
    }
  };

  // Filter daftar guru berdasarkan inputan setelah "@"
  const filteredTeachers = teachers.filter((t) =>
    t.nama.toLowerCase().includes(teacherSearch),
  );

  return (
    <DashboardLayout role="admin" title="Manajemen Kelas">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">
            Manajemen Kelas
          </h2>
          <p className="text-neutral-500 font-medium">
            Kelola daftar rombongan belajar (Rombel) dan tetapkan gurunya.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus weight="bold" size={20} /> Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-neutral-100">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nama Kelas</th>
              <th className="px-6 py-4 text-center">Kode Kelas</th>
              <th className="px-6 py-4 text-center">Total Siswa Terdaftar</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 animate-pulse">
                  Memuat data kelas...
                </td>
              </tr>
            ) : classes.length > 0 ? (
              classes.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b border-neutral-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-bold text-gray-400">
                    {cls.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      {cls.nama_kelas}
                    </div>
                    {cls.guru_nama && (
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        Wali: {cls.guru_nama}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-gray-200">
                      {cls.kode_unik || "----"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">
                    {cls.total_siswa} Siswa
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.nama_kelas)}
                      className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  Belum ada kelas yang dibuat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit" : "Tambah"} Kelas
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={24} weight="bold" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Row: Nama Kelas & Kode Unik */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_kelas: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium outline-none transition-all"
                    placeholder="Contoh: Kelas 1A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Kode Kelas
                  </label>
                  <input
                    type="text"
                    value={formData.kode_unik}
                    onChange={(e) =>
                      setFormData({ ...formData, kode_unik: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold font-mono tracking-widest text-center outline-none transition-all text-blue-600"
                    placeholder="ABC123"
                  />
                </div>
              </div>

              {/* Fitur Assign Guru dengan '@' */}
              <div className="mb-6 relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Guru Pengajar (Opsional)
                </label>
                <input
                  type="text"
                  value={guruInput}
                  onChange={handleGuruChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium outline-none transition-all"
                  placeholder="Ketik '@' untuk mencari nama guru..."
                  autoComplete="off"
                />
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  Ketik lambang{" "}
                  <span className="font-bold text-gray-600">@</span> untuk
                  memunculkan daftar guru.
                </p>

                {/* Dropdown Mention Guru */}
                {showMention && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredTeachers.length > 0 ? (
                      <ul className="p-2">
                        {filteredTeachers.map((teacher) => (
                          <li
                            key={teacher.id}
                            onClick={() => selectTeacher(teacher)}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                              <UserRectangle weight="fill" size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800 leading-none">
                                {teacher.nama}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium mt-1">
                                Username: @{teacher.username}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-sm font-medium text-gray-400">
                        Guru tidak ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
