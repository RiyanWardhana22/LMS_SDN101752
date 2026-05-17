import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  CaretLeft,
  FloppyDisk,
  TextItalic,
  TextUnderline,
  ListBullets,
  Link,
  VideoCamera,
  Cube,
  XCircle,
} from "@phosphor-icons/react";
import { FaBold } from "react-icons/fa";

export default function FormMateri() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [judul, setJudul] = useState("");
  const [mediaList, setMediaList] = useState([]);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate("/guru/materi");
    }, 1500);
  };
  const addMedia = (type) => {
    if (type === "video") {
      setMediaList([
        ...mediaList,
        { id: Date.now(), type: "video", url: "https://youtube.com/..." },
      ]);
    } else if (type === "ar") {
      setMediaList([
        ...mediaList,
        { id: Date.now(), type: "ar", marker: "targets.mind" },
      ]);
    }
  };

  const removeMedia = (id) => {
    setMediaList(mediaList.filter((m) => m.id !== id));
  };

  return (
    <DashboardLayout role="guru" title="Buat Materi Baru">
      <form
        onSubmit={handleSave}
        className="max-w-5xl mx-auto flex flex-col gap-6"
      >
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <button
            type="button"
            onClick={() => navigate("/guru/materi")}
            className="flex items-center gap-2 text-neutral-500 hover:text-[#ff6b35] font-bold text-sm transition-colors"
          >
            <CaretLeft weight="bold" size={20} /> Kembali
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl transition-all shadow-[0_4px_0_#1e8449] active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            <FloppyDisk weight="bold" size={20} />
            {isSaving ? "Menyimpan..." : "Simpan & Terbitkan"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
            <div className="bg-neutral-50 border-b border-neutral-100 p-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <FaBold />
                </button>
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <TextItalic weight="bold" size={18} />
                </button>
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <TextUnderline weight="bold" size={18} />
                </button>
              </div>
              <div className="w-px h-6 bg-neutral-200 mx-1"></div>
              <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <ListBullets weight="bold" size={18} />
                </button>
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <Link weight="bold" size={18} />
                </button>
              </div>

              <div className="flex-1"></div>

              {/* Tombol Sisipkan Khusus */}
              <button
                type="button"
                onClick={() => addMedia("video")}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#fdedec] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white font-bold text-xs rounded-lg transition-colors border border-[#e74c3c]/20"
              >
                <VideoCamera weight="fill" size={16} /> Sisipkan Video
              </button>
              <button
                type="button"
                onClick={() => addMedia("ar")}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#eafaf1] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white font-bold text-xs rounded-lg transition-colors border border-[#2ecc71]/20"
              >
                <Cube weight="fill" size={16} /> Sisipkan AR
              </button>
            </div>

            {/* Area Ketik Editor */}
            <div className="p-8 flex-1 flex flex-col min-h-[400px]">
              <input
                type="text"
                placeholder="Judul Materi..."
                className="w-full text-4xl font-black text-neutral-900 placeholder:text-neutral-300 border-none focus:ring-0 outline-none mb-6 bg-transparent"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
              <textarea
                placeholder="Ketik isi materi di sini... Anda bisa menekan tombol di atas untuk menyisipkan Video atau AR."
                className="w-full flex-1 text-neutral-700 leading-relaxed border-none focus:ring-0 outline-none resize-none bg-transparent"
              ></textarea>

              {/* Area Render Media yang disisipkan */}
              {mediaList.length > 0 && (
                <div className="mt-8 flex flex-col gap-4 border-t-2 border-dashed border-neutral-200 pt-6">
                  <h4 className="font-bold text-neutral-400 text-sm uppercase tracking-wider">
                    Media Tersisip
                  </h4>

                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      className={`relative p-4 rounded-2xl border-2 flex items-center gap-4 ${media.type === "video" ? "bg-[#fdedec]/50 border-[#e74c3c]/30" : "bg-[#eafaf1]/50 border-[#2ecc71]/30"}`}
                    >
                      <div
                        className={`p-3 rounded-xl text-white ${media.type === "video" ? "bg-[#e74c3c]" : "bg-[#2ecc71]"}`}
                      >
                        {media.type === "video" ? (
                          <VideoCamera weight="fill" size={24} />
                        ) : (
                          <Cube weight="fill" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">
                          {media.type === "video"
                            ? "Tautan Video YouTube"
                            : "Modul WebAR (MindAR)"}
                        </p>
                        <input
                          type="text"
                          defaultValue={
                            media.type === "video" ? media.url : media.marker
                          }
                          className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#ff6b35]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(media.id)}
                        className="p-2 text-neutral-400 hover:text-[#e74c3c] transition-colors"
                      >
                        <XCircle weight="fill" size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AREA KANAN: Panel Pengaturan */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-black text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                Pengaturan Materi
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Mata Pelajaran
                  </label>
                  <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35]">
                    <option>IPA (Sains)</option>
                    <option>IPS (Sosial)</option>
                    <option>Matematika</option>
                    <option>Bahasa Indonesia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Target Kelas
                  </label>
                  <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35]">
                    <option>Kelas 1</option>
                    <option>Kelas 2</option>
                    <option>Kelas 3</option>
                    <option>Kelas 4</option>
                    <option>Kelas 5</option>
                    <option>Kelas 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Status Visibilitas
                  </label>
                  <select className="w-full bg-[#fff3ee] border border-[#ff6b35] rounded-xl p-3 text-sm font-bold text-[#e54e1b] outline-none">
                    <option>Tersedia untuk Siswa</option>
                    <option>Sembunyikan (Draft)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#4ecdc4] to-[#3498db] rounded-3xl p-6 shadow-sm text-white">
              <h3 className="font-black mb-2 flex items-center gap-2">
                <Cube weight="fill" /> Tips Modul AR
              </h3>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                Untuk menyisipkan AR, pastikan Anda sudah mengunggah file{" "}
                <code className="bg-black/20 px-1 rounded">.mind</code> ke
                server. Siswa akan langsung melihat tombol "Mulai AR" di bagian
                bawah teks bacaan.
              </p>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
