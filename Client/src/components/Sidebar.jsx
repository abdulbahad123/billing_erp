import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FiGrid,
    FiFileText,
    FiPlusSquare,
    FiShoppingBag,
    FiTrendingUp,
    FiSettings,
    FiLogOut,
} from "react-icons/fi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout, t } = useAuth();
    if (!user) return null;

    const isAdmin = user.role === "admin";

    const navItems = [
        ...(isAdmin
            ? [
                  {
                      name: t("dashboard"),
                      path: "/dashboard",
                      icon: <FiGrid className="text-xl" />,
                  },
              ]
            : []),
        {
            name: t("billing"),
            path: "/billing",
            icon: <FiPlusSquare className="text-xl" />,
        },
        {
            name: t("invoices"),
            path: "/invoices",
            icon: <FiFileText className="text-xl" />,
        },
        {
            name: t("products"),
            path: "/products",
            icon: <FiShoppingBag className="text-xl" />,
        },
        ...(isAdmin
            ? [
                  {
                      name: t("reports"),
                      path: "/reports",
                      icon: <FiTrendingUp className="text-xl" />,
                  },
              ]
            : []),
        {
            name: t("settings"),
            path: "/settings",
            icon: <FiSettings className="text-xl" />,
        },
    ];

    return (
        <>
            {/* Mobile Backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-850">
                    <div className="flex flex-col text-left">
                        <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                            ERP BILLING
                        </span>
                        <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                            Enterprise
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden focus:outline-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) toggleSidebar();
                            }}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "bg-gradient-to-r from-purple-600/35 to-indigo-600/35 text-purple-300 border-l-4 border-purple-500 font-medium"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Card & Logout */}
                <div className="p-4 border-t border-slate-850">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-850/60 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold uppercase shadow-lg shadow-purple-500/10">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-sm font-semibold truncate text-slate-200">
                                {user.name}
                            </h4>
                            <p className="text-xs truncate text-slate-500 uppercase tracking-widest font-mono">
                                {user.role === "admin" ? t("active") : t("cashier")}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <FiLogOut className="text-xl" />
                        <span>{t("logout")}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
