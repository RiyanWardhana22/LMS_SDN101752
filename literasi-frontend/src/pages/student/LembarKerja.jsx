import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  CaretLeft,
  PaperPlaneRight,
  CheckCircle,
  WarningCircle,
  Check,
  Circle,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function LembarKerja() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tugas, setTugas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [jawabanTugas, setJawabanTugas] = useState("");
  const [jawabanKuis, setJawabanKuis] = useState({});
  const [soalParsed, setSoalParsed] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          apiEndpoint(`api/tugas/detail.php?id=${id}`),
        );
        const data = await response.json();
        if (data.status === "success") {
          setTugas(data.data);
          if (data.data.tipe === "kuis") {
            setSoalParsed(JSON.parse(data.data.deskripsi));
          }
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
          navigate("/siswa/evaluasi");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat tugas.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handlePilihOpsi = (soalId, opsi) => {
    setJawabanKuis({ ...jawabanKuis, [soalId]: opsi });
  };

  const handleSubmit = async () => {
    if (
      tugas.tipe === "kuis" &&
      Object.keys(jawabanKuis).length < soalParsed.length
    ) {
      Swal.fire({
        icon: "warning",
        title: "Belum Selesai",
        text: "Masih ada soal kuis yang belum kamu jawab!",
      });
      return;
    }
    if (tugas.tipe === "tugas" && jawabanTugas.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Jawaban Kosong",
        text: "Tulis jawabanmu terlebih dahulu sebelum mengumpulkan.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Kumpulkan Sekarang?",
      text: "Pastikan jawabanmu sudah benar karena tidak bisa diulang!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3498db",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Ya, Kumpulkan! 🚀",
      cancelButtonText: "Cek Lagi",
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;
    setIsSubmitting(true);
    let nilaiAkhir = null;
    let payloadJawaban = jawabanTugas;

    if (tugas.tipe === "kuis") {
      let benar = 0;
      soalParsed.forEach((soal) => {
        if (jawabanKuis[soal.id] === soal.kunci) benar++;
      });
      nilaiAkhir = Math.round((benar / soalParsed.length) * 100);
      payloadJawaban = JSON.stringify(jawabanKuis);
    }
    try {
      const response = await fetch(apiEndpoint("api/tugas/submit.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tugas_id: tugas.id,
          siswa_id: user.id,
          jawaban: payloadJawaban,
          nilai: nilaiAkhir,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        Swal.fire({
          title: "Kerja Bagus! 🎉",
          text:
            tugas.tipe === "kuis"
              ? `Kamu mendapatkan nilai: ${nilaiAkhir}`
              : "Tugas esai berhasil dikirim ke Meja Guru.",
          icon: "success",
          confirmButtonColor: "#2ecc71",
        }).then(() => navigate("/siswa/evaluasi"));
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Jaringan Putus",
        text: "Jawaban gagal dikirim.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <StudentLayout title="Lembar Kerja">
        <div className="text-center py-20 font-bold text-neutral-400 animate-pulse text-lg">
          Membagikan lembar soal... 📝
        </div>
      </StudentLayout>
    );
  if (!tugas) return null;

  return (
    <StudentLayout title="Lembar Kerja">
      <div className="max-w-4xl mx-auto pb-12">
        <button
          onClick={() => navigate("/siswa/evaluasi")}
          className="flex items-center gap-2 text-neutral-500 hover:text-[#ff6b35] font-bold text-sm mb-6 transition-colors"
        >
          <CaretLeft weight="bold" size={20} /> Kembali ke Ruang Evaluasi
        </button>

        <div className="bg-white rounded-3xl p-8 mb-6 shadow-sm border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-3">
              <span
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${tugas.tipe === "kuis" ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
              >
                {tugas.tipe === "kuis" ? "Kuis Pilihan Ganda" : "Tugas Esai"}
              </span>
              <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                <WarningCircle weight="bold" /> Tenggat:{" "}
                {new Date(tugas.tenggat).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900">
              {tugas.judul}
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 shadow-lg transition-all ${isSubmitting ? "bg-neutral-400 cursor-not-allowed" : "bg-[#2ecc71] hover:scale-105 active:scale-95"}`}
          >
            {isSubmitting ? (
              "Mengirim..."
            ) : (
              <>
                Kumpulkan Jawaban <PaperPlaneRight weight="fill" />
              </>
            )}
          </button>
        </div>

        {/* AREA TUGAS ESAI */}
        {tugas.tipe === "tugas" && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
            <div className="prose prose-neutral max-w-none mb-8 border-b-2 border-dashed border-neutral-200 pb-8">
              <div dangerouslySetInnerHTML={{ __html: tugas.deskripsi }}></div>
            </div>
            <h3 className="font-black text-neutral-900 text-lg mb-4">
              Lembar Jawaban Siswa
            </h3>
            <textarea
              placeholder="Ketik jawaban lengkapmu di sini..."
              className="w-full h-64 bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-6 text-neutral-800 font-medium outline-none focus:border-[#3498db] focus:bg-white transition-all resize-none"
              value={jawabanTugas}
              onChange={(e) => setJawabanTugas(e.target.value)}
            ></textarea>
          </div>
        )}

        {/* AREA KUIS PILIHAN GANDA */}
        {tugas.tipe === "kuis" && (
          <div className="flex flex-col gap-6">
            {soalParsed.map((soal, index) => (
              <div
                key={soal.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-[#3498db] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <h3 className="font-black text-neutral-400 text-sm mb-2">
                  Soal Nomor {index + 1}
                </h3>
                <p className="text-lg font-bold text-neutral-900 mb-6 leading-relaxed">
                  {soal.pertanyaan}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["a", "b", "c", "d"].map((opsi) => {
                    const isSelected = jawabanKuis[soal.id] === opsi;
                    return (
                      <div
                        key={opsi}
                        onClick={() => handlePilihOpsi(soal.id, opsi)}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${
                          isSelected
                            ? "bg-[#ebf5fb] border-[#3498db] shadow-[0_4px_0_#2980b9] translate-y-[-2px]"
                            : "bg-white border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? "text-[#3498db]" : "text-neutral-300"}`}
                        >
                          {isSelected ? (
                            <CheckCircle weight="fill" size={24} />
                          ) : (
                            <Circle weight="bold" size={24} />
                          )}
                        </div>
                        <span className="font-semibold text-neutral-800 text-sm">
                          {soal[opsi]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
