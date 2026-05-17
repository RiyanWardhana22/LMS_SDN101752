import { useState } from "react";

export default function Login() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const handleCekKredensial = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verify_credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        console.log("Token Anda (Cek Database/Console ini):", data.debug_token);
      } else {
        setErrorMsg(data.message || "Gagal login. Periksa kembali data Anda.");
      }
    } catch (err) {
      setErrorMsg(
        "Tidak dapat terhubung ke server. Pastikan Laragon berjalan.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk Langkah 2: Verifikasi Token
  const handleVerifikasiToken = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verify_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Berhasil login! Selamat datang, ${data.user.role}`);
      } else {
        setErrorMsg(data.message || "Token tidak valid.");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(255,107,53,0.12)] w-full max-w-md overflow-hidden relative border border-neutral-100">
        {errorMsg && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm z-10 text-center animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* Slider Kontainer untuk Multi-Langkah */}
        <div
          className="flex w-[200%] transition-transform duration-500 ease-in-out z-10 relative pt-20"
          style={{
            transform: step === 1 ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          {/* --- LANGKAH 1: FORM KREDENSIAL --- */}
          <div className="w-1/2 p-8">
            <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
              Portal Guru & Admin
            </h2>
            <p className="text-neutral-500 mb-6">
              Masukkan data diri untuk melanjutkan ke LiteraSI.
            </p>

            <form onSubmit={handleCekKredensial} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-medium text-lg"
                  placeholder="Ketik username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-medium text-lg"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary font-bold text-lg py-3 rounded-2xl mt-4"
              >
                {isLoading ? "Memeriksa..." : "Lanjutkan"}
              </button>
            </form>
          </div>

          {/* --- LANGKAH 2: FORM TOKEN VERIFIKASI --- */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
              Verifikasi Keamanan
            </h2>
            <p className="text-neutral-500 mb-6">
              Kami telah menghasilkan token untuk sesi Anda. Silakan cek
              console/database.
            </p>

            <form onSubmit={handleVerifikasiToken} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">
                  Token 6 Digit
                </label>
                <input
                  type="text"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-center tracking-widest text-2xl"
                  placeholder="------"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} // Hanya angka
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary font-bold text-lg py-3 rounded-2xl mt-4"
              >
                {isLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setToken("");
                  setErrorMsg("");
                }}
                className="w-full text-neutral-500 font-bold text-sm py-2 mt-2 hover:text-[#ff6b35] transition-colors"
              >
                ← Kembali ke awal
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
