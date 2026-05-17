import StudentLayout from "../../components/layout/StudentLayout";
import { LockKey, Star } from "@phosphor-icons/react";
export default function BerandaSiswa() {
  const wilayahBelajar = [
    {
      id: 1,
      nama: "Hutan Bahasa",
      warna: "#ff6b9d",
      icon: "📖",
      status: "selesai",
      stars: 3,
    },
    {
      id: 2,
      nama: "Pulau Matematika",
      warna: "#4ecdc4",
      icon: "➗",
      status: "aktif",
      progress: 60,
    },
    {
      id: 3,
      nama: "Kota Sains (IPA)",
      warna: "#2ecc71",
      icon: "🔬",
      status: "terkunci",
    },
    {
      id: 4,
      nama: "Desa Sosial (IPS)",
      warna: "#e67e22",
      icon: "🌍",
      status: "terkunci",
    },
    {
      id: 5,
      nama: "Puncak PKn",
      warna: "#e74c3c",
      icon: "🇮🇩",
      status: "terkunci",
    },
  ];

  return (
    <StudentLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-neutral-900 mb-2">
          Peta Petualangan
        </h1>
        <p className="text-neutral-500 font-bold">
          Ayo selesaikan misimu hari ini!
        </p>
      </div>

      {/* Kontainer Peta dengan garis putus-putus di belakangnya */}
      <div className="relative pb-10 flex flex-col items-center">
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-4 border-l-8 border-dashed border-neutral-200 -z-10"></div>
        {wilayahBelajar.map((wilayah, index) => {
          const isLeft = index % 2 === 0;
          const transformClass =
            index === 0 ? "" : isLeft ? "-translate-x-12" : "translate-x-12";

          return (
            <div
              key={wilayah.id}
              className={`relative mb-12 flex flex-col items-center w-full ${transformClass}`}
            >
              {/* Nama Pulau (Tooltip) */}
              <div
                className={`mb-3 px-4 py-1.5 rounded-xl font-bold text-sm border-2 shadow-sm ${wilayah.status === "terkunci" ? "bg-neutral-100 text-neutral-400 border-neutral-200" : "bg-white text-neutral-800"}`}
                style={{
                  borderColor:
                    wilayah.status !== "terkunci" ? wilayah.warna : "",
                }}
              >
                {wilayah.nama}
              </div>

              {/* Tombol Node Pulau */}
              <button
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-transform active:scale-95 ${
                  wilayah.status === "aktif" ? "animate-bounce" : ""
                }`}
                style={{
                  backgroundColor:
                    wilayah.status === "terkunci" ? "#e5e7eb" : wilayah.warna,
                  boxShadow:
                    wilayah.status === "terkunci"
                      ? "0 6px 0 #d1d5db"
                      : `0 8px 0 ${wilayah.warna}80`,
                  border: "4px solid white",
                }}
              >
                {/* Konten Ikon */}
                {wilayah.status === "terkunci" ? (
                  <LockKey
                    weight="fill"
                    size={32}
                    className="text-neutral-400"
                  />
                ) : (
                  <span>{wilayah.icon}</span>
                )}

                {/* Bintang jika sudah selesai */}
                {wilayah.status === "selesai" && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-yellow-400 shadow-sm">
                    <Star weight="fill" size={20} className="text-yellow-400" />
                  </div>
                )}
              </button>

              {/* Progress bar di bawah pulau jika sedang aktif */}
              {wilayah.status === "aktif" && (
                <div className="mt-4 w-32 h-3 bg-neutral-200 rounded-full overflow-hidden border border-neutral-300">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${wilayah.progress}%`,
                      backgroundColor: wilayah.warna,
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Peti Harta Karun di ujung jalan */}
        <div className="mt-4 w-20 h-20 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-2xl flex items-center justify-center text-4xl shadow-[0_8px_0_#b45309] border-4 border-white z-10">
          🎁
        </div>
      </div>
    </StudentLayout>
  );
}
