import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  CaretLeft,
  FloppyDisk,
  VideoCamera,
  Cube,
  XCircle,
  Link,
  UploadSimple,
  FolderUser,
} from "@phosphor-icons/react";
import { FaYoutube } from "react-icons/fa";

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
  const fileInputRef = useRef(null);
  const arInputRef = useRef(null);

  const CLOUD_NAME = "dbteh8sbe";
  const UPLOAD_PRESET = "literasi_preset";
  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const res = await fetch(
          "http://localhost/lms_sdn101752/literasi-backend/api/kelas/read_rombel.php",
        );
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
      media: mediaList,
    };

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/materi/create.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

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

  const addVideoLink = () => {
    setMediaList([...mediaList, { type: "video_link", url: "" }]);
  };

  const addArMind = () => {
    setMediaList([...mediaList, { type: "ar_mind", url: "" }]);
  };

  const handleMediaUrlChange = (index, value) => {
    const updated = [...mediaList];
    updated[index].url = value;
    setMediaList(updated);
  };

  const removeMedia = (index) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

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
        },
      );
      const data = await res.json();
      Swal.close();

      if (data.secure_url) {
        if (index !== undefined) {
          const updated = [...mediaList];
          updated[index].url = data.secure_url;
          setMediaList(updated);
        } else {
          setMediaList([
            ...mediaList,
            {
              type: type === "video" ? "video_cloud" : "ar_mind",
              url: data.secure_url,
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

  return (
    <DashboardLayout role="guru" title="Buat Materi Baru">
      <form
        onSubmit={handleSave}
        className="max-w-5xl mx-auto flex flex-col gap-6 pb-12"
      >
        {/* Bar Aksi Atas */}
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

        {/* Panel Konfigurasi Utama */}
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
            {/* Input Mata Pelajaran */}
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

            {/* Dropdown Rombel Pintar Terpadu */}
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
                    (r) => r.id == e.target.value,
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

            {/* Visibilitas Akses */}
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

        {/* Editor WYSIWYG Konten Teks */}
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

        {/* Panel Media Interaktif (Video & Augmented Reality) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-black text-neutral-900 text-lg">
                Media Belajar Interaktif
              </h3>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">
                Sematkan video pembelajaran atau berkas Augmented Reality
                (.mind).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addVideoLink}
                className="p-2.5 bg-neutral-50 hover:bg-[#ebf5fb] text-neutral-600 hover:text-[#3498db] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <FaYoutube weight="bold" size={16} /> + Video Link
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
                onClick={addArMind}
                className="p-2.5 bg-neutral-50 hover:bg-[#fff3ee] text-neutral-600 hover:text-[#ff6b35] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
              >
                <Cube weight="bold" size={16} /> + Modul AR
              </button>
            </div>
          </div>

          {/* Hidden File Input Reference */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleDirectUpload(e, "video")}
            accept="video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={arInputRef}
            accept=".mind"
            className="hidden"
          />

          {/* List Rendering Media Dinamis */}
          {mediaList.length === 0 ? (
            <div className="text-center py-8 text-neutral-300 font-bold text-sm border-2 border-dashed border-neutral-100 rounded-2xl">
              Belum ada media interaktif yang disematkan.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mediaList.map((media, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 animate-fade-in"
                >
                  <div
                    className={`p-3 rounded-xl ${media.type.includes("video") ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                  >
                    {media.type.includes("video") ? (
                      <VideoCamera weight="fill" size={20} />
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
                          placeholder="Belum ada file terunggah..."
                          required
                          className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl p-2.5 text-sm font-semibold text-neutral-500 outline-none"
                          value={media.url}
                        />
                        {!media.url && (
                          <button
                            type="button"
                            onClick={() => {
                              if (media.type === "video_cloud")
                                fileInputRef.current.click();
                              else {
                                // Trigger upload target custom file .mind
                                const tempInput =
                                  document.createElement("input");
                                tempInput.type = "file";
                                tempInput.accept = ".mind";
                                tempInput.onchange = (e) =>
                                  handleDirectUpload(e, "ar", index);
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

                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="text-neutral-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <XCircle weight="fill" size={24} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </DashboardLayout>
  );
}
