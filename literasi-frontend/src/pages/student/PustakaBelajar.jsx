import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  BookOpen,
  MagnifyingGlass,
  CaretRight,
  RocketLaunch,
} from "@phosphor-icons/react";
import { apiEndpoint } from "../../config/api";

export default function PustakaBelajar() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const response = await fetch(apiEndpoint("api/materi/read_public.php"));
        const data = await response.json();
        if (data.status === "success") {
          setMateriList(data.data);
        } else {
          Swal.fire({ icon: "error", title: "Oops", text: data.message });
        }
      } catch (error) {
        console.error("Gagal memuat materi", error);
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Tidak dapat memuat materi dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMateri();
  }, []);

  const filteredMateri = materiList.filter(
    (m) =>
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const getTheme = (mapel) => {
    if (mapel.includes("IPA"))
      return {
        bg: "bg-[#eafaf1]",
        text: "text-[#2ecc71]",
        border: "border-[#2ecc71]/30",
        shadow: "shadow-[#2ecc71]/20",
      };
    if (mapel.includes("Matematika"))
      return {
        bg: "bg-[#ebf5fb]",
        text: "text-[#3498db]",
        border: "border-[#3498db]/30",
        shadow: "shadow-[#3498db]/20",
      };
    if (mapel.includes("IPS"))
      return {
        bg: "bg-[#fef5e7]",
        text: "text-[#e67e22]",
        border: "border-[#e67e22]/30",
        shadow: "shadow-[#e67e22]/20",
      };
    return {
      bg: "bg-[#fdedec]",
      text: "text-[#e74c3c]",
      border: "border-[#e74c3c]/30",
      shadow: "shadow-[#e74c3c]/20",
    };
  };

  return (
    <StudentLayout title="Pustaka Belajar">
      <div className="relative mb-8 max-w-xl mx-auto">
        <MagnifyingGlass
          size={24}
          weight="bold"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Cari nama pelajaran atau judul materi..."
          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-neutral-200 focus:border-[#4ecdc4] focus:ring-0 outline-none transition-colors font-bold text-neutral-700 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid Materi */}
      {isLoading ? (
        <div className="text-center py-12 font-bold text-neutral-400 animate-pulse text-lg">
          Sedang menyiapkan buku pelajaranmu... 📚
        </div>
      ) : filteredMateri.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-neutral-100 flex flex-col items-center">
          <BookOpen size={64} weight="thin" className="text-neutral-300 mb-4" />
          <p className="font-bold text-neutral-500 text-lg">
            Belum ada materi yang tersedia saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMateri.map((materi) => {
            const theme = getTheme(materi.mata_pelajaran);
            return (
              <div
                key={materi.id}
                className={`bg-white rounded-3xl p-6 border-2 border-neutral-100 hover:${theme.border} hover:shadow-lg transition-all duration-300 group flex flex-col cursor-pointer`}
                onClick={() => navigate(`/siswa/materi/${materi.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}
                  >
                    {materi.mata_pelajaran}
                  </span>
                  <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">
                    {materi.kelas}
                  </span>
                </div>

                <h3 className="text-xl font-black text-neutral-900 mb-4 group-hover:text-[#4ecdc4] transition-colors line-clamp-3 leading-tight">
                  {materi.judul}
                </h3>

                <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">
                    {new Date(materi.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <button
                    className={`w-8 h-8 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <CaretRight weight="bold" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
