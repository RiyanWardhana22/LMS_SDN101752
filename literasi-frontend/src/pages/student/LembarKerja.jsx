import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import { CaretLeft, PaperPlaneRight, CheckCircle, WarningCircle, Check, Circle } from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function LembarKerja() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tugas, setTugas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jawabanTugas, setJawabanTugas] = useState("");
  const [jawabanKuis, setJawabanKuis] = useState({});
  const [soalParsed, setSoalParsed] = useState([]);
  const [animatingChoice, setAnimatingChoice] = useState(null); // {soalId, opsi}
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(apiEndpoint(`api/tugas/detail.php?id=${id}`));
        const data = await response.json();
        if (data.status === "success") {
          setTugas(data.data);
          if (data.data.tipe === "kuis") {
            setSoalParsed(JSON.parse(data.data.deskripsi));
          }
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
          navigate("/siswa/evaluasi");
        }
      } catch {
        Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat tugas." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handlePilihOpsi = (soalId, opsi) => {
    setAnimatingChoice({ soalId, opsi });
    setTimeout(() => setAnimatingChoice(null), 400);
    setJawabanKuis((prev) => ({ ...prev, [soalId]: opsi }));
  };

  const handleSubmit = async () => {
    if (tugas.tipe === "kuis" && Object.keys(jawabanKuis).length < soalParsed.length) {
      Swal.fire({ icon: "warning", title: "Belum Selesai", text: "Masih ada soal kuis yang belum kamu jawab!" });
      return;
    }
    if (tugas.tipe === "tugas" && jawabanTugas.trim() === "") {
      Swal.fire({ icon: "warning", title: "Jawaban Kosong", text: "Tulis jawabanmu terlebih dahulu sebelum mengumpulkan." });
      return;
    }

    const result = await Swal.fire({
      title: "Kumpulkan Sekarang?",
      text: "Pastikan jawabanmu sudah benar karena tidak bisa diulang!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3498DB",
      cancelButtonColor: "#95A5A6",
      confirmButtonText: "Ya, Kumpulkan! 🚀",
      cancelButtonText: "Cek Lagi",
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;
    setIsSubmitting(true);

    let nilaiAkhir = null;
    let payloadJawaban = jawabanTugas;

    if (tugas.tipe === "kuis") {
      let benar = 0;
      soalParsed.forEach((soal) => { if (jawabanKuis[soal.id] === soal.kunci) benar++; });
      nilaiAkhir = Math.round((benar / soalParsed.length) * 100);
      payloadJawaban = JSON.stringify(jawabanKuis);
    }

    try {
      const response = await fetch(apiEndpoint("api/tugas/submit.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tugas_id: tugas.id, siswa_id: user.id, jawaban: payloadJawaban, nilai: nilaiAkhir }),
      });
      const data = await response.json();
      if (data.status === "success") {
        Swal.fire({
          title: "Kerja Bagus! 🎉",
          text: tugas.tipe === "kuis" ? `Kamu mendapatkan nilai: ${nilaiAkhir}` : "Tugas berhasil dikirim ke Meja Guru.",
          icon: "success",
          confirmButtonColor: "#2ECC71",
        }).then(() => navigate("/siswa/evaluasi"));
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Jaringan Putus", text: "Jawaban gagal dikirim." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="text-center py-20 text-lg font-bold animate-pulse" style={{ color: "var(--color-neutral-500)" }}>
          Membagikan lembar soal... 📝
        </div>
      </StudentLayout>
    );
  }
  if (!tugas) return null;

  const answeredCount = Object.keys(jawabanKuis).length;
  const progressPercent = soalParsed.length > 0 ? (answeredCount / soalParsed.length) * 100 : 0;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto pb-12">

        {/* Back button */}
        <button
          onClick={() => navigate("/siswa/evaluasi")}
          className="flex items-center gap-2 font-bold text-sm mb-6 transition-colors"
          style={{ color: "var(--color-neutral-500)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-neutral-500)")}
        >
          <CaretLeft weight="bold" size={20} />
          Kembali ke Ruang Evaluasi
        </button>

        {/* Progress bar kuis (gaya Duolingo) — hanya tampil untuk kuis */}
        {tugas.tipe === "kuis" && soalParsed.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
                Progress Kuis
              </span>
              <span className="text-xs font-black" style={{ color: "var(--color-primary)" }}>
                {answeredCount}/{soalParsed.length} Soal
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-neutral-300)" }}>
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-500"
                style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #FF6B35, #FF8C5A)" }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", animation: "shimmer 1.5s infinite" }} />
              </div>
            </div>
          </div>
        )}

        {/* Header card tugas */}
        <div className="bg-white rounded-3xl p-7 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5" style={{ boxShadow: "var(--shadow-card)", border: "2px solid var(--color-neutral-100)" }}>
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="px-3 py-1 text-[10px] font-black uppercase rounded-lg"
                style={{
                  backgroundColor: tugas.tipe === "kuis" ? "var(--color-info-bg)" : "var(--color-primary-bg)",
                  color:           tugas.tipe === "kuis" ? "var(--color-info)" : "var(--color-primary)",
                }}
              >
                {tugas.tipe === "kuis" ? "Kuis Pilihan Ganda" : "Tugas Esai"}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase rounded-lg" style={{ backgroundColor: "var(--color-error-bg)", color: "var(--color-error)" }}>
                <WarningCircle weight="bold" size={12} />
                Tenggat: {new Date(tugas.tenggat).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <h1 className="text-2xl font-black" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
              {tugas.judul}
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white whitespace-nowrap transition-all"
            style={{
              backgroundColor:  isSubmitting ? "var(--color-neutral-300)" : "var(--color-accent-green)",
              boxShadow:        isSubmitting ? "none" : "var(--shadow-button-success)",
              cursor:           isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isSubmitting ? "Mengirim..." : (<><PaperPlaneRight weight="fill" size={20} /> Kumpulkan Jawaban</>)}
          </button>
        </div>

        {/* === AREA TUGAS ESAI === */}
        {tugas.tipe === "tugas" && (
          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: "var(--shadow-card)", border: "2px solid var(--color-neutral-100)" }}>
            <div className="prose max-w-none mb-8 pb-8" style={{ borderBottom: "2px dashed var(--color-neutral-200)", fontSize: "1.125rem", color: "var(--color-neutral-700)" }}>
              <div dangerouslySetInnerHTML={{ __html: tugas.deskripsi }} />
            </div>
            <h3 className="font-black text-lg mb-4" style={{ color: "var(--color-neutral-900)", fontFamily: "'Fredoka One', sans-serif" }}>
              ✏️ Lembar Jawaban
            </h3>
            <textarea
              placeholder="Ketik jawaban lengkapmu di sini..."
              className="w-full h-64 rounded-2xl p-5 font-medium outline-none transition-all resize-none"
              style={{
                border:          "2.5px solid var(--color-neutral-300)",
                fontSize:        "1rem",
                color:           "var(--color-neutral-900)",
                backgroundColor: "var(--color-neutral-50)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--color-info)"; e.target.style.boxShadow = "0 0 0 3px rgba(52,152,219,0.12)"; e.target.style.backgroundColor = "white"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--color-neutral-300)"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "var(--color-neutral-50)"; }}
              value={jawabanTugas}
              onChange={(e) => setJawabanTugas(e.target.value)}
            />
          </div>
        )}

        {/* === AREA KUIS PILIHAN GANDA === */}
        {tugas.tipe === "kuis" && (
          <div className="flex flex-col gap-5">
            {soalParsed.map((soal, index) => {
              const selectedOpsi = jawabanKuis[soal.id];
              return (
                <div
                  key={soal.id}
                  className="bg-white rounded-3xl p-7"
                  style={{
                    boxShadow: "var(--shadow-card)",
                    border:    `2px solid ${selectedOpsi ? "var(--color-info)" : "var(--color-neutral-100)"}`,
                    transition: "border-color 200ms ease",
                  }}
                >
                  {/* Nomor soal */}
                  <p className="text-xs font-black uppercase mb-2" style={{ color: "var(--color-neutral-500)", letterSpacing: "0.05em" }}>
                    Soal Nomor {index + 1}
                  </p>

                  {/* Pertanyaan */}
                  <p className="font-bold leading-relaxed mb-6" style={{ fontSize: "1.125rem", color: "var(--color-neutral-900)" }}>
                    {soal.pertanyaan}
                  </p>

                  {/* Opsi jawaban */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["a", "b", "c", "d"].map((opsi) => {
                      const isSelected = selectedOpsi === opsi;
                      const isAnimating = animatingChoice?.soalId === soal.id && animatingChoice?.opsi === opsi;
                      return (
                        <button
                          key={opsi}
                          onClick={() => handlePilihOpsi(soal.id, opsi)}
                          className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-150 ${isAnimating ? "answer-correct" : ""}`}
                          style={{
                            minHeight:       "64px",
                            border:          `2.5px solid ${isSelected ? "var(--color-info)" : "var(--color-neutral-300)"}`,
                            backgroundColor: isSelected ? "var(--color-info-bg)" : "white",
                            boxShadow:       isSelected ? "0 4px 0 #2980B9" : "0 4px 0 var(--color-neutral-300)",
                            transform:       isSelected ? "translateY(-2px)" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "var(--color-neutral-500)";
                              e.currentTarget.style.backgroundColor = "var(--color-neutral-50)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "var(--color-neutral-300)";
                              e.currentTarget.style.backgroundColor = "white";
                            }
                          }}
                        >
                          {/* Ikon pilihan */}
                          <div style={{ color: isSelected ? "var(--color-info)" : "var(--color-neutral-300)", flexShrink: 0 }}>
                            {isSelected ? <CheckCircle weight="fill" size={26} /> : <Circle weight="bold" size={26} />}
                          </div>
                          {/* Opsi label + teks */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black uppercase" style={{ color: isSelected ? "var(--color-info)" : "var(--color-neutral-500)" }}>
                              {opsi}.
                            </span>
                            <span className="font-semibold text-sm" style={{ color: isSelected ? "var(--color-neutral-900)" : "var(--color-neutral-700)" }}>
                              {soal[opsi]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
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