import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { FiTrendingUp, FiShoppingBag, FiCalendar, FiPieChart } from "react-icons/fi";

const Reports = () => {
    const { api, user, language, t } = useAuth();
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (isAdmin) {
                    const res = await api.get("/reports/sales");
                    if (res.data.success) {
                        setTrendData(res.data.salesTrend);
                    }
                }
            } catch (err) {
                console.error("Reports loading error:", err);
                setError("Failed to fetch detailed analytics reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="p-8 text-center text-red-400 font-bold glass-card rounded-2xl">
                Access Denied. Only administrators are allowed to view profit reports.
            </div>
        );
    }

    if (loading) return <Loader size="lg" />;

    // Calculations
    const totalSales = trendData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalProfit = trendData.reduce((acc, curr) => acc + curr.profit, 0);
    const avgProfitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-left">
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                    {t("reports")}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t("reportsSubtitle")}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 glass-card rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            {t("cumulativeRevenue")}
                        </span>
                        <FiCalendar className="text-purple-400 text-lg" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-100 font-mono">
                        Rs. {totalSales.toLocaleString()}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                        {language === "ta" ? "கடந்த 30 நாட்களின் மொத்த விற்பனை தொகை" : "Sum of past 30 days of trading"}
                    </p>
                </div>

                <div className="p-6 glass-card rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            {t("netStoreProfit")}
                        </span>
                        <FiTrendingUp className="text-emerald-400 text-lg" />
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-400 font-mono">
                        Rs. {totalProfit.toLocaleString()}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                        {language === "ta" ? "விற்பனை விலை கழித்தல் கொள்முதல் விலை" : "Sum of Sales Price minus Cost Price"}
                    </p>
                </div>

                <div className="p-6 glass-card rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            {t("avgProfitMargin")}
                        </span>
                        <FiPieChart className="text-blue-400 text-lg" />
                    </div>
                    <h3 className="text-3xl font-bold text-blue-400 font-mono">
                        {avgProfitMargin}%
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                        {language === "ta" ? "மொத்த விற்பனையில் கிடைத்த லாப சதவிகிதம்" : "Overall percentage yield on sales"}
                    </p>
                </div>
            </div>

            {/* Daily stats table breakdown */}
            <div className="p-6 glass-card rounded-2xl border border-white/5 text-left">
                <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <FiShoppingBag className="text-purple-400" />
                    <span>{t("dailyAudit")}</span>
                </h3>

                {trendData.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">
                        No sales recorded in the system.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-6">{t("date")}</th>
                                    <th className="py-3 px-6 text-center">{t("totalInvoices")}</th>
                                    <th className="py-3 px-6 text-right">{language === "ta" ? "விற்பனை (ரூ.)" : "Daily Sales"}</th>
                                    <th className="py-3 px-6 text-right">{language === "ta" ? "லாபம் (ரூ.)" : "Daily Profit"}</th>
                                    <th className="py-3 px-6 text-right">{language === "ta" ? "லாப வரம்பு" : "Net Yield"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300 font-mono">
                                {[...trendData].reverse().map((day) => {
                                    const margin = day.sales > 0 ? ((day.profit / day.sales) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={day._id} className="hover:bg-slate-900/10">
                                            <td className="py-3.5 px-6 font-semibold text-slate-350">
                                                {new Date(day._id).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="py-3.5 px-6 text-center text-slate-400">
                                                {day.count} {language === "ta" ? "பில்கள்" : "bills"}
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-bold text-slate-200">
                                                Rs. {day.sales.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-6 text-right text-emerald-400 font-bold">
                                                Rs. {day.profit.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-bold text-blue-400">
                                                {margin}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
