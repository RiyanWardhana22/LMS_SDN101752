import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Robot,
  PaperPlaneRight,
  Paperclip,
  X,
  FilmStrip,
  Books,
  PenNib,
  Sparkle,
  ChatCircleText,
  User,
} from "@phosphor-icons/react";

export default function WorkshopAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState("chat");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("ai_chat_history");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            id: "welcome-1",
            role: "ai",
            mode: "chat",
            content:
              "Halo! Saya Asisten Gemini. Anda bisa melampirkan Gambar atau dokumen PDF menggunakan ikon klip kertas di bawah. Ada yang bisa saya bantu hari ini?",
            timestamp: new Date().toISOString(),
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- HANDLER FILE UPLOAD & KONVERSI BASE64 ---
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (attachedFiles.length + files.length > 3) {
      return Swal.fire(
        "Batas File",
        "Maksimal 3 file dalam satu pesan.",
        "warning",
      );
    }

    // Mengubah file fisik menjadi string Base64
    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
          resolve({
            name: file.name,
            type: file.type,
            // Pisahkan "data:image/png;base64," dan ambil string Base64-nya saja
            data: reader.result.split(",")[1],
          });
        reader.onerror = (error) => reject(error);
      });
    });

    try {
      const base64Files = await Promise.all(filePromises);
      setAttachedFiles((prev) => [...prev, ...base64Files]);
    } catch (error) {
      Swal.fire("Error", "Gagal membaca file.", "error");
    }

    e.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    setAttachedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const formatTeksAI = (text) => {
    if (!text) return "";
    let html = text;
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-black mt-4 mb-2 text-slate-800">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-black mt-5 mb-3 text-slate-800">$1</h2>',
    );
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-slate-900 font-black">$1</strong>',
    );
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="text-slate-600 italic">$1</em>',
    );
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      mode: selectedMode,
      content: inputValue,
      files: attachedFiles.map((f) => ({ name: f.name, type: f.type })), // Simpan metadata saja untuk histori UI
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simpan payload file yang asli (Base64) untuk dikirim ke API
    const filesToUpload = [...attachedFiles];

    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    let sysInstruction = "";
    let finalPrompt = inputValue || "Tolong analisis file yang saya lampirkan.";

    if (selectedMode === "animasi") {
      sysInstruction =
        "Kamu adalah Sutradara Film. Ubah ide pengguna menjadi prompt Bahasa Inggris yang sangat detail. Langsung output prompt Inggrisnya saja.";
      finalPrompt = `Buatkan prompt video animasi untuk ide ini: ${inputValue}`;
    } else if (selectedMode === "soal") {
      sysInstruction =
        "Kamu adalah Guru SD ahli pembuat soal HOTS. Buatlah 5 soal pilihan ganda berdasarkan teks/file yang diberikan beserta kuncinya.";
      finalPrompt = `Buatkan soal literasi dari topik/file ini: ${inputValue}`;
    } else if (selectedMode === "cerita") {
      sysInstruction =
        "Kamu adalah Penulis Buku Anak. Buatlah cerita pendek yang mendidik untuk anak SD.";
      finalPrompt = `Tulis cerita anak dengan tema: ${inputValue}`;
    }

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/ai/generate.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // PERBAIKAN: Mengirim file Base64 ke PHP
          body: JSON.stringify({
            prompt: finalPrompt,
            system_instruction: sysInstruction,
            files: filesToUpload,
          }),
        },
      );
      const rawText = await response.text();
      const data = JSON.parse(rawText);

      if (data.status === "success") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            mode: selectedMode,
            content: data.data,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        Swal.fire("Gagal", data.message, "error");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            mode: "error",
            content: "Error: " + data.message,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          mode: "error",
          content: "Gagal menghubungi server AI.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    Swal.fire({
      title: "Hapus Obrolan?",
      text: "Riwayat ini akan hilang permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
    }).then((res) => {
      if (res.isConfirmed)
        setMessages([
          {
            id: "reset-1",
            role: "ai",
            mode: "chat",
            content: "Ruang kerja dibersihkan. Mari mulai yang baru!",
          },
        ]);
    });
  };

  const getModeIcon = (mode) => {
    if (mode === "animasi")
      return <FilmStrip weight="fill" className="text-purple-500" />;
    if (mode === "soal")
      return <PenNib weight="fill" className="text-orange-500" />;
    if (mode === "cerita")
      return <Books weight="fill" className="text-emerald-500" />;
    return <ChatCircleText weight="fill" className="text-blue-500" />;
  };

  const getModeLabel = (mode) => {
    if (mode === "animasi") return "Prompt Animasi";
    if (mode === "soal") return "Pembuat Soal";
    if (mode === "cerita") return "Tulis Cerita";
    return "Chat Asisten";
  };

  return (
    <DashboardLayout role="guru" title="Workshop AI">
      <div className="max-w-5xl mx-auto h-[85vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* HEADER CHAT */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Robot size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg leading-tight">
                Gemini 3.5 Flash (Vision)
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                Sistem Aktif
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
          >
            Bersihkan Chat
          </button>
        </div>

        {/* AREA OBROLAN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-white flex flex-col gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 w-full max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className="shrink-0 pt-2">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                    <User weight="fill" size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm flex items-center justify-center text-white">
                    <Sparkle weight="fill" size={16} />
                  </div>
                )}
              </div>
              <div
                className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {msg.role === "ai" && msg.mode !== "error" && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                    {getModeIcon(msg.mode)} {getModeLabel(msg.mode)}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : msg.mode === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm"}`}
                >
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {msg.files.map((f, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${msg.role === "user" ? "bg-white/20 border-white/10" : "bg-slate-200 border-slate-300"}`}
                        >
                          <Paperclip size={14} /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatTeksAI(msg.content),
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 w-full max-w-3xl mr-auto">
              <div className="shrink-0 pt-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Sparkle weight="fill" size={16} />
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-100 flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA TERPADU */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {attachedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200"
                  >
                    <Paperclip size={14} className="text-indigo-500" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan atau instruksi di sini..."
                className="w-full bg-transparent p-4 text-sm font-medium text-slate-700 outline-none resize-none max-h-40 overflow-y-auto"
                rows="2"
              ></textarea>
              <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100">
                <div className="flex items-center gap-1 md:gap-3">
                  <label
                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-xl cursor-pointer transition-colors"
                    title="Lampirkan Gambar / PDF"
                  >
                    <Paperclip size={20} weight="bold" />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <option value="chat">💬 Chat Bebas</option>
                    <option value="animasi">🎬 Pembuat Prompt Video</option>
                    <option value="soal">📝 Penyusun Soal HOTS</option>
                    <option value="cerita">📚 Penulis Cerita Anak</option>
                  </select>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={
                    isLoading ||
                    (!inputValue.trim() && attachedFiles.length === 0)
                  }
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_3px_0_#4f46e5] active:translate-y-1 active:shadow-none"
                >
                  <PaperPlaneRight weight="fill" size={18} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-1">
              AI dapat melakukan kesalahan. Harap periksa kembali informasi
              penting yang dihasilkan.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
