import { useState, useRef, useEffect } from "react";
import {
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../../config/auth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = getStoredUser();

  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@example.com";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md">
   
     

      <div className="relative flex h-16 items-center justify-between px-6">
        
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3 transition-all cursor-pointer"
        >
      
          <h1 className="text-[21px] font-bold text-[#ffffff]">
            FINANCE DASHBOARD
          </h1>
        </button>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              className={`flex items-center gap-3 rounded-full border border-white/5 bg-white/5 pl-1 pr-3 py-1 transition-all hover:bg-white/10 hover:border-white/20 ${
                open ? "ring-2 ring-blue-500/50 bg-white/10" : ""
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border border-white/10">
                <User size={16} className="text-blue-400" />
              </div>
              
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-gray-200">{userName}</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu with Glow Effect */}
            {open && (
              <div className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 mb-1 border-b border-white/5">
                  <p className="text-sm font-bold text-white">{userName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                </div>

                <div className="space-y-1">
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-blue-500/10 hover:text-blue-400 group">
                    <Settings size={16} className="group-hover:rotate-45 transition-transform" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-all hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}