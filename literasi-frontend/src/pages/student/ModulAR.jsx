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

  // State & refs untuk gesture zoom/rotate model 3D
  const [modelInteractive, setModelInteractive] = useState(false);
  const gestureRef = useRef({
    modelEl: null,
    baseScale: [0.5, 0.5, 0.5],
    baseRotation: [0, 0, 0],
    scaleFactor: 1,
    rotX: 0,
    rotY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    lastPinchDist: null,
    cleanup: null,
  });

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
    if (gestureRef.current.cleanup) {
      gestureRef.current.cleanup();
      gestureRef.current.cleanup = null;
    }
    setModelInteractive(false);

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
      return {
        html: `
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
        `,
        isModel: false,
        baseScale: [0.6, 0.6, 0.6],
        baseRotation: [0, 0, 0],
      };
    }

    const config = outputMedia.model_config || {};

    // Helper: parse string "x y z" menjadi array angka
    const parseVec3 = (str, fallback) => {
      if (!str) return fallback;
      const parts = String(str).trim().split(/\s+/).map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return fallback;
      return parts;
    };

    // ============================================
    // VIDEO CLOUD / VIDEO LINK
    // ============================================
    if (outputMedia.type === "video_cloud" || outputMedia.type === "video_link") {
      return {
        html: `
          <a-video 
            src="${outputMedia.url}" 
            position="0 0 0.1" 
            scale="0.8 0.6 0.6" 
            autoplay="true" 
            loop="true" 
            muted="false"
            crossOrigin="anonymous"
          ></a-video>
        `,
        isModel: false,
        baseScale: [0.8, 0.6, 0.6],
        baseRotation: [0, 0, 0],
      };
    }

    // ============================================
    // IMAGE CLOUD
    // ============================================
    if (outputMedia.type === "image_cloud") {
      return {
        html: `
          <a-image 
            src="${outputMedia.url}" 
            position="0 0 0.1" 
            scale="0.8 0.6 0.6"
            crossOrigin="anonymous"
          ></a-image>
        `,
        isModel: false,
        baseScale: [0.8, 0.6, 0.6],
        baseRotation: [0, 0, 0],
      };
    }

    // ============================================
    // MODEL 3D STATIS (.glb) - PERBAIKAN + GESTURE
    // ============================================
    if (outputMedia.type === "model_3d") {
      const scaleStr = config.scale || "0.5 0.5 0.5";
      const position = config.position || "0 0.1 0.1";
      const rotationStr = config.rotation || "0 0 0";
      const baseScale = parseVec3(scaleStr, [0.5, 0.5, 0.5]);
      const baseRotation = parseVec3(rotationStr, [0, 0, 0]);

      // Pastikan URL valid
      const modelUrl = outputMedia.url;
      if (!modelUrl) {
        return {
          html: `
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
          `,
          isModel: false,
          baseScale: [0.6, 0.6, 0.6],
          baseRotation: [0, 0, 0],
        };
      }

      // Catatan: animasi auto-rotate dari admin dinonaktifkan otomatis
      // begitu user mulai melakukan gesture rotasi manual (lihat setupModelGestures).
      return {
        html: `
          <a-entity
            id="ar-model-entity"
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scaleStr}"
            rotation="${rotationStr}"
            class="ar-interactive-model"
          ></a-entity>
        `,
        isModel: true,
        baseScale,
        baseRotation,
      };
    }

    // ============================================
    // MODEL 3D DENGAN ANIMASI BAWAAN (.glb) - PERBAIKAN + GESTURE
    // ============================================
    if (outputMedia.type === "model_3d_animated") {
      const scaleStr = config.scale || "0.5 0.5 0.5";
      const position = config.position || "0 0.1 0.1";
      const rotationStr = config.rotation || "0 0 0";
      const baseScale = parseVec3(scaleStr, [0.5, 0.5, 0.5]);
      const baseRotation = parseVec3(rotationStr, [0, 0, 0]);

      const modelUrl = outputMedia.url;
      if (!modelUrl) {
        return {
          html: `
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
          `,
          isModel: false,
          baseScale: [0.6, 0.6, 0.6],
          baseRotation: [0, 0, 0],
        };
      }

      return {
        html: `
          <a-entity
            id="ar-model-entity"
            gltf-model="${modelUrl}"
            position="${position}"
            scale="${scaleStr}"
            rotation="${rotationStr}"
            animation-mixer="clip: *; loop: repeat"
            class="ar-interactive-model"
          ></a-entity>
        `,
        isModel: true,
        baseScale,
        baseRotation,
      };
    }

    // Fallback
    return {
      html: `
        <a-box
          position="0 0 0.1"
          scale="0.6 0.6 0.6"
          color="#FF6B35"
          material="emissive: #FF6B35; emissiveIntensity: 0.5"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
        ></a-box>
      `,
      isModel: false,
      baseScale: [0.6, 0.6, 0.6],
      baseRotation: [0, 0, 0],
    };
  }, []);

  // ============================================================
  // GESTURE: ZOOM (PINCH) & ROTASI 360° (DRAG) UNTUK MODEL 3D
  // ============================================================
  const MIN_SCALE_FACTOR = 0.3;
  const MAX_SCALE_FACTOR = 3;
  const DRAG_SENSITIVITY = 0.5; // derajat per px
  const PINCH_SENSITIVITY = 1;

  const setupModelGestures = useCallback((container, modelEl, baseScale, baseRotation) => {
    // Bersihkan listener gesture sebelumnya (kalau ada)
    if (gestureRef.current.cleanup) {
      gestureRef.current.cleanup();
      gestureRef.current.cleanup = null;
    }

    if (!container || !modelEl) {
      setModelInteractive(false);
      return;
    }

    gestureRef.current.modelEl = modelEl;
    gestureRef.current.baseScale = baseScale;
    gestureRef.current.baseRotation = baseRotation;
    gestureRef.current.scaleFactor = 1;
    gestureRef.current.rotX = baseRotation[0];
    gestureRef.current.rotY = baseRotation[1];
    setModelInteractive(true);

    const applyTransform = () => {
      const g = gestureRef.current;
      const el = g.modelEl;
      if (!el) return;
      const s = g.scaleFactor;
      el.setAttribute(
        "scale",
        `${g.baseScale[0] * s} ${g.baseScale[1] * s} ${g.baseScale[2] * s}`
      );
      el.setAttribute("rotation", `${g.rotX} ${g.rotY} ${g.baseRotation[2]}`);
    };

    // Hentikan animasi auto-rotate/mixer bawaan begitu user mulai interaksi manual
    const stopAutoAnimation = () => {
      const el = gestureRef.current.modelEl;
      if (!el) return;
      if (el.hasAttribute("animation")) el.removeAttribute("animation");
      if (el.hasAttribute("animation__rotate")) el.removeAttribute("animation__rotate");
    };

    const getTouchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e) => {
      const g = gestureRef.current;
      if (e.touches.length === 1) {
        g.isDragging = true;
        g.lastX = e.touches[0].clientX;
        g.lastY = e.touches[0].clientY;
        g.lastPinchDist = null;
      } else if (e.touches.length === 2) {
        g.isDragging = false;
        g.lastPinchDist = getTouchDist(e.touches);
      }
    };

    const onTouchMove = (e) => {
      const g = gestureRef.current;
      if (e.touches.length === 2) {
        // PINCH TO ZOOM
        e.preventDefault();
        const dist = getTouchDist(e.touches);
        if (g.lastPinchDist != null) {
          const delta = (dist - g.lastPinchDist) * 0.005 * PINCH_SENSITIVITY;
          g.scaleFactor = Math.min(
            MAX_SCALE_FACTOR,
            Math.max(MIN_SCALE_FACTOR, g.scaleFactor + delta)
          );
          applyTransform();
        }
        g.lastPinchDist = dist;
      } else if (e.touches.length === 1 && g.isDragging) {
        // DRAG UNTUK ROTASI 360°
        e.preventDefault();
        stopAutoAnimation();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const deltaX = x - g.lastX;
        const deltaY = y - g.lastY;
        g.rotY = (g.rotY + deltaX * DRAG_SENSITIVITY) % 360;
        g.rotX = (g.rotX + deltaY * DRAG_SENSITIVITY) % 360;
        g.lastX = x;
        g.lastY = y;
        applyTransform();
      }
    };

    const onTouchEnd = (e) => {
      const g = gestureRef.current;
      if (e.touches.length === 0) {
        g.isDragging = false;
        g.lastPinchDist = null;
      } else if (e.touches.length === 1) {
        g.lastPinchDist = null;
        g.isDragging = true;
        g.lastX = e.touches[0].clientX;
        g.lastY = e.touches[0].clientY;
      }
    };

    // Dukungan mouse untuk testing di desktop
    let mouseDragging = false;
    const onMouseDown = (e) => {
      mouseDragging = true;
      gestureRef.current.lastX = e.clientX;
      gestureRef.current.lastY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!mouseDragging) return;
      stopAutoAnimation();
      const g = gestureRef.current;
      const deltaX = e.clientX - g.lastX;
      const deltaY = e.clientY - g.lastY;
      g.rotY = (g.rotY + deltaX * DRAG_SENSITIVITY) % 360;
      g.rotX = (g.rotX + deltaY * DRAG_SENSITIVITY) % 360;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      applyTransform();
    };
    const onMouseUp = () => { mouseDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      const g = gestureRef.current;
      const delta = -e.deltaY * 0.0008 * PINCH_SENSITIVITY;
      g.scaleFactor = Math.min(
        MAX_SCALE_FACTOR,
        Math.max(MIN_SCALE_FACTOR, g.scaleFactor + delta)
      );
      applyTransform();
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    // Izinkan container menerima sentuhan (di-override dari pointer-events default)
    container.style.touchAction = "none";
    container.style.pointerEvents = "auto";

    gestureRef.current.cleanup = () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
    };

    // Terapkan transform awal
    applyTransform();
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
    const entityData = generateEntityHTML(arOutputMedia);
    const entityHTML = entityData.html;

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

    // Pasang gesture zoom (pinch) & rotasi 360° (drag) khusus untuk model 3D
    if (entityData.isModel) {
      const modelEl = scene.querySelector("#ar-model-entity");
      setupModelGestures(
        arContainerRef.current,
        modelEl,
        entityData.baseScale,
        entityData.baseRotation
      );
    } else {
      setModelInteractive(false);
      if (gestureRef.current.cleanup) {
        gestureRef.current.cleanup();
        gestureRef.current.cleanup = null;
      }
    }

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

    // ============================================================
    // FIX ANDROID: paksa MindAR menghitung ulang ukuran video/canvas
    // saat viewport berubah (address bar muncul/hilang, rotasi layar).
    // Ini penyebab umum video kamera tidak sejajar dengan box marker.
    // ============================================================
    let resizeDebounce = null;
    const handleViewportResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        try {
          const mindar = scene.systems['mindar-image'];
          // beberapa versi mindar-image-aframe expose controller.resize()
          mindar?.controller?.resize?.();
          // trigger native resize supaya a-frame renderer & mindar
          // internal recalculation ikut jalan
          window.dispatchEvent(new Event('resize'));
        } catch (_) {}
      }, 150);
    };
    window.addEventListener("resize", handleViewportResize);
    window.addEventListener("orientationchange", handleViewportResize);

    // Cleanup ref
    cleanupRef.current = () => {
      scene.removeEventListener("renderstart", onRenderStart);
      scene.removeEventListener("cameraStart", onCameraStart);
      scene.removeEventListener("cameraError", onCameraError);
      scene.removeEventListener('model-error', () => {});
      scene.removeEventListener('model-loaded', () => {});
      window.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("orientationchange", handleViewportResize);
      if (resizeDebounce) clearTimeout(resizeDebounce);
      if (cameraStartTimeoutRef.current) {
        clearTimeout(cameraStartTimeoutRef.current);
        cameraStartTimeoutRef.current = null;
      }
    };

  }, [arTargetUrl, arOutputMedia, facingMode, cleanupAR, generateEntityHTML, setupModelGestures]);

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

          {/* Hint gesture: pinch zoom & drag rotate untuk model 3D */}
          {modelInteractive && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white/80 text-xs font-medium px-4 py-2 rounded-full">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Geser untuk putar &bull; Cubit untuk zoom</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTAINER A-FRAME */}
      <div
        id="ar-container"
        ref={arContainerRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />

      {/* ANIMASI SCANLINE + FIX POSISI KAMERA MINDAR */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        @keyframes scanline {
          0% { top: 10%; opacity: 0.3; }
          50% { top: 80%; opacity: 1; }
          100% { top: 10%; opacity: 0.3; }
        }

        /* ============================================================
           FIX: Video kamera & canvas MindAR sering tidak full-screen
           di Android karena tidak diberi CSS eksplisit oleh library.
           Paksa keduanya menutupi seluruh container & sejajar dgn
           box scan marker (yang posisinya absolute inset-0).
        ============================================================ */
        #ar-container,
        #ar-container a-scene {
          position: absolute !important;
          inset: 0 !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }

        #ar-container video,
        #ar-container canvas.a-canvas,
        #ar-container canvas {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          max-width: none !important;
          object-fit: cover !important;
          -o-object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}