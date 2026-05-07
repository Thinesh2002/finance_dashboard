import { NavLink, useMatch, useResolvedPath } from "react-router-dom";
import {
  User,
  Package,
  PlusSquare,
  Tags,
  ShoppingBag,
  GitBranch,
  ClipboardList,
  BarChart3,
  Warehouse,
  FileText,
  X
} from "lucide-react";

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-60 h-full bg-[#020618] border-r border-white/5 flex flex-col">
      <div className="lg:hidden flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-[#1a1a1c] text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 py-2">
        <MenuTitle title="Finance" />
        <MenuItem to="/finance-create" icon={ShoppingBag} label="Update Finance Details" onClick={onClose} />
        
        <MenuTitle title="Users" />
        <MenuItem to="/user-dashboard" icon={User} label="User Dashboard" onClick={onClose} />
      </nav>
    </aside>
  );
}

function MenuTitle({ title }) {
  return (
    <p className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-t border-white/5 mt-2 first:border-t-0 first:mt-0">
      {title}
    </p>
  );
}

function MenuItem({ to, icon: Icon, label, onClick }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  const isActive = !!match;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: linkActive }) =>
        `
        flex items-center gap-3 px-6 py-2.5 text-[13px] font-medium transition-all duration-200
        ${linkActive
          ? "bg-[#020618] text-[#06dda4] border-l-2 border-[#099670] shadow-[inset_10px_0px_20px_-15px_rgba(59,130,246,0.5)]"
          : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
        }
        `
      }
    >
      <Icon 
        size={16} 
        className={`${isActive ? "text-[#099670]" : "text-slate-500"} shrink-0 transition-colors`} 
      />
      <span>{label}</span>
    </NavLink>
  );
}