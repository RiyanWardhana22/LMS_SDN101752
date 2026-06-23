import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiEndpoint } from "../../config/api";
import {
  PaperPlaneRight,
  Paperclip,
  X,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";

export default function WorkshopAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState("chat");
  const [gayaVisual, setGayaVisual] = useState("3D Animation (Pixar Style)");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [systemInfo, setSystemInfo] = useState({
    model: "gemini-3.5-flash",
    apiIndex: 1,
  });

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("ai_chat_history");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            id: "welcome-1",
            role: "ai",
            content:
              "Halo. Saya asisten AI Anda. Silakan ketik instruksi, lampirkan dokumen, atau pilih mode khusus di bawah untuk mulai bekerja.",
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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (attachedFiles.length + files.length > 3) {
      return Swal.fire(
        "Batas File",
        "Maksimal 3 file dalam satu pesan.",
        "warning",
      );
    }

    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
          resolve({
            name: file.name,
            type: file.type,
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
      '<h3 class="text-lg font-bold mt-6 mb-2 text-slate-900">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900">$1</h2>',
    );
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-slate-900 font-bold">$1</strong>',
    );
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="text-slate-700 italic">$1</em>',
    );
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      files: attachedFiles.map((f) => ({ name: f.name, type: f.type })),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const filesToUpload = [...attachedFiles];
    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    let sysInstruction = "";
    let finalPrompt = inputValue || "Tolong analisis file yang saya lampirkan.";

    if (selectedMode === "animasi") {
      sysInstruction = `Kamu adalah Sutradara Film Profesional dan ahli Prompt Engineer... (Output hanya prompt bahasa Inggris). Gunakan gaya visual: ${gayaVisual}.`;
      finalPrompt = `Buatkan prompt video untuk: ${inputValue}`;
    } else if (selectedMode === "soal") {
      sysInstruction =
        "Kamu adalah Guru SD. Buatlah 5 soal pilihan ganda berstandar HOTS berdasarkan teks/file yang diberikan. Jangan berikan pengantar, langsung berikan soal dan kuncinya di akhir.";
      finalPrompt = `Buatkan soal literasi dari topik/file ini: ${inputValue}`;
    } else if (selectedMode === "cerita") {
      sysInstruction =
        "Kamu adalah Penulis Buku Anak. Buat cerita pendek yang mendidik untuk anak SD (3-4 paragraf) dengan pesan moral di akhir.";
      finalPrompt = `Tema cerita: ${inputValue}`;
    }

    try {
      const response = await fetch(apiEndpoint("api/ai/generate.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          system_instruction: sysInstruction,
          files: filesToUpload,
        }),
      });
      const rawText = await response.text();
      const data = JSON.parse(rawText);

      if (data.status === "success") {
        if (data.model_used && data.api_used) {
          setSystemInfo({ model: data.model_used, apiIndex: data.api_used });
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
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
      title: "Bersihkan History Chat?",
      text: "Riwayat percakapan ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Bersihkan",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed)
        setMessages([
          {
            id: "reset-1",
            role: "ai",
            content: "Ruang kerja telah dibersihkan.",
            timestamp: new Date().toISOString(),
          },
        ]);
    });
  };

  return (
    <DashboardLayout role="guru" title="Workshop AI" isFullScreenChat={true}>
      <div className="flex-1 flex flex-col w-full h-full bg-white overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200/80 bg-white shrink-0">
          <div>
            <h2 className="font-extrabold text-slate-800 text-lg tracking-wide uppercase font-mono">
              {systemInfo.model}
            </h2>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              API Key {systemInfo.apiIndex}
            </p>
          </div>
          <button
            onClick={clearChat}
            className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Bersihkan Obrolan"
          >
            <Trash size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-16 custom-scrollbar bg-white flex flex-col gap-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" ? (
                <div className="flex gap-4 max-w-[90%] md:max-w-[85%]">
                  <div className="shrink-0 pt-1">
                    <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white">
                      <Sparkle weight="fill" size={14} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="text-[15px] leading-relaxed text-slate-800 font-medium"
                      dangerouslySetInnerHTML={{
                        __html: formatTeksAI(msg.content),
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2 max-w-[80%] md:max-w-[70%]">
                  <div className="bg-slate-100 text-slate-800 px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm font-medium">
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.files.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md text-xs font-semibold text-slate-600 border border-slate-200"
                          >
                            <Paperclip size={14} /> {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-[90%] md:max-w-[85%]">
              <div className="shrink-0 pt-1">
                <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Sparkle weight="fill" size={14} className="animate-spin" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-slate-400 text-sm font-medium animate-pulse">
                  Menghasilkan respons...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="pb-2" />
        </div>

        <div className="p-4 md:px-16 pb-6 bg-white shrink-0 border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {attachedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                  >
                    <Paperclip size={14} />{" "}
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col bg-white border-2 border-slate-200 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-slate-900 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all overflow-hidden">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik instruksi, materi, atau skenario di sini..."
                className="w-full bg-transparent px-5 py-4 text-[15px] font-medium text-slate-800 outline-none resize-none max-h-48 overflow-y-auto"
                rows="1"
              ></textarea>
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl cursor-pointer transition-colors shadow-sm border border-slate-200/60"
                    title="Lampirkan File"
                  >
                    <Paperclip size={18} weight="bold" />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="bg-white border border-slate-200/80 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
                  >
                    <option value="chat">Chat Umum</option>
                    <option value="animasi">Prompt Animasi</option>
                    <option value="soal">Penyusun Soal</option>
                    <option value="cerita">Penulis Cerita</option>
                  </select>

                  {selectedMode === "animasi" && (
                    <select
                      value={gayaVisual}
                      onChange={(e) => setGayaVisual(e.target.value)}
                      className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                      <option value="3D Animation (Pixar Style)">
                        Pixar / 3D
                      </option>
                      <option value="Stop Motion Claymation">
                        Claymation (Tanah Liat)
                      </option>
                      <option value="Cinematic Photorealistic, 8k">
                        Realistis Sinematik
                      </option>
                      <option value="Studio Ghibli 2D Anime style">
                        Anime (Ghibli)
                      </option>
                      <option value="Watercolor Illustration">Cat Air</option>
                    </select>
                  )}
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={
                    isLoading ||
                    (!inputValue.trim() && attachedFiles.length === 0)
                  }
                  className="px-5 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  <PaperPlaneRight weight="fill" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
