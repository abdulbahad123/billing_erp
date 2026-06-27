import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { FiUserPlus, FiSettings, FiCheck, FiGlobe } from "react-icons/fi";

const Settings = () => {
    const { api, user, language, setLanguage, t } = useAuth();
    const isAdmin = user?.role === "admin";

    // Cashier registration form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("cashier");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Bill format configurations (mock template config for local prints)
    const [shopName, setShopName] = useState(
        localStorage.getItem("cfg_shopName") || "ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்"
    );
    const [shopAddress, setShopAddress] = useState(
        localStorage.getItem("cfg_shopAddress") || "ஸ்ரீ அங்காளபரமேஸ்வரி காம்ப்ளக்ஸ், விராலிமலை-இலுப்பூர் மெயின்ரோடு - மேலப்பட்டி."
    );
    const [shopPhones, setShopPhones] = useState(
        localStorage.getItem("cfg_shopPhones") || "86681 85758, 87600 76551"
    );
    const [configSaved, setConfigSaved] = useState(false);

    const handleCreateCashier = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                phone,
                role,
            });

            if (res.data.success) {
                setSuccessMsg(`Account created successfully for ${name}!`);
                setName("");
                setEmail("");
                setPassword("");
                setPhone("");
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to create cashier user.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = (e) => {
        e.preventDefault();
        localStorage.setItem("cfg_shopName", shopName);
        localStorage.setItem("cfg_shopAddress", shopAddress);
        localStorage.setItem("cfg_shopPhones", shopPhones);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 3000);
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                    {t("systemSettings")}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t("settingsSubtitle")}
                </p>
            </div>

            {/* Language Selector Card */}
            <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <FiGlobe className="text-purple-400 text-lg" />
                    <span>{language === "ta" ? "மொழி தேர்வு" : "System Language Selection"}</span>
                </h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setLanguage("ta")}
                        className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold border transition-all cursor-pointer ${
                            language === "ta"
                                ? "bg-purple-650 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        தமிழ் (Tamil)
                    </button>
                    <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold border transition-all cursor-pointer ${
                            language === "en"
                                ? "bg-purple-650 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        English (US)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cashier Creation Card (Admin Only) */}
                {isAdmin && (
                    <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-6">
                        <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                            <FiUserPlus className="text-purple-400 text-lg" />
                            <span>{t("createCashier")}</span>
                        </h3>

                        {successMsg && (
                            <div className="p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleCreateCashier} className="space-y-4">
                            <Input
                                label={t("fullName")}
                                placeholder="Ramesh Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <Input
                                label={t("email")}
                                type="email"
                                placeholder="ramesh@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={t("phone")}
                                    type="text"
                                    placeholder="8760076551"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-300">{language === "ta" ? "அணுகல் வகை" : "System Role"}</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:outline-none w-full"
                                    >
                                        <option value="cashier">{language === "ta" ? "கேஷியர்" : "Cashier"}</option>
                                        <option value="admin">{language === "ta" ? "மேலாளர் (Admin)" : "Administrator"}</option>
                                    </select>
                                </div>
                            </div>
                            <Input
                                label={t("defaultPassword")}
                                type="password"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={loading} className="w-full mt-2">
                                {loading ? (language === "ta" ? "பதிவு செய்யப்படுகிறது..." : "Creating...") : t("registerAccount")}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Print Template Configuration Card */}
                <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-6">
                    <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                        <FiSettings className="text-purple-400 text-lg" />
                        <span>{t("customizeReceipt")}</span>
                    </h3>

                    {configSaved && (
                        <div className="p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                            <FiCheck />
                            <span>Configuration saved locally!</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <Input
                            label={t("businessName")}
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">{t("shopAddress")}</label>
                            <textarea
                                value={shopAddress}
                                onChange={(e) => setShopAddress(e.target.value)}
                                rows="3"
                                className="glass-input px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none w-full"
                                required
                            />
                        </div>
                        <Input
                            label={t("contactCell")}
                            value={shopPhones}
                            onChange={(e) => setShopPhones(e.target.value)}
                            required
                        />

                        <Button type="submit" variant="success" className="w-full mt-2">
                            {t("saveConfig")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
