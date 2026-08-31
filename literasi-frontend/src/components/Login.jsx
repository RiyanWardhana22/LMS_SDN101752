import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoint } from "../config/api";
import Swal from "sweetalert2";

export default function Login() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(data.user));
        storage.setItem("token", data.token);

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

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(
        apiEndpoint("api/auth/forgot_password.php"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        setForgotStep(2);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Kode pemulihan telah dikirim ke email Anda.",
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        setErrorMsg(data.message || "Email tidak ditemukan.");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(apiEndpoint("api/auth/reset_password.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          token: forgotToken,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kata sandi Anda telah diperbarui. Silakan login.",
          confirmButtonColor: "#ff6b35",
        }).then(() => {
          setIsForgotMode(false);
          setForgotStep(1);
          setForgotEmail("");
          setForgotToken("");
          setNewPassword("");
        });
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
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 animate-fade-in relative overflow-hidden">
        {isForgotMode ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-neutral-900">
                Pemulihan Akun
              </h2>
              <p className="text-sm font-bold text-neutral-500 mt-1">
                {forgotStep === 1
                  ? "Masukkan email yang terdaftar"
                  : "Buat kata sandi baru Anda"}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold mb-4 text-center">
                {errorMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form
                onSubmit={handleForgotPasswordRequest}
                className="flex flex-col gap-4 animate-fade-in"
              >
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-slate-700"
                    placeholder="nama@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ff6b35] hover:bg-[#e85f2b] text-white font-bold text-base py-3 rounded-xl shadow-[0_4px_0_#cc521d] active:translate-y-1 active:shadow-none transition-all cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? "Mengirim Kode..." : "Kirim Kode Pemulihan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setErrorMsg("");
                  }}
                  className="w-full text-neutral-500 cursor-pointer font-bold text-sm py-2 mt-1 hover:text-[#ff6b35] transition-colors"
                >
                  ← Kembali ke Login
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-4 animate-fade-in"
              >
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">
                    Kode 6 Digit dari Email
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-center tracking-widest text-2xl text-slate-700"
                    placeholder="------"
                    value={forgotToken}
                    onChange={(e) =>
                      setForgotToken(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#ff6b35] focus:ring-0 outline-none transition-colors font-bold text-slate-700"
                    placeholder="Masukkan sandi baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ff6b35] hover:bg-[#e85f2b] text-white font-bold text-base py-3 rounded-xl shadow-[0_4px_0_#cc521d] active:translate-y-1 active:shadow-none transition-all cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? "Memproses..." : "Simpan Kata Sandi"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setErrorMsg("");
                  }}
                  className="w-full text-neutral-500 cursor-pointer font-bold text-sm py-2 mt-1 hover:text-[#ff6b35] transition-colors"
                >
                  ← Kembali
                </button>
              </form>
            )}
          </>
        ) : (
          <>
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
              <form
                onSubmit={handleCekKredensial}
                className="flex flex-col gap-4 animate-fade-in"
              >
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

                {/* CHECKBOX INGAT SAYA & LINK LUPA PASSWORD */}
                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#ff6b35] border-neutral-300 rounded focus:ring-[#ff6b35] cursor-pointer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-neutral-600">
                      Ingat Saya
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setErrorMsg("");
                    }}
                    className="text-sm font-bold text-[#ff6b35] hover:text-[#e85f2b] transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
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
              <form
                onSubmit={handleVerifyToken}
                className="flex flex-col gap-4 animate-fade-in"
              >
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
                    onChange={(e) =>
                      setToken(e.target.value.replace(/\D/g, ""))
                    }
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
          </>
        )}
      </div>
    </div>
  );
}
