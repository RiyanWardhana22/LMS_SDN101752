import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaTrophy,
  FaBrain,
  FaCube,
  FaChartLine,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowRight,
} from "react-icons/fa";
import { apiEndpoint } from "../config/api";

const AnimatedCounter = ({ endValue, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return <>{count}</>;
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    pengunjung: 0,
  });

  const heroSlides = [
    "/images/bgsklh.jpg",
    "/images/kelas.jpg",
    "/images/ar.jpg",
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(apiEndpoint("api/admin/dashboard_stats.php"));
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            setStats({
              siswa: data.data.summary?.siswa || 378,
              guru: data.data.summary?.guru || 18,
              pengunjung: data.data.aktivitas?.[0]?.kunjungan || 542,
            });
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data statistik:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-[#ff6b35] selection:text-white">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span
              className={`text-2xl font-black tracking-tight ${isScrolled ? "text-slate-800" : "text-white"}`}
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              SDN{" "}
              <span
                className={`${isScrolled ? "text-[#ff6b35]" : "text-[#FFD700]"}`}
              >
                101752
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login-siswa"
              className={`font-bold transition-colors ${isScrolled ? "text-slate-600 hover:text-[#ff6b35]" : "text-white/90 hover:text-white"}`}
            >
              Ruang Siswa
            </Link>
            <Link
              to="/login-staf"
              className={`px-6 py-2.5 rounded-full font-bold transition-all ${isScrolled ? "bg-[#ff6b35] text-white shadow-md hover:-translate-y-0.5" : "bg-white text-[#ff6b35] shadow-lg hover:bg-slate-50"}`}
            >
              Portal Guru
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative h-screen min-h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-400">
          {heroSlides.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Latar Belakang Sekolah ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover mix-blend-overlay transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20 flex flex-col items-center text-center mt-16">
          <h1
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Eksplorasi Dunia Belajar <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF8C5A]">
              Tanpa Batas
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link
              to="/login-siswa"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white font-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {" "}
              Masuk Kelas
            </Link>
            <Link
              to="/login-staf"
              className="w-full sm:w-auto px-8 py-4 bg-transparent backdrop-blur-sm text-white font-black rounded-full border-2 border-white/50 hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 text-lg"
            >
              Ruang Guru
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 translate-y-1">
          <svg
            className="relative block w-full h-[80px] md:h-[120px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.63,196.36,108.84,242.65,98.37,284.14,73.1,321.39,56.44Z"
              fill="#f8fafc"
            ></path>
          </svg>
        </div>
      </section>

      <section className="py-12 bg-slate-50 relative z-30 -mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row justify-around items-center gap-10">
            <div className="flex flex-col items-center text-center group">
              <div className="p-5 bg-blue-50 text-blue-500 rounded-2xl mb-4 group-hover:-translate-y-2 transition-transform">
                <FaUserGraduate size={32} />
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-1">
                <AnimatedCounter endValue={stats.siswa} />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                Siswa Terdaftar
              </p>
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-100"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="p-5 bg-emerald-50 text-emerald-500 rounded-2xl mb-4 group-hover:-translate-y-2 transition-transform">
                <FaChalkboardTeacher size={32} />
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-1">
                <AnimatedCounter endValue={stats.guru} duration={1500} />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                Guru Pengajar
              </p>
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-100"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="p-5 bg-orange-50 text-orange-500 rounded-2xl mb-4 group-hover:-translate-y-2 transition-transform">
                <FaChartLine size={32} />
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-1">
                <AnimatedCounter endValue={stats.pengunjung} duration={2500} />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                Total Kunjungan
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-[#3498db] rounded-[2rem] transform translate-x-4 translate-y-4 opacity-10"></div>
            <div className="relative z-10 w-full rounded-[2rem] bg-slate-200 shadow-2xl h-[400px] overflow-hidden flex items-center justify-center">
              <img
                src="/images/about.jpg"
                alt="Tentang Sekolah"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center text-slate-400">
                <FaBookOpen size={48} className="mb-4" />
                <span className="font-bold">Foto Profil Sekolah</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-[#ff6b35] text-white rounded-xl">
                <FaTrophy size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">
                  Kurikulum SD Merdeka
                </p>
                <p className="text-xs font-bold text-slate-500">
                  Mendukung Digitalisasi
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-wider mb-4">
              Tentang Kami
            </div>
            <h2
              className="text-3xl md:text-4xl font-black text-slate-800 mb-6 leading-snug"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              Membawa Ruang Kelas ke Genggaman Tangan Anda.
            </h2>
            <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
              Kami percaya bahwa pendidikan harus beradaptasi dengan
              perkembangan zaman. LMS ini dirancang khusus untuk memenuhi
              kebutuhan siswa dan guru SDN 101752 Kelambir Lima dalam menghadapi
              era revolusi industri 4.0.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Materi pelajaran interaktif yang mudah diakses kapan saja.",
                "Bank soal dan evaluasi kuis dengan koreksi otomatis.",
                "Sistem pemantauan perkembangan nilai secara transparan.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FaArrowRight size={10} />
                  </div>
                  <span className="font-bold text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login-siswa"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-black hover:bg-[#ff6b35] transition-colors"
            >
              Mulai Petualangan <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h4 className="text-[#3498db] font-black uppercase tracking-wider mb-2">
              Keunggulan Sistem
            </h4>
            <h2
              className="text-3xl md:text-4xl font-black text-slate-800 mb-4"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              Teknologi Pendidikan Modern
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Fitur-fitur inovatif yang dirancang untuk meningkatkan minat baca
              dan pemahaman konseptual siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-[#fff3ee] text-[#ff6b35] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#ff6b35] group-hover:text-white transition-colors">
                <FaCube size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">
                Augmented Reality (AR)
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Visualisasikan materi pelajaran secara 3D langsung dari kamera
                smartphone. Belajar sains dan matematika menjadi lebih nyata dan
                menyenangkan!
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-[#ebf5fb] text-[#3498db] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3498db] group-hover:text-white transition-colors">
                <FaBrain size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">
                Evaluasi & Kuis Cerdas
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Uji kemampuanmu dengan kuis pilihan ganda dan tugas esai. Nilai
                langsung diproses oleh sistem untuk memudahkan guru memberikan
                feedback.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-[#eafaf1] text-[#2ecc71] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] group-hover:text-white transition-colors">
                <FaTrophy size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">
                Sistem Gamifikasi (XP)
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Kumpulkan Experience Points (XP) setiap kali menyelesaikan
                tugas, naikkan levelmu, dan raih badge kebanggaan di profil
                studimu!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER PROFESIONAL ================= */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t-4 border-[#FF6B35]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-800 pb-16 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-3xl font-black tracking-tight text-white"
                  style={{ fontFamily: "'Fredoka One', sans-serif" }}
                >
                  SDN 101752
                </span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-6">
                Membangun ekosistem pendidikan digital yang interaktif dan
                menyenangkan untuk mencetak generasi cerdas berkarakter.
              </p>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-6">
                Akses Cepat
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/login-siswa"
                    className="text-slate-400 hover:text-[#ff6b35] font-bold transition-colors flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>{" "}
                    Portal Siswa
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login-staf"
                    className="text-slate-400 hover:text-[#3498db] font-bold transition-colors flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3498db]"></span>{" "}
                    Ruang Guru & Admin
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-6">
                Hubungi Kami
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-slate-400 font-medium">
                  <FaMapMarkerAlt
                    size={18}
                    className="text-[#2ecc71] shrink-0 mt-1"
                  />
                  <span>
                    Jl. Kelambir Lima No. 123, Kab. Deli Serdang, Sumatera
                    Utara.
                  </span>
                </li>
                <li className="flex items-center gap-4 text-slate-400 font-medium">
                  <FaPhoneAlt size={18} className="text-[#3498db] shrink-0" />
                  <span>(061) 1234-5678</span>
                </li>
                <li className="flex items-center gap-4 text-slate-400 font-medium">
                  <FaEnvelope size={18} className="text-[#ff6b35] shrink-0" />
                  <span>info@sdn101752.sch.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-slate-500 text-sm font-bold">
            <p>
              &copy; {new Date().getFullYear()} LMS SDN 101752 Kelambir Lima.
              Hak Cipta Dilindungi.
            </p>
            <p>Developed with ❤️ for Education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
