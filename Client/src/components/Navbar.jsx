import { FiMenu, FiCalendar, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar }) => {
    const { user, language, setLanguage, t } = useAuth();
    if (!user) return null;

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <header className="flex items-center justify-between h-20 px-6 border-b border-slate-850/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-900 lg:hidden focus:outline-none"
                    aria-label="Toggle navigation menu"
                >
                    <FiMenu className="text-2xl" />
                </button>
                <div className="flex flex-col text-left">
                    <h2 className="text-sm sm:text-lg font-bold tracking-wide text-slate-100 font-sans">
                        {language === "ta" ? "ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்" : "Sri Angala Parameswari Motors"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            {/* Right: Date, Language Toggle & Profile Badge */}
            <div className="flex items-center gap-4 sm:gap-6">
                {/* Language Switch Toggle */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                    <button
                        onClick={() => setLanguage("ta")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            language === "ta"
                                ? "bg-purple-600 text-white"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        தமிழ்
                    </button>
                    <button
                        onClick={() => setLanguage("en")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            language === "en"
                                ? "bg-purple-600 text-white"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        EN
                    </button>
                </div>

                {/* Date */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-sm font-medium">
                    <FiCalendar className="text-purple-400" />
                    <span>{today}</span>
                </div>

                {/* Profile Badge */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">
                            {user.role}
                        </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">
                        <FiUser className="text-lg" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
