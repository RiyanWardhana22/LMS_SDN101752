import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Sparkle,
  PaperPlaneRight,
  FloppyDisk,
  Info,
} from "@phosphor-icons/react";

export default function WorkshopAI() {
  const [prompt, setPrompt] = useState("");
  const [kategori, setKategori] = useState("Soal Literasi");
  const [kelas, setKelas] = useState("Kelas 4");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setOutput("");

    // Simulasi pemanggilan Gemini API
    setTimeout(() => {
      setOutput(
        `Berikut adalah draft ${kategori} untuk ${kelas} berdasarkan topik "${prompt}":\n\n1. Bacalah paragraf berikut dengan saksama...\n\n(Catatan: Ini adalah simulasi antarmuka. Kita akan mengintegrasikan Gemini API yang asli di tahap selanjutnya!)`,
      );
      setIsLoading(false);
    }, 2000);
  };

  return (
    <DashboardLayout role="guru" title="Laboratorium Prompt AI">
      <div className="bg-[#0D1117] min-h-[calc(100vh-140px)] rounded-3xl p-6 shadow-2xl border border-neutral-800 text-neutral-200 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-5/12 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2ECC71]/20 rounded-xl text-[#2ECC71]">
              <Sparkle weight="fill" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Studio Prompt</h2>
              <p className="text-xs text-[#2ECC71] font-bold">
                Asisten AI Guru (Gemini)
              </p>
            </div>
          </div>

          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Opsi Parameter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  Jenis Output
                </label>
                <select
                  className="w-full bg-[#1a202c] border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-[#2ECC71] focus:ring-0 outline-none"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  <option>Soal Literasi</option>
                  <option>Teks Bacaan Baru</option>
                  <option>Saran Media Belajar</option>
                  <option>Penyederhanaan Teks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  Target Kelas
                </label>
                <select
                  className="w-full bg-[#1a202c] border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-[#2ECC71] focus:ring-0 outline-none"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                >
                  <option>Kelas 1-3 (Rendah)</option>
                  <option>Kelas 4</option>
                  <option>Kelas 5</option>
                  <option>Kelas 6</option>
                </select>
              </div>
            </div>

            {/* Area Ketik (Textarea) */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-neutral-400 mb-1">
                Topik / Ide Utama
              </label>
              <textarea
                className="flex-1 w-full bg-[#1a202c] border border-neutral-700 rounded-xl p-4 text-sm text-white focus:border-[#2ECC71] focus:ring-0 outline-none resize-none"
                placeholder="Contoh: Buatkan cerita pendek tentang banjir di desa, lengkapi dengan 3 pertanyaan pilihan ganda yang menguji pemahaman..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                isLoading || !prompt
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-[#2ECC71] text-[#0D1117] hover:bg-[#27AE60] shadow-[0_4px_0_#1e8449] active:translate-y-1 active:shadow-none"
              }`}
            >
              {isLoading ? (
                "AI Sedang Berpikir..."
              ) : (
                <>
                  Jalankan AI <PaperPlaneRight weight="fill" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* PANEL KANAN: Output */}
        <div className="w-full md:w-7/12 bg-[#05070a] rounded-2xl border border-neutral-800 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
            <h3 className="font-bold text-neutral-300">Hasil Generate</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-[#ff6b35] hover:text-white text-neutral-400 text-xs font-bold rounded-lg transition-colors">
              <FloppyDisk weight="fill" size={16} />
              Simpan ke Bank Soal
            </button>
          </div>

          <div className="flex-1 overflow-y-auto font-['JetBrains_Mono',monospace] text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {!output && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                <Sparkle weight="thin" size={64} className="mb-4 opacity-50" />
                <p>Silakan ketik prompt di sebelah kiri dan klik Jalankan.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 text-[#2ECC71] font-bold">
                <span className="animate-pulse">
                  Menghubungkan ke satelit AI...
                </span>
              </div>
            )}

            {output && <div className="animate-fade-in">{output}</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
