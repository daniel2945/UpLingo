import React from "react";
import { Outlet, useNavigate, Navigate, useLocation } from "react-router-dom";
import { Map, Box, LogOut } from "lucide-react";
import useAuthStore from "../store/authStore";
import useLearningStore from "../store/learningStore";

const LANGUAGES = [
  { code: "en", label: "English", emoji: "🇬🇧" },
  { code: "es", label: "Spanish", emoji: "🇪🇸" },
  { code: "fr", label: "French", emoji: "🇫🇷" },
  { code: "de", label: "German", emoji: "🇩🇪" },
];

// Navbar Component
export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const learningLang = useLearningStore((state) => state.language);
  const setLanguage = useLearningStore((state) => state.setLanguage);

  if (!user) return null;

  // מוצאים את אובייקט השפה הנוכחית כדי להציג את האימוג'י שלה בחוץ
  const currentLangObj =
    LANGUAGES.find((l) => l.code === learningLang) || LANGUAGES[0];

  const NavButton = ({ path, icon: Icon, label }) => {
    // בודק אם אנחנו בעמוד הנוכחי
    const isActive = location.pathname.includes(path);

    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm tracking-wide ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  };

  return (
    <nav className="bg-white border-b-2 border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 w-full gap-4 md:gap-0">
      {/* צד שמאל: לוגו ותפריט ניווט */}
      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
        <div
          className="flex items-center space-x-2 cursor-pointer shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          <div className="bg-primary p-2 rounded-xl text-white font-black px-2">
            UL
          </div>
          <span className="text-2xl font-black text-primary tracking-tight uppercase ml-2">
            UPLINGO
          </span>
        </div>

        {/* פה תוקן הניתוב מ-tools ל-practice */}
        <div
          className="hidden md:flex items-center gap-2 border-l-2 border-slate-100 pl-6 ml-2"
          dir="rtl"
        >
          <NavButton path="/dashboard" icon={Map} label="שיעורים" />
          <NavButton path="/practice" icon={Box} label="ארגז חול" />
        </div>
      </div>

      {/* צד ימין */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* עיצוב חכם לבחירת שפה: האימוג'י בחוץ, ה-select שקוף בפנים */}
        <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-primary transition-colors">
          <span
            className="text-xl mr-2 leading-none"
            role="img"
            aria-label="flag"
          >
            {currentLangObj.emoji}
          </span>
          <select
            value={learningLang}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer border-none p-0 focus:ring-0"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl border-2 border-orange-100">
          <span className="font-bold text-orange-600 uppercase tracking-tighter text-sm">
            MISSION {user.currentMissionOrder || 1}
          </span>
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1"
          title="התנתק"
        >
          <LogOut size={22} />
        </button>
      </div>

      {/* תפריט ניווט למובייל (גם פה תוקן הניתוב) */}
      <div
        className="flex md:hidden w-full items-center justify-center gap-2 pt-2 border-t border-slate-100"
        dir="rtl"
      >
        <NavButton path="/dashboard" icon={Map} label="שיעורים" />
        <NavButton path="/practice" icon={Box} label="ארגז חול" />
      </div>
    </nav>
  );
};

// Footer Component (נשאר ללא שינוי)
export const Footer = () => (
  <footer className="bg-white border-t-2 border-gray-100 mt-auto w-full">
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-black tracking-tight uppercase">
        <div>UPLINGO</div>
        <div className="text-sm font-medium">Made for language learners</div>
        <div className="text-xs">© 2026</div>
      </div>
    </div>
  </footer>
);

// Main Application Layout (נשאר ללא שינוי)
export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col w-full">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Authentication Layout (Login/Register) (נשאר ללא שינוי)
export const AuthLayout = () => (
  <div className="min-h-screen flex flex-col bg-surface p-4 items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-b-4 border-gray-200 overflow-hidden mb-8">
      <Outlet />
    </div>
    <footer className="py-2 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
      UpLingo 2026
    </footer>
  </div>
);

// Protected Route Logic (נשאר ללא שינוי)
export const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
