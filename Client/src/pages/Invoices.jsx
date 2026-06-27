import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Button from "../components/Button";
import { FiSearch, FiPrinter, FiShare2, FiEye, FiX } from "react-icons/fi";

const Invoices = () => {
    const { api, language, t } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Details Modal
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/invoices?search=${search}`);
            if (res.data.success) {
                setInvoices(res.data.invoices);
            }
        } catch (err) {
            console.error("Error loading invoices:", err);
            setError("Failed to load invoice history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [search]);

    const openInvoiceDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const closeInvoiceDetails = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    // Print Receipt
    const handlePrint = () => {
        window.print();
    };

    // Share to WhatsApp
    const handleShareWhatsApp = (inv) => {
        const phone = inv.customerPhone;
        const dateStr = new Date(inv.createdAt).toLocaleDateString("en-IN");
        
        let itemsText = "";
        inv.items.forEach((item, index) => {
            const detail = item.formula ? `(${item.formula})` : `${item.qty} ${item.unit} x Rs. ${item.salesPrice}`;
            itemsText += `${index + 1}. ${item.name} - ${detail} = Rs. ${item.amount}\n`;
        });

        const textMessage = `*ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்*\n` +
            `-----------------------------------------\n` +
            `*பில் எண் (Bill No):* #${inv.invoiceNumber}\n` +
            `*தேதி (Date):* ${dateStr}\n` +
            `*வாடிக்கையாளர் (Customer):* ${inv.customerName}\n` +
            `*கைபேசி (Phone):* ${phone}\n` +
            `-----------------------------------------\n` +
            `*விவரங்கள் (Particulars):*\n${itemsText}` +
            `-----------------------------------------\n` +
            `*தள்ளுபடி (Discount):* Rs. ${inv.discount}\n` +
            `*மொத்தம் (TOTAL):* Rs. ${inv.total}\n` +
            `-----------------------------------------\n` +
            `நன்றி! (Thank you!)\n` +
            `செல்: 86681 85758, 87600 76551`;

        const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(textMessage)}`;
        window.open(waUrl, "_blank");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-left">
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                    {t("invoices")}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t("invoiceSubtitle")}
                </p>
            </div>

            {/* Search */}
            <div className="flex justify-between items-center">
                <div className="relative w-full md:w-80">
                    <Input
                        type="text"
                        placeholder={language === "ta" ? "பில் எண், பெயர், போன் கொண்டு தேடுக..." : "Search by Bill No, Name, or Phone..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    <FiSearch className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Table or loading states */}
            {loading ? (
                <Loader size="lg" />
            ) : invoices.length === 0 ? (
                <div className="p-12 glass-card rounded-2xl text-center text-slate-500 border border-white/5">
                    {language === "ta" ? "விவரங்கள் எதுவும் கிடைக்கவில்லை." : "No invoices registered under this query."}
                </div>
            ) : (
                <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-6">{t("billNo")}</th>
                                    <th className="py-3 px-6">{t("customer")}</th>
                                    <th className="py-3 px-6">{t("phone")}</th>
                                    <th className="py-3 px-6">{t("totalAmount")}</th>
                                    <th className="py-3 px-6">{t("payment")}</th>
                                    <th className="py-3 px-6">{t("date")}</th>
                                    <th className="py-3 px-6 text-center">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-slate-900/20">
                                        <td className="py-4 px-6 font-mono font-bold text-purple-400">
                                            #{inv.invoiceNumber}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-200 text-left">
                                            {inv.customerName}
                                        </td>
                                        <td className="py-4 px-6 font-mono">{inv.customerPhone}</td>
                                        <td className="py-4 px-6 font-bold text-slate-100 font-mono">
                                            Rs. {inv.total.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-0.5 rounded text-xs border border-slate-800 bg-slate-900/60 text-slate-400 font-bold">
                                                {inv.paymentMode}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500">
                                            {new Date(inv.createdAt).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center gap-3">
                                                <button
                                                    onClick={() => openInvoiceDetails(inv)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
                                                    title={language === "ta" ? "பில் விவரங்கள்" : "View Receipt"}
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    onClick={() => handleShareWhatsApp(inv)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                                    title={t("share")}
                                                >
                                                    <FiShare2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Dialog for Bill Preview & Printing */}
            {isModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl glass-card border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {t("billNo")} #{selectedInvoice.invoiceNumber}
                            </h3>
                            <button
                                onClick={closeInvoiceDetails}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Screen Bill View */}
                        <div className="space-y-6 text-left text-slate-350">
                            {/* Shop Title Info */}
                            <div className="text-center p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                                <h2 className="text-xl font-bold text-slate-100">
                                    ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    ஸ்ரீ அங்காளபரமேஸ்வரி காம்ப்ளக்ஸ், விராலிமலை-இலுப்பூர் மெயின்ரோடு, மேலப்பட்டி.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Cell: 86681 85758, 87600 76551
                                </p>
                            </div>

                            {/* Client & Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                                <div>
                                    <p className="text-slate-500 uppercase tracking-widest font-mono">
                                        {t("billTo")}
                                    </p>
                                    <p className="text-slate-200 font-semibold mt-1">
                                        {selectedInvoice.customerName}
                                    </p>
                                    <p className="font-mono text-slate-400 mt-0.5">
                                        {selectedInvoice.customerPhone}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 uppercase tracking-widest font-mono">
                                        {t("invoiceDate")}
                                    </p>
                                    <p className="text-slate-200 font-semibold mt-1 font-mono">
                                        {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-slate-400 mt-0.5">
                                        {t("payMode")}:{" "}
                                        <span className="font-bold text-purple-400">
                                            {selectedInvoice.paymentMode}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="border border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
                                            <th className="py-2.5 px-4 w-12">{t("sNo")}</th>
                                            <th className="py-2.5 px-4">{t("particulars")}</th>
                                            <th className="py-2.5 px-4 text-center">{t("qtyCalc")}</th>
                                            <th className="py-2.5 px-4 text-right">{t("amtRs")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-slate-300">
                                        {selectedInvoice.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-3 px-4 font-mono">{index + 1}</td>
                                                <td className="py-3 px-4 font-semibold">{item.name}</td>
                                                <td className="py-3 px-4 text-center font-mono">
                                                    {item.formula ? (
                                                        <span className="font-bold text-purple-400">{item.formula}</span>
                                                    ) : (
                                                        `${item.qty} ${item.unit} x Rs. ${item.salesPrice}`
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold font-mono">
                                                    {item.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Math */}
                            <div className="flex justify-end pt-2">
                                <div className="w-64 space-y-2 text-xs border-t border-slate-800 pt-3">
                                    <div className="flex justify-between">
                                        <span>{t("subtotal")}</span>
                                        <span className="font-bold text-slate-200 font-mono">
                                            Rs. {selectedInvoice.subTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-red-400">
                                        <span>{language === "ta" ? "தள்ளுபடி" : "Discount"}</span>
                                        <span className="font-bold font-mono">
                                            - Rs. {selectedInvoice.discount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-slate-100 border-t border-slate-800 pt-2">
                                        <span>{language === "ta" ? "மொத்தம்" : "Grand Total"}</span>
                                        <span className="text-purple-400 font-mono">
                                            Rs. {selectedInvoice.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                            <Button
                                onClick={() => handleShareWhatsApp(selectedInvoice)}
                                variant="secondary"
                            >
                                <FiShare2 /> {t("share")}
                            </Button>
                            <Button onClick={handlePrint} variant="primary">
                                <FiPrinter /> {t("reprint")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN PRINT-ONLY INVOICE COMPONENT matching the physical invoice layout pixel-by-pixel */}
            {selectedInvoice && (
                <div className="print-invoice-only font-mono text-black">
                    {/* Blessings top line */}
                    <div className="flex justify-between text-[11px] font-bold border-b border-black pb-1 mb-2">
                        <span>எண் : {selectedInvoice.invoiceNumber}</span>
                        <div className="text-center">
                            <span className="text-[9px] block">உ</span>
                            <span>ஸ்ரீ ஆகாச கருப்பர் துணை • ஸ்ரீ மதுரை வீரன் துணை • ஸ்ரீ பட்டவன் துணை</span>
                        </div>
                        <span className="text-right">
                            Cell: 86681 85758<br/>87600 76551
                        </span>
                    </div>

                    {/* Store Title */}
                    <div className="text-center mt-2">
                        <h1 className="text-3xl font-extrabold text-black tracking-wider leading-none m-0">
                            ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்
                        </h1>
                        <p className="text-sm font-bold border-b border-black pb-2 mt-1">
                            ஸ்ரீ அங்காளபரமேஸ்வரி காம்ப்ளக்ஸ், விராலிமலை-இலுப்பூர் மெயின்ரோடு - மேலப்பட்டி.
                        </p>
                    </div>

                    {/* Date and Client Info */}
                    <div className="flex justify-between my-3 text-sm">
                        <div className="flex-1">
                            <span className="font-bold">பெறுதல் (To):</span>{" "}
                            <span className="border-b border-dotted border-black inline-block min-w-[280px] px-2 font-bold">
                                {selectedInvoice.customerName} ({selectedInvoice.customerPhone})
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold">தேதி (Date):</span>{" "}
                            <span className="border-b border-dotted border-black inline-block min-w-[100px] px-2 font-mono">
                                {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* Receipt Items Grid Table with split Rs/Ps columns */}
                    <table className="print-table w-full border border-black text-sm">
                        <thead>
                            <tr className="border-b border-black bg-gray-150">
                                <th className="border-r border-black py-1 text-center w-10">S.No</th>
                                <th className="border-r border-black py-1 px-2 text-left">PARTICULARS</th>
                                <th className="border-r border-black py-1 text-center w-36">Qty</th>
                                <th colSpan="2" className="py-1 text-center w-32 px-2">
                                    <div className="border-b border-black pb-0.5">AMOUNT</div>
                                    <div className="flex justify-between text-[11px] pt-0.5">
                                        <span className="w-1/2 text-left pl-2">Rs.</span>
                                        <span className="w-1/2 text-right pr-2">Ps.</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedInvoice.items.map((item, index) => {
                                // Split amount into Rupees (Integer) and Paise (Decimals)
                                const amtStr = String(item.amount);
                                const parts = amtStr.split(".");
                                const rupees = parts[0];
                                const paise = parts[1] ? parts[1].padEnd(2, "0").slice(0, 2) : "00";

                                return (
                                    <tr key={index} className="border-b border-black h-7">
                                        <td className="border-r border-black py-1.5 text-center font-bold">{index + 1}</td>
                                        <td className="border-r border-black py-1.5 px-2 text-left font-bold uppercase">
                                            {item.name}
                                        </td>
                                        <td className="border-r border-black py-1.5 text-center font-bold">
                                            {item.formula ? item.formula : `${item.qty} ${item.unit}`}
                                        </td>
                                        <td className="border-r border-black py-1.5 text-right px-2 font-bold font-mono w-20">
                                            {rupees}
                                        </td>
                                        <td className="py-1.5 text-right px-2 font-bold font-mono w-12 text-gray-700">
                                            {paise}
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {/* Empty filler rows to match physical receipt paper length */}
                            {selectedInvoice.items.length < 10 &&
                                Array.from({ length: 10 - selectedInvoice.items.length }).map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="border-b border-black h-7">
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td></td>
                                    </tr>
                                ))}

                            {/* Discount row */}
                            {selectedInvoice.discount > 0 && (
                                <tr className="border-b border-black font-bold">
                                    <td colSpan="3" className="border-r border-black py-1.5 text-right px-2">
                                        TALLUPADI (Discount):
                                    </td>
                                    <td className="border-r border-black py-1.5 text-right px-2 font-mono">
                                        -{selectedInvoice.discount}
                                    </td>
                                    <td className="py-1.5 text-right px-2 font-mono">00</td>
                                </tr>
                            )}

                            {/* Total Row */}
                            <tr className="font-bold border-t-2 border-black">
                                <td colSpan="3" className="border-r border-black py-2 text-right px-2 uppercase font-extrabold text-md">
                                    TOTAL AMOUNT:
                                </td>
                                <td className="border-r border-black py-2 text-right px-2 text-md font-extrabold font-mono">
                                    {String(selectedInvoice.total).split(".")[0]}
                                </td>
                                <td className="py-2 text-right px-2 text-md font-extrabold font-mono">
                                    {String(selectedInvoice.total).split(".")[1] ? String(selectedInvoice.total).split(".")[1].padEnd(2, "0").slice(0, 2) : "00"}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Rubber Seal stamp box */}
                    <div className="flex justify-between items-center mt-6">
                        <div className="border-2 border-black px-4 py-2 text-center rounded font-bold text-xs uppercase leading-tight scale-90 origin-left">
                            <p>ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்</p>
                            <p className="text-[10px] mt-0.5">மேலப்பட்டி</p>
                        </div>
                        <div className="text-right pr-6 font-bold text-xs">
                            <p className="mt-8 border-t border-black pt-1 w-32 text-center">கையெழுத்து (Signature)</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
