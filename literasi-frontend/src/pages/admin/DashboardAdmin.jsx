import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-8 border border-neutral-100">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
          Dasbor Admin
        </h1>
        <p className="text-neutral-500 mb-6">
          Selamat datang kembali, {user?.username}!
        </p>
        <button
          onClick={handleLogout}
          className="btn-primary px-6 py-2 rounded-xl font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
