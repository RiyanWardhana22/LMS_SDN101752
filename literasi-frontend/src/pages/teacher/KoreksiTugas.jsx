import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiEndpoint } from "../../config/api";
import {
  CaretLeft,
  UsersThree,
  FloppyDisk,
  CheckCircle,
} from "@phosphor-icons/react";

export default function KoreksiTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [infoTugas, setInfoTugas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputNilai, setInputNilai] = useState({});
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          apiEndpoint(`api/tugas/submissions.php?tugas_id=${id}`),
        );
        const data = await response.json();
        if (data.status === "success") {
          setInfoTugas(data.info_tugas);
          setSubmissions(data.data);
          const initNilai = {};
          data.data.forEach((sub) => {
            if (sub.nilai !== null) initNilai[sub.id] = sub.nilai;
          });
          setInputNilai(initNilai);
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: data.message });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Koneksi Terputus",
          text: "Gagal memuat data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  const handleSimpanNilai = async (pengumpulanId) => {
    const nilai = inputNilai[pengumpulanId];
    if (
      nilai === undefined ||
      nilai === "" ||
      isNaN(nilai) ||
      nilai < 0 ||
      nilai > 100
    ) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Valid",
        text: "Masukkan angka nilai dari 0 hingga 100.",
      });
      return;
    }

    try {
      const response = await fetch(apiEndpoint("api/tugas/grade.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengumpulan_id: pengumpulanId,
          nilai: parseInt(nilai),
        }),
      });
      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: data.message,
          showConfirmButton: false,
          timer: 2000,
        });
        setSubmissions(
          submissions.map((s) =>
            s.id === pengumpulanId ? { ...s, nilai: parseInt(nilai) } : s,
          ),
        );
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan nilai.",
      });
    }
  };

  return (
    <DashboardLayout role="guru" title="Koreksi Tugas">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <button
            onClick={() => navigate("/guru/tugas")}
            className="text-neutral-500 hover:text-[#ff6b35] font-bold p-2 transition-colors"
          >
            <CaretLeft weight="bold" size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-900 leading-none mb-1">
              {infoTugas ? infoTugas.judul : "Memuat..."}
            </h2>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              {infoTugas
                ? infoTugas.tipe === "kuis"
                  ? "Kuis Pilihan Ganda (Auto Grade)"
                  : "Tugas Esai (Manual Grade)"
                : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-bold text-neutral-400 animate-pulse">
            Menarik data dari meja siswa...
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-neutral-100 shadow-sm flex flex-col items-center">
            <UsersThree
              size={64}
              weight="thin"
              className="text-neutral-300 mb-4"
            />
            <h3 className="text-xl font-black text-neutral-900 mb-2">
              Belum Ada Pengumpulan
            </h3>
            <p className="font-bold text-neutral-500">
              Belum ada siswa yang mengerjakan tugas ini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-wider">
                    <th className="p-5 w-1/4">Nama Siswa</th>
                    <th className="p-5 w-1/4">Dikumpulkan</th>
                    <th className="p-5 w-1/3">Jawaban</th>
                    <th className="p-5 text-center w-1/6">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-neutral-50/80 transition-colors"
                    >
                      <td className="p-5 font-bold text-neutral-900">
                        {sub.nama_siswa}
                      </td>
                      <td className="p-5 font-semibold text-neutral-500">
                        {new Date(sub.dikumpulkan_pada).toLocaleString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="p-5">
                        {infoTugas.tipe === "kuis" ? (
                          <span className="text-xs font-bold text-[#3498db] bg-[#ebf5fb] px-3 py-1 rounded-lg">
                            Format Kuis (Sistem)
                          </span>
                        ) : (
                          <div className="p-3 bg-neutral-50 rounded-xl text-neutral-700 max-h-32 overflow-y-auto whitespace-pre-wrap border border-neutral-200 text-xs font-medium">
                            {sub.jawaban}
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {infoTugas.tipe === "kuis" ? (
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#eafaf1] text-[#2ecc71] font-black text-lg shadow-sm border border-[#2ecc71]/20">
                            {sub.nilai}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={
                                inputNilai[sub.id] !== undefined
                                  ? inputNilai[sub.id]
                                  : ""
                              }
                              onChange={(e) =>
                                setInputNilai({
                                  ...inputNilai,
                                  [sub.id]: e.target.value,
                                })
                              }
                              className={`w-20 text-center font-black text-lg px-2 py-2 rounded-xl outline-none border-2 transition-colors ${sub.nilai !== null ? "border-[#2ecc71] bg-[#eafaf1] text-[#2ecc71]" : "border-neutral-200 focus:border-[#ff6b35] text-neutral-700"}`}
                            />
                            {sub.nilai === null ||
                            inputNilai[sub.id] !== sub.nilai ? (
                              <button
                                onClick={() => handleSimpanNilai(sub.id)}
                                className="flex items-center gap-1 text-[10px] font-bold px-3 py-1 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
                              >
                                <FloppyDisk weight="fill" /> Simpan
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-[#2ecc71]">
                                <CheckCircle weight="fill" /> Tersimpan
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
