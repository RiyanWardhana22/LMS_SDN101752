import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { apiEndpoint } from "../../config/api";
import {
  CaretLeft,
  VideoCamera,
  Cube,
  XCircle,
  UploadSimple,
  Image,
  CheckCircle,
  Circle,
  Gear,
  Question,
} from "@phosphor-icons/react";
import { FaYoutube } from "react-icons/fa";
import Swal from "sweetalert2";

export default function FormMateri() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [kelas, setKelas] = useState("");
  const [visibilitas, setVisibilitas] = useState("publik");
  const [rombelId, setRombelId] = useState("");
  const [rombelList, setRombelList] = useState([]);
  const [isUploadingCloud, setIsUploadingCloud] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(null); // Index media yang sedang dikonfigurasi
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const arInputRef = useRef(null);

  const CLOUD_NAME = "dbteh8sbe";
  const UPLOAD_PRESET = "literasi_preset";

  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const res = await fetch(apiEndpoint("api/kelas/read_rombel.php"));
        const data = await res.json();
        if (data.status === "success") {
          setRombelList(data.data);
        }
      } catch (error) {
        console.error("Gagal memuat daftar rombel:", error);
      }
    };
    fetchRombel();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!judul.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Judul Kosong",
        text: "Jangan lupa isi judul materimu ya!",
      });
      return;
    }
    if (!rombelId) {
      Swal.fire({
        icon: "warning",
        title: "Rombel Belum Dipilih",
        text: "Silakan pilih target kelas (Rombel) terlebih dahulu!",
      });
      return;
    }

    // Validasi: pastikan ada minimal satu media bertipe ar_mind (target)
    const hasArTarget = mediaList.some((m) => m.type === "ar_mind" && m.url);
    if (!hasArTarget) {
      Swal.fire({
        icon: "warning",
        title: "Target AR Belum Diunggah",
        text: "Silakan tambahkan file .mind sebagai target AR.",
      });
      return;
    }

    setIsSaving(true);
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const payload = {
      guru_id: user.id,
      rombel_id: rombelId,
      judul,
      mata_pelajaran: mataPelajaran,
      kelas,
      konten,
      visibilitas,
      media: mediaList.map((m) => ({
        type: m.type,
        url: m.url,
        is_ar_output: m.is_ar_output ? 1 : 0,
        nama_file: m.nama_file || null,
        model_config: m.model_config || null,
      })),
    };

    try {
      const response = await fetch(apiEndpoint("api/materi/create.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: data.message,
          confirmButtonColor: "#ff6b35",
        }).then(() => navigate("/guru/materi"));
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Tidak dapat terhubung ke server database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // FUNGSI MENAMBAH MEDIA
  // ============================================

  // Menambahkan media video link (YouTube)
  const addVideoLink = () => {
    setMediaList([
      ...mediaList,
      { type: "video_link", url: "", is_ar_output: false },
    ]);
  };

  // Menambahkan media AR target (.mind)
  const addArMind = () => {
    setMediaList([
      ...mediaList,
      { type: "ar_mind", url: "", is_ar_output: false },
    ]);
  };

  // ✅ MENAMBAHKAN MODEL 3D
  const addModel3D = () => {
    setMediaList([
      ...mediaList,
      {
        type: "model_3d",
        url: "",
        is_ar_output: true, // Default sebagai AR output
        nama_file: "",
        model_config: {
          scale: "0.5 0.5 0.5",
          position: "0 0.1 0.1",
          rotation: "0 0 0",
          animation: "none", // none, rotate
          animationSpeed: 5000,
        },
      },
    ]);
  };

  // ✅ MENAMBAHKAN MODEL 3D DENGAN ANIMASI BAWAAN
  const addModel3DAnimated = () => {
    setMediaList([
      ...mediaList,
      {
        type: "model_3d_animated",
        url: "",
        is_ar_output: true,
        nama_file: "",
        model_config: {
          scale: "0.5 0.5 0.5",
          position: "0 0.1 0.1",
          rotation: "0 0 0",
          animation: "built-in",
          autoRotate: false,
        },
      },
    ]);
  };

  // ============================================
  // FUNGSI UPDATE MEDIA
  // ============================================

  const handleMediaUrlChange = (index, value) => {
    const updated = [...mediaList];
    updated[index].url = value;
    setMediaList(updated);
  };

  const removeMedia = (index) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  // Toggle status AR Output
  const toggleArOutput = (index) => {
    const updated = [...mediaList];
    if (
      updated[index].type === "video_cloud" ||
      updated[index].type === "video_link" ||
      updated[index].type === "image_cloud" ||
      updated[index].type === "model_3d" ||
      updated[index].type === "model_3d_animated"
    ) {
      updated[index].is_ar_output = !updated[index].is_ar_output;
      setMediaList(updated);
    }
  };

  // ✅ UPDATE KONFIGURASI MODEL 3D
  const updateModelConfig = (index, key, value) => {
    const updated = [...mediaList];
    if (!updated[index].model_config) {
      updated[index].model_config = {};
    }
    updated[index].model_config[key] = value;
    setMediaList(updated);
  };

  // ============================================
  // FUNGSI UPLOAD KE CLOUDINARY
  // ============================================

  // Upload video, gambar, atau .mind
  const handleDirectUpload = async (e, type, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCloud(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      Swal.fire({
        title: "Mengunggah...",
        text: "Media sedang dikirim ke server cloud.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      Swal.close();

      if (data.secure_url) {
        if (index !== undefined) {
          const updated = [...mediaList];
          updated[index].url = data.secure_url;
          setMediaList(updated);
        } else {
          let mediaType = "";
          if (type === "video") mediaType = "video_cloud";
          else if (type === "image") mediaType = "image_cloud";
          else if (type === "ar") mediaType = "ar_mind";
          setMediaList([
            ...mediaList,
            {
              type: mediaType,
              url: data.secure_url,
              is_ar_output: false,
            },
          ]);
        }
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Media berhasil diunggah!",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Gagal Upload",
        text: "Terjadi kesalahan saat mengunggah media.",
      });
    } finally {
      setIsUploadingCloud(false);
    }
  };

  // ✅ UPLOAD MODEL 3D (.glb / .gltf) KE CLOUDINARY - DIPERBAIKI
  const handleModel3DUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi format
    const validExtensions = ['.glb', '.gltf', '.GLB', '.GLTF'];
    const isValidExtension = validExtensions.some(ext => file.name.endsWith(ext));
    
    if (!isValidExtension) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Didukung",
        text: "Hanya file .glb atau .gltf yang diterima untuk model 3D.",
      });
      return;
    }

    // Validasi ukuran (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: "Ukuran maksimal model 3D adalah 20MB. Silakan optimasi file terlebih dahulu.",
      });
      return;
    }

    setIsUploadingCloud(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "auto"); // Penting: biarkan Cloudinary mendeteksi tipe

    try {
      Swal.fire({
        title: "Mengunggah Model 3D...",
        text: "File sedang dikirim ke server cloud. Mohon tunggu...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Gunakan endpoint auto/upload untuk mendeteksi tipe file secara otomatis
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      Swal.close();

      if (data.secure_url) {
        // Ambil URL yang dihasilkan Cloudinary
        let modelUrl = data.secure_url;
        
        // Jika URL tidak memiliki ekstensi .glb atau .gltf, kita tetap gunakan karena Cloudinary akan serve file yang benar
        // Namun kita bisa memastikan dengan menambahkan parameter jika perlu
        if (!modelUrl.endsWith('.glb') && !modelUrl.endsWith('.gltf')) {
          // Cloudinary kadang mengembalikan URL tanpa ekstensi, tapi tetap valid
          console.log('Model URL (tanpa ekstensi):', modelUrl);
        }
        
        const updated = [...mediaList];
        updated[index].url = modelUrl;
        updated[index].nama_file = file.name;
        setMediaList(updated);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Model 3D berhasil diunggah!",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Upload",
          text: data.error?.message || "Terjadi kesalahan saat mengunggah.",
        });
      }
    } catch (err) {
      Swal.close();
      console.error('Upload error:', err);
      Swal.fire({
        icon: "error",
        title: "Gagal Upload",
        text: "Terjadi kesalahan saat mengunggah model 3D.",
      });
    } finally {
      setIsUploadingCloud(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout role="guru" title="Buat Materi Baru">
      <form
        onSubmit={handleSave}
        className="max-w-5xl mx-auto flex flex-col gap-6 pb-12"
      >
        {/* ============================================ */}
        {/* BAR AKSI ATAS */}
        {/* ============================================ */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <button
            type="button"
            onClick={() => navigate("/guru/materi")}
            className="flex items-center gap-2 text-neutral-500 hover:text-[#ff6b35] font-bold text-sm bg-transparent border-none cursor-pointer"
          >
            <CaretLeft weight="bold" size={20} /> Batal
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploadingCloud}
            className="flex items-center gap-2 px-6 py-2 bg-[#ff6b35] hover:bg-[#e0531f] text-white font-bold rounded-xl shadow-[0_4px_0_#b83f12] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Terbitkan Materi"}
          </button>
        </div>

        {/* ============================================ */}
        {/* PANEL KONFIGURASI UTAMA */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Masukkan Judul Materi Pembelajaran..."
            required
            className="w-full text-3xl font-black text-neutral-900 border-none focus:ring-0 outline-none bg-transparent"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
                Mata Pelajaran
              </label>
              <input
                type="text"
                required
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                placeholder="Contoh: IPA (Sains) atau Matematika"
                className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
                Target Kelas
              </label>
              <select
                required
                value={rombelId}
                onChange={(e) => {
                  setRombelId(e.target.value);
                  const selected = rombelList.find(
                    (r) => r.id == e.target.value
                  );
                  if (selected) setKelas(selected.nama_kelas);
                }}
                className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>
                  -- Pilih Kelas --
                </option>
                {rombelList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_kelas} (Kode: {r.kode_unik})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
                Status Publikasi
              </label>
              <select
                value={visibilitas}
                onChange={(e) => setVisibilitas(e.target.value)}
                className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="publik">Tersedia untuk Siswa (Publik)</option>
                <option value="draft">Sembunyikan Materi (Draft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* EDITOR WYSIWYG KONTEN TEKS */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
          <label className="block text-sm font-black text-neutral-900 mb-4">
            Isi Materi Pembelajaran
          </label>
          <div className="h-[350px] mb-12">
            <ReactQuill
              theme="snow"
              value={konten}
              onChange={setKonten}
              style={{ height: "100%" }}
              placeholder="Tulis materi narasi edukatif di sini..."
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* PANEL MEDIA INTERAKTIF */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-black text-neutral-900 text-lg">
                Media Belajar Interaktif
              </h3>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">
                Sematkan video, gambar, model 3D, atau berkas Augmented Reality
                (.mind). Tandai media sebagai{" "}
                <span className="font-bold text-[#ff6b35]">Output AR</span>{" "}
                agar muncul saat marker discan.
              </p>
            </div>

            {/* Tombol-tombol Media */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addVideoLink}
                className="p-2.5 bg-neutral-50 hover:bg-[#ebf5fb] text-neutral-600 hover:text-[#3498db] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <FaYoutube size={16} /> + Video Link
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2.5 bg-neutral-50 hover:bg-[#eafaf1] text-neutral-600 hover:text-[#2ecc71] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <UploadSimple weight="bold" size={16} /> + Video Galeri
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="p-2.5 bg-neutral-50 hover:bg-[#fef9e7] text-neutral-600 hover:text-[#f39c12] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <Image weight="bold" size={16} /> + Gambar
              </button>
              {/* ✅ TOMBOL MODEL 3D */}
              <button
                type="button"
                onClick={addModel3D}
                className="p-2.5 bg-neutral-50 hover:bg-[#f0e6ff] text-neutral-600 hover:text-[#8e44ad] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <Cube weight="bold" size={16} /> + Model 3D
              </button>
              {/* ✅ TOMBOL MODEL 3D ANIMASI */}
              <button
                type="button"
                onClick={addModel3DAnimated}
                className="p-2.5 bg-neutral-50 hover:bg-[#f0e6ff] text-neutral-600 hover:text-[#7d3c98] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <Cube weight="fill" size={16} /> + Model 3D Animasi
              </button>
              <button
                type="button"
                onClick={addArMind}
                className="p-2.5 bg-neutral-50 hover:bg-[#fff3ee] text-neutral-600 hover:text-[#ff6b35] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <Cube weight="bold" size={16} /> + Modul AR
              </button>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleDirectUpload(e, "video")}
            accept="video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleDirectUpload(e, "image")}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={arInputRef}
            accept=".mind"
            className="hidden"
          />

          {/* ============================================ */}
          {/* LIST RENDERING MEDIA DINAMIS */}
          {/* ============================================ */}
          {mediaList.length === 0 ? (
            <div className="text-center py-8 text-neutral-300 font-bold text-sm border-2 border-dashed border-neutral-100 rounded-2xl">
              Belum ada media interaktif yang disematkan.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mediaList.map((media, index) => (
                <div key={index} className="flex flex-col gap-3">
                  {/* Card Media */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 animate-fade-in">
                    {/* Icon berdasarkan tipe */}
                    <div
                      className={`p-3 rounded-xl ${
                        media.type.includes("video")
                          ? "bg-[#ebf5fb] text-[#3498db]"
                          : media.type === "image_cloud"
                          ? "bg-[#fef9e7] text-[#f39c12]"
                          : media.type === "model_3d" ||
                            media.type === "model_3d_animated"
                          ? "bg-[#f0e6ff] text-[#8e44ad]"
                          : "bg-[#fff3ee] text-[#ff6b35]"
                      }`}
                    >
                      {media.type.includes("video") ? (
                        <VideoCamera weight="fill" size={20} />
                      ) : media.type === "image_cloud" ? (
                        <Image weight="fill" size={20} />
                      ) : media.type === "model_3d" ||
                        media.type === "model_3d_animated" ? (
                        <Cube weight="fill" size={20} />
                      ) : (
                        <Cube weight="fill" size={20} />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
                      <span className="text-xs font-black text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                        {media.type === "video_link"
                          ? "YouTube Link"
                          : media.type === "video_cloud"
                          ? "Cloud Video"
                          : media.type === "image_cloud"
                          ? "Gambar"
                          : media.type === "model_3d"
                          ? "Model 3D"
                          : media.type === "model_3d_animated"
                          ? "Model 3D Animasi"
                          : "AR (.mind)"}
                      </span>

                      {media.type === "video_link" ? (
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          required
                          className="flex-1 bg-white border border-neutral-200 rounded-xl p-2.5 text-sm font-semibold text-neutral-700 outline-none focus:border-[#3498db]"
                          value={media.url}
                          onChange={(e) =>
                            handleMediaUrlChange(index, e.target.value)
                          }
                        />
                      ) : (
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="text"
                            readOnly
                            placeholder={
                              media.type === "model_3d" ||
                              media.type === "model_3d_animated"
                                ? "Pilih file .glb..."
                                : "Belum ada file terunggah..."
                            }
                            required
                            className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl p-2.5 text-sm font-semibold text-neutral-500 outline-none"
                            value={media.nama_file || media.url}
                          />
                          {!media.url && (
                            <button
                              type="button"
                              onClick={() => {
                                if (media.type === "video_cloud") {
                                  fileInputRef.current.click();
                                } else if (media.type === "image_cloud") {
                                  imageInputRef.current.click();
                                } else if (
                                  media.type === "model_3d" ||
                                  media.type === "model_3d_animated"
                                ) {
                                  // ✅ Trigger upload .glb / .gltf
                                  const tempInput =
                                    document.createElement("input");
                                  tempInput.type = "file";
                                  tempInput.accept = ".glb,.gltf";
                                  tempInput.onchange = (ev) =>
                                    handleModel3DUpload(ev, index);
                                  tempInput.click();
                                } else {
                                  const tempInput =
                                    document.createElement("input");
                                  tempInput.type = "file";
                                  tempInput.accept = ".mind";
                                  tempInput.onchange = (ev) =>
                                    handleDirectUpload(ev, "ar", index);
                                  tempInput.click();
                                }
                              }}
                              className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Pilih Berkas
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tombol Toggle AR Output */}
                    {(media.type === "video_cloud" ||
                      media.type === "video_link" ||
                      media.type === "image_cloud" ||
                      media.type === "model_3d" ||
                      media.type === "model_3d_animated") && (
                      <button
                        type="button"
                        onClick={() => toggleArOutput(index)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          media.is_ar_output
                            ? "bg-[#ff6b35] text-white hover:bg-[#e0531f]"
                            : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                        }`}
                      >
                        {media.is_ar_output ? (
                          <CheckCircle weight="fill" size={14} />
                        ) : (
                          <Circle weight="fill" size={14} />
                        )}
                        {media.is_ar_output
                          ? "Output AR"
                          : "Jadikan Output AR"}
                      </button>
                    )}

                    {/* ✅ Tombol Konfigurasi Model 3D */}
                    {(media.type === "model_3d" ||
                      media.type === "model_3d_animated") &&
                      media.url && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowModelConfig(
                              showModelConfig === index ? null : index
                            )
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            showModelConfig === index
                              ? "bg-[#8e44ad] text-white"
                              : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                          }`}
                          title="Konfigurasi Model 3D"
                        >
                          <Gear weight="bold" size={16} />
                        </button>
                      )}

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <XCircle weight="fill" size={24} />
                    </button>
                  </div>

                  {/* ✅ PANEL KONFIGURASI MODEL 3D */}
                  {showModelConfig === index &&
                    (media.type === "model_3d" ||
                      media.type === "model_3d_animated") && (
                      <div className="ml-16 p-4 bg-purple-50 rounded-xl border border-purple-200 animate-fade-in">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                          <Gear weight="bold" size={16} />
                          Konfigurasi Model 3D
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Scale */}
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1">
                              Skala (x y z)
                            </label>
                            <input
                              type="text"
                              value={
                                media.model_config?.scale || "0.5 0.5 0.5"
                              }
                              onChange={(e) =>
                                updateModelConfig(
                                  index,
                                  "scale",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                              placeholder="0.5 0.5 0.5"
                            />
                          </div>

                          {/* Position */}
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1">
                              Posisi (x y z)
                            </label>
                            <input
                              type="text"
                              value={
                                media.model_config?.position ||
                                "0 0.1 0.1"
                              }
                              onChange={(e) =>
                                updateModelConfig(
                                  index,
                                  "position",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                              placeholder="0 0.1 0.1"
                            />
                          </div>

                          {/* Rotation */}
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1">
                              Rotasi Awal (x y z)
                            </label>
                            <input
                              type="text"
                              value={
                                media.model_config?.rotation || "0 0 0"
                              }
                              onChange={(e) =>
                                updateModelConfig(
                                  index,
                                  "rotation",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                              placeholder="0 45 0"
                            />
                          </div>

                          {/* Animation (hanya untuk model_3d) */}
                          {media.type === "model_3d" && (
                            <div>
                              <label className="block text-xs font-semibold text-purple-700 mb-1">
                                Animasi
                              </label>
                              <select
                                value={
                                  media.model_config?.animation || "none"
                                }
                                onChange={(e) =>
                                  updateModelConfig(
                                    index,
                                    "animation",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                              >
                                <option value="none">Tidak Ada</option>
                                <option value="rotate">Rotasi Otomatis</option>
                              </select>
                            </div>
                          )}

                          {/* Animation Speed (jika rotate) */}
                          {media.type === "model_3d" &&
                            media.model_config?.animation === "rotate" && (
                              <div>
                                <label className="block text-xs font-semibold text-purple-700 mb-1">
                                  Kecepatan Rotasi (ms)
                                </label>
                                <input
                                  type="number"
                                  value={
                                    media.model_config?.animationSpeed ||
                                    5000
                                  }
                                  onChange={(e) =>
                                    updateModelConfig(
                                      index,
                                      "animationSpeed",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                                  min="1000"
                                  step="1000"
                                />
                              </div>
                            )}

                          {/* Auto Rotate (untuk model_3d_animated) */}
                          {media.type === "model_3d_animated" && (
                            <div>
                              <label className="block text-xs font-semibold text-purple-700 mb-1">
                                Auto Rotate
                              </label>
                              <select
                                value={
                                  media.model_config?.autoRotate
                                    ? "true"
                                    : "false"
                                }
                                onChange={(e) =>
                                  updateModelConfig(
                                    index,
                                    "autoRotate",
                                    e.target.value === "true"
                                  )
                                }
                                className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-purple-500"
                              >
                                <option value="false">Tidak</option>
                                <option value="true">Ya</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* INFORMASI TAMBAHAN */}
        {/* ============================================ */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 flex items-start gap-3">
          <div className="mt-0.5">
            <Question weight="fill" size={20} />
          </div>
          <div>
            <p className="font-bold">Cara Kerja Output AR:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-blue-600">
              <li>
                <span className="font-semibold">Target (.mind)</span> wajib
                diunggah sebagai marker yang akan discan siswa.
              </li>
              <li>
                Tandai{" "}
                <span className="font-semibold">
                  video, gambar, atau model 3D
                </span>{" "}
                sebagai{" "}
                <span className="font-bold text-[#ff6b35]">Output AR</span>{" "}
                agar muncul di atas marker saat siswa melakukan scan.
              </li>
              <li>
                <span className="font-semibold">Model 3D (.glb/.gltf)</span> akan
                tampil interaktif di atas marker dan bisa dilihat dari
                berbagai sudut. Gunakan konfigurasi untuk mengatur skala,
                posisi, dan animasi.
              </li>
              <li>
                Jika tidak ditandai, media akan tampil di halaman detail
                materi biasa (Ruang Baca).
              </li>
            </ul>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}