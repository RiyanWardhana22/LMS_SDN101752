import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSiswa() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const handleChange = (index, value) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleLogin = (e) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length < 6) {
      setErrorMsg("Masukkan 6 huruf/angka kodemu ya!");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      if (fullCode === "ABC123") {
        const userSiswa = { role: "siswa", nama: "Budi", kode: "ABC123" };
        localStorage.setItem("user", JSON.stringify(userSiswa));
        navigate("/siswa/beranda");
      } else {
        setErrorMsg("Yah, kodenya salah. Coba periksa lagi!");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fff3ee] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-black text-neutral-900 mb-2">
          Halo, Teman!
        </h1>
        <p className="text-lg font-bold text-neutral-500 mb-8">
          Masukkan Kode Belajarmu di bawah ini ya!
        </p>

        {errorMsg && (
          <div className="bg-[#fdedec] border-2 border-[#e74c3c] text-[#e74c3c] font-bold px-4 py-3 rounded-2xl mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* 6 Kotak Input Kode */}
          <div className="flex justify-center gap-2 md:gap-3 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-black bg-white border-4 border-neutral-200 rounded-xl focus:border-[#ff6b35] focus:outline-none focus:ring-0 transition-colors shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff6b35] text-white font-black text-xl py-4 rounded-2xl shadow-[0_6px_0_#e54e1b] hover:bg-[#ff8c5a] active:translate-y-[6px] active:shadow-none transition-all"
          >
            {isLoading ? "Tunggu sebentar..." : "Mulai Belajar! 🚀"}
          </button>
        </form>

        {/* Tombol navigasi balik untuk guru/admin */}
        <button
          onClick={() => navigate("/login-staf")}
          className="mt-8 text-neutral-400 font-bold hover:text-[#ff6b35] transition-colors"
        >
          Masuk sebagai Guru / Admin
        </button>
      </div>
    </div>
  );
}
