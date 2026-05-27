import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ChartLineUp,
  Student,
  ClipboardText,
  Calculator,
} from "@phosphor-icons/react";

export default function BukuNilai() {
  const [tasks, setTasks] = useState([]);
  const [report, setReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const localUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchGradebook = async () => {
      try {
        const response = await fetch(
          `http://localhost/lms_sdn101752/literasi-backend/api/tugas/gradebook.php?guru_id=${localUser.id}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          setTasks(data.tasks);
          setReport(data.report);
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: data.message });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal terhubung ke server.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (localUser.id) fetchGradebook();
  }, [localUser.id]);

  const calculateAverage = (gradesObj) => {
    let total = 0;
    let count = 0;
    Object.values(gradesObj).forEach((val) => {
      if (val !== null && val !== "") {
        total += parseFloat(val);
        count++;
      }
    });
    return count === 0 ? 0 : Math.round(total / count);
  };

  const getTaskAverage = (taskId) => {
    let total = 0;
    let count = 0;
    report.forEach((student) => {
      const val = student.grades[taskId];
      if (val !== null && val !== "") {
        total += parseFloat(val);
        count++;
      }
    });
    return count === 0 ? 0 : Math.round(total / count);
  };

  const classOverallAverage =
    report.length === 0
      ? 0
      : Math.round(
          report.reduce(
            (sum, student) => sum + calculateAverage(student.grades),
            0,
          ) / report.length,
        );

  return (
    <DashboardLayout role="guru" title="Buku Nilai & Analitik">
      <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-8">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-green-500 rounded-sm p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-400 text-sm mb-1">
                  Rata-Rata Kelas
                </p>
                <h3 className="text-4xl font-black">{classOverallAverage}</h3>
              </div>
              <ChartLineUp weight="duotone" size={56} className="opacity-50" />
            </div>

            <div className="bg-white border-2 border-indigo-500 rounded-sm p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-400 text-sm mb-1">
                  Total Siswa Aktif
                </p>
                <h3 className="text-4xl font-black text-neutral-800">
                  {report.length}
                </h3>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl text-neutral-300">
                <Student weight="fill" size={32} />
              </div>
            </div>

            <div className="bg-white border-2 border-cyan-500 rounded-sm p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-400 text-sm mb-1">
                  Evaluasi Diterbitkan
                </p>
                <h3 className="text-4xl font-black text-neutral-800">
                  {tasks.length}
                </h3>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl text-neutral-300">
                <ClipboardText weight="fill" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Matriks Buku Nilai */}
        <div className="bg-white rounded-sm border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20 font-bold text-neutral-400 animate-pulse">
              Menghitung kalkulasi nilai...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 font-medium">
              Belum ada tugas atau kuis yang diterbitkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-neutral-50 border-b-2 border-neutral-100">
                    <th className="p-5 text-sm font-black text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-50 z-10 border-r border-neutral-100 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                      Nama Siswa
                    </th>
                    {tasks.map((task) => (
                      <th
                        key={task.id}
                        className="p-5 text-center min-w-[140px] border-r border-neutral-100"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase ${task.tipe === "kuis" ? "bg-[#ebf5fb] text-[#3498db]" : "bg-[#fff3ee] text-[#ff6b35]"}`}
                          >
                            {task.tipe}
                          </span>
                          <span
                            className="text-sm font-bold text-neutral-700 truncate w-32"
                            title={task.judul}
                          >
                            {task.judul}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="p-5 text-center text-sm font-black text-[#2ecc71] uppercase tracking-wider bg-[#eafaf1]/50">
                      Rata-Rata Siswa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm font-semibold">
                  <tr className="bg-[#f8f9fa] border-b-2 border-neutral-200">
                    <td className="p-4 font-black text-neutral-600 sticky left-0 bg-[#f8f9fa] z-10 border-r border-neutral-100 flex items-center gap-2">
                      Rata-Rata Tugas
                    </td>
                    {tasks.map((task) => (
                      <td
                        key={`avg-${task.id}`}
                        className="p-4 text-center font-black text-neutral-700 border-r border-neutral-100"
                      >
                        {getTaskAverage(task.id)}
                      </td>
                    ))}
                    <td className="p-4 text-center font-black text-[#2ecc71] bg-[#eafaf1]/50">
                      {classOverallAverage}
                    </td>
                  </tr>

                  {/* Render Baris Nilai per Siswa */}
                  {report.map((student) => {
                    const studentAvg = calculateAverage(student.grades);
                    return (
                      <tr
                        key={student.siswa_id}
                        className="hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="p-4 font-bold text-neutral-900 sticky left-0 bg-white z-10 border-r border-neutral-100 shadow-[4px_0_12px_rgba(0,0,0,0.01)]">
                          {student.nama_siswa}
                        </td>

                        {tasks.map((task) => {
                          const nilai = student.grades[task.id];
                          return (
                            <td
                              key={`${student.siswa_id}-${task.id}`}
                              className="p-4 text-center border-r border-neutral-100"
                            >
                              {nilai === null ? (
                                <span className="text-neutral-300 text-xs font-bold">
                                  -
                                </span>
                              ) : (
                                <span
                                  className={`inline-block px-3 py-1 rounded-lg font-black text-sm ${nilai < 60 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}
                                >
                                  {nilai}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-4 text-center font-black text-neutral-800 bg-[#eafaf1]/20">
                          {studentAvg}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
