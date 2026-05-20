import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Info, CheckCircle } from "@phosphor-icons/react";

export default function ModulAR() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    const timerLoading = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    const timerQuiz = setTimeout(() => {
      setShowQuiz(true);
    }, 13000);

    return () => {
      clearTimeout(timerLoading);
      clearTimeout(timerQuiz);
      const video = document.querySelector("video");
      if (video) {
        const stream = video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-['Nunito']">
      <style>
        {`
          video, .a-canvas {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 0 !important;
          }
        `}
      </style>
      {/* 1. LAYAR LOADING AR */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#1a1a2e] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 mb-6 bg-[#ff6b35] rounded-full flex items-center justify-center text-5xl animate-bounce shadow-[0_0_40px_rgba(255,107,53,0.5)]">
            🤖
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Aktifkan Kamera
          </h2>
          <p className="text-neutral-300 font-bold max-w-xs mb-8">
            Arahkan kamera ke marker untuk melihat keajaibannya! Jangan lupa
            izinkan akses kamera ya.
          </p>
          <div className="px-6 py-3 bg-white/10 rounded-full text-white font-bold animate-pulse">
            Memuat Modul AR...
          </div>
        </div>
      )}

      {/* 2. OVERLAY UI SAAT AR AKTIF */}
      {!isLoading && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Tombol Tutup (Kiri Atas) */}
          <button
            onClick={() => navigate("/siswa/beranda")}
            className="absolute top-6 left-6 pointer-events-auto bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-[#e74c3c] transition-colors"
          >
            <XCircle weight="fill" size={40} />
          </button>

          {/* Tombol Info (Kanan Atas) */}
          <button className="absolute top-6 right-6 pointer-events-auto bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-[#3498db] transition-colors">
            <Info weight="fill" size={40} />
          </button>

          {/* Instruksi Bawah */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg pointer-events-auto font-bold text-neutral-800 border-2 border-white">
              Arahkan ke gambar Marker! 📷
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL KUIS (Muncul setelah 10 detik interaksi) */}
      {showQuiz && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl border-4 border-[#ff6b35] transform transition-all">
            <div className="w-16 h-16 mx-auto bg-[#4ecdc4] rounded-full flex items-center justify-center text-3xl mb-4 -mt-12 shadow-lg border-4 border-white">
              ❓
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-4">
              Apa yang kamu lihat tadi?
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowQuiz(false)}
                className="w-full text-left font-bold text-lg px-4 py-3 border-2 border-neutral-200 rounded-xl hover:border-[#2ecc71] hover:bg-[#eafaf1] transition-all"
              >
                A. Siklus Air
              </button>
              <button
                onClick={() => setShowQuiz(false)}
                className="w-full text-left font-bold text-lg px-4 py-3 border-2 border-neutral-200 rounded-xl hover:border-[#e74c3c] hover:bg-[#fdedec] transition-all"
              >
                B. Tata Surya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. A-FRAME & MIND-AR SCENE */}
      <div className="absolute inset-0 z-0">
        <a-scene
          style={{ width: "100%", height: "100%", display: "block" }}
          ref={sceneRef}
          mindar-image={`imageTargetSrc: ${localStorage.getItem("current_ar_marker") || "/targets.mind"}; autoStart: true; uiLoading: no; uiError: no;`}
          color-space="sRGB"
          embedded
          renderer="colorManagement: true, physicallyCorrectLights"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          <a-entity mindar-image-target="targetIndex: 0">
            <a-box
              position="0 0 0.1"
              scale="0.5 0.5 0.5"
              color="#ff6b35"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"
            ></a-box>
            <a-text
              value="Materi AR\nSDN 101752"
              color="#ffffff"
              align="center"
              position="0 0.6 0.1"
              scale="0.5 0.5 0.5"
            ></a-text>
          </a-entity>
        </a-scene>
      </div>
    </div>
  );
}
