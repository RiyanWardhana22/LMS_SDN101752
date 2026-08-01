import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  CaretLeft,
  PaperPlaneRight,
  CheckCircle,
  WarningCircle,
  Check,
  Circle,
  CalendarBlank,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";
import { getSubjectTheme } from "../../utils/subjectThemes";

// Fungsi untuk decode HTML entities
function decodeHtmlEntities(text) {
  if (!text) return "";
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Fungsi untuk menampilkan animasi XP popup
function showXpPopup(xpAmount) {
  if (!xpAmount || xpAmount <= 0) return;
  
  const popup = document.createElement('div');
  popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none';
  popup.style.animation = 'xpPop 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  popup.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-2">🎉</div>
      <div class="text-5xl font-black" style="color: var(--color-primary); font-family: 'Fredoka One', sans-serif; text-shadow: 0 4px 16px rgba(255,107,53,0.3);">
        +${xpAmount} XP
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  
  setTimeout(() => {
    if (popup.parentNode) {
      popup.remove();
    }
  }, 1500);
}

export default function LembarKerja() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tugas, setTugas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jawabanTugas, setJawabanTugas] = useState("");
  const [jawabanKuis, setJawabanKuis] = useState({});
  const [jawabanEsaiPerSoal, setJawabanEsaiPerSoal] = useState({});
  const [soalParsed, setSoalParsed] = useState([]);
  const [soalEsaiList, setSoalEsaiList] = useState([]);
  const [isEsaiBernomor, setIsEsaiBernomor] = useState(false);
  const [animatingChoice, setAnimatingChoice] = useState(null);
  const [sudahDikumpulkan, setSudahDikumpulkan] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          apiEndpoint(`api/tugas/detail.php?id=${id}&siswa_id=${user.id}`)
        );
        const data = await response.json();

        if (data.status === "success") {
          const tugasData = data.data;
          
          // DECODE deskripsi dari HTML entities
          if (tugasData.deskripsi) {
            tugasData.deskripsi = decodeHtmlEntities(tugasData.deskripsi);
          }
          
          setTugas(tugasData);
          setIsExpired(tugasData.is_expired || false);
          setSudahDikumpulkan(tugasData.sudah_dikumpulkan || false);

          // Jika sudah expired, langsung redirect
          if (tugasData.is_expired) {
            Swal.fire({
              icon: "warning",
              title: "⏰ Tenggat Berakhir",
              text: "Tugas ini sudah tidak bisa dikerjakan lagi.",
              confirmButtonColor: "#E74C3C",
            }).then(() => navigate("/siswa/evaluasi"));
            return;
          }

          // Proses berdasarkan tipe
          if (tugasData.tipe === "kuis") {
            const parsed = JSON.parse(tugasData.deskripsi);
            setSoalParsed(parsed);

            // Prefill jawaban jika sudah dikumpulkan
            if (tugasData.sudah_dikumpulkan && tugasData.jawaban_sebelumnya) {
              try {
                const jawabanLama = JSON.parse(tugasData.jawaban_sebelumnya);
                setJawabanKuis(jawabanLama);
              } catch (e) {
                console.warn("Gagal parse jawaban kuis lama:", e);
              }
            }
          } else {
            // ============================================================
            // BAGIAN UTAMA: EKSTRAKSI SOAL ESAI BERNOMOR
            // ============================================================
            const htmlContent = tugasData.deskripsi || "";
            
            // DECODE dulu sebelum di-Parse
            const decodedHtml = decodeHtmlEntities(htmlContent);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(decodedHtml, "text/html");
            const olElements = doc.querySelectorAll("ol");

            let hasNumberedList = false;
            let soalItems = [];

            // Cek apakah ada <ol> dengan lebih dari 1 <li>
            for (const ol of olElements) {
              const liItems = ol.querySelectorAll("li");
              if (liItems.length > 1) {
                hasNumberedList = true;
                liItems.forEach((li, index) => {
                  // KRUSIAL: Gunakan innerHTML, BUKAN textContent
                  // Ini mempertahankan formatting bold/italic dari guru
                  soalItems.push({
                    nomor: index + 1,
                    html: li.innerHTML || li.textContent || "",
                    text: li.textContent || "",
                  });
                });
                break;
              }
            }

            if (hasNumberedList && soalItems.length > 1) {
              setIsEsaiBernomor(true);
              setSoalEsaiList(soalItems);

              // Prefill jawaban esai bernomor jika sudah dikumpulkan
              if (tugasData.sudah_dikumpulkan && tugasData.jawaban_sebelumnya) {
                try {
                  const jawabanLamaRaw = decodeHtmlEntities(tugasData.jawaban_sebelumnya);
                  const jawabanLama = JSON.parse(jawabanLamaRaw);
                  setJawabanEsaiPerSoal(jawabanLama);
                } catch (e) {
                  console.warn("Gagal parse jawaban esai bernomor lama:", e);
                }
              }
            } else {
              // Esai biasa (satu textarea)
              setIsEsaiBernomor(false);
              if (tugasData.sudah_dikumpulkan && tugasData.jawaban_sebelumnya) {
                setJawabanTugas(decodeHtmlEntities(tugasData.jawaban_sebelumnya));
              }
            }
          }
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
          navigate("/siswa/evaluasi");
        }
      } catch (error) {
        console.error("Error fetch detail tugas:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat tugas. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate, user.id]);

  const handlePilihOpsi = (soalId, opsi) => {
    setAnimatingChoice({ soalId, opsi });
    setTimeout(() => setAnimatingChoice(null), 400);
    setJawabanKuis((prev) => ({ ...prev, [soalId]: opsi }));
  };

  const handleSubmit = async () => {
    // Validasi
    if (tugas.tipe === "kuis" && Object.keys(jawabanKuis).length < soalParsed.length) {
      Swal.fire({
        icon: "warning",
        title: "Belum Selesai",
        text: "Masih ada soal kuis yang belum kamu jawab!",
      });
      return;
    }

    if (tugas.tipe === "tugas") {
      if (isEsaiBernomor) {
        const totalSoal = soalEsaiList.length;
        const terjawab = Object.keys(jawabanEsaiPerSoal).filter(
          (key) => jawabanEsaiPerSoal[key]?.trim() !== ""
        ).length;
        if (terjawab < totalSoal) {
          Swal.fire({
            icon: "warning",
            title: "Belum Selesai",
            text: `Masih ada ${totalSoal - terjawab} soal esai yang belum dijawab!`,
          });
          return;
        }
      } else {
        if (jawabanTugas.trim() === "") {
          Swal.fire({
            icon: "warning",
            title: "Jawaban Kosong",
            text: "Tulis jawabanmu terlebih dahulu sebelum mengumpulkan.",
          });
          return;
        }
      }
    }

    const confirmText = sudahDikumpulkan
      ? "Kamu sudah mengumpulkan sebelumnya. Yakin ingin memperbarui jawaban?"
      : "Pastikan jawabanmu sudah benar karena tidak bisa diulang!";

    const result = await Swal.fire({
      title: sudahDikumpulkan ? "Perbarui Jawaban?" : "Kumpulkan Sekarang?",
      text: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3498DB",
      cancelButtonColor: "#95A5A6",
      confirmButtonText: sudahDikumpulkan ? "Ya, Perbarui! 🔄" : "Ya, Kumpulkan! 🚀",
      cancelButtonText: "Cek Lagi",
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;
    setIsSubmitting(true);

    let nilaiAkhir = null;
    let payloadJawaban = "";

    if (tugas.tipe === "kuis") {
      let benar = 0;
      soalParsed.forEach((soal) => {
        if (jawabanKuis[soal.id] === soal.kunci) benar++;
      });
      nilaiAkhir = Math.round((benar / soalParsed.length) * 100);
      payloadJawaban = JSON.stringify(jawabanKuis);
    } else if (isEsaiBernomor) {
      payloadJawaban = JSON.stringify(jawabanEsaiPerSoal);
    } else {
      payloadJawaban = jawabanTugas;
    }

    try {
      const response = await fetch(apiEndpoint("api/tugas/submit.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tugas_id: tugas.id,
          siswa_id: user.id,
          jawaban: payloadJawaban,
          nilai: nilaiAkhir,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // 🔥 UPDATE XP di localStorage dari response
        if (data.xp_baru !== undefined) {
          const currentUser = JSON.parse(localStorage.getItem("user")) || {};
          currentUser.xp = data.xp_baru;
          localStorage.setItem("user", JSON.stringify(currentUser));
          
          // 🔥 Tampilkan animasi XP popup jika ada XP yang ditambahkan
          if (data.xp_ditambahkan > 0) {
            showXpPopup(data.xp_ditambahkan);
          }
        }

        const successMessage = sudahDikumpulkan
          ? "Jawaban berhasil diperbarui! ✅"
          : tugas.tipe === "kuis"
          ? `Kamu mendapatkan nilai: ${nilaiAkhir} 🎉`
          : "Tugas berhasil dikirim ke Meja Guru.";

        await Swal.fire({
          title: sudahDikumpulkan ? "✅ Jawaban Diperbarui!" : "Kerja Bagus! 🎉",
          text: successMessage,
          icon: "success",
          confirmButtonColor: "#2ECC71",
        });
        
        // Navigasi ke Beranda dengan flag justSubmitted
        navigate("/siswa/beranda", { 
          state: { justSubmitted: true } 
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.message || "Terjadi kesalahan saat menyimpan jawaban.",
        });
      }
    } catch (error) {
      console.error("Error submit tugas:", error);
      Swal.fire({
        icon: "error",
        title: "Jaringan Putus",
        text: "Jawaban gagal dikirim. Periksa koneksi internetmu.",
      });
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

  // Jika expired, tampilkan pesan blokir
  if (isExpired) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-red-100 flex flex-col items-center">
            <WarningCircle size={64} weight="fill" className="text-red-500 mb-4" />
            <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              ⏰ Tenggat Berakhir
            </h3>
            <p className="font-bold text-neutral-500 mb-6">
              Tugas ini sudah tidak bisa dikerjakan karena melewati batas waktu pengumpulan.
            </p>
            <button
              onClick={() => navigate("/siswa/evaluasi")}
              className="px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--color-primary)",
                boxShadow: "var(--shadow-button-primary)",
              }}
            >
              ← Kembali ke Ruang Evaluasi
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const answeredCount = Object.keys(jawabanKuis).length;
  const progressPercent = soalParsed.length > 0 ? (answeredCount / soalParsed.length) * 100 : 0;
  const theme = getSubjectTheme(tugas.mata_pelajaran);

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

        {/* Progress bar kuis */}
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
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Header card tugas - Style seperti RuangBaca */}
        <div
          className="bg-white rounded-t-3xl relative overflow-hidden"
          style={{
            border: "2px solid var(--color-neutral-100)",
            borderBottom: "none",
          }}
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ backgroundColor: theme.color }} />

          <div className="p-7">
            {/* Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide"
                style={{
                  backgroundColor: tugas.tipe === "kuis" ? "var(--color-info-bg)" : "var(--color-primary-bg)",
                  color: tugas.tipe === "kuis" ? "var(--color-info)" : "var(--color-primary)",
                }}
              >
                {tugas.tipe === "kuis" ? "Kuis Pilihan Ganda" : "Tugas Esai"}
              </span>

              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ backgroundColor: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }}
              >
                <CalendarBlank weight="bold" size={14} />
                Tenggat: {new Date(tugas.tenggat).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {sudahDikumpulkan && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
                  style={{ backgroundColor: "var(--color-accent-green)", color: "white" }}
                >
                  <CheckCircle weight="fill" size={14} />
                  Sudah Dikumpulkan
                </span>
              )}
            </div>

            {/* Mata Pelajaran */}
            {tugas.mata_pelajaran && (
              <div className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: theme.color }}>
                <span>{theme.icon}</span>
                <span>{tugas.mata_pelajaran}</span>
              </div>
            )}

            {/* Judul */}
            <h1
              className="text-3xl font-black leading-tight"
              style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}
            >
              {tugas.judul}
            </h1>
          </div>
        </div>

        {/* Body - Form Jawaban */}
        <div
          className="bg-white p-7"
          style={{
            borderLeft: "2px solid var(--color-neutral-100)",
            borderRight: "2px solid var(--color-neutral-100)",
          }}
        >
          {/* Info Edit */}
          {sudahDikumpulkan && (
            <div
              className="mb-6 p-4 rounded-2xl flex items-center gap-3"
              style={{
                backgroundColor: "var(--color-info-bg)",
                border: "2px solid var(--color-info)",
              }}
            >
              <CheckCircle weight="fill" size={24} style={{ color: "var(--color-info)" }} />
              <div>
                <p className="font-black text-sm" style={{ color: "var(--color-neutral-900)" }}>
                  ✅ Kamu sudah mengumpulkan jawaban
                </p>
                <p className="text-xs font-bold" style={{ color: "var(--color-neutral-500)" }}>
                  Masih bisa diedit sampai tenggat. Klik "Perbarui Jawaban" untuk mengirim revisi.
                </p>
              </div>
            </div>
          )}

          {/* === TUGAS ESAI === */}
          {tugas.tipe === "tugas" && (
            <>
              {/* Deskripsi soal */}
              {isEsaiBernomor ? (
                // Esai bernomor - tampilkan per soal
                <div className="mb-6">
                  <div
                    className="prose max-w-none mb-6 pb-6"
                    style={{
                      borderBottom: "2px dashed var(--color-neutral-200)",
                      fontSize: "1.125rem",
                      color: "var(--color-neutral-700)",
                    }}
                  >
                    <div
                      className="text-justify break-words"
                      style={{
                        textAlign: "justify",
                        textJustify: "inter-word",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: tugas.deskripsi,
                      }}
                    />
                  </div>

                  {/* Textarea per soal */}
                  <h3
                    className="font-black text-lg mb-4"
                    style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}
                  >
                    ✏️ Lembar Jawaban Esai
                  </h3>

                  <div className="flex flex-col gap-6">
                    {soalEsaiList.map((soal, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl"
                        style={{
                          backgroundColor: "var(--color-neutral-50)",
                          border: "2px solid var(--color-neutral-200)",
                        }}
                      >
                        <p className="font-bold text-sm mb-2" style={{ color: "var(--color-neutral-700)" }}>
                          Soal Esai Nomor {soal.nomor}
                        </p>
                        
                        {/* Render dengan dangerouslySetInnerHTML agar &nbsp; menjadi spasi */}
                        <div 
                          className="text-sm font-medium mb-3 leading-relaxed"
                          style={{ 
                            color: "var(--color-neutral-600)",
                            textAlign: "justify",
                            textJustify: "inter-word",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                          dangerouslySetInnerHTML={{ __html: soal.html || soal.text }}
                        />
                        
                        <textarea
                          placeholder={`Tulis jawaban untuk soal nomor ${soal.nomor}...`}
                          className="w-full rounded-xl p-4 font-medium outline-none transition-all resize-none"
                          rows={5}
                          style={{
                            border: "2.5px solid var(--color-neutral-300)",
                            fontSize: "0.95rem",
                            color: "var(--color-neutral-900)",
                            backgroundColor: "white",
                            lineHeight: "1.75",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "var(--color-info)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(52,152,219,0.12)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "var(--color-neutral-300)";
                            e.target.style.boxShadow = "none";
                          }}
                          value={jawabanEsaiPerSoal[soal.nomor] || ""}
                          onChange={(e) => {
                            setJawabanEsaiPerSoal((prev) => ({
                              ...prev,
                              [soal.nomor]: e.target.value,
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Esai biasa (satu textarea)
                <>
                  <div
                    className="prose max-w-none mb-6 pb-6"
                    style={{
                      borderBottom: "2px dashed var(--color-neutral-200)",
                      fontSize: "1.125rem",
                      color: "var(--color-neutral-700)",
                    }}
                  >
                    <div
                      className="text-justify break-words"
                      style={{
                        textAlign: "justify",
                        textJustify: "inter-word",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{ __html: tugas.deskripsi }}
                    />
                  </div>
                  <h3
                    className="font-black text-lg mb-4"
                    style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}
                  >
                    ✏️ Lembar Jawaban
                  </h3>
                  <textarea
                    placeholder="Ketik jawaban lengkapmu di sini..."
                    className="w-full h-64 rounded-2xl p-5 font-medium outline-none transition-all resize-none"
                    style={{
                      border: "2.5px solid var(--color-neutral-300)",
                      fontSize: "1rem",
                      color: "var(--color-neutral-900)",
                      backgroundColor: "var(--color-neutral-50)",
                      lineHeight: "1.75",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-info)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(52,152,219,0.12)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-neutral-300)";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "var(--color-neutral-50)";
                    }}
                    value={jawabanTugas}
                    onChange={(e) => setJawabanTugas(e.target.value)}
                  />
                </>
              )}
            </>
          )}

          {/* === KUIS PILIHAN GANDA === */}
          {tugas.tipe === "kuis" && (
            <div className="flex flex-col gap-5">
              {soalParsed.map((soal, index) => {
                const selectedOpsi = jawabanKuis[soal.id];
                return (
                  <div
                    key={soal.id}
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "var(--color-neutral-50)",
                      border: `2px solid ${selectedOpsi ? "var(--color-info)" : "var(--color-neutral-200)"}`,
                      transition: "border-color 200ms ease",
                    }}
                  >
                    <p
                      className="text-xs font-black uppercase mb-2"
                      style={{ color: "var(--color-neutral-500)", letterSpacing: "0.05em" }}
                    >
                      Soal Nomor {index + 1}
                    </p>

                    <p
                      className="font-bold leading-relaxed mb-6"
                      style={{ 
                        fontSize: "1.125rem", 
                        color: "var(--color-neutral-900)",
                        textAlign: "justify",
                        textJustify: "inter-word",
                      }}
                    >
                      {soal.pertanyaan}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["a", "b", "c", "d"].map((opsi) => {
                        const isSelected = selectedOpsi === opsi;
                        const isAnimating =
                          animatingChoice?.soalId === soal.id && animatingChoice?.opsi === opsi;
                        return (
                          <button
                            key={opsi}
                            onClick={() => handlePilihOpsi(soal.id, opsi)}
                            className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-150 ${
                              isAnimating ? "answer-correct" : ""
                            }`}
                            style={{
                              minHeight: "64px",
                              border: `2.5px solid ${
                                isSelected ? "var(--color-info)" : "var(--color-neutral-300)"
                              }`,
                              backgroundColor: isSelected ? "var(--color-info-bg)" : "white",
                              boxShadow: isSelected ? "0 4px 0 #2980B9" : "0 4px 0 var(--color-neutral-300)",
                              transform: isSelected ? "translateY(-2px)" : "none",
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
                            <div
                              style={{
                                color: isSelected ? "var(--color-info)" : "var(--color-neutral-300)",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected ? (
                                <CheckCircle weight="fill" size={26} />
                              ) : (
                                <Circle weight="bold" size={26} />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-black uppercase"
                                style={{
                                  color: isSelected ? "var(--color-info)" : "var(--color-neutral-500)",
                                }}
                              >
                                {opsi}.
                              </span>
                              <span
                                className="font-semibold text-sm"
                                style={{
                                  color: isSelected ? "var(--color-neutral-900)" : "var(--color-neutral-700)",
                                }}
                              >
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

        {/* Footer - Tombol Submit */}
        <div
          className="bg-white rounded-b-3xl p-7"
          style={{
            border: "2px solid var(--color-neutral-100)",
            borderTop: "none",
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl font-black text-white transition-all"
            style={{
              backgroundColor: isSubmitting ? "var(--color-neutral-300)" : "var(--color-accent-green)",
              boxShadow: isSubmitting ? "none" : "var(--shadow-button-success)",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isSubmitting ? (
              "Mengirim..."
            ) : sudahDikumpulkan ? (
              <>
                <PaperPlaneRight weight="fill" size={20} />
                Perbarui Jawaban
              </>
            ) : (
              <>
                <PaperPlaneRight weight="fill" size={20} />
                Kumpulkan Jawaban
              </>
            )}
          </button>

          {sudahDikumpulkan && (
            <p
              className="text-xs font-bold text-center mt-3"
              style={{ color: "var(--color-neutral-500)" }}
            >
              Masih bisa diedit sampai tenggat berakhir
            </p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
