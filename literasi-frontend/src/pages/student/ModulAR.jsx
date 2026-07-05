import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  XCircle, 
  Info, 
  Camera, 
  Scan, 
  CheckCircle,
  ArrowsClockwise 
} from "@phosphor-icons/react";

export default function ModulAR() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [markerFound, setMarkerFound] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const arContainerRef = useRef(null);
  const sceneLoadedRef = useRef(false);
  const streamRef = useRef(null);
  const cleanupRef = useRef(null);
  const sceneRef = useRef(null);
  const videoCheckIntervalRef = useRef(null);

  // Path marker dari localStorage (set oleh RuangBaca saat klik "Mulai AR")
  const markerSrc = localStorage.getItem("current_ar_marker") || "/targets.mind";

  // Function to ensure MindAR video element is properly rendering
  const ensureVideoRendering = useCallback(() => {
    console.log("[ModulAR] Checking MindAR video element...");
    
    // Find all video elements in the DOM
    const videos = document.querySelectorAll("video");
    let mindarVideo = null;
    
    // Look for MindAR video (usually has specific attributes or is inside mindar container)
    for (const video of videos) {
      // Check if this is MindAR's video element
      if (video.style.display !== 'none' && video.srcObject) {
        // Additional check: MindAR video usually has width/height set
        if (video.width > 0 || video.height > 0 || video.videoWidth > 0) {
          mindarVideo = video;
          break;
        }
      }
    }
    
    // If no MindAR video found, try to find any video with a stream
    if (!mindarVideo) {
      for (const video of videos) {
        if (video.srcObject && video.videoWidth > 0) {
          mindarVideo = video;
          break;
        }
      }
    }
    
    if (mindarVideo) {
      console.log("[ModulAR] Found MindAR video element:", mindarVideo);
      
      // Force critical attributes for video playback
      mindarVideo.muted = true;
      mindarVideo.playsInline = true;
      mindarVideo.autoplay = true;
      mindarVideo.setAttribute('playsinline', '');
      mindarVideo.setAttribute('webkit-playsinline', '');
      
      // Ensure video is playing
      if (mindarVideo.paused) {
        console.log("[ModulAR] Video is paused, attempting to play...");
        mindarVideo.play()
          .then(() => {
            console.log("[ModulAR] Video playback started successfully");
            setIsVideoReady(true);
          })
          .catch((err) => {
            console.warn("[ModulAR] Video play() failed:", err);
            // Try again after a short delay
            setTimeout(() => {
              if (mindarVideo.paused) {
                mindarVideo.play().catch(e => console.warn("[ModulAR] Second play attempt failed:", e));
              }
            }, 500);
          });
      } else {
        console.log("[ModulAR] Video is already playing");
        setIsVideoReady(true);
      }
      
      // Force a style update to ensure video is visible
      mindarVideo.style.display = 'block';
      mindarVideo.style.width = '100%';
      mindarVideo.style.height = '100%';
      mindarVideo.style.objectFit = 'cover';
      
      // Ensure video element is in the correct position
      const parent = mindarVideo.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.width = '100%';
        parent.style.height = '100%';
      }
      
      return true;
    } else {
      console.log("[ModulAR] MindAR video element not found yet, will retry...");
      return false;
    }
  }, []);

  // Cleanup function yang reusable
  const cleanupAR = useCallback(() => {
    console.log("[ModulAR] Running cleanup...");
    
    // Clear video check interval
    if (videoCheckIntervalRef.current) {
      clearInterval(videoCheckIntervalRef.current);
      videoCheckIntervalRef.current = null;
    }
    
    // Stop semua video track yang masih aktif
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
      console.log("[ModulAR] Permission stream stopped");
    }

    // Hentikan semua video element yang mungkin masih running
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
        console.log("[ModulAR] Video stream stopped");
      }
    });

    // Hapus scene A-Frame
    if (arContainerRef.current) {
      const scene = arContainerRef.current.querySelector("a-scene");
      if (scene) {
        try {
          scene.exitVR();
          scene.pause();
          // Hapus canvas WebGL context
          const canvas = scene.querySelector("canvas");
          if (canvas) {
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (gl) {
              gl.getExtension("WEBGL_lose_context")?.loseContext();
            }
          }
        } catch (e) {
          console.warn("[ModulAR] Cleanup error:", e);
        }
      }
      arContainerRef.current.innerHTML = "";
    }

    sceneLoadedRef.current = false;
    setIsSceneReady(false);
    setIsVideoReady(false);
    sceneRef.current = null;
  }, []);

  // Setup AR Scene dengan facingMode tertentu
  const setupARScene = useCallback((mode = facingMode) => {
    if (!arContainerRef.current) {
      console.warn("[ModulAR] Container not ready");
      return;
    }

    console.log("[ModulAR] Setting up AR scene with facingMode:", mode);

    // Bersihkan container terlebih dahulu
    cleanupAR();

    // Build mindar-image attribute - use simpler config to avoid constraint issues
    const mindarConfig = [
      `imageTargetSrc: ${markerSrc}`,
      "autoStart: true",
      "uiLoading: no",
      "uiError: no",
      "uiScanning: no"
    ].join("; ");

    // Inject A-Frame scene - removed videoSettings to let MindAR handle camera
    const sceneHTML = `
      <a-scene
        mindar-image="${mindarConfig}"
        embedded
        renderer="colorManagement: false; physicallyCorrectLights: false; exposure: 1.5;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style="width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;"
      >
        <a-assets>
          <!-- Aset AR bisa ditambahkan di sini jika perlu -->
        </a-assets>

        <!-- Camera dengan setting optimal untuk AR -->
        <a-camera 
          position="0 0 0" 
          look-controls="enabled: false"
          near="0.1"
          far="1000"
        ></a-camera>

        <!-- Pencahayaan untuk objek 3D -->
        <a-light type="ambient" color="#ffffff" intensity="0.8"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.0" position="1 2 1"></a-light>
        <a-light type="directional" color="#ffffff" intensity="0.6" position="-1 1 -1"></a-light>
        <a-light type="hemisphere" color="#87CEEB" groundColor="#3a3a3a" intensity="0.7"></a-light>

        <!-- Objek yang muncul saat marker terdeteksi -->
        <a-entity mindar-image-target="targetIndex: 0">
          <!-- Kotak oranye berputar sebagai placeholder objek AR -->
          <a-box
            position="0 0 0.1"
            scale="0.6 0.6 0.6"
            color="#FF6B35"
            material="emissive: #FF6B35; emissiveIntensity: 0.5; metalness: 0.1; roughness: 0.6"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
          ></a-box>
          <a-text
            value="Materi AR\nSDN 101752"
            color="#FFFFFF"
            align="center"
            position="0 0.75 0.1"
            scale="0.5 0.5 0.5"
            font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
            material="transparent: true; opacity: 1"
          ></a-text>
        </a-entity>
      </a-scene>
    `;

    arContainerRef.current.innerHTML = sceneHTML;
    console.log("[ModulAR] Scene injected into container");

    // Setup event listener untuk scene readiness
    const scene = arContainerRef.current.querySelector("a-scene");
    sceneRef.current = scene;
    
    if (scene) {
      const onRenderStart = () => {
        console.log("[ModulAR] Scene renderstart event fired");
        setIsSceneReady(true);
        sceneLoadedRef.current = true;
        setIsLoading(false);
        setIsSwitchingCamera(false);
        scene.removeEventListener("renderstart", onRenderStart);
        
        // Start checking for video element
        if (videoCheckIntervalRef.current) {
          clearInterval(videoCheckIntervalRef.current);
        }
        
        // Check for video element immediately and then periodically
        let attempts = 0;
        const maxAttempts = 20;
        
        const checkVideo = () => {
          attempts++;
          console.log(`[ModulAR] Video check attempt ${attempts}/${maxAttempts}`);
          
          const found = ensureVideoRendering();
          if (found) {
            console.log("[ModulAR] Video rendering confirmed!");
            if (videoCheckIntervalRef.current) {
              clearInterval(videoCheckIntervalRef.current);
              videoCheckIntervalRef.current = null;
            }
          } else if (attempts >= maxAttempts) {
            console.warn("[ModulAR] Max attempts reached, video not found");
            if (videoCheckIntervalRef.current) {
              clearInterval(videoCheckIntervalRef.current);
              videoCheckIntervalRef.current = null;
            }
            // Try one more time with a different approach
            setTimeout(() => {
              ensureVideoRendering();
            }, 1000);
          }
        };
        
        // Check immediately
        setTimeout(checkVideo, 100);
        // Then set interval
        videoCheckIntervalRef.current = setInterval(checkVideo, 500);
      };
      
      scene.addEventListener("renderstart", onRenderStart);

      // Fallback jika renderstart tidak terpanggil
      const fallbackTimer = setTimeout(() => {
        if (!sceneLoadedRef.current) {
          console.log("[ModulAR] Fallback: renderstart not fired, forcing ready");
          setIsLoading(false);
          setIsSwitchingCamera(false);
          setIsSceneReady(true);
          sceneLoadedRef.current = true;
          
          // Try to ensure video anyway
          setTimeout(() => ensureVideoRendering(), 300);
        }
      }, 5000);

      // Setup marker detection events
      const targetEntity = scene.querySelector("[mindar-image-target]");
      if (targetEntity) {
        console.log("[ModulAR] Setting up marker detection events");
        targetEntity.addEventListener("targetFound", () => {
          console.log("[ModulAR] Target found!");
          setMarkerFound(true);
          setTimeout(() => {
            setMarkerFound(false);
          }, 3000);
        });
        
        targetEntity.addEventListener("targetLost", () => {
          console.log("[ModulAR] Target lost");
          setMarkerFound(false);
        });
      } else {
        console.warn("[ModulAR] Target entity not found");
      }

      // Cleanup function
      cleanupRef.current = () => {
        clearTimeout(fallbackTimer);
        scene.removeEventListener("renderstart", onRenderStart);
        if (videoCheckIntervalRef.current) {
          clearInterval(videoCheckIntervalRef.current);
          videoCheckIntervalRef.current = null;
        }
      };
    } else {
      console.error("[ModulAR] Scene element not found after injection");
      setIsLoading(false);
      setIsSwitchingCamera(false);
    }
  }, [markerSrc, facingMode, cleanupAR, ensureVideoRendering]);

  // Handle switch camera
  const handleSwitchCamera = useCallback(async () => {
    if (isSwitchingCamera) return;
    
    console.log("[ModulAR] Switching camera...");
    setIsSwitchingCamera(true);
    setMarkerFound(false);
    setFacingMode(prev => {
      const newMode = prev === "environment" ? "user" : "environment";
      console.log(`[ModulAR] Switching to ${newMode} mode`);
      return newMode;
    });
    
    // Tambahkan delay untuk memastikan state update
    setTimeout(() => {
      setupARScene(facingMode === "environment" ? "user" : "environment");
    }, 500);
  }, [facingMode, isSwitchingCamera, setupARScene]);

  // Effect utama: setup kamera dan AR
  useEffect(() => {
    let mounted = true;
    console.log("[ModulAR] Main effect running");

    // Cek apakah browser mendukung kamera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("[ModulAR] Browser doesn't support getUserMedia");
      setCameraError(true);
      setErrorMessage("Browser Anda tidak mendukung akses kamera. Silakan gunakan browser terbaru.");
      setIsLoading(false);
      return;
    }

    // Cek jumlah kamera yang tersedia
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        console.log("[ModulAR] Video devices found:", videoDevices.length);
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch((err) => {
        console.warn("[ModulAR] enumerateDevices failed:", err);
        setHasMultipleCameras(false);
      });

    // Minta izin kamera dengan constraint yang flexible
    const constraints = {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    console.log("[ModulAR] Requesting camera permission with constraints:", constraints);

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        console.log("[ModulAR] Camera permission granted");
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Simpan stream reference untuk cleanup
        streamRef.current = stream;

        // **KRUSIAL: Stop semua track setelah izin diperoleh**
        // Ini mencegah konflik dengan stream kamera MindAR
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
        console.log("[ModulAR] Permission stream stopped, releasing camera");

        // Tunggu sebentar untuk memastikan device benar-benar dilepas
        setTimeout(() => {
          if (mounted) {
            console.log("[ModulAR] Starting AR setup...");
            setupARScene();
          }
        }, 300);
      })
      .catch((err) => {
        console.error("[ModulAR] Camera permission error:", err);
        
        if (!mounted) return;

        // Tangani OverconstrainedError dengan fallback ke constraint minimal
        if (err.name === "OverconstrainedError") {
          console.log("[ModulAR] OverconstrainedError, trying fallback...");
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((fallbackStream) => {
              if (!mounted) {
                fallbackStream.getTracks().forEach(track => track.stop());
                return;
              }
              
              console.log("[ModulAR] Fallback camera permission granted");
              fallbackStream.getTracks().forEach(track => track.stop());
              
              setTimeout(() => {
                if (mounted) {
                  setFacingMode("environment");
                  setupARScene("environment");
                }
              }, 300);
            })
            .catch((fallbackErr) => {
              console.error("[ModulAR] Fallback camera also failed:", fallbackErr);
              setErrorMessage("Kamera tidak dapat diakses. Silakan coba dengan kamera lain.");
              setCameraError(true);
              setIsLoading(false);
            });
          return;
        }

        // Tangani berbagai jenis error lainnya
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("Tidak ditemukan kamera di perangkat Anda.");
        } else if (err.name === "NotReadableError") {
          setErrorMessage("Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi kamera lain.");
        } else {
          setErrorMessage(`Gagal mengakses kamera: ${err.message || "Unknown error"}`);
        }
        
        setCameraError(true);
        setIsLoading(false);
      });

    // Cleanup
    return () => {
      console.log("[ModulAR] Component unmounting, cleaning up...");
      mounted = false;
      
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      cleanupAR();
    };
  }, [setupARScene, cleanupAR]);

  // Effect untuk loading timeout safety
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.log("[ModulAR] Safety timer triggered");
        setIsLoading(false);
        setIsSwitchingCamera(false);
      }
    }, 10000);

    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  // === LAYAR ERROR KAMERA ===
  if (cameraError) {
    return (
      <div 
        className="relative w-full h-screen flex flex-col items-center justify-center p-6 text-center" 
        style={{ backgroundColor: "var(--color-neutral-900)", fontFamily: "'Nunito', sans-serif" }}
      >
        <div className="text-6xl mb-6">📷❌</div>
        <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
          Kamera Tidak Dapat Diakses
        </h2>
        <p className="text-neutral-300 font-bold max-w-xs mb-8">
          {errorMessage}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105 mb-3"
          style={{ 
            backgroundColor: "var(--color-primary)", 
            boxShadow: "var(--shadow-button-primary)",
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          🔄 Coba Lagi
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105"
          style={{ 
            backgroundColor: "rgba(255,255,255,0.15)", 
            fontFamily: "'Nunito', sans-serif"
          }}
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--color-neutral-900)" }}>
          <div 
            className="w-28 h-28 mb-6 rounded-full flex items-center justify-center text-6xl animate-bounce"
            style={{ 
              backgroundColor: "var(--color-primary)", 
              boxShadow: "0 0 40px rgba(255,107,53,0.5)"
            }}
          >
            <Camera weight="fill" className="text-white" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            Aktifkan Kamera 📷
          </h2>
          <p className="font-bold max-w-xs mb-8" style={{ color: "var(--color-neutral-300)" }}>
            Arahkan kamera ke <strong>gambar marker</strong> yang sudah dicetak untuk melihat keajaibannya!
          </p>
          <div 
            className="px-6 py-3 rounded-full font-bold animate-pulse text-white"
            style={{ 
              backgroundColor: "rgba(255,255,255,0.10)",
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            {isSwitchingCamera ? "🔄 Mengganti Kamera..." : "⏳ Memuat Modul AR..."}
          </div>
        </div>
      )}

      {/* === 2. OVERLAY UI SAAT AR AKTIF === */}
      {!isLoading && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Tombol Tutup - besar dan mudah di-tap */}
          <button
            onClick={() => {
              cleanupAR();
              navigate("/siswa/beranda");
            }}
            className="absolute top-6 left-6 pointer-events-auto p-3 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ 
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border: "2px solid rgba(255,255,255,0.2)",
              minWidth: "56px",
              minHeight: "56px",
              zIndex: 50
            }}
            aria-label="Tutup AR"
          >
            <XCircle weight="fill" size={32} />
          </button>

          {/* Tombol Info */}
          <button
            className="absolute top-6 right-6 pointer-events-auto p-3 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ 
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border: "2px solid rgba(255,255,255,0.2)",
              minWidth: "56px",
              minHeight: "56px",
              zIndex: 50
            }}
            onClick={() => {
              alert("📱 Arahkan kamera ke marker AR untuk melihat objek 3D.");
            }}
            aria-label="Info AR"
          >
            <Info weight="fill" size={32} />
          </button>

          {/* Tombol Switch Kamera - hanya tampil jika ada multiple camera */}
          {hasMultipleCameras && !isSwitchingCamera && (
            <button
              onClick={handleSwitchCamera}
              className="absolute top-24 right-6 pointer-events-auto p-3 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ 
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.2)",
                minWidth: "56px",
                minHeight: "56px",
                zIndex: 50
              }}
              aria-label="Ganti Kamera"
            >
              <ArrowsClockwise weight="fill" size={28} />
            </button>
          )}

          {/* Status Scanning - Indikator di bawah */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 50 }}>
            <div 
              className="px-6 py-3 rounded-full font-bold backdrop-blur-sm transition-all duration-500 flex items-center gap-3"
              style={{
                backgroundColor: markerFound 
                  ? "rgba(46, 204, 113, 0.90)" 
                  : "rgba(0,0,0,0.70)",
                color: markerFound ? "white" : "white",
                border: markerFound ? "2px solid var(--color-accent-green)" : "none",
                boxShadow: markerFound ? "0 0 20px rgba(46, 204, 113, 0.3)" : "none"
              }}
            >
              {markerFound ? (
                <>
                  <CheckCircle weight="fill" size={24} className="animate-pulse" />
                  <span>✨ Marker ditemukan!</span>
                </>
              ) : (
                <>
                  <Scan weight="fill" size={24} className="animate-pulse" />
                  <span>🔍 Mencari marker...</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === 3. CONTAINER A-FRAME === */}
      <div
        ref={arContainerRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}