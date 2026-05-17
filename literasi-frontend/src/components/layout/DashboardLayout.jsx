import Sidebar from "./Sidebar";
export default function DashboardLayout({ children, role, title }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="flex min-h-screen bg-[#f5f5ff]">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[64px] bg-white border-b border-neutral-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-extrabold text-neutral-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-neutral-900">
                {user?.username}
              </p>
              <p className="text-xs font-semibold text-neutral-500 capitalize">
                {role}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#4ecdc4] to-[#3498db] rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </header>

        {/* Area Render Halaman */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
