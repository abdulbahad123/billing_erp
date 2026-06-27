import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import {
    FiDollarSign,
    FiTrendingUp,
    FiPackage,
    FiFileText,
    FiAlertTriangle,
} from "react-icons/fi";

const Dashboard = () => {
    const { api, user, t } = useAuth();
    const [stats, setStats] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (isAdmin) {
                    const [statsRes, salesRes] = await Promise.all([
                        api.get("/reports/dashboard"),
                        api.get("/reports/sales"),
                    ]);

                    if (statsRes.data.success) {
                        setStats(statsRes.data.stats);
                    }
                    if (salesRes.data.success) {
                        setSalesTrend(salesRes.data.salesTrend);
                    }
                } else {
                    const invRes = await api.get("/invoices");
                    if (invRes.data.success) {
                        const invoices = invRes.data.invoices;
                        const totalSales = invoices.reduce((acc, inv) => acc + inv.total, 0);
                        setStats({
                            totalSales,
                            totalInvoices: invoices.length,
                            recentInvoices: invoices.slice(0, 5),
                        });
                    }
                }
            } catch (err) {
                console.error("Dashboard load error:", err);
                setError("Failed to fetch dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, api, isAdmin]);

    if (loading) return <Loader size="lg" />;

    const renderTrendChart = () => {
        if (salesTrend.length === 0) {
            return (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                    No transactions registered in the last 30 days.
                </div>
            );
        }

        const maxVal = Math.max(...salesTrend.map((d) => d.sales), 1000);
        const width = 600;
        const height = 150;
        const padding = 20;

        const points = salesTrend
            .map((data, index) => {
                const x = padding + (index * (width - padding * 2)) / (salesTrend.length - 1 || 1);
                const y = height - padding - (data.sales * (height - padding * 2)) / maxVal;
                return `${x},${y}`;
            })
            .join(" ");

        const fillPoints = `${padding},${height - padding} ${points} ${
            padding + (salesTrend.length - 1) * ((width - padding * 2) / (salesTrend.length - 1 || 1))
        },${height - padding}`;

        return (
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                    <line
                        x1={padding}
                        y1={padding}
                        x2={width - padding}
                        y2={padding}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />

                    <polygon points={fillPoints} fill="url(#chartGradient)" />

                    <polyline
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="2.5"
                        points={points}
                    />

                    {salesTrend.map((data, index) => {
                        const x = padding + (index * (width - padding * 2)) / (salesTrend.length - 1 || 1);
                        const y = height - padding - (data.sales * (height - padding * 2)) / maxVal;
                        return (
                            <g key={index} className="group">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className="fill-purple-500 stroke-slate-950 stroke-2 hover:r-6 cursor-pointer transition-all"
                                />
                                <title>{`${data._id}: Rs. ${data.sales.toLocaleString()}`}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header Title */}
            <div className="text-left">
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                    {t("dbOverview")}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t("dbSubtitle")}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Metric Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Sales Card */}
                <div className="p-6 glass-card rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            {t("totalRevenue")}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-100 mt-2">
                            Rs. {stats?.totalSales?.toLocaleString() || 0}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                        <FiDollarSign className="text-2xl" />
                    </div>
                </div>

                {/* Total Profit Card (Admin Only) */}
                {isAdmin && (
                    <div className="p-6 glass-card rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                                {t("totalProfits")}
                            </p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-2">
                                Rs. {stats?.totalProfit?.toLocaleString() || 0}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                            <FiTrendingUp className="text-2xl" />
                        </div>
                    </div>
                )}

                {/* Active Products count */}
                {isAdmin ? (
                    <div className="p-6 glass-card rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                                {t("activeCatalog")}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-100 mt-2">
                                {stats?.totalProducts || 0} {t("products")}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                            <FiPackage className="text-2xl" />
                        </div>
                    </div>
                ) : (
                    <div className="p-6 glass-card rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                                {t("shiftStatus")}
                            </p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-2">
                                {t("active")}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                            <FiPackage className="text-2xl" />
                        </div>
                    </div>
                )}

                {/* Total Invoice billing count */}
                <div className="p-6 glass-card rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            {t("totalInvoices")}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-100 mt-2">
                            {stats?.totalInvoices || 0} {t("invoices")}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                        <FiFileText className="text-2xl" />
                    </div>
                </div>
            </div>

            {/* Graphs and stock indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 30-Day sales chart (Admin only) */}
                {isAdmin && (
                    <div className="p-6 glass-card rounded-2xl border border-white/5 lg:col-span-2">
                        <h3 className="text-lg font-bold text-slate-200 text-left mb-6">
                            {t("salesTrend")}
                        </h3>
                        {renderTrendChart()}
                    </div>
                )}

                {/* Low Stock Warning List (Admin Only) */}
                {isAdmin && (
                    <div className="p-6 glass-card rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-slate-200 text-left mb-6 flex items-center gap-2">
                            <FiAlertTriangle className="text-amber-500 animate-bounce" />
                            <span>{t("lowStockAlerts")}</span>
                        </h3>
                        {stats?.lowStockProducts?.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-8">
                                {t("allStocked")}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {stats?.lowStockProducts?.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800"
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-slate-300">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {t("unit")}: {item.unit}
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                            {item.stock} {t("left")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Transaction log */}
            <div className="p-6 glass-card rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-slate-200 text-left mb-6">
                    {t("recentInvoices")}
                </h3>
                {stats?.recentInvoices?.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">
                        No transactions registered yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-4">{t("billNo")}</th>
                                    <th className="py-3 px-4">{t("customer")}</th>
                                    <th className="py-3 px-4">{t("phone")}</th>
                                    <th className="py-3 px-4">{t("payment")}</th>
                                    <th className="py-3 px-4">{t("totalAmount")}</th>
                                    <th className="py-3 px-4">{t("cashier")}</th>
                                    <th className="py-3 px-4">{t("date")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                                {stats?.recentInvoices?.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-slate-900/30">
                                        <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                                            #{invoice.invoiceNumber}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                                            {invoice.customerName}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono">{invoice.customerPhone}</td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                                                    invoice.paymentMode === "UPI"
                                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                        : invoice.paymentMode === "Card"
                                                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                }`}
                                            >
                                                {invoice.paymentMode}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-100">
                                            Rs. {invoice.total.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400">
                                            {invoice.cashier?.name || "System"}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500">
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
