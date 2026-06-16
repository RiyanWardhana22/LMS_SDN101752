import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditMateri() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("IPA (Sains)");
  const [kelas, setKelas] = useState("Kelas 4");
  const [visibilitas, setVisibilitas] = useState("publik");
  const [mediaList, setMediaList] = useState([]);
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

  useEffect(() => {
    const loadMateriDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost/lms_sdn101752/literasi-backend/api/materi/detail.php?id=${id}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          setJudul(data.data.judul);
          setKonten(data.data.konten || "");
          setMataPelajaran(data.data.mata_pelajaran);
          setKelas(data.data.kelas);
          setVisibilitas(data.data.visibilitas);
          setMediaList(data.data.media || []);
          setRombelId(data.data.rombel_id || "");
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: data.message });
          navigate("/guru/materi");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Tidak dapat terhubung ke server.",
        });
      } finally {
        setIsPageLoading(false);
      }
    };
    loadMateriDetails();
  }, [id]);
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
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Video berhasil diunggah ke cloud!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: "Gagal mengunggah ke Cloudinary.",
      });
    } finally {
      setIsUploadingCloud(false);
    }
  };

  const handleARUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".mind")) {
      Swal.fire({
        icon: "warning",
        title: "Format Salah",
        text: "Hanya menerima file ekstensi .mind!",
      });
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
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "File AR disimpan di server!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Koneksi server lokal terputus.",
      });
    }
  };

  const handleUpdateMediaUrl = (id, newUrl) => {
    setMediaList(
      mediaList.map((m) => (m.id === id ? { ...m, url: newUrl } : m)),
    );
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      id,
      judul,
      konten,
      rombel_id: rombelId,
      mata_pelajaran: mataPelajaran,
      kelas,
      visibilitas,
      media: mediaList,
    };

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/materi/update.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Perubahan materi telah disimpan.",
          confirmButtonColor: "#ff6b35",
        }).then(() => {
          navigate("/guru/materi");
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan Sistem",
        text: "Gagal memperbarui data ke server.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return (
      <DashboardLayout role="guru" title="Edit Materi">
        <div className="text-center py-20 font-bold text-neutral-500 animate-pulse">
          Memuat detail materi dari database...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="guru" title="Edit Materi">
      <form
        onSubmit={handleSave}
        className="max-w-5xl mx-auto flex flex-col gap-6"
      >
        {/* Top Navbar */}
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
            className="flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl shadow-[0_4px_0_#1e8449]"
          >
            {isSaving ? "Memperbarui..." : "Simpan Perubahan"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
              <input
                type="text"
                required
                className="w-full text-3xl font-black text-neutral-900 border-none focus:ring-0 outline-none mb-6 bg-transparent"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
              <div className="h-[300px] mb-12">
                <ReactQuill
                  theme="snow"
                  value={konten}
                  onChange={setKonten}
                  style={{ height: "100%" }}
                />
              </div>
            </div>

            {/* Media Manager Panel */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
              <h3 className="font-black text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                Multimedia Tersemat
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fdedec] text-[#e74c3c] font-bold text-sm rounded-xl"
                >
                  <Link /> Link YouTube
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fff3ee] text-[#ff6b35] font-bold text-sm rounded-xl"
                >
                  <UploadSimple />{" "}
                  {isUploadingCloud ? "Uploading..." : "Upload Video"}
                </button>
                <button
                  type="button"
                  onClick={() => arInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#eafaf1] text-[#2ecc71] font-bold text-sm rounded-xl"
                >
                  <Cube /> Upload AR (.mind)
                </button>
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleCloudinaryUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  accept=".mind"
                  ref={arInputRef}
                  onChange={handleARUpload}
                  className="hidden"
                />
              </div>

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
                      <p className="font-bold text-neutral-900 text-sm capitalize">
                        {media.type.replace("_", " ")}
                      </p>
                      {media.type === "video_link" ? (
                        <input
                          type="url"
                          value={media.url}
                          onChange={(e) =>
                            handleUpdateMediaUrl(media.id, e.target.value)
                          }
                          className="w-full mt-2 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      ) : (
                        <p className="text-xs text-neutral-500 mt-1 break-all bg-neutral-200 p-2 rounded-lg">
                          {media.url}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMediaList(mediaList.filter((m) => m.id !== media.id))
                      }
                      className="text-neutral-400 hover:text-[#e74c3c]"
                    >
                      <XCircle weight="fill" size={28} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Samping */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
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
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700"
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
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Status Visibilitas
                  </label>
                  <select
                    value={visibilitas}
                    onChange={(e) => setVisibilitas(e.target.value)}
                    className="w-full bg-[#fff3ee] border border-[#ff6b35] rounded-xl p-3 text-sm font-bold text-[#e54e1b]"
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
