import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { BookOpen, MagnifyingGlass, CaretRight } from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

// Mapping warna dan ikon per mata pelajaran
const SUBJECT_THEMES = {
  "Bahasa Indonesia": { bg: "#FFF0F6", text: "#FF6B9D", border: "#FF6B9D", icon: "📖", shadow: "rgba(255,107,157,0.20)" },
  "Matematika":       { bg: "#F0FAFA", text: "#4ECDC4", border: "#4ECDC4", icon: "➗", shadow: "rgba(78,205,196,0.20)" },
  "IPA":              { bg: "#EAFAF1", text: "#2ECC71", border: "#2ECC71", icon: "🔬", shadow: "rgba(46,204,113,0.20)" },
  "IPS":              { bg: "#FEF5E7", text: "#E67E22", border: "#E67E22", icon: "🌍", shadow: "rgba(230,126,34,0.20)" },
  "PKn":              { bg: "#FDEDEC", text: "#E74C3C", border: "#E74C3C", icon: "🇮🇩", shadow: "rgba(231,76,60,0.20)" },
  "Agama":            { bg: "#F5EEF8", text: "#9B59B6", border: "#9B59B6", icon: "🕌", shadow: "rgba(155,89,182,0.20)" },
  "SBdP":             { bg: "#FEF9E7", text: "#F39C12", border: "#F39C12", icon: "🎨", shadow: "rgba(243,156,18,0.20)" },
  "PJOK":             { bg: "#E8F8F5", text: "#1ABC9C", border: "#1ABC9C", icon: "⚽", shadow: "rgba(26,188,156,0.20)" },
};

function getTheme(mapel) {
  // Cari yang cocok (partial match)
  const key = Object.keys(SUBJECT_THEMES).find((k) =>
    mapel.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(mapel.toLowerCase())
  );
  return key ? SUBJECT_THEMES[key] : { bg: "#EBF5FB", text: "#3498DB", border: "#3498DB", icon: "📚", shadow: "rgba(52,152,219,0.20)" };
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-neutral-100">
      <div className="flex justify-between mb-4">
        <div className="skeleton h-6 w-24 rounded-xl" />
        <div className="skeleton h-6 w-16 rounded-lg" />
      </div>
      <div className="skeleton h-6 w-full rounded-lg mb-2" />
      <div className="skeleton h-6 w-3/4 rounded-lg mb-6" />
      <div className="flex justify-between items-center pt-4" style={{ borderTop: "2px solid var(--color-neutral-100)" }}>
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export default function PustakaBelajar() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const response = await fetch(apiEndpoint("api/materi/read_public.php"));
        const data = await response.json();
        if (data.status === "success") {
          setMateriList(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
        }
      } catch (error) {
        console.error("Gagal memuat materi", error);
        Swal.fire({ icon: "error", title: "Koneksi Gagal", text: "Tidak dapat memuat materi dari server." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMateri();
  }, []);

  const filteredMateri = materiList.filter(
    (m) =>
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
          📚 Pustaka Belajar
        </h1>
        <p className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
          Pilih materi dan mulai petualangan belajarmu!
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlass size={22} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-neutral-500)" }} />
        <input
          type="text"
          placeholder="Cari pelajaran atau judul materi..."
          className="w-full pl-12 pr-5 py-4 rounded-2xl font-bold outline-none transition-all"
          style={{
            border: "2.5px solid var(--color-neutral-300)",
            fontSize: "1rem",
            color: "var(--color-neutral-900)",
            backgroundColor: "white",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-secondary)"; e.target.style.boxShadow = "0 0 0 3px rgba(78,205,196,0.15)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--color-neutral-300)"; e.target.style.boxShadow = "none"; }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid Materi */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredMateri.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="font-black text-lg mb-1" style={{ color: "var(--color-neutral-900)" }}>
            {searchQuery ? "Materi tidak ditemukan" : "Belum ada materi"}
          </p>
          <p className="font-bold text-sm" style={{ color: "var(--color-neutral-500)" }}>
            {searchQuery ? `Coba kata kunci lain untuk "${searchQuery}"` : "Gurumu belum menambahkan materi baru."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMateri.map((materi) => {
            const theme = getTheme(materi.mata_pelajaran);
            return (
              <div
                key={materi.id}
                className="bg-white rounded-3xl p-6 flex flex-col cursor-pointer group transition-all duration-200"
                style={{
                  border: "2px solid var(--color-neutral-100)",
                  boxShadow: "var(--shadow-card)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-neutral-100)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onClick={() => navigate(`/siswa/materi/${materi.id}`)}
              >
                {/* Top row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: theme.bg }}>
                    <span className="text-sm">{theme.icon}</span>
                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: theme.text }}>
                      {materi.mata_pelajaran}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }}>
                    {materi.kelas}
                  </span>
                </div>

                {/* Judul */}
                <h3 className="text-xl font-black leading-snug mb-4 line-clamp-3 transition-colors" style={{ color: "var(--color-neutral-900)", fontFamily: "'Nunito', sans-serif", textAlign: "justify", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  {materi.judul}
                </h3>

                {/* Footer */}
                <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: "2px solid var(--color-neutral-100)" }}>
                  <span className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
                    {new Date(materi.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: theme.bg, color: theme.text }}>
                    <CaretRight weight="bold" size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}