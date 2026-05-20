import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  CaretLeft,
  Cube,
  VideoCamera,
  CalendarBlank,
} from "@phosphor-icons/react";

export default function RuangBaca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materi, setMateri] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost/lms_sdn101752/literasi-backend/api/materi/detail.php?id=${id}`,
        );
        const data = await response.json();
        if (data.status === "success") {
          setMateri(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
          navigate("/siswa/materi");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Tidak dapat memuat materi dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);
  const getEmbedUrl = (url) => {
    if (url.includes("youtube.com/watch?v="))
      return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/"))
      return url.replace("youtu.be/", "youtube.com/embed/");
    return url;
  };

  if (isLoading) {
    return (
      <StudentLayout title="Ruang Baca">
        <div className="text-center py-32 font-black text-neutral-400 animate-pulse text-xl">
          Membuka halaman buku... 📖
        </div>
      </StudentLayout>
    );
  }

  if (!materi) return null;

  return (
    <StudentLayout title="Ruang Baca">
      <div className="max-w-4xl mx-auto pb-12">
        <button
          onClick={() => navigate("/siswa/materi")}
          className="flex items-center gap-2 text-neutral-500 hover:text-[#4ecdc4] font-bold text-sm mb-6 transition-colors"
        >
          <CaretLeft weight="bold" size={20} /> Kembali ke Pustaka
        </button>

        {/* Header Materi */}
        <div className="bg-white rounded-t-3xl p-8 lg:p-12 border-x-2 border-t-2 border-neutral-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-4 py-1.5 bg-[#eafaf1] text-[#2ecc71] font-black text-xs uppercase tracking-wider rounded-xl">
              {materi.mata_pelajaran}
            </span>
            <span className="px-4 py-1.5 bg-neutral-100 text-neutral-500 font-bold text-xs rounded-xl flex items-center gap-2">
              <CalendarBlank weight="bold" />
              {new Date(materi.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-900 leading-tight mb-2">
            {materi.judul}
          </h1>
        </div>

        <div className="bg-white p-8 lg:px-12 border-x-2 border-neutral-100 shadow-sm prose prose-lg prose-neutral max-w-none prose-headings:font-black prose-a:text-[#3498db] prose-img:rounded-2xl leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: materi.konten }}></div>
        </div>

        {/* Area Media Pendukung (Video & Modul AR) */}
        {materi.media && materi.media.length > 0 && (
          <div className="bg-neutral-50 p-8 lg:p-12 border-2 border-neutral-100 rounded-b-3xl shadow-sm flex flex-col gap-8">
            <h3 className="font-black text-neutral-900 text-2xl border-b-2 border-neutral-200 pb-4">
              Media Belajar Interaktif
            </h3>
            <div className="flex flex-col gap-8">
              {materi.media.map((med, index) => (
                <div key={index} className="w-full">
                  {/* Tampilan 1: Video YouTube */}
                  {med.type === "video_link" && (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-black">
                      <iframe
                        src={getEmbedUrl(med.url)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  )}

                  {/* Tampilan 2: Video Cloudinary */}
                  {med.type === "video_cloud" && (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-black">
                      <video controls className="w-full h-full">
                        <source src={med.url} type="video/mp4" />
                        Browser Anda tidak mendukung pemutar video ini.
                      </video>
                    </div>
                  )}

                  {/* Tampilan 3: Tombol Augmented Reality */}
                  {med.type === "ar_mind" && (
                    <div className="bg-gradient-to-r from-[#4ecdc4] to-[#3498db] p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                      <div className="relative z-10 flex items-center gap-6 text-center md:text-left">
                        <div className="p-4 bg-white/20 rounded-2xl shrink-0 hidden sm:block">
                          <Cube weight="fill" size={48} />
                        </div>
                        <div>
                          <h4 className="font-black text-2xl mb-1">
                            Modul Augmented Reality
                          </h4>
                          <p className="font-medium opacity-90 text-sm md:text-base">
                            Kamera Ajaib siap digunakan! Arahkan ke gambar yang
                            ditentukan gurumu.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("current_ar_marker", med.url);
                          navigate("/siswa/modul-ar");
                        }}
                        className="relative z-10 w-full md:w-auto px-8 py-4 bg-white text-[#3498db] font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap"
                      >
                        Mulai AR 🚀
                      </button>
                      <Cube
                        weight="duotone"
                        size={160}
                        className="absolute -right-10 -bottom-10 opacity-10 transform -rotate-12"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Penutup Kotak Putih Bawah (Bila Tidak Ada Media) */}
        {(!materi.media || materi.media.length === 0) && (
          <div className="bg-white border-x-2 border-b-2 border-neutral-100 rounded-b-3xl h-8"></div>
        )}
      </div>
    </StudentLayout>
  );
}
