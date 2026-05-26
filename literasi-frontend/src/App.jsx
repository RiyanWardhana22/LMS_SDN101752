import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardGuru from "./pages/teacher/DashboardGuru";
import LoginSiswa from "./components/LoginSiswa";
import BerandaSiswa from "./pages/student/BerandaSiswa";
import ModulAR from "./pages/student/ModulAR";
import ManajemenMateri from "./pages/teacher/ManajemenMateri";
import WorkshopAI from "./pages/teacher/WorkshopAI";
import FormMateri from "./pages/teacher/FormMateri";
import EditMateri from "./pages/teacher/EditMateri";
import ManajemenTugas from "./pages/teacher/ManajemenTugas";
import FormTugas from "./pages/teacher/FormTugas";
import PustakaBelajar from "./pages/student/PustakaBelajar";
import RuangBaca from "./pages/student/RuangBaca";
import RuangEvaluasi from "./pages/student/RuangEvaluasi";
import LembarKerja from "./pages/student/LembarKerja";
import KoreksiTugas from "./pages/teacher/KoreksiTugas";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSiswa />} />
        {/* ADMIN */}
        <Route path="/login-staf" element={<Login />} />

        {/* SISWA */}
        <Route
          path="/siswa/beranda"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <BerandaSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/ar"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <ModulAR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/materi"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <PustakaBelajar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/materi/:id"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <RuangBaca />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/evaluasi"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <RuangEvaluasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/kerjakan/:id"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <LembarKerja />
            </ProtectedRoute>
          }
        />

        {/* GURU */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/dashboard"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <DashboardGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/materi"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <ManajemenMateri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/materi/tambah"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <FormMateri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/materi/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <EditMateri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/tugas"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <ManajemenTugas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/tugas/tambah"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <FormTugas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/tugas/koreksi/:id"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <KoreksiTugas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/workshop-ai"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <WorkshopAI />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
