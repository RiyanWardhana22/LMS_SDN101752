import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Info } from "@phosphor-icons/react";

export default function ModulAR() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const arContainerRef = useRef(null);

  // Path marker dari localStorage (set oleh RuangBaca saat klik "Mulai AR")
  const markerSrc = localStorage.getItem("current_ar_marker") || "/targets.mind";

  useEffect(() => {
    // Cek apakah browser mendukung kamera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(true);
      setIsLoading(false);
      return;
    }

    // Minta izin kamera dulu
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        // Izin diberikan — inject A-Frame scene ke container
        if (arContainerRef.current) {
          arContainerRef.current.innerHTML = `
            <a-scene
              mindar-image="imageTargetSrc: ${markerSrc}; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
              color-space="sRGB"
              embedded
              renderer="colorManagement: true; physicallyCorrectLights: true;"
              vr-mode-ui="enabled: false"
              device-orientation-permission-ui="enabled: false"
              style="width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;"
            >
              <a-assets>
                <!-- Aset AR bisa ditambahkan di sini jika perlu -->
              </a-assets>

              <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

              <!-- Objek yang muncul saat marker terdeteksi -->
              <a-entity mindar-image-target="targetIndex: 0">
                <!-- Kotak oranye berputar sebagai placeholder objek AR -->
                <a-box
                  position="0 0 0.1"
                  scale="0.5 0.5 0.5"
                  color="#FF6B35"
                  animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
                ></a-box>
                <a-text
                  value="Materi AR\nSDN 101752"
                  color="#FFFFFF"
                  align="center"
                  position="0 0.65 0.1"
                  scale="0.5 0.5 0.5"
                  font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
                ></a-text>
              </a-entity>
            </a-scene>
          `;
        }

        // Tampilkan UI AR setelah 3 detik (simulasi loading library AR)
        const loadingTimer = setTimeout(() => setIsLoading(false), 3000);

        // Munculkan kuis setelah 13 detik berinteraksi dengan AR
        const quizTimer = setTimeout(() => setShowQuiz(true), 16000);

        return () => {
          clearTimeout(loadingTimer);
          clearTimeout(quizTimer);
        };
      })
      .catch((err) => {
        console.error("Kamera error:", err);
        setCameraError(true);
        setIsLoading(false);
      });

    // Cleanup: hentikan semua track kamera saat komponen unmount
    return () => {
      // Stop semua video track yang aktif
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        if (video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      });

      // Bersihkan scene A-Frame jika ada
      if (arContainerRef.current) {
        arContainerRef.current.innerHTML = "";
      }
    };
  }, [markerSrc]);

  // === LAYAR ERROR KAMERA ===
  if (cameraError) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "#1A1A2E", fontFamily: "'Nunito', sans-serif" }}>
        <div className="text-6xl mb-6">📷❌</div>
        <h2 className="text-2xl font-black text-white mb-3">Kamera Tidak Dapat Diakses</h2>
        <p className="text-neutral-300 font-bold max-w-xs mb-8">
          Pastikan kamu sudah memberikan izin kamera untuk browser ini, lalu muat ulang halaman.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105"
          style={{ backgroundColor: "var(--color-primary)", boxShadow: "var(--shadow-button-primary)" }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* === 1. LAYAR LOADING AR === */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "#1A1A2E" }}>
          <div className="w-28 h-28 mb-6 rounded-full flex items-center justify-center text-6xl" style={{ backgroundColor: "var(--color-primary)", animation: "pulse 2s infinite", boxShadow: "0 0 40px rgba(255,107,53,0.5)" }}>
            🤖
          </div>
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            Aktifkan Kamera! 📷
          </h2>
          <p className="font-bold max-w-xs mb-8" style={{ color: "var(--color-neutral-300)" }}>
            Arahkan kamera ke <strong>gambar marker</strong> yang sudah dicetak untuk melihat keajaibannya!
          </p>
          <div className="px-6 py-3 rounded-full font-bold animate-pulse text-white" style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
            Memuat Modul AR...
          </div>
        </div>
      )}

      {/* === 2. OVERLAY UI SAAT AR AKTIF === */}
      {!isLoading && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Tombol Tutup */}
          <button
            onClick={() => navigate("/siswa/beranda")}
            className="absolute top-6 left-6 pointer-events-auto p-2 rounded-full text-white transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-error)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
          >
            <XCircle weight="fill" size={40} />
          </button>

          {/* Tombol Info */}
          <button
            className="absolute top-6 right-6 pointer-events-auto p-2 rounded-full text-white transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-info)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
          >
            <Info weight="fill" size={40} />
          </button>

          {/* Instruksi bawah */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <div className="px-6 py-3 rounded-full font-bold border-2 border-white" style={{ backgroundColor: "rgba(255,255,255,0.80)", backdropFilter: "blur(8px)", color: "var(--color-neutral-900)" }}>
              📷 Arahkan ke gambar Marker!
            </div>
          </div>
        </div>
      )}

      {/* === 3. MODAL KUIS (muncul setelah 13 detik interaksi AR) === */}
      {showQuiz && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white p-7 rounded-3xl max-w-sm w-full text-center scale-in" style={{ border: "4px solid var(--color-primary)", boxShadow: "0 16px 48px rgba(0,0,0,0.30)" }}>
            {/* Ikon kuis */}
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 -mt-12 border-4 border-white" style={{ backgroundColor: "#4ECDC4", boxShadow: "0 4px 16px rgba(78,205,196,0.40)" }}>
              ❓
            </div>
            <h3 className="text-xl font-black mb-5" style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--color-neutral-900)" }}>
              Apa yang kamu lihat tadi?
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "A", text: "Siklus Air", correct: true },
                { label: "B", text: "Tata Surya", correct: false },
              ].map((opsi) => (
                <button
                  key={opsi.label}
                  onClick={() => setShowQuiz(false)}
                  className="w-full text-left font-bold text-lg px-4 py-4 rounded-2xl transition-all"
                  style={{
                    border:          "2.5px solid var(--color-neutral-300)",
                    backgroundColor: "white",
                    minHeight:       "60px",
                    color:           "var(--color-neutral-900)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = opsi.correct ? "var(--color-accent-green)" : "var(--color-error)";
                    e.currentTarget.style.backgroundColor = opsi.correct ? "var(--color-success-bg)" : "var(--color-error-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-neutral-300)";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {opsi.label}. {opsi.text}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowQuiz(false)}
              className="mt-4 text-sm font-bold transition-colors"
              style={{ color: "var(--color-neutral-500)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-neutral-900)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-neutral-500)")}
            >
              Lewati
            </button>
          </div>
        </div>
      )}

      {/* === 4. CONTAINER A-FRAME (diisi via useEffect) === */}
      <div
        ref={arContainerRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}