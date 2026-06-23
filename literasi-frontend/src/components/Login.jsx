import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoint } from "../config/api";

export default function Login() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleCekKredensial = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(
        apiEndpoint("api/auth/verify_credentials.php"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        console.log("Token Anda (Cek Database/Console ini):", data.debug_token);
      } else {
        setErrorMsg(data.message || "Gagal login. Periksa kembali data Anda.");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(apiEndpoint("api/auth/verify_token.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "guru") {
          navigate("/guru/dashboard");
        }
      } else {
        setErrorMsg(data.message || "Token salah atau kadaluarsa.");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5ff] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-neutral-900">
            Portal Guru & Admin
          </h2>
          <p className="text-sm font-bold text-neutral-500 mt-1">
            Silakan masuk ke akun Anda
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCekKredensial} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-slate-700"
                placeholder="Masukkan username"
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
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-slate-700"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff6b35] hover:bg-[#e85f2b] text-white font-bold text-base py-3 rounded-xl shadow-[0_4px_0_#cc521d] active:translate-y-1 active:shadow-none transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Lanjutkan"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyToken} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">
                Token 6 Digit
              </label>
              <input
                type="text"
                maxLength="6"
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-center tracking-widest text-2xl text-slate-700"
                placeholder="------"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff6b35] hover:bg-[#e85f2b] text-white font-bold text-base py-3 rounded-xl shadow-[0_4px_0_#cc521d] active:translate-y-1 active:shadow-none transition-all cursor-pointer mt-2 disabled:opacity-50"
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
              className="w-full text-neutral-500 cursor-pointer font-bold text-sm py-2 mt-1 hover:text-[#ff6b35] transition-colors"
            >
              ← Kembali ke awal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
