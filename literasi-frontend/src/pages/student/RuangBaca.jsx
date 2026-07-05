import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { CaretLeft, Cube, CalendarBlank, VideoCamera } from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

const SUBJECT_THEMES = {
  "Bahasa Indonesia": { bg: "#FFF0F6", text: "#FF6B9D", icon: "📖" },
  "Matematika":       { bg: "#F0FAFA", text: "#4ECDC4", icon: "➗" },
  "IPA":              { bg: "#EAFAF1", text: "#2ECC71", icon: "🔬" },
  "IPS":              { bg: "#FEF5E7", text: "#E67E22", icon: "🌍" },
  "PKn":              { bg: "#FDEDEC", text: "#E74C3C", icon: "🇮🇩" },
  default:            { bg: "#EBF5FB", text: "#3498DB", icon: "📚" },
};

function getTheme(mapel) {
  const key = Object.keys(SUBJECT_THEMES).find((k) => mapel?.toLowerCase().includes(k.toLowerCase()));
  return SUBJECT_THEMES[key] || SUBJECT_THEMES.default;
}

function LoadingSkeleton() {
  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="skeleton h-6 w-32 rounded-xl mb-6" />
        <div className="bg-white rounded-t-3xl p-8 border-2 border-b-0" style={{ borderColor: "var(--color-neutral-100)" }}>
          <div className="skeleton h-6 w-24 rounded-xl mb-4" />
          <div className="skeleton h-9 w-3/4 rounded-xl mb-2" />
          <div className="skeleton h-6 w-1/2 rounded-xl" />
        </div>
        <div className="bg-white p-8 border-x-2" style={{ borderColor: "var(--color-neutral-100)" }}>
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-5 w-full rounded mb-3" />)}
        </div>
        <div className="bg-white rounded-b-3xl h-8 border-2 border-t-0" style={{ borderColor: "var(--color-neutral-100)" }} />
      </div>
    </StudentLayout>
  );
}

export default function RuangBaca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materi, setMateri] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(apiEndpoint(`api/materi/detail.php?id=${id}`));
        const data = await response.json();
        if (data.status === "success") {
          setMateri(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
          navigate("/siswa/materi");
        }
      } catch {
        Swal.fire({ icon: "error", title: "Koneksi Gagal", text: "Tidak dapat memuat materi dari server." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const getEmbedUrl = (url) => {
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (isLoading) return <LoadingSkeleton />;
  if (!materi) return null;

  const theme = getTheme(materi.mata_pelajaran);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/siswa/materi")}
          className="flex items-center gap-2 font-bold text-sm mb-6 transition-colors"
          style={{ color: "var(--color-neutral-500)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-neutral-500)")}
        >
          <CaretLeft weight="bold" size={20} />
          Kembali ke Pustaka
        </button>

        {/* Header */}
        <div className="bg-white rounded-t-3xl p-8 relative overflow-hidden" style={{ border: "2px solid var(--color-neutral-100)", borderBottom: "none" }}>
          {/* Accent bar atas sesuai warna mapel */}
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ backgroundColor: theme.text }} />

          <div className="flex flex-wrap gap-3 mb-5">
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide" style={{ backgroundColor: theme.bg, color: theme.text }}>
              <span>{theme.icon}</span> {materi.mata_pelajaran}
            </span>
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }}>
              <CalendarBlank weight="bold" size={14} />
              {new Date(materi.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
            {materi.judul}
          </h1>
        </div>

        {/* Konten Materi — font lebih besar untuk anak-anak */}
        <div
          className="bg-white p-8"
          style={{
            borderLeft: "2px solid var(--color-neutral-100)",
            borderRight: "2px solid var(--color-neutral-100)",
            fontSize: "1.125rem",      /* 18px — ukuran untuk siswa */
            lineHeight: "1.75",
            color: "var(--color-neutral-700)",
          }}
        >
          <div
            className="prose max-w-none materi-content"
            style={{ "--tw-prose-headings": "var(--color-neutral-900)" }}
            dangerouslySetInnerHTML={{ __html: materi.konten }}
          />
        </div>

        {/* Media Interaktif */}
        {materi.media && materi.media.length > 0 && (
          <div className="p-8 rounded-b-3xl flex flex-col gap-8" style={{ backgroundColor: "var(--color-neutral-50)", border: "2px solid var(--color-neutral-100)", borderTop: "none" }}>
            <h3 className="font-black text-2xl pb-4" style={{ color: "var(--color-neutral-900)", borderBottom: "2px solid var(--color-neutral-200)", fontFamily: "'Fredoka One', sans-serif" }}>
              🎬 Media Belajar Interaktif
            </h3>
            <div className="flex flex-col gap-8">
              {materi.media.map((med, index) => (
                <div key={index} className="w-full">
                  {med.type === "video_link" && (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(26,26,46,0.12)", border: "4px solid white", backgroundColor: "black" }}>
                      <iframe
                        src={getEmbedUrl(med.url)}
                        title="Video Materi"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {med.type === "video_cloud" && (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(26,26,46,0.12)", border: "4px solid white", backgroundColor: "black" }}>
                      <video controls className="w-full h-full">
                        <source src={med.url} type="video/mp4" />
                        Browser kamu tidak mendukung pemutar video.
                      </video>
                    </div>
                  )}

                  {med.type === "ar_mind" && (
                    <div className="p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4ECDC4 0%, #3498DB 100%)", boxShadow: "0 8px 32px rgba(78,205,196,0.30)" }}>
                      <div className="relative z-10 flex items-center gap-5 text-center md:text-left">
                        <div className="p-4 rounded-2xl hidden sm:flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.20)" }}>
                          <Cube weight="fill" size={48} />
                        </div>
                        <div>
                          <h4 className="font-black text-2xl mb-1" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
                            Modul Augmented Reality ✨
                          </h4>
                          <p className="text-sm font-medium opacity-90">
                            Arahkan kamera ke gambar marker yang diberikan gurumu untuk melihat objek 3D!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("current_ar_marker", med.url);
                          navigate("/siswa/ar");
                        }}
                        className="relative z-10 w-full md:w-auto px-8 py-4 font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        style={{ backgroundColor: "white", color: "#3498DB", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                      >
                        🚀 Mulai AR!
                      </button>
                      <Cube weight="duotone" size={160} className="absolute -right-8 -bottom-8 opacity-10 -rotate-12" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Penutup bawah jika tidak ada media */}
        {(!materi.media || materi.media.length === 0) && (
          <div className="rounded-b-3xl h-8 bg-white" style={{ border: "2px solid var(--color-neutral-100)", borderTop: "none" }} />
        )}
      </div>
    </StudentLayout>
  );
}