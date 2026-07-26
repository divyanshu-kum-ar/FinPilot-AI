import { useEffect } from "react";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  Settings,
  Wallet,
  User,
  TrendingUp,
  X,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const isCollapsed = false;

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/transactions", icon: Wallet, label: "Transactions" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/ai-insights", icon: Brain, label: "AI Insights" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/profile", icon: Settings, label: "Settings" }, // Styled as navigation placeholder
  ];

  // Listen to Escape key press to close the sidebar drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <div>
      {/* Overlay Backdrop (Visible on all viewports, dark semi-transparent with very subtle blur) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#050816]/70 backdrop-blur-[1.5px] z-40 transition-opacity duration-300"
          onClick={onToggle}
        ></div>
      )}

      <div
        className={`
          bg-white dark:bg-[#08101f] shadow-2xl border-r border-gray-100 dark:border-white/5
          transition-transform duration-300 ease-in-out flex flex-col
          fixed top-0 left-0 h-full z-50
          w-[85vw] max-w-[280px] md:w-72
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Branding & Close Button */}
        <div className="flex items-center h-16 px-5 border-b border-gray-100 dark:border-white/5 justify-between select-none">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>FinPilot AI</span>
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none transition-all duration-200"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="px-3 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && 
                !(item.label === "Settings" && location.pathname === "/profile");

              return (
                <div key={item.label + index} className="relative group">
                  <Link
                    to={item.path}
                    onClick={onToggle} // Automatically close sidebar on item selection
                    className={`
                      flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200
                      ${isCollapsed ? "justify-center" : ""}
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/15"
                          : "text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-100 rounded-xl hover:scale-[1.01]"
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {!isCollapsed && <span className="ml-3.5">{item.label}</span>}
                  </Link>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full shadow-glow"></div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer Credits */}
        <div className="p-5 border-t border-gray-100 dark:border-white/5 select-none mt-auto">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
            © 2026 FinPilot AI
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1 select-none font-medium">
            Made with ❤️ by{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Divyanshu Kumar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
