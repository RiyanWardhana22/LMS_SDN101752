import { useNavigate } from "react-router-dom";

export default function DashboardGuru() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border-l-4 border-[#ff6b35] p-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
          Meja Kerja Digital Guru
        </h1>
        <p className="text-neutral-500 mb-6">
          Halo, {user?.username}! Siap mengajar hari ini?
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
