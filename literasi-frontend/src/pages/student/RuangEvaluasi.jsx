import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  GameController,
  PenNib,
  Clock,
  WarningCircle,
  CheckCircle,
  X,
  CalendarBlank,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";
import { getSubjectTheme } from "../../utils/subjectThemes";

export default function RuangEvaluasi() {
  const navigate = useNavigate();
  const [tugasList, setTugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchTugas = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const rombelId = user.rombel_id || "";

        let url = apiEndpoint("api/tugas/read_public.php");
        const params = new URLSearchParams();
        if (rombelId) params.append("rombel_id", rombelId);
        if (filterMapel) params.append("mapel", filterMapel);
        if (params.toString()) url += "?" + params.toString();

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "success") {
          setTugasList(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
        }
      } catch (error) {
        console.error("Gagal memuat tugas", error);
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Tidak dapat memuat tugas dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTugas();
  }, [filterMapel]);

  // Filter data secara lokal
  const filteredTugas = tugasList.filter((tugas) => {
    if (!filterMapel) return true;
    return tugas.mata_pelajaran === filterMapel;
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
              Waktunya Menguji Kemampuanmu!
            </h2>
            <p className="font-medium opacity-90 max-w-lg leading-relaxed text-sm md:text-base">
              Kerjakan kuis dan tugas di bawah ini sebelum batas waktunya habis.
              Tunjukkan bahwa kamu adalah siswa terbaik!
            </p>
          </div>
          <GameController
            weight="duotone"
            size={160}
            className="absolute -right-8 -bottom-12 opacity-20 transform -rotate-12 hidden md:block"
          />
        </div>

        {/* Badge Filter Mapel */}
        {filterMapel && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
              Menampilkan tugas: <strong>{filterMapel}</strong>
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

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12 font-bold text-neutral-400 animate-pulse text-lg">
            Memuat daftar tugas... 
          </div>
        ) : filteredTugas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-neutral-100 flex flex-col items-center max-w-2xl mx-auto">
            <CheckCircle
              size={64}
              weight="fill"
              className="text-[#2ecc71] mb-4"
            />
            <h3 className="text-xl font-black text-neutral-900 mb-2">
              {filterMapel ? `Belum ada tugas untuk ${filterMapel}` : "Hore! Tidak Ada Tugas"}
            </h3>
            <p className="font-bold text-neutral-500">
              {filterMapel
                ? `Coba periksa mata pelajaran lain atau hapus filter.`
                : "Semua tugas sudah diselesaikan atau belum ada tugas baru dari guru."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredTugas.map((tugas) => {
              const isKuis = tugas.tipe === "kuis";
              const theme = getSubjectTheme(tugas.mata_pelajaran);
              const isExpired = tugas.is_expired;

              return (
                <div
                  key={tugas.id}
                  className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                    isExpired
                      ? "opacity-75 cursor-default"
                      : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                  }`}
                  style={{
                    border: "2px solid var(--color-neutral-100)",
                    boxShadow: "var(--shadow-card)",
                  }}
                  onClick={() => {
                    if (!isExpired) {
                      navigate(`/siswa/kerjakan/${tugas.id}`);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpired) {
                      e.currentTarget.style.borderColor = theme.color;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${theme.color}30`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpired) {
                      e.currentTarget.style.borderColor = "var(--color-neutral-100)";
                      e.currentTarget.style.boxShadow = "var(--shadow-card)";
                    }
                  }}
                >
                  {/* Accent bar warna */}
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: isExpired ? "var(--color-neutral-300)" : theme.color }}
                  />

                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left section */}
                    <div className="flex-1">
                      {/* Badge */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div
                          className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5"
                          style={{
                            backgroundColor: isExpired ? "var(--color-neutral-100)" : theme.bg,
                            color: isExpired ? "var(--color-neutral-500)" : theme.color,
                          }}
                        >
                          {isKuis ? "Kuis" : "Tugas"}
                        </div>

                        {isExpired ? (
                          <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-100">
                            Ditutup
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 text-[10px] font-black uppercase rounded-lg"
                            style={{
                              backgroundColor: isKuis ? "var(--color-info-bg)" : "var(--color-primary-bg)",
                              color: isKuis ? "var(--color-info)" : "var(--color-primary)",
                            }}
                          >
                            {isKuis ? "Pilihan Ganda" : "Esai"}
                          </span>
                        )}
                      </div>

                      {/* Mata Pelajaran */}
                      {tugas.mata_pelajaran && (
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: "var(--color-neutral-500)" }}>
                          <span>{theme.icon}</span>
                          <span>{tugas.mata_pelajaran}</span>
                        </div>
                      )}

                      {/* Judul */}
                      <h3
                        className="text-xl font-black leading-snug"
                        style={{ color: "var(--color-neutral-900)" }}
                      >
                        {tugas.judul}
                      </h3>
                    </div>

                    {/* Right section - Deadline */}
                    <div className="flex-shrink-0 md:text-right">
                      <div
                        className={`flex md:flex-col items-center md:items-end gap-2 text-xs font-bold ${
                          isExpired ? "text-red-500" : "text-neutral-500"
                        }`}
                      >
                        {isExpired ? (
                          <WarningCircle weight="bold" size={16} />
                        ) : (
                          <Clock weight="bold" size={16} />
                        )}
                        <div>
                          <div>{isExpired ? "Ditutup:" : "Tenggat:"}</div>
                          <div className="font-black">
                            {new Date(tugas.tenggat).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
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