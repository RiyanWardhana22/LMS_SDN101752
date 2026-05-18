import { useState, useRef } from "react";
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
} from "@phosphor-icons/react";

export default function FormMateri() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState("IPA (Sains)");
  const [kelas, setKelas] = useState("Kelas 4");
  const [visibilitas, setVisibilitas] = useState("publik");
  const [isUploadingCloud, setIsUploadingCloud] = useState(false);
  const fileInputRef = useRef(null);
  const arInputRef = useRef(null);

  const CLOUD_NAME = "dy419a52c";
  const UPLOAD_PRESET = "r7a8ph82";

  const addVideoLink = () => {
    setMediaList([
      ...mediaList,
      { id: Date.now(), type: "video_link", url: "" },
    ]);
  };

  const handleCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCloud(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();

      if (data.secure_url) {
        setMediaList([
          ...mediaList,
          {
            id: Date.now(),
            type: "video_cloud",
            url: data.secure_url,
            filename: file.name,
          },
        ]);
      }
    } catch (error) {
      alert("Gagal mengunggah ke Cloudinary");
    } finally {
      setIsUploadingCloud(false);
    }
  };

  const handleARUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".mind")) {
      alert("Format harus .mind!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/upload_ar.php",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();

      if (data.status === "success") {
        setMediaList([
          ...mediaList,
          {
            id: Date.now(),
            type: "ar_mind",
            url: data.file_path,
            filename: file.name,
          },
        ]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Gagal mengunggah AR ke server lokal");
    }
  };

  const removeMedia = (id) => {
    setMediaList(mediaList.filter((m) => m.id !== id));
  };

  const handleUpdateMediaUrl = (id, newUrl) => {
    setMediaList(
      mediaList.map((m) => (m.id === id ? { ...m, url: newUrl } : m)),
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      guru_id: user.id,
      judul,
      konten,
      mata_pelajaran: mataPelajaran,
      kelas,
      visibilitas,
      media: mediaList,
    };

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/materi/create.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        alert("Berhasil: " + data.message);
        navigate("/guru/materi");
      } else {
        alert("Gagal: " + data.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="guru" title="Buat Materi Baru">
      <form
        onSubmit={handleSave}
        className="max-w-5xl mx-auto flex flex-col gap-6"
      >
        {/* Header Aksi */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <button
            type="button"
            onClick={() => navigate("/guru/materi")}
            className="flex items-center gap-2 text-neutral-500 hover:text-[#ff6b35] font-bold text-sm"
          >
            <CaretLeft weight="bold" size={20} /> Kembali
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl transition-all shadow-[0_4px_0_#1e8449]"
          >
            <FloppyDisk weight="bold" size={20} />{" "}
            {isSaving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* AREA KIRI: Editor Teks & Media */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col p-6">
              <input
                type="text"
                placeholder="Masukkan Judul Materi..."
                required
                className="w-full text-3xl font-black text-neutral-900 placeholder:text-neutral-300 border-none focus:ring-0 outline-none mb-6 bg-transparent"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />

              {/* React Quill WYSIWYG */}
              <div className="h-[300px] mb-12">
                <ReactQuill
                  theme="snow"
                  value={konten}
                  onChange={setKonten}
                  style={{ height: "100%" }}
                  placeholder="Ketik isi materi, penjelasan, atau instruksi di sini..."
                />
              </div>
            </div>

            {/* Panel Penyisipan Media Khusus */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-black text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                Sisipkan Multimedia
              </h3>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fdedec] text-[#e74c3c] font-bold text-sm rounded-xl"
                >
                  <Link weight="bold" /> Link YouTube
                </button>

                {/* Tombol Upload Video */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fff3ee] text-[#ff6b35] font-bold text-sm rounded-xl"
                >
                  <UploadSimple weight="bold" />{" "}
                  {isUploadingCloud ? "Mengunggah..." : "Upload Video (Cloud)"}
                </button>
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleCloudinaryUpload}
                  className="hidden"
                />

                {/* Tombol Upload AR */}
                <button
                  type="button"
                  onClick={() => arInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#eafaf1] text-[#2ecc71] font-bold text-sm rounded-xl"
                >
                  <Cube weight="bold" /> Upload File .mind (AR)
                </button>
                <input
                  type="file"
                  accept=".mind"
                  ref={arInputRef}
                  onChange={handleARUpload}
                  className="hidden"
                />
              </div>

              {/* Daftar Media yang sudah ditambahkan */}
              <div className="flex flex-col gap-4">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className="p-4 rounded-xl border-2 flex items-center gap-4 bg-neutral-50 border-neutral-200"
                  >
                    <div className="p-3 rounded-xl text-white bg-neutral-400">
                      {media.type.includes("video") ? (
                        <VideoCamera weight="fill" size={24} />
                      ) : (
                        <Cube weight="fill" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900 text-sm">
                        {media.type === "video_link" && "Link Video YouTube"}
                        {media.type === "video_cloud" &&
                          `Video Cloudinary: ${media.filename}`}
                        {media.type === "ar_mind" &&
                          `Modul AR: ${media.filename}`}
                      </p>

                      {media.type === "video_link" ? (
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          required
                          value={media.url}
                          onChange={(e) =>
                            handleUpdateMediaUrl(media.id, e.target.value)
                          }
                          className="w-full mt-2 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#ff6b35]"
                        />
                      ) : (
                        <p className="text-xs text-neutral-500 mt-1 break-all bg-neutral-200 p-2 rounded-lg">
                          {media.url}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(media.id)}
                      className="p-2 text-neutral-400 hover:text-[#e74c3c] transition-colors"
                    >
                      <XCircle weight="fill" size={28} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AREA KANAN: Pengaturan Materi (Tetap Sama) */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-black text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                Kategori
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none"
                  >
                    <option value="IPA (Sains)">IPA (Sains)</option>
                    <option value="IPS (Sosial)">IPS (Sosial)</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Target Kelas
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none"
                  >
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas 4">Kelas 4</option>
                    <option value="Kelas 5">Kelas 5</option>
                    <option value="Kelas 6">Kelas 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Status Visibilitas
                  </label>
                  <select
                    value={visibilitas}
                    onChange={(e) => setVisibilitas(e.target.value)}
                    className="w-full bg-[#fff3ee] border border-[#ff6b35] rounded-xl p-3 text-sm font-bold text-[#e54e1b] outline-none"
                  >
                    <option value="publik">Tersedia untuk Siswa</option>
                    <option value="draft">Sembunyikan (Draft)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
