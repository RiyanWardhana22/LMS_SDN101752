import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { List, Screencast } from "@phosphor-icons/react";

export default function DashboardLayout({
  children,
  role,
  title,
  isFullScreenChat = false,
}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmartboard, setIsSmartboard] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1920) setIsSmartboard(true);
  }, []);

  return (
    <div
      className={`flex h-[100dvh] bg-[#f5f5ff] overflow-hidden ${isSmartboard ? "smartboard-mode" : ""}`}
    >
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {!isFullScreenChat && (
          <header className="h-[64px] sm:h-[72px] bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
            <div className="flex items-center gap-3 lg:gap-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <List size={28} weight="bold" />
              </button>
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 truncate max-w-[200px] sm:max-w-none">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => setIsSmartboard(!isSmartboard)}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-bold text-xs transition-colors ${
                  isSmartboard
                    ? "border-[#ff6b35] bg-[#fff3ee] text-[#ff6b35]"
                    : "border-neutral-200 text-neutral-400 hover:text-neutral-700"
                }`}
              >
                <Screencast size={18} weight="bold" />
                Smartboard Mode
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-neutral-900">
                    {user.nama}
                  </p>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>

                {user.foto_profile ? (
                  <img
                    src={user.foto_profile}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(255,107,53,0.2)]"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] rounded-full border-2 border-white shadow-[0_2px_8px_rgba(255,107,53,0.2)] flex items-center justify-center text-white font-black text-xl">
                    {user.nama ? user.nama.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        <main
          className={`flex-1 flex flex-col overflow-hidden ${isFullScreenChat ? "p-0 bg-white" : "p-4 sm:p-6 lg:p-8 overflow-y-auto"}`}
        >
          <div
            className={
              isFullScreenChat
                ? "flex-1 flex flex-col w-full h-full"
                : "max-w-7xl mx-auto pb-10 w-full"
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
