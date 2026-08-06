import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Chalkboard,
  Plus,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({ id: "", nama_kelas: "" });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint("api/admin/rombels.php"));
      const result = await response.json();
      if (result.status === "success") setClasses(result.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: "", nama_kelas: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (rombel) => {
    setIsEditMode(true);
    setFormData({ id: rombel.id, nama_kelas: rombel.nama_kelas });
    setIsModalOpen(true);
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
        fetchClasses();
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
        fetchClasses();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Kesalahan jaringan.");
    }
  };

  return (
    <DashboardLayout role="admin" title="Manajemen Kelas">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">
            Manajemen Kelas
          </h2>
          <p className="text-neutral-500 font-medium">
            Kelola daftar rombongan belajar (Rombel).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
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
              <th className="px-6 py-4 text-center">Total Siswa Terdaftar</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 animate-pulse">
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
                    #{cls.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <Chalkboard size={20} className="text-blue-500" />{" "}
                    {cls.nama_kelas}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">
                    {cls.total_siswa} Siswa
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.nama_kelas)}
                      className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  Belum ada kelas yang dibuat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit" : "Tambah"} Kelas
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} weight="bold" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
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
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Contoh: Kelas 1A"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
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
