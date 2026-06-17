import { useState } from "react";
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
  const [resultText, setResultText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // --- STATE INPUT: TAB ANIMASI ---
  const [ideCerita, setIdeCerita] = useState("");
  const [gayaVisual, setGayaVisual] = useState("3D Animation (Pixar Style)");

  // --- STATE INPUT: TAB SOAL LITERASI ---
  const [teksBacaan, setTeksBacaan] = useState("");

  // --- STATE INPUT: TAB TEKS CERITA ---
  const [temaCerita, setTemaCerita] = useState("");
  const [kelasTarget, setKelasTarget] = useState("Kelas 4");

  // FUNGSI DEBUGGER UNTUK MENCARI ERROR ASLI
  const generateAI = async (prompt, systemInstruction) => {
    setIsLoading(true);
    setResultText("");
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

      // 🔴 TRICK DEBUGGING: Jangan langsung di .json(), kita baca teks mentahnya dulu!
      const rawText = await response.text();
      console.log("RAW RESPONSE DARI PHP:", rawText);

      try {
        // Coba ubah teks mentah tadi menjadi JSON
        const data = JSON.parse(rawText);

        if (data.status === "success") {
          setResultText(data.data);
        } else {
          Swal.fire(
            "Gagal (Dari API)",
            data.message + (data.debug ? `\n\nDebug: ${data.debug}` : ""),
            "error",
          );
        }
      } catch (parseError) {
        // 🔴 JIKA MASUK KESINI: Artinya PHP mengeluarkan Error/Warning, bukan JSON!
        Swal.fire({
          title: "Terdeteksi Error di PHP!",
          html: `<p style="font-size:14px; text-align:left; color:#e74c3c; font-weight:bold;">PHP tidak menghasilkan JSON. Ini output aslinya:</p>
                 <pre style="text-align:left; background:#f4f6f9; padding:10px; border-radius:8px; font-size:12px; overflow-x:auto; border: 1px solid #e2e8f0; color:#333;">${rawText || "Teks Kosong (Empty Response)"}</pre>`,
          icon: "error",
          width: 600,
        });
      }
    } catch (error) {
      // Jika masuk ke sini, artinya Fetch API benar-benar gagal (contoh: URL salah, CORS, server mati)
      Swal.fire(
        "Fetch Error",
        `Gagal melakukan request: ${error.message}`,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA MAGIC ENHANCER (Di Balik Layar) ---
  const handleGenerateAnimasi = () => {
    if (!ideCerita)
      return Swal.fire("Oops", "Tuliskan ide ceritamu dulu ya!", "warning");

    // Ini adalah MAGIC PROMPT yang disembunyikan dari guru.
    const sysInstruction = `Kamu adalah Sutradara Film Profesional dan ahli Prompt Engineer untuk AI Text-to-Video (seperti Sora, Luma Dream Machine, Kling, Veo). Tugasmu adalah mengubah ide cerita pengguna yang sederhana menjadi prompt Bahasa Inggris yang SANGAT DETAIL dan menakjubkan. 
    Aturan wajib:
    1. Output HANYA berupa prompt Bahasa Inggrisnya saja (jangan ada kalimat pengantar seperti 'Here is your prompt').
    2. Sertakan detail pergerakan kamera (camera motion, panning, tracking).
    3. Sertakan detail pencahayaan (cinematic lighting, volumetric light).
    4. Sertakan detail resolusi (8k, hyper-detailed, photorealistic).
    5. Gunakan gaya visual berikut ini secara spesifik: ${gayaVisual}.`;

    const userPrompt = `Tolong buatkan prompt video untuk ide cerita ini: ${ideCerita}`;
    generateAI(userPrompt, sysInstruction);
  };

  const handleGenerateSoal = () => {
    if (!teksBacaan)
      return Swal.fire(
        "Oops",
        "Masukkan teks bacaan terlebih dahulu!",
        "warning",
      );
    const sysInstruction =
      "Kamu adalah Guru SD ahli pembuat soal Evaluasi Literasi berstandar HOTS. Buatlah 5 soal pilihan ganda (A, B, C, D) yang menguji pemahaman makna, bukan sekadar hafalan. Berikan kunci jawabannya di bagian paling bawah.";
    const userPrompt = `Buatkan 5 soal pilihan ganda dari teks ini:\n\n${teksBacaan}`;
    generateAI(userPrompt, sysInstruction);
  };

  const handleGenerateCerita = () => {
    if (!temaCerita)
      return Swal.fire(
        "Oops",
        "Tuliskan tema cerita terlebih dahulu!",
        "warning",
      );
    const sysInstruction = `Kamu adalah Penulis Buku Anak Terkenal. Buatlah cerita pendek yang sangat menarik, mendidik, dan mudah dipahami untuk anak SD ${kelasTarget}. Ceritanya tidak boleh terlalu panjang, cukup 3-4 paragraf. Sisipkan pesan moral yang baik di akhir cerita.`;
    const userPrompt = `Buatkan cerita anak bertema: ${temaCerita}`;
    generateAI(userPrompt, sysInstruction);
  };

  // UX Bantuan: Copy ke Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <DashboardLayout role="guru" title="Workshop Asisten AI">
      <div className="max-w-5xl mx-auto pb-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* PANEL KIRI: Menu & Form Input */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          {/* TAB SWITCHER */}
          <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => {
                setActiveTab("animasi");
                setResultText("");
              }}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${activeTab === "animasi" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <FilmStrip
                weight={activeTab === "animasi" ? "fill" : "bold"}
                size={24}
              />{" "}
              Prompt Video
            </button>
            <button
              onClick={() => {
                setActiveTab("soal");
                setResultText("");
              }}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${activeTab === "soal" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <PenNib
                weight={activeTab === "soal" ? "fill" : "bold"}
                size={24}
              />{" "}
              Buat Soal
            </button>
            <button
              onClick={() => {
                setActiveTab("teks");
                setResultText("");
              }}
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
                    value={ideCerita}
                    onChange={(e) => setIdeCerita(e.target.value)}
                    placeholder="Contoh: Seekor kucing orange sedang belajar matematika di perpustakaan sihir..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 h-32 resize-none"
                  ></textarea>
                  <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center gap-1">
                     AI
                    akan otomatis menyulapnya jadi prompt bahasa Inggris
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Pilih Gaya Visual
                  </label>
                  <select
                    value={gayaVisual}
                    onChange={(e) => setGayaVisual(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                  >
                    <option value="3D Animation (Pixar Style)">
                      3D Pixar / Disney Style
                    </option>
                    <option value="Stop Motion Claymation (Aardman style)">
                      Claymation (Tanah Liat)
                    </option>
                    <option value="Cinematic Photorealistic, 8k resolution">
                      Realistis Sinematik (Asli)
                    </option>
                    <option value="Studio Ghibli 2D Anime style">
                      Anime (Studio Ghibli)
                    </option>
                    <option value="Watercolor Illustration style">
                      Ilustrasi Cat Air (Buku Cerita)
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
                    value={teksBacaan}
                    onChange={(e) => setTeksBacaan(e.target.value)}
                    placeholder="Paste teks cerita atau artikel di sini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 h-56 resize-none custom-scrollbar"
                  ></textarea>
                </div>
                <button
                  onClick={handleGenerateSoal}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Berpikir..." : "Buat 5 Soal HOTS"}{" "}
                  <PenNib weight="fill" size={18} />
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
                    value={temaCerita}
                    onChange={(e) => setTemaCerita(e.target.value)}
                    placeholder="Contoh: Pentingnya membuang sampah pada tempatnya"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Target Anak
                  </label>
                  <select
                    value={kelasTarget}
                    onChange={(e) => setKelasTarget(e.target.value)}
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
                  {isLoading ? "Menulis..." : "Mulai Menulis Cerita"}{" "}
                  <Books weight="fill" size={18} />
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
                className={`w-3 h-3 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : resultText ? "bg-emerald-400" : "bg-slate-300"}`}
              ></div>
              <h3 className="font-bold text-slate-700 text-sm">
                Papan Hasil (Output)
              </h3>
            </div>

            {resultText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResultText("")}
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
            ) : resultText ? (
              <div className="whitespace-pre-wrap font-medium text-slate-700 text-[15px] leading-relaxed">
                {resultText}
              </div>
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
