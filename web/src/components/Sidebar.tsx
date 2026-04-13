import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: "speed", label: "Dashboard", fill: true },
  { to: "/athletes", icon: "groups", label: "Atletas" },
  { to: "/exercises", icon: "fitness_center", label: "Librería de Ejercicios" },
  { to: "/routines", icon: "edit_calendar", label: "Rutinas" },
];

const bottomItems = [
  { to: "/settings", icon: "settings", label: "Ajustes" },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-tc-surface-container-lowest flex flex-col border-r border-white/5 transition-transform duration-300 z-[60] 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Brand */}
        <div className="px-6 pt-8 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-tc-primary-fixed font-headline uppercase tracking-tighter">
              TrainifyConnect
            </h1>
            <p className="font-headline uppercase text-[10px] tracking-widest text-tc-outline mt-1">
              Tactical Dashboard
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden text-tc-outline hover:text-white cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

      {/* Coach Profile */}
      <div className="px-6 py-4 flex items-center gap-4 bg-tc-surface">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-tc-surface-container-highest flex items-center justify-center shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span
              className="material-symbols-outlined text-tc-primary-fixed text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-headline uppercase text-sm tracking-widest text-tc-primary-fixed font-bold truncate">
            {user?.displayName || "Master Coach"}
          </p>
          <p className="text-[10px] text-white/60 uppercase tracking-widest truncate">
            {user?.email || "Performance Lab"}
          </p>
          <p className="text-[10px] text-tc-secondary font-headline flex items-center gap-1 mt-1">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
            Security Active
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex flex-col gap-1 px-3 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `font-headline uppercase text-sm tracking-widest flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "text-tc-primary-fixed font-bold border-l-4 border-tc-primary-fixed bg-tc-surface-container-highest/30"
                  : "text-white/50 hover:text-white hover:bg-tc-surface-container-low pl-5"
              }`
            }
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: item.fill
                  ? "'FILL' 1"
                  : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 space-y-2">
        <button 
          onClick={() => navigate("/athletes/new")}
          className="w-full py-3 bg-tc-primary-fixed text-tc-on-primary-fixed font-headline font-bold text-xs tracking-widest flex items-center justify-center gap-2 rounded-sm active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          NUEVO ATLETA
        </button>

        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `font-headline uppercase text-sm tracking-widest flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "text-tc-primary-fixed font-bold"
                  : "text-white/50 hover:text-white hover:bg-tc-surface-container-low"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* System Status and Logout */}
      <div className="px-4 pb-6 border-t border-white/5 pt-4">
        <button
          onClick={() => {
            // Note: In real app we should import useAuth and call logout. Let's do that at the top.
            logout();
          }}
          className="w-full mb-4 py-2 bg-tc-error/10 text-tc-error hover:bg-tc-error hover:text-tc-on-error font-headline font-bold text-xs tracking-widest flex items-center justify-center gap-2 rounded-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          CERRAR SESIÓN
        </button>
        <div className="bg-tc-surface-container-highest/30 p-4 rounded-lg">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
            System Status
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-tc-secondary">Online</span>
            <span className="w-2 h-2 rounded-full bg-tc-secondary shadow-[0_0_8px_#00e3fd]" />
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
