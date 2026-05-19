import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  CaretLeft,
  FloppyDisk,
  ListChecks,
  FileText,
  Plus,
  Trash,
} from "@phosphor-icons/react";

export default function FormTugas() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState("tugas");
  const [tenggat, setTenggat] = useState("");
  const [deskripsiTugas, setDeskripsiTugas] = useState("");
  const [soalKuis, setSoalKuis] = useState([
    { id: Date.now(), pertanyaan: "", a: "", b: "", c: "", d: "", kunci: "a" },
  ]);
  const tambahSoal = () => {
    setSoalKuis([
      ...soalKuis,
      {
        id: Date.now(),
        pertanyaan: "",
        a: "",
        b: "",
        c: "",
        d: "",
        kunci: "a",
      },
    ]);
  };

  const hapusSoal = (id) => {
    if (soalKuis.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Kuis minimal harus memiliki 1 soal!",
      });
      return;
    }
    setSoalKuis(soalKuis.filter((soal) => soal.id !== id));
  };
  const updateSoal = (id, field, value) => {
    setSoalKuis(
      soalKuis.map((soal) =>
        soal.id === id ? { ...soal, [field]: value } : soal,
      ),
    );
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!judul || !tenggat) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Pastikan Judul dan Tenggat Waktu sudah terisi!",
      });
      return;
    }

    setIsSaving(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      guru_id: user.id,
      judul,
      tipe,
      tenggat,
      deskripsi: tipe === "tugas" ? deskripsiTugas : JSON.stringify(soalKuis),
    };

    try {
      const response = await fetch(
        "http://localhost/lms_sdn101752/literasi-backend/api/tugas/create.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const textRes = await response.text();
      const data = JSON.parse(textRes);

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil Diterbitkan!",
          text: data.message,
          confirmButtonColor: "#2ecc71",
        }).then(() => navigate("/guru/tugas"));
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Koneksi Putus",
        text: "Gagal menghubungi server database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="guru" title="Buat Evaluasi Baru">
      <form
        onSubmit={handleSave}
        className="max-w-4xl mx-auto flex flex-col gap-6 pb-12"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <button
            type="button"
            onClick={() => navigate("/guru/tugas")}
            className="flex items-center gap-2 text-neutral-500 hover:text-[#ff6b35] font-bold text-sm"
          >
            <CaretLeft weight="bold" size={20} /> Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl shadow-[0_4px_0_#1e8449]"
          >
            <FloppyDisk weight="bold" size={20} />{" "}
            {isSaving ? "Menyimpan..." : "Terbitkan Sekarang"}
          </button>
        </div>

        {/* Panel Pengaturan Utama */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Masukkan Judul Tugas / Kuis..."
            required
            className="w-full text-3xl font-black text-neutral-900 border-none focus:ring-0 outline-none bg-transparent"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            {/* Tipe Evaluasi Switcher */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2">
                Tipe Evaluasi
              </label>
              <div className="flex bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTipe("tugas")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${tipe === "tugas" ? "bg-white text-[#ff6b35] shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  Tugas (Esai)
                </button>
                <button
                  type="button"
                  onClick={() => setTipe("kuis")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${tipe === "kuis" ? "bg-white text-[#3498db] shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  Kuis (Pilihan Ganda)
                </button>
              </div>
            </div>

            {/* Tenggat Waktu */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2">
                Tenggat Waktu Pengumpulan
              </label>
              <input
                type="datetime-local"
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-bold text-neutral-700 outline-none focus:border-[#ff6b35]"
                value={tenggat}
                onChange={(e) => setTenggat(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* AREA RENDER DINAMIS BERDASARKAN TIPE */}
        {/* ========================================= */}

        {tipe === "tugas" ? (
          /* TAMPILAN JIKA PILIH "TUGAS" */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
            <label className="block text-sm font-black text-neutral-900 mb-4">
              Instruksi & Deskripsi Tugas
            </label>
            <div className="h-[300px] mb-10">
              <ReactQuill
                theme="snow"
                value={deskripsiTugas}
                onChange={setDeskripsiTugas}
                style={{ height: "100%" }}
                placeholder="Tuliskan instruksi tugas, bahan bacaan, atau soal esai di sini..."
              />
            </div>
          </div>
        ) : (
          /* TAMPILAN JIKA PILIH "KUIS" */
          <div className="flex flex-col gap-6">
            {soalKuis.map((soal, index) => (
              <div
                key={soal.id}
                className="bg-white rounded-3xl p-6 shadow-sm border-2 border-neutral-100 relative group"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <h3 className="font-black text-neutral-900 text-lg">
                    Soal Nomor {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => hapusSoal(soal.id)}
                    className="text-neutral-400 hover:text-[#e74c3c] bg-neutral-50 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  >
                    <Trash weight="bold" size={20} />
                  </button>
                </div>

                {/* Input Pertanyaan */}
                <textarea
                  placeholder="Ketik pertanyaan kuis di sini..."
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm font-bold text-neutral-800 outline-none focus:border-[#3498db] resize-none h-24 mb-6"
                  value={soal.pertanyaan}
                  onChange={(e) =>
                    updateSoal(soal.id, "pertanyaan", e.target.value)
                  }
                ></textarea>

                {/* Grid Opsi A, B, C, D */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["a", "b", "c", "d"].map((opsi) => (
                    <div
                      key={opsi}
                      className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-colors ${soal.kunci === opsi ? "border-[#2ecc71] bg-[#eafaf1]" : "border-neutral-100 bg-white"}`}
                    >
                      {/* Radio Button untuk Kunci Jawaban */}
                      <input
                        type="radio"
                        name={`kunci-${soal.id}`}
                        value={opsi}
                        checked={soal.kunci === opsi}
                        onChange={() => updateSoal(soal.id, "kunci", opsi)}
                        className="w-5 h-5 ml-2 accent-[#2ecc71] cursor-pointer"
                        title="Jadikan Kunci Jawaban"
                      />
                      <span className="font-black text-neutral-400 uppercase">
                        {opsi}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Jawaban opsi ${opsi.toUpperCase()}`}
                        required
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none"
                        value={soal[opsi]}
                        onChange={(e) =>
                          updateSoal(soal.id, opsi, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                {/* Indikator Tips Kunci Jawaban */}
                <p className="text-[11px] font-bold text-neutral-400 mt-4 text-center">
                  💡 Klik bulatan (radio button) di sebelah kiri opsi untuk
                  memilih{" "}
                  <span className="text-[#2ecc71]">
                    Kunci Jawaban yang Benar
                  </span>
                  .
                </p>
              </div>
            ))}

            {/* Tombol Tambah Soal */}
            <button
              type="button"
              onClick={tambahSoal}
              className="w-full py-4 border-2 border-dashed border-[#3498db] text-[#3498db] font-black text-sm rounded-3xl hover:bg-[#ebf5fb] transition-colors flex items-center justify-center gap-2"
            >
              <Plus weight="bold" size={20} /> Tambah Soal Berikutnya
            </button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
}
