import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  GameController,
  PenNib,
  Clock,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";

export default function RuangEvaluasi() {
  const navigate = useNavigate();
  const [tugasList, setTugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTugas = async () => {
      try {
        const response = await fetch(
          "http://localhost/lms_sdn101752/literasi-backend/api/tugas/read_public.php",
        );
        const data = await response.json();

        if (data.status === "success") {
          setTugasList(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Tidak dapat memuat tugas dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTugas();
  }, []);

  return (
    <StudentLayout title="Ruang Evaluasi">
      <div className="max-w-7xl mx-auto w-full pb-12">
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-3xl p-8 mb-8 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              Waktunya Menguji Kemampuanmu! 🎯
            </h2>
            <p className="font-medium opacity-90 max-w-lg leading-relaxed text-sm md:text-base">
              Kerjakan kuis dan tugas di bawah ini sebelum batas waktunya habis.
              Tunjukkan bahwa kamu adalah siswa terbaik!
            </p>
          </div>
          <GameController
            weight="duotone"
            size={160}
            className="absolute -right-8 -bottom-12 opacity-20 transform -rotate-12 hidden md:block"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 font-bold text-neutral-400 animate-pulse text-lg">
            Memuat daftar tugas... ⏳
          </div>
        ) : tugasList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-neutral-100 flex flex-col items-center max-w-2xl mx-auto">
            <CheckCircle
              size={64}
              weight="fill"
              className="text-[#2ecc71] mb-4"
            />
            <h3 className="text-xl font-black text-neutral-900 mb-2">
              Hore! Tidak Ada Tugas
            </h3>
            <p className="font-bold text-neutral-500">
              Semua tugas sudah diselesaikan atau belum ada tugas baru dari
              guru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tugasList.map((tugas) => {
              const isKuis = tugas.tipe === "kuis";
              return (
                <div
                  key={tugas.id}
                  className={`bg-white rounded-3xl p-6 border-2 flex flex-col h-full min-h-[240px] transition-all duration-300 ${
                    tugas.is_expired
                      ? "border-neutral-200 opacity-75"
                      : "border-neutral-100 hover:-translate-y-1 hover:shadow-xl cursor-pointer " +
                        (isKuis
                          ? "hover:border-[#3498db]/50 hover:shadow-[#3498db]/10"
                          : "hover:border-[#ff6b35]/50 hover:shadow-[#ff6b35]/10")
                  }`}
                  onClick={() => {
                    if (!tugas.is_expired) {
                      navigate(`/siswa/kerjakan/${tugas.id}`);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-2xl ${isKuis ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                    >
                      {isKuis ? (
                        <GameController weight="fill" size={24} />
                      ) : (
                        <PenNib weight="fill" size={24} />
                      )}
                    </div>
                    {tugas.is_expired ? (
                      <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-100">
                        Waktu Habis
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${isKuis ? "bg-[#3498db] text-white" : "bg-[#ff6b35] text-white"}`}
                      >
                        {isKuis ? "Kuis Pilihan Ganda" : "Tugas Esai"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-neutral-900 mb-4 line-clamp-3 leading-snug flex-1">
                    {tugas.judul}
                  </h3>

                  <div className="mt-4 pt-4 border-t border-neutral-100 shrink-0">
                    <div
                      className={`flex items-center gap-2 text-xs font-bold ${tugas.is_expired ? "text-red-500" : "text-neutral-500"}`}
                    >
                      {tugas.is_expired ? (
                        <WarningCircle weight="bold" size={16} />
                      ) : (
                        <Clock weight="bold" size={16} />
                      )}
                      {tugas.is_expired ? "Ditutup: " : "Tenggat: "}
                      {new Date(tugas.tenggat).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
