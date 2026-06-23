import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CaretLeft, UsersThree, Plus } from "@phosphor-icons/react";
import { apiEndpoint } from "../config/api";

export default function LoginSiswa() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [kelasInfo, setKelasInfo] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleVerifyRombel = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6)
      return setErrorMsg("Masukkan 6 huruf/angka kodemu ya!");
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(apiEndpoint("api/auth/verify_rombel.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode_unik: fullCode }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setKelasInfo(data.kelas);
        setSiswaList(data.siswa);
        setStep(2);
      } else setErrorMsg(data.message);
    } catch (error) {
      setErrorMsg("Jaringan terputus. Coba periksa koneksi internetmu ya!");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePilihKarakter = async (siswa) => {
    const { value: pin } = await Swal.fire({
      title: `Halo, ${siswa.nama.split(" ")[0]}!`,
      text: "Masukkan 4 Angka PIN Rahasiamu",
      input: "password",
      inputAttributes: {
        maxlength: 4,
        inputmode: "numeric",
        pattern: "[0-9]*",
      },
      showCancelButton: true,
      confirmButtonText: "Masuk",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3498db",
      customClass: { input: "text-center text-3xl tracking-widest font-black" },
    });

    if (pin) {
      setIsLoading(true);
      try {
        const response = await fetch(apiEndpoint("api/auth/login_siswa.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: siswa.id,
            rombel_id: kelasInfo.id,
            pin: pin,
          }),
        });
        const data = await response.json();

        if (data.status === "success") {
          localStorage.setItem("user", JSON.stringify(data.user));
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 2000,
          }).then(() => navigate("/siswa/beranda"));
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Gagal", text: "Koneksi terputus." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDaftarBaru = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Pendaftaran Siswa",
      html:
        '<p class="text-sm text-neutral-500 mb-4">Tulis namamu dan buat 4 angka rahasia untuk masuk nanti!</p>' +
        '<input id="swal-nama" class="swal2-input border-2 border-neutral-200 rounded-xl" placeholder="Nama Lengkapmu">' +
        '<input id="swal-pin" type="password" class="swal2-input border-2 border-neutral-200 rounded-xl text-center tracking-widest text-xl font-black" placeholder="Buat PIN 4 Angka" maxlength="4" inputmode="numeric">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Daftar Sekarang!",
      confirmButtonColor: "#2ecc71",
      preConfirm: () => {
        const nama = document.getElementById("swal-nama").value;
        const pin = document.getElementById("swal-pin").value;
        if (!nama || !pin || pin.length < 4) {
          Swal.showValidationMessage("Nama dan 4 Angka PIN wajib diisi!");
          return false;
        }
        return { nama, pin };
      },
    });

    if (formValues) {
      setIsLoading(true);
      try {
        const response = await fetch(
          apiEndpoint("api/auth/register_siswa.php"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: formValues.nama,
              pin: formValues.pin,
              rombel_id: kelasInfo.id,
            }),
          },
        );
        const data = await response.json();

        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: data.message,
            confirmButtonColor: "#3498db",
          });
          setSiswaList([...siswaList, data.siswa]);
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: data.message });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Gagal", text: "Koneksi terputus." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fff3ee] flex flex-col items-center justify-center p-4">
      {step === 1 && (
        <div className="w-full max-w-md text-center animate-fade-in">
          <h1 className="text-4xl font-black text-neutral-900 mb-2">
            Halo, Teman!
          </h1>
          <p className="text-lg font-bold text-neutral-500 mb-8">
            Masukkan <span className="text-[#ff6b35]">Kode Kelasmu</span> di
            bawah ini ya!
          </p>

          {errorMsg && (
            <div className="bg-[#fdedec] border-2 border-[#e74c3c] text-[#e74c3c] font-bold px-4 py-3 rounded-2xl mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleVerifyRombel}>
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
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-black bg-white border-4 border-neutral-200 rounded-xl focus:border-[#ff6b35] focus:outline-none focus:ring-0 transition-colors shadow-sm uppercase"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff6b35] cursor-pointer text-white font-black text-xl py-4 rounded-2xl shadow-[0_6px_0_#e54e1b] hover:bg-[#ff8c5a] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoading ? "Mencari Kelas..." : "Cari Kelasku"}
            </button>
          </form>

          <button
            onClick={() => navigate("/login-staf")}
            className="mt-8 text-neutral-400 font-bold hover:text-[#ff6b35] cursor-pointer transition-colors"
          >
            Masuk sebagai Guru / Admin
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-4xl animate-fade-in flex flex-col h-[90vh]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 font-bold text-neutral-500 hover:text-[#ff6b35] transition-colors"
            >
              <CaretLeft weight="bold" size={20} /> Kembali
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-neutral-200 shadow-sm">
              <UsersThree weight="fill" className="text-[#3498db]" size={24} />
              <span className="font-black text-neutral-800">
                {kelasInfo?.nama_kelas}
              </span>
            </div>
          </div>

          <div className="text-center mb-8 shrink-0">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2">
              Pilih Namamu!
            </h2>
            <p className="font-bold text-neutral-500">
              Klik avatarmu dan masukkan PIN rahasiamu.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
              {siswaList.map((siswa) => (
                <button
                  key={siswa.id}
                  disabled={isLoading}
                  onClick={() => handlePilihKarakter(siswa)}
                  className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-4 border-neutral-100 hover:border-[#4ecdc4] hover:shadow-[0_8px_0_#4ecdc4] transition-all cursor-pointer group disabled:opacity-50"
                >
                  {siswa.foto_profile ? (
                    <img
                      src={siswa.foto_profile}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-neutral-100 group-hover:border-[#4ecdc4] transition-colors"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4ecdc4] to-[#2ecc71] flex items-center justify-center text-white font-black text-3xl shadow-sm border-4 border-transparent group-hover:border-[#eafaf1] transition-all">
                      {siswa.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-black text-neutral-800 text-lg group-hover:text-[#4ecdc4] transition-colors text-center line-clamp-1 w-full">
                    {siswa.nama.split(" ")[0]}
                  </span>
                </button>
              ))}

              <button
                disabled={isLoading}
                onClick={handleDaftarBaru}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-[#ebf5fb] rounded-3xl border-4 border-dashed border-[#3498db] hover:bg-[#d6eaf8] cursor-pointer group disabled:opacity-50"
              >
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#3498db] shadow-sm">
                  <Plus weight="bold" size={32} />
                </div>
                <span className="font-black text-[#3498db] text-lg text-center">
                  Saya Siswa Baru
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
