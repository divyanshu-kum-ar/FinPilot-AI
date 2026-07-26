import { LogOut, Menu, Moon, Sun, User, ChevronDown, TrendingUp, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "User";

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get user initials (e.g. "D" for "Divyanshu Kumar")
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 1).toUpperCase();
    }
    return "U";
  };

  return (
    <nav
      className={`
        bg-white/80 dark:bg-[#0d1324]/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-white/5
        sticky top-0 z-45 w-full transition-all duration-300 ease-in-out h-16 flex items-center
        ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Brand */}
          <div className="flex items-center space-x-3">
            {/* Sidebar toggle button (remains a standard icon) */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none transition-all duration-200"
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <Menu size={20} />
            </button>
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 hover:shadow-blue-500/40 transition-all duration-300">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <Link
              to="/"
              className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 select-none"
            >
              <span>FinPilot AI</span>
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            </Link>
          </div>

          {/* Right - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent dark:border-white/5 focus:outline-none transition-all duration-200 animate-rotate-theme"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Link
              to="/profile"
              className="flex items-center space-x-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-1.5 border border-transparent dark:border-white/5 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                Hi, {userName || "User"}
              </span>
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20 transition-transform duration-200">
                {getUserInitials()}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-red-500/10 active:scale-[0.98] focus:outline-none"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu toggle using the profile image */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-indigo-500 transition-colors duration-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 pb-4 border-t border-gray-100 dark:border-white/5 animate-fade-in relative z-50 bg-white dark:bg-[#060814] px-2 rounded-b-2xl shadow-xl">
            <div className="flex flex-col space-y-3 pt-4">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                  {getUserInitials()}
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 font-semibold">
                  {user?.displayName || user?.email}
                </span>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 font-medium text-sm"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                <span>Toggle Theme</span>
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-200 w-full font-semibold text-sm focus:outline-none"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
