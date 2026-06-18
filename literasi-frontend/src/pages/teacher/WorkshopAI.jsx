import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Robot,
  FilmStrip,
  Books,
  PenNib,
  Copy,
  CheckCircle,
  Sparkle,
  Broom,
} from "@phosphor-icons/react";

export default function WorkshopAI() {
  const [activeTab, setActiveTab] = useState("animasi");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- STATE 1: PENYIMPANAN INPUT (Persisten) ---
  const [inputs, setInputs] = useState(() => {
    const savedInputs = localStorage.getItem("ai_workshop_inputs");
    return savedInputs
      ? JSON.parse(savedInputs)
      : {
          ideCerita: "",
          gayaVisual: "3D Animation (Pixar Style)",
          teksBacaan: "",
          temaCerita: "",
          kelasTarget: "Kelas 4",
        };
  });

  // --- STATE 2: PENYIMPANAN HASIL AI UNTUK TIAP TAB (Persisten) ---
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem("ai_workshop_results");
    return savedResults
      ? JSON.parse(savedResults)
      : {
          animasi: "",
          soal: "",
          teks: "",
        };
  });

  // Efek Otomatis: Simpan ke memori browser setiap kali Guru mengetik/mendapat hasil
  useEffect(() => {
    localStorage.setItem("ai_workshop_inputs", JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem("ai_workshop_results", JSON.stringify(results));
  }, [results]);

  const ubahInput = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // --- FUNGSI PARSING MARKDOWN (Agar Enak Dibaca) ---
  const formatTeksAI = (text) => {
    if (!text) return "";
    let html = text;
    // Format Heading 3 (### Judul)
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-black mt-5 mb-2 text-indigo-900">$1</h3>',
    );
    // Format Heading 2 (## Judul)
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-black mt-6 mb-3 text-indigo-900">$1</h2>',
    );
    // Format Bold (**teks**)
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-slate-900 font-black">$1</strong>',
    );
    // Format Italic (*teks*)
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="text-slate-600 italic">$1</em>',
    );
    // Format baris baru (Enter)
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  // --- LOGIKA PEMANGGILAN AI ---
  const generateAI = async (prompt, systemInstruction, tabKey) => {
    setIsLoading(true);
    // Kosongkan HANYA hasil pada tab yang sedang aktif saat loading dimulai
    setResults((prev) => ({ ...prev, [tabKey]: "" }));
    setIsCopied(false);

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/ai/generate.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt,
            system_instruction: systemInstruction,
          }),
        },
      );

      const rawText = await response.text();

      try {
        const data = JSON.parse(rawText);
        if (data.status === "success") {
          // Simpan hasil HANYA ke ruangan tab tersebut
          setResults((prev) => ({ ...prev, [tabKey]: data.data }));
        } else {
          Swal.fire("Gagal", data.message, "error");
        }
      } catch (parseError) {
        Swal.fire(
          "Error Server",
          "Sistem AI mengalami gangguan saat membaca respons.",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Fetch Error", "Gagal menghubungi backend.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAnimasi = () => {
    if (!inputs.ideCerita)
      return Swal.fire("Oops", "Tuliskan ide ceritamu dulu ya!", "warning");
    const sysInstruction = `Kamu adalah Sutradara Film Profesional dan ahli Prompt Engineer untuk AI Text-to-Video... (Output hanya prompt bahasa Inggris). Gunakan gaya visual: ${inputs.gayaVisual}.`;
    const userPrompt = `Buatkan prompt video untuk: ${inputs.ideCerita}`;
    generateAI(userPrompt, sysInstruction, "animasi"); // Kirim kode tab 'animasi'
  };

  const handleGenerateSoal = () => {
    if (!inputs.teksBacaan)
      return Swal.fire(
        "Oops",
        "Masukkan teks bacaan terlebih dahulu!",
        "warning",
      );
    const sysInstruction =
      "Kamu adalah Guru SD ahli pembuat soal Evaluasi Literasi berstandar HOTS. Buatlah 5 soal pilihan ganda (A, B, C, D) yang menguji pemahaman makna. Berikan kunci jawabannya di bagian paling bawah. Gunakan format yang rapi.";
    const userPrompt = `Buatkan 5 soal pilihan ganda dari teks ini:\n\n${inputs.teksBacaan}`;
    generateAI(userPrompt, sysInstruction, "soal"); // Kirim kode tab 'soal'
  };

  const handleGenerateCerita = () => {
    if (!inputs.temaCerita)
      return Swal.fire(
        "Oops",
        "Tuliskan tema cerita terlebih dahulu!",
        "warning",
      );
    const sysInstruction = `Kamu adalah Penulis Buku Anak Terkenal. Buatlah cerita pendek yang sangat menarik, mendidik, dan mudah dipahami untuk anak SD ${inputs.kelasTarget}. Ceritanya tidak boleh terlalu panjang, cukup 3-4 paragraf. Sisipkan pesan moral yang baik di akhir cerita.`;
    const userPrompt = `Buatkan cerita anak bertema: ${inputs.temaCerita}`;
    generateAI(userPrompt, sysInstruction, "teks"); // Kirim kode tab 'teks'
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(results[activeTab]); // Kopi hanya dari tab aktif
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const bersihkanHasil = () => {
    setResults((prev) => ({ ...prev, [activeTab]: "" }));
  };

  return (
    <DashboardLayout role="guru" title="Workshop Asisten AI">
      <div className="max-w-5xl mx-auto pb-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* PANEL KIRI: Menu & Form Input */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab("animasi")}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${activeTab === "animasi" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <FilmStrip
                weight={activeTab === "animasi" ? "fill" : "bold"}
                size={24}
              />{" "}
              Prompt Video
            </button>
            <button
              onClick={() => setActiveTab("soal")}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${activeTab === "soal" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <PenNib
                weight={activeTab === "soal" ? "fill" : "bold"}
                size={24}
              />{" "}
              Buat Soal
            </button>
            <button
              onClick={() => setActiveTab("teks")}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${activeTab === "teks" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Books
                weight={activeTab === "teks" ? "fill" : "bold"}
                size={24}
              />{" "}
              Tulis Cerita
            </button>
          </div>

          {/* FORM INPUT DINAMIS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-fade-in">
            {activeTab === "animasi" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ide Cerita Sederhana
                  </label>
                  <textarea
                    value={inputs.ideCerita}
                    onChange={(e) => ubahInput("ideCerita", e.target.value)}
                    placeholder="Contoh: Kucing orange sedang belajar..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 h-32 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Pilih Gaya Visual
                  </label>
                  <select
                    value={inputs.gayaVisual}
                    onChange={(e) => ubahInput("gayaVisual", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                  >
                    <option value="3D Animation (Pixar Style)">
                      3D Pixar / Disney Style
                    </option>
                    <option value="Stop Motion Claymation (Aardman style)">
                      Claymation (Tanah Liat)
                    </option>
                    <option value="Cinematic Photorealistic">
                      Realistis Sinematik (Asli)
                    </option>
                    <option value="Studio Ghibli 2D Anime style">
                      Anime (Studio Ghibli)
                    </option>
                    <option value="Watercolor Illustration style">
                      Ilustrasi Cat Air
                    </option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateAnimasi}
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Generate"}
                </button>
              </div>
            )}

            {activeTab === "soal" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Masukkan Teks Bacaan
                  </label>
                  <textarea
                    value={inputs.teksBacaan}
                    onChange={(e) => ubahInput("teksBacaan", e.target.value)}
                    placeholder="Paste teks cerita di sini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 h-56 resize-none"
                  ></textarea>
                </div>
                <button
                  onClick={handleGenerateSoal}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Buat Soal"}
                </button>
              </div>
            )}

            {activeTab === "teks" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tema / Topik Cerita
                  </label>
                  <input
                    type="text"
                    value={inputs.temaCerita}
                    onChange={(e) => ubahInput("temaCerita", e.target.value)}
                    placeholder="Contoh: Belajar Berbagi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Target Anak
                  </label>
                  <select
                    value={inputs.kelasTarget}
                    onChange={(e) => ubahInput("kelasTarget", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                  >
                    <option value="Kelas 1-2">Kelas Bawah (1 & 2)</option>
                    <option value="Kelas 3-4">Kelas Tengah (3 & 4)</option>
                    <option value="Kelas 5-6">Kelas Atas (5 & 6)</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateCerita}
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Menulis..." : "Kirim"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PANEL KANAN: Hasil AI */}
        <div className="w-full lg:w-7/12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[70vh] lg:sticky top-8">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : results[activeTab] ? "bg-emerald-400" : "bg-slate-300"}`}
              ></div>
              <h3 className="font-bold text-slate-700 text-sm">
                Papan Hasil ({activeTab})
              </h3>
            </div>

            {results[activeTab] && (
              <div className="flex items-center gap-2">
                <button
                  onClick={bersihkanHasil}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Bersihkan"
                >
                  <Broom weight="bold" size={18} />
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${isCopied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle weight="fill" size={16} /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy weight="bold" size={16} /> Copy Hasil
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-400">
                <Robot size={48} weight="duotone" className="animate-bounce" />
                <p className="font-bold text-sm">Gemini sedang bekerja...</p>
              </div>
            ) : results[activeTab] ? (
              <div
                className="whitespace-pre-wrap font-medium text-slate-700 text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatTeksAI(results[activeTab]),
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                <Sparkle size={48} weight="thin" />
                <p className="font-medium text-sm text-center max-w-xs">
                  Pilih menu di sebelah kiri dan klik tombol untuk melihat
                  keajaiban AI di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
