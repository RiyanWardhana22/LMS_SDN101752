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
        <Route path="/login-staf" element={<Login />} />
        <Route
          path="/siswa/beranda"
          element={
            <ProtectedRoute allowedRoles={["siswa"]}>
              <BerandaSiswa />
            </ProtectedRoute>
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
