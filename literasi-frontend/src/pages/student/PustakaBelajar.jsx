import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { BookOpen, MagnifyingGlass, CalendarBlank, X } from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";
import { getSubjectTheme } from "../../utils/subjectThemes";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-neutral-100 flex flex-col h-full min-h-[200px]">
      <div className="h-1.5 skeleton" />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="skeleton h-12 w-12 rounded-2xl" />
            <div className="skeleton h-6 w-24 rounded-xl" />
          </div>
          <div className="skeleton h-6 w-16 rounded-xl" />
        </div>
        <div className="skeleton h-6 w-full rounded-lg mb-2" />
        <div className="skeleton h-6 w-3/4 rounded-lg mb-6" />
        <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
          <div className="skeleton h-6 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function PustakaBelajar() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Filter dari URL ---
  const [searchParams, setSearchParams] = useSearchParams();
  const mapelFromUrl = searchParams.get("mapel") || "";
  const [filterMapel, setFilterMapel] = useState(mapelFromUrl);

  // Update URL saat filter berubah
  useEffect(() => {
    if (filterMapel) {
      setSearchParams({ mapel: filterMapel });
    } else {
      setSearchParams({});
    }
  }, [filterMapel, setSearchParams]);

  // --- Fetch data ---
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

  // Filter data (search + mapel)
  const filteredMateri = materiList.filter((m) => {
    const matchMapel = filterMapel ? m.mata_pelajaran === filterMapel : true;
    const matchSearch =
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMapel && matchSearch;
  });

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto w-full pb-12">
        {/* Hero */}
        <div
          className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-3xl p-8 mb-8 text-white flex items-center justify-between shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              📚 Pustaka Belajar
            </h2>
            <p className="font-medium opacity-90 max-w-lg leading-relaxed text-sm md:text-base">
              Pilih materi dan mulai petualangan belajarmu!
            </p>
          </div>
          <BookOpen
            weight="duotone"
            size={160}
            className="absolute -right-8 -bottom-12 opacity-20 transform -rotate-12 hidden md:block"
          />
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

        {/* Badge Filter Mapel */}
        {filterMapel && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
              Menampilkan materi: <strong>{filterMapel}</strong>
            </span>
            <button
              onClick={() => setFilterMapel("")}
              className="p-1 rounded-full hover:bg-neutral-200 transition-colors"
              aria-label="Hapus filter"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        )}

        {/* Grid Materi */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredMateri.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-neutral-100 flex flex-col items-center max-w-2xl mx-auto">
            <BookOpen
              size={64}
              weight="fill"
              className="text-[#3498db] mb-4"
            />
            <h3 className="text-xl font-black text-neutral-900 mb-2">
              {searchQuery || filterMapel ? "Materi tidak ditemukan" : "Belum ada materi"}
            </h3>
            <p className="font-bold text-neutral-500">
              {searchQuery || filterMapel
                ? `Coba kata kunci lain atau hapus filter`
                : "Gurumu belum menambahkan materi baru."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredMateri.map((materi) => {
              const theme = getSubjectTheme(materi.mata_pelajaran);

              return (
                <div
                  key={materi.id}
                  className="bg-white rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    border: "2px solid var(--color-neutral-100)",
                    boxShadow: "var(--shadow-card)",
                  }}
                  onClick={() => navigate(`/siswa/materi/${materi.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.color;
                    e.currentTarget.style.boxShadow = `0 8px 32px ${theme.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-neutral-100)";
                    e.currentTarget.style.boxShadow = "var(--shadow-card)";
                  }}
                >
                  {/* Accent bar warna */}
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: theme.color }}
                  />

                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left section */}
                    <div className="flex-1">
                      {/* Badge */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div
                          className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5"
                          style={{
                            backgroundColor: theme.bg,
                            color: theme.color,
                          }}
                        >
                          <span>{theme.icon}</span>
                          {materi.mata_pelajaran}
                        </div>

                        <span
                          className="px-3 py-1 text-[10px] font-black uppercase rounded-lg"
                          style={{
                            backgroundColor: "var(--color-primary-bg)",
                            color: "var(--color-primary)",
                          }}
                        >
                          Materi
                        </span>
                      </div>

                      {/* Kelas */}
                      <div className="flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: "var(--color-neutral-500)" }}>
                        <span>📚</span>
                        <span>{materi.kelas}</span>
                      </div>

                      {/* Judul */}
                      <h3
                        className="text-xl font-black leading-snug"
                        style={{ color: "var(--color-neutral-900)" }}
                      >
                        {materi.judul}
                      </h3>
                    </div>

                    {/* Right section - Tanggal */}
                    <div className="flex-shrink-0 md:text-right">
                      <div className="flex md:flex-col items-center md:items-end gap-2 text-xs font-bold text-neutral-500">
                        <CalendarBlank weight="bold" size={16} />
                        <div>
                          <div>Dipublikasikan:</div>
                          <div className="font-black">
                            {new Date(materi.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
