import { useState, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  User,
  Envelope,
  Lock,
  IdentificationCard,
  Camera,
  FloppyDisk,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function KelolaProfil() {
  const localUser = JSON.parse(localStorage.getItem("user")) || {};
  const [nama, setNama] = useState(localUser.nama || "");
  const [username, setUsername] = useState(localUser.username || "");
  const [email, setEmail] = useState(localUser.email || "");
  const [password, setPassword] = useState("");
  const [fotoProfile, setFotoProfile] = useState(localUser.foto_profile || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const CLOUD_NAME = "dbteh8sbe";
  const UPLOAD_PRESET = "literasi_preset";

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Format Salah",
        text: "File harus berupa gambar (PNG/JPG)!",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();

      if (data.secure_url) {
        setFotoProfile(data.secure_url);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Foto profil berhasil diunggah!",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Koneksi ke Cloudinary terputus.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      id: localUser.id,
      nama: nama || localUser.nama,
      username: username || localUser.username,
      email: email || localUser.email,
      password: password,
      foto_profile: fotoProfile || localUser.foto_profile,
    };

    try {
      const response = await fetch(apiEndpoint("api/profile/update.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: data.message,
          confirmButtonColor: "#ff6b35",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal terhubung ke server database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="guru" title="Pengaturan Profil">
      <div className="max-w-3xl mx-auto pb-12">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 md:p-12">
          <div className="mb-8 border-b border-neutral-100 pb-4">
            <h2 className="text-2xl font-black text-neutral-900">
              Kelola Akun Saya
            </h2>
            <p className="text-neutral-500 font-medium text-sm mt-1">
              Perbarui informasi pribadi, alamat email, keamanan password, dan
              foto profil Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center justify-center gap-4 bg-neutral-50 p-6 rounded-3xl border-2 border-dashed border-neutral-200">
              <div className="relative group w-28 h-28">
                {fotoProfile ? (
                  <img
                    src={fotoProfile}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-neutral-200 border-4 border-white shadow-md flex items-center justify-center text-neutral-400 font-black text-3xl uppercase">
                    {nama.charAt(0)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  disabled={isUploading}
                >
                  <Camera size={24} weight="bold" />
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-bold text-xs rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  {isUploading ? "Mengunggah..." : "Ubah Foto Profil"}
                </button>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Format gambar JPG, JPEG, atau PNG.
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadFoto}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* FORM INPUT DETAIL UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <IdentificationCard size={16} weight="bold" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder={localUser.nama || "Ketik nama baru..."}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none font-semibold text-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <User size={16} weight="bold" /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={localUser.username || "Ketik username baru..."}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none font-semibold text-neutral-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Envelope size={16} weight="bold" /> Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={localUser.email || "Belum ada email terdaftar"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none font-semibold text-neutral-800"
                />
                <p className="text-[11px] font-medium text-neutral-400 mt-1.5">
                  Kosongkan kolom apa pun yang tidak ingin Anda ubah. Sistem
                  akan mempertahankan data lama Anda.
                </p>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-neutral-100">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Lock size={16} weight="bold" /> Kata Sandi Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none font-semibold text-neutral-800"
                />
                <p className="text-[11px] font-medium text-neutral-400 mt-1.5">
                  Kosongkan kolom kata sandi jika Anda tidak ingin mengubah
                  sandi lama Anda.
                </p>
              </div>
            </div>

            {/* TOMBOL AKSI UTAMA */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-8 py-3 bg-[#ff6b35] hover:bg-[#e0531f] text-white font-black rounded-xl shadow-[0_4px_0_#b83f12] transition-all flex items-center gap-2 active:translate-y-1 active:shadow-none disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
