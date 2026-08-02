import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  X, 
  Info, 
  Camera, 
  Scan, 
  CheckCircle2,
  RefreshCw,
  Box,
  Maximize2
} from "lucide-react";
import { apiEndpoint } from "../../config/api";

// ============================================================
// IMPORT STATIS A-FRAME & MINDAR
// ============================================================
import "aframe";
import "aframe-extras";
import "mind-ar/dist/mindar-image-aframe.prod.js";

// ============================================================
// DETEKSI JENIS PERANGKAT
// ============================================================
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mobile|Tablet|Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ModulAR() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State data
  const [materiData, setMateriData] = useState(null);
  const [arTargetUrl, setArTargetUrl] = useState(null);
  const [arOutputMedia, setArOutputMedia] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(false);

  // State AR
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [markerFound, setMarkerFound] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [deviceType, setDeviceType] = useState("other");
  const [arContentType, setArContentType] = useState(""); // Tipe konten AR yang aktif
  const [modelLoadError, setModelLoadError] = useState(false);

  const arContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cleanupRef = useRef(null);
  const mountRef = useRef(true);
  const cameraStartTimeoutRef = useRef(null);

  // ============================================================
  // FETCH DATA MATERI
  // ============================================================
  useEffect(() => {
    if (!id) {
      setDataError(true);
      setErrorMessage("ID materi tidak ditemukan.");
      setLoadingData(false);
      return;
    }

    const fetchMateri = async () => {
      try {
        const res = await fetch(apiEndpoint(`api/materi/detail.php?id=${id}`));
        const data = await res.json();
        if (data.status === "success") {
          setMateriData(data.data);
          const mediaList = data.data.media || [];
          
          // Cari AR target (.mind)
          const arTarget = mediaList.find(m => m.type === "ar_mind" && m.url);
          if (arTarget) {
            setArTargetUrl(arTarget.url);
          } else {
            setDataError(true);
            setErrorMessage("Materi ini tidak memiliki target AR.");
            setLoadingData(false);
            return;
          }

          // Cari AR output (video, gambar, atau model 3D yang ditandai is_ar_output)
          const output = mediaList.find(m => {
            const isArOutput = Number(m.is_ar_output) === 1;
            const isSupported = 
              m.type === "video_cloud" || 
              m.type === "video_link" || 
              m.type === "image_cloud" ||
              m.type === "model_3d" ||
              m.type === "model_3d_animated";
            return isArOutput && isSupported && m.url;
          });

          setArOutputMedia(output || null);
          if (output) {
            setArContentType(output.type);
          }
          setLoadingData(false);
        } else {
          setDataError(true);
          setErrorMessage(data.message || "Gagal memuat data materi.");
          setLoadingData(false);
        }
      } catch (err) {
        console.error("[ModulAR] Fetch error:", err);
        setDataError(true);
        setErrorMessage("Tidak dapat terhubung ke server.");
        setLoadingData(false);
      }
    };

    fetchMateri();
  }, [id]);

  // ============================================================
  // CEK KETERSEDIAAN AFRAME
  // ============================================================
  useEffect(() => {
    const checkScripts = () => {
      if (typeof window.AFRAME !== 'undefined') {
        setTimeout(() => {
          if (mountRef.current) setScriptsReady(true);
        }, 100);
        return true;
      }
      return false;
    };

    if (checkScripts()) return;

    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      if (checkScripts()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        if (mountRef.current) {
          setScriptsReady(false);
          setErrorMessage("Gagal memuat library AR. Silakan refresh.");
          setIsLoading(false);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      mountRef.current = false;
    };
  }, []);

  // ============================================================
  // CLEANUP
  // ============================================================
  const cleanupAR = useCallback(() => {
    if (cameraStartTimeoutRef.current) {
      clearTimeout(cameraStartTimeoutRef.current);
      cameraStartTimeoutRef.current = null;
    }

    if (sceneRef.current) {
      try {
        const scene = sceneRef.current;
        const mindar = scene.systems['mindar-image'];
        if (mindar) {
          mindar.stop();
          mindar.video?.pause?.();
        }
        scene.exitVR?.();
        scene.pause?.();
        const canvas = scene.querySelector("canvas");
        if (canvas) {
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        }
      } catch (_) {}
    }

    if (arContainerRef.current) {
      arContainerRef.current.innerHTML = "";
    }

    sceneRef.current = null;
    setIsSceneReady(false);
    setModelLoadError(false);
  }, []);

  // ============================================================
  // GENERATE ENTITY HTML BERDASARKAN TIPE OUTPUT
  // ============================================================
  const generateEntityHTML = useCallback((outputMedia) => {
    if (!outputMedia) {
      // Fallback: Kotak default
      return `
        <a-box
          position="0 0 0.1"
          scale="0.6 0.6 0.6"
          color="#FF6B35"
          material="emissive: #FF6B35; emissiveIntensity: 0.5; metalness: 0.1; roughness: 0.6"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
        ></a-box>
        <a-text
          value="Materi AR"
          color="#FFFFFF"
          align="center"
          position="0 0.75 0.1"
          scale="0.5 0.5 0.5"
          font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
          material="transparent: true; opacity: 1"
        ></a-text>
      `;
    }

    const config = outputMedia.model_config || {};
    
    // ============================================
    // VIDEO CLOUD / VIDEO LINK
    // ============================================
    if (outputMedia.type === "video_cloud" || outputMedia.type === "video_link") {
      return `
        <a-video 
          src="${outputMedia.url}" 
          position="0 0 0.1" 
          scale="0.8 0.6 0.6" 
          autoplay="true" 
          loop="true" 
          muted="false"
          crossOrigin="anonymous"
        ></a-video>
      `;
    }

    // ============================================
    // IMAGE CLOUD
    // ============================================
    if (outputMedia.type === "image_cloud") {
      return `
        <a-image 
          src="${outputMedia.url}" 
          position="0 0 0.1" 
          scale="0.8 0.6 0.6"
          crossOrigin="anonymous"
        ></a-image>
      `;
    }

    // ============================================
    // MODEL 3D STATIS (.glb) - PERBAIKAN
    // ============================================
    if (outputMedia.type === "model_3d") {
      const scale = config.scale || "0.5 0.5 0.5";
      const position = config.position || "0 0.1 0.1";
      const rotation = config.rotation || "0 0 0";
      const animation = config.animation || "none";
      const animSpeed = config.animationSpeed || 5000;

      // Pastikan URL valid
      const modelUrl = outputMedia.url;
      if (!modelUrl) {
        return `
          <a-box
            position="0 0 0.1"
            scale="0.6 0.6 0.6"
            color="#FF0000"
            material="emissive: #FF0000; emissiveIntensity: 0.5"
          ></a-box>
          <a-text
            value="Model tidak tersedia"
            color="#FFFFFF"
            align="center"
            position="0 0.75 0.1"
            scale="0.4 0.4 0.4"
          ></a-text>
        `;
      }

      // Gunakan a-entity dengan gltf-model
      if (animation === "rotate") {
        return `
          <a-entity
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scale}"
            rotation="${rotation}"
            animation="property: rotation; to: 0 360 0; loop: true; dur: ${animSpeed}; easing: linear"
          ></a-entity>
        `;
      } else {
        return `
          <a-entity
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scale}"
            rotation="${rotation}"
          ></a-entity>
        `;
      }
    }

    // ============================================
    // MODEL 3D DENGAN ANIMASI BAWAAN (.glb) - PERBAIKAN
    // ============================================
    if (outputMedia.type === "model_3d_animated") {
      const scale = config.scale || "0.5 0.5 0.5";
      const position = config.position || "0 0.1 0.1";
      const rotation = config.rotation || "0 0 0";
      const autoRotate = config.autoRotate || false;

      const modelUrl = outputMedia.url;
      if (!modelUrl) {
        return `
          <a-box
            position="0 0 0.1"
            scale="0.6 0.6 0.6"
            color="#FF0000"
            material="emissive: #FF0000; emissiveIntensity: 0.5"
          ></a-box>
          <a-text
            value="Model tidak tersedia"
            color="#FFFFFF"
            align="center"
            position="0 0.75 0.1"
            scale="0.4 0.4 0.4"
          ></a-text>
        `;
      }

      if (autoRotate) {
        return `
          <a-entity
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scale}"
            rotation="${rotation}"
            animation-mixer="clip: *; loop: repeat"
            animation__rotate="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
          ></a-entity>
        `;
      } else {
        return `
          <a-entity
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scale}"
            rotation="${rotation}"
            animation-mixer="clip: *; loop: repeat"
          ></a-entity>
        `;
      }
    }

    // Fallback
    return `
      <a-box
        position="0 0 0.1"
        scale="0.6 0.6 0.6"
        color="#FF6B35"
        material="emissive: #FF6B35; emissiveIntensity: 0.5"
        animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
      ></a-box>
    `;
  }, []);

  // ============================================================
  // SETUP AR SCENE
  // ============================================================
  const setupARScene = useCallback((mode = facingMode) => {
    if (!arContainerRef.current || !arTargetUrl) {
      setIsLoading(false);
      return;
    }

    cleanupAR();

    if (typeof window.AFRAME === 'undefined') {
      setErrorMessage("AFRAME tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    // Generate entity HTML berdasarkan output media
    const entityHTML = generateEntityHTML(arOutputMedia);

    // Konfigurasi MindAR
    const mindarConfig = [
      `imageTargetSrc: ${arTargetUrl}`,
      "autoStart: true",
      "uiLoading: no",
      "uiError: no",
      "uiScanning: no",
      `facingMode: ${mode}`,
      "mirror: false"
    ].join("; ");

    const sceneHTML = `
      <a-scene
        mindar-image="${mindarConfig}"
        embedded
        renderer="colorManagement: false; physicallyCorrectLights: false; exposure: 1.5;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style="width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0; background: transparent;"
      >
        <a-assets></a-assets>
        <a-camera 
          position="0 0 0" 
          look-controls="enabled: false"
          near="0.1"
          far="1000"
        ></a-camera>
        <a-light type="ambient" color="#ffffff" intensity="0.8"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.0" position="1 2 1"></a-light>
        <a-light type="directional" color="#ffffff" intensity="0.6" position="-1 1 -1"></a-light>
        <a-light type="hemisphere" color="#87CEEB" groundColor="#3a3a3a" intensity="0.7"></a-light>
        <a-entity mindar-image-target="targetIndex: 0">
          ${entityHTML}
        </a-entity>
      </a-scene>
    `;

    arContainerRef.current.innerHTML = sceneHTML;

    const scene = arContainerRef.current.querySelector("a-scene");
    sceneRef.current = scene;

    if (!scene) {
      setIsLoading(false);
      return;
    }

    // Event: renderstart
    const onRenderStart = () => {
      setIsSceneReady(true);
      scene.removeEventListener("renderstart", onRenderStart);
    };
    scene.addEventListener("renderstart", onRenderStart);

    // Event: cameraStart (MindAR)
    const onCameraStart = () => {
      setIsLoading(false);
      setIsSwitchingCamera(false);
      const mindar = scene.systems['mindar-image'];
      if (mindar && mindar.video) {
        const vid = mindar.video;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.setAttribute('playsinline', '');
        vid.setAttribute('webkit-playsinline', '');
        if (vid.paused) vid.play().catch(() => {});
      }
    };
    scene.addEventListener("cameraStart", onCameraStart);

    // Event: cameraError
    const onCameraError = (err) => {
      console.error("[ModulAR] Camera error:", err);
      setIsLoading(false);
      setCameraError(true);
      setErrorMessage("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
    };
    scene.addEventListener("cameraError", onCameraError);

    // Event: targetFound / targetLost
    const targetEntity = scene.querySelector("[mindar-image-target]");
    if (targetEntity) {
      targetEntity.addEventListener("targetFound", () => {
        setMarkerFound(true);
        setModelLoadError(false);
        setTimeout(() => setMarkerFound(false), 3000);
      });
      targetEntity.addEventListener("targetLost", () => {
        setMarkerFound(false);
      });
    }

    // Event listener untuk model 3D
    scene.addEventListener('model-error', (e) => {
      console.error('[ModulAR] Model 3D error:', e.detail);
      setModelLoadError(true);
    });
    
    scene.addEventListener('model-loaded', (e) => {
      console.log('[ModulAR] Model 3D loaded:', e.detail);
      setModelLoadError(false);
    });

    // Fallback: jika cameraStart tidak pernah terjadi
    cameraStartTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        const mindar = scene.systems['mindar-image'];
        if (mindar && !mindar.started) {
          mindar.start().catch(() => {});
        }
        setTimeout(() => {
          setIsLoading(false);
          setIsSwitchingCamera(false);
        }, 3000);
      }
    }, 8000);

    // Cleanup ref
    cleanupRef.current = () => {
      scene.removeEventListener("renderstart", onRenderStart);
      scene.removeEventListener("cameraStart", onCameraStart);
      scene.removeEventListener("cameraError", onCameraError);
      scene.removeEventListener('model-error', () => {});
      scene.removeEventListener('model-loaded', () => {});
      if (cameraStartTimeoutRef.current) {
        clearTimeout(cameraStartTimeoutRef.current);
        cameraStartTimeoutRef.current = null;
      }
    };

  }, [arTargetUrl, arOutputMedia, facingMode, cleanupAR, generateEntityHTML]);

  // ============================================================
  // SWITCH CAMERA
  // ============================================================
  const handleSwitchCamera = useCallback(() => {
    if (isSwitchingCamera) return;
    setIsSwitchingCamera(true);
    setMarkerFound(false);
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    setTimeout(() => {
      setupARScene(newMode);
    }, 300);
  }, [facingMode, isSwitchingCamera, setupARScene]);

  // ============================================================
  // EFFECT UTAMA: DETEKSI PERANGKAT & SETUP AWAL
  // ============================================================
  useEffect(() => {
    if (!scriptsReady || loadingData || dataError || !arTargetUrl) return;

    const device = detectDeviceType();
    setDeviceType(device);

    if (device === "android" || device === "ios") {
      setHasMultipleCameras(true);
    } else if (device === "desktop") {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === "videoinput");
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(() => setHasMultipleCameras(false));
    } else {
      setHasMultipleCameras(false);
    }

    let initialMode = "environment";
    if (device === "desktop") initialMode = "user";
    setFacingMode(initialMode);

    setupARScene(initialMode);

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupAR();
    };
  }, [scriptsReady, loadingData, dataError, arTargetUrl, setupARScene, cleanupAR]);

  // ============================================================
  // SAFETY TIMER
  // ============================================================
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isLoading && scriptsReady && !loadingData) {
        setIsLoading(false);
        setIsSwitchingCamera(false);
      }
    }, 12000);
    return () => clearTimeout(safetyTimer);
  }, [isLoading, scriptsReady, loadingData]);

  // ============================================================
  // GET ICON & LABEL UNTUK TIPE KONTEN AR
  // ============================================================
  const getArContentInfo = () => {
    if (!arContentType) return { icon: null, label: "" };
    
    if (arContentType.includes("video")) {
      return { icon: <Camera className="w-4 h-4" />, label: "Video AR" };
    }
    if (arContentType === "image_cloud") {
      return { icon: <Camera className="w-4 h-4" />, label: "Gambar AR" };
    }
    if (arContentType === "model_3d" || arContentType === "model_3d_animated") {
      return { icon: <Box className="w-4 h-4" />, label: "Model 3D AR" };
    }
    return { icon: null, label: "Konten AR" };
  };

  const arContentInfo = getArContentInfo();

  // ============================================================
  // RENDER ERROR DATA
  // ============================================================
  if (dataError) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center p-6 text-center bg-neutral-900 text-white font-sans">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <Camera className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Gagal Memuat Materi</h2>
        <p className="text-neutral-400 max-w-xs mb-8">{errorMessage}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-semibold bg-[#FF6B35] hover:bg-[#e05a2a] transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER ERROR KAMERA
  // ============================================================
  if (cameraError) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center p-6 text-center bg-neutral-900 text-white font-sans">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <Camera className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Kamera Tidak Dapat Diakses</h2>
        <p className="text-neutral-400 max-w-xs mb-8">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-semibold bg-[#FF6B35] hover:bg-[#e05a2a] transition-colors mb-3"
        >
          Coba Lagi
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER UTAMA
  // ============================================================
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">

      {/* LOADING OVERLAY */}
      {(isLoading || loadingData) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-neutral-900">
          <div className="w-24 h-24 rounded-full bg-[#FF6B35] flex items-center justify-center mb-6 shadow-lg shadow-[#FF6B35]/30 animate-pulse">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {!scriptsReady ? "Memuat Komponen AR" : loadingData ? "Memuat Materi" : "Mengaktifkan Kamera"}
          </h2>
          <p className="text-neutral-400 max-w-xs mb-8">
            {!scriptsReady 
              ? "Tunggu sebentar, sedang memuat library AR..."
              : loadingData
              ? "Mengambil data materi..."
              : arContentType === "model_3d" || arContentType === "model_3d_animated"
              ? "Arahkan kamera ke marker untuk melihat Model 3D."
              : "Arahkan kamera ke marker yang sudah disediakan."}
          </p>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{isSwitchingCamera ? "Mengganti Kamera..." : "Memuat..."}</span>
          </div>
        </div>
      )}

      {/* OVERLAY UI SAAT AR AKTIF */}
      {!isLoading && !loadingData && !cameraError && scriptsReady && !dataError && (
        <div className="absolute inset-0 z-40 pointer-events-none">

          {/* SCANNING FRAME */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="relative w-64 h-64 md:w-80 md:h-80"
              style={{
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
              }}
            >
              {/* Corner top-left */}
              <div className="absolute -top-0.5 -left-0.5 w-8 h-0.5 bg-white/70 rounded-full" />
              <div className="absolute -top-0.5 -left-0.5 w-0.5 h-8 bg-white/70 rounded-full" />
              
              {/* Corner top-right */}
              <div className="absolute -top-0.5 -right-0.5 w-8 h-0.5 bg-white/70 rounded-full" />
              <div className="absolute -top-0.5 -right-0.5 w-0.5 h-8 bg-white/70 rounded-full" />
              
              {/* Corner bottom-left */}
              <div className="absolute -bottom-0.5 -left-0.5 w-8 h-0.5 bg-white/70 rounded-full" />
              <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-8 bg-white/70 rounded-full" />
              
              {/* Corner bottom-right */}
              <div className="absolute -bottom-0.5 -right-0.5 w-8 h-0.5 bg-white/70 rounded-full" />
              <div className="absolute -bottom-0.5 -right-0.5 w-0.5 h-8 bg-white/70 rounded-full" />

              {/* Animated scanning line */}
              <div 
                className="absolute left-4 right-4 h-0.5 bg-[#FF6B35]/60 rounded-full shadow-lg shadow-[#FF6B35]/30"
                style={{
                  animation: 'scanline 2.5s ease-in-out infinite',
                }}
              />

              {/* Label di bawah kotak */}
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <span className="text-xs font-medium text-white/60 tracking-wider uppercase">
                  {arContentType === "model_3d" || arContentType === "model_3d_animated"
                    ? "Arahkan ke Marker - Model 3D"
                    : "Arahkan ke Marker"}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Tutup */}
          <button
            onClick={() => {
              cleanupAR();
              navigate("/siswa/beranda");
            }}
            className="absolute top-6 left-6 pointer-events-auto p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Tombol Info */}
          <button
            className="absolute top-6 right-6 pointer-events-auto p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all"
            onClick={() => {
              let message = "Arahkan kamera ke marker AR yang sudah disediakan.";
              if (arContentType === "model_3d" || arContentType === "model_3d_animated") {
                message = "Arahkan kamera ke marker untuk melihat Model 3D interaktif. Anda bisa menggerakkan HP untuk melihat dari berbagai sudut.";
              }
              alert(message);
            }}
          >
            <Info className="w-6 h-6 text-white" />
          </button>

          {/* Tombol Switch Kamera */}
          {(deviceType === "android" || (deviceType === "other" && hasMultipleCameras)) && !isSwitchingCamera && (
            <button
              onClick={handleSwitchCamera}
              className="absolute top-24 right-6 pointer-events-auto p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Status Scanning */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <div 
              className={`px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-500 flex items-center gap-2.5
                ${markerFound 
                  ? 'bg-green-500/90 text-white' 
                  : modelLoadError
                  ? 'bg-red-500/90 text-white'
                  : 'bg-black/60 text-white/80'
                }`}
            >
              {markerFound ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-medium">
                    {arContentType === "model_3d" || arContentType === "model_3d_animated"
                      ? "Model 3D Terdeteksi"
                      : "Marker Terdeteksi"}
                  </span>
                </>
              ) : modelLoadError ? (
                <>
                  <X className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Gagal Memuat Model
                  </span>
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-medium">
                    {arContentType === "model_3d" || arContentType === "model_3d_animated"
                      ? "Mencari Marker..."
                      : "Mencari Marker..."}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Judul Materi + Info Tipe Konten */}
          {materiData && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center flex flex-col items-center gap-2">
              <h3 className="text-sm font-medium text-white/80 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
                {materiData.judul}
              </h3>
              {arContentInfo.icon && (
                <span className="text-xs font-medium text-white/60 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                  {arContentInfo.icon}
                  {arContentInfo.label}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTAINER A-FRAME */}
      <div
        ref={arContainerRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* ANIMASI SCANLINE */}
      <style>{`
        @keyframes scanline {
          0% { top: 10%; opacity: 0.3; }
          50% { top: 80%; opacity: 1; }
          100% { top: 10%; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
