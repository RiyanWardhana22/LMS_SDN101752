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
        {/* Rute Default sekarang adalah Portal Login Siswa */}
        <Route path="/" element={<LoginSiswa />} />

        {/* Rute Login Admin/Guru kita pindah ke path /login-staf */}
        <Route path="/login-staf" element={<Login />} />

        {/* Halaman Beranda Siswa (Placeholder sementara) */}
        <Route
          path="/siswa/beranda"
          element={
            <h1 className="p-8 text-2xl font-black">
              Selamat Datang di Peta Dunia LiteraSI! 🌍
            </h1>
          }
        />

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
      </Routes>
    </Router>
  );
}

export default App;
