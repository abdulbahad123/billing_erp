import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { FiPlus, FiTrash2, FiSearch, FiUser, FiPhone, FiInfo, FiEdit } from "react-icons/fi";

const Billing = () => {
    const { api, language, t } = useAuth();
    const navigate = useNavigate();

    // Customer details
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // Product search & selection
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Current editing item values
    const [customItemName, setCustomItemName] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState("pcs");
    const [isCustomCalculation, setIsCustomCalculation] = useState(false);

    // Custom calculation values
    const [lengthQty, setLengthQty] = useState("");
    const [customRate, setCustomRate] = useState("");
    const [customUnit, setCustomUnit] = useState("mtr");

    // Bill summaries
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMode, setPaymentMode] = useState("Cash");

    // Auto-print status tracking
    const [lastCreatedInvoice, setLastCreatedInvoice] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Dropdown ref for clicking outside
    const dropdownRef = useRef(null);

    // Fetch products based on search term
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                try {
                    const res = await api.get(`/products?search=${searchTerm}`);
                    if (res.data.success) {
                        setProducts(res.data.products);
                        setShowDropdown(true);
                    }
                } catch (err) {
                    console.error("Error searching products", err);
                }
            } else {
                setProducts([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Customer autocomplete search by phone
    useEffect(() => {
        const fetchCustomer = async () => {
            if (customerPhone.trim().length === 10) {
                try {
                    const res = await api.get(`/customers?search=${customerPhone}`);
                    if (res.data.success && res.data.customers.length > 0) {
                        setCustomerName(res.data.customers[0].name);
                    }
                } catch (err) {
                    console.error("Error autocomplete customer", err);
                }
            }
        };
        fetchCustomer();
    }, [customerPhone]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle product selection (Auto-adds to items list instantly!)
    const handleSelectProduct = (prod) => {
        // If it's a wire/hose, we might want custom multiplier formulas, so let's pre-populate the left fields
        if (prod.unit === "mtr" || prod.unit === "kg" || prod.unit === "feet") {
            setSelectedProduct(prod);
            setCustomItemName(prod.name);
            setPrice(prod.price);
            setUnit(prod.unit);
            setSearchTerm("");
            setProducts([]);
            setShowDropdown(false);
            setIsCustomCalculation(true);
            setCustomUnit(prod.unit);
            setCustomRate(prod.price);
            setLengthQty("");
            return;
        }

        // Standard products get auto-added instantly with Qty = 1
        const existingIndex = items.findIndex(
            (item) => item.productId === prod._id && !item.formula
        );

        if (existingIndex > -1) {
            const updated = [...items];
            updated[existingIndex].qty += 1;
            updated[existingIndex].amount = updated[existingIndex].qty * updated[existingIndex].salesPrice;
            setItems(updated);
        } else {
            const newItem = {
                productId: prod._id,
                name: prod.name,
                qty: 1,
                unit: prod.unit,
                salesPrice: prod.price,
                purchasePrice: prod.purchasePrice,
                amount: prod.price,
                formula: "",
            };
            setItems([...items, newItem]);
        }

        setSearchTerm("");
        setProducts([]);
        setShowDropdown(false);
        setSelectedProduct(null);
    };

    // Update fields inline in summary list
    const handleUpdateInline = (index, field, value) => {
        const updated = [...items];
        const numVal = parseFloat(value) || 0;

        if (field === "qty") {
            updated[index].qty = Math.max(0, numVal);
        } else if (field === "salesPrice") {
            updated[index].salesPrice = Math.max(0, numVal);
        }

        updated[index].amount = updated[index].qty * updated[index].salesPrice;

        // If it has a formula, update it to match new dimensions
        if (updated[index].formula) {
            updated[index].formula = `${updated[index].qty} X ${updated[index].salesPrice}`;
        }

        setItems(updated);
    };

    // Add manual custom item (when clicking "Add Item to Bill")
    const handleAddItem = () => {
        if (!customItemName.trim()) {
            alert("Please select a product or enter custom name");
            return;
        }

        let itemQty = Number(qty);
        let itemPrice = Number(price);
        let itemFormula = "";

        if (isCustomCalculation) {
            const parsedLength = parseFloat(lengthQty);
            const parsedRate = parseFloat(customRate);

            if (isNaN(parsedLength) || isNaN(parsedRate) || parsedLength <= 0 || parsedRate <= 0) {
                alert("Please enter a valid length/weight and unit rate for calculations");
                return;
            }

            itemQty = parsedLength;
            itemPrice = parsedRate;
            itemFormula = `${parsedLength} X ${parsedRate}`;
        } else {
            if (itemQty <= 0 || itemPrice < 0) {
                alert("Please enter valid quantity and price");
                return;
            }
        }

        const subtotal = itemQty * itemPrice;

        const newItem = {
            productId: selectedProduct ? selectedProduct._id : null,
            name: customItemName.trim(),
            qty: itemQty,
            unit: isCustomCalculation ? customUnit : unit,
            salesPrice: itemPrice,
            purchasePrice: selectedProduct ? selectedProduct.purchasePrice : Math.round(itemPrice * 0.8),
            amount: subtotal,
            formula: itemFormula,
        };

        setItems([...items, newItem]);

        // Reset inputs
        setSelectedProduct(null);
        setCustomItemName("");
        setQty(1);
        setPrice(0);
        setIsCustomCalculation(false);
        setLengthQty("");
        setCustomRate("");
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return items.reduce((acc, item) => acc + item.amount, 0);
    };

    const calculateTotal = () => {
        const sub = calculateSubtotal();
        return Math.max(0, sub - Number(discount));
    };

    // Save and auto-download/print invoice
    const handleSaveInvoice = async () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            alert(language === "ta" ? "வாடிக்கையாளர் பெயர் மற்றும் கைபேசி எண்ணை உள்ளிடவும்" : "Please enter customer name and contact phone");
            return;
        }

        if (items.length === 0) {
            alert(language === "ta" ? "பில்லில் பொருட்களை சேர்க்கவும்" : "Please add at least one item to the bill");
            return;
        }

        const payload = {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            items,
            discount: Number(discount),
            paymentMode,
        };

        try {
            const res = await api.post("/invoices", payload);
            if (res.data.success) {
                const createdInv = res.data.invoice;
                setLastCreatedInvoice(createdInv);
                setIsPrinting(true);

                // Auto-print triggered immediately
                setTimeout(() => {
                    window.print();
                    // Reset invoice form after print popup opens
                    setItems([]);
                    setCustomerName("");
                    setCustomerPhone("");
                    setDiscount(0);
                    setLastCreatedInvoice(null);
                    setIsPrinting(false);
                    navigate("/invoices");
                }, 500);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create invoice");
        }
    };

    const subTotal = calculateSubtotal();
    const total = calculateTotal();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="text-left">
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                    {t("createNewBill")}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t("billingSubtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Form: Customer and Manual Search */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-md font-bold text-slate-200 text-left flex items-center gap-2 border-b border-slate-800 pb-3">
                            <FiUser className="text-purple-400 animate-pulse" />
                            <span>{t("customerInfo")}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label={t("custPhone")}
                                    type="text"
                                    placeholder="Enter 10-digit number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    maxLength="10"
                                    required
                                    className="pl-10 font-mono"
                                />
                                <FiPhone className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                            </div>
                            <div className="relative">
                                <Input
                                    label={t("custName")}
                                    placeholder="Enter Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                                <FiUser className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Catalog search and addition */}
                    <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-md font-bold text-slate-200 text-left flex items-center gap-2 border-b border-slate-800 pb-3">
                            <FiSearch className="text-purple-400" />
                            <span>{t("selectProduct")}</span>
                        </h3>

                        {/* Autocomplete Input */}
                        <div ref={dropdownRef} className="relative">
                            <Input
                                label={t("searchCatalog")}
                                placeholder={language === "ta" ? "பொருளின் பெயரை டைப் செய்க... (எ.கா: Lakshmi, Finolex)" : "Type to search catalog..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <FiSearch className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />

                            {showDropdown && products.length > 0 && (
                                <div className="absolute left-0 right-0 mt-1 z-30 max-h-60 overflow-y-auto glass-card border border-white/10 rounded-xl shadow-2xl divide-y divide-slate-800">
                                    {products.map((prod) => (
                                        <button
                                            key={prod._id}
                                            type="button"
                                            onClick={() => handleSelectProduct(prod)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-900/60 transition-colors flex items-center justify-between text-sm cursor-pointer"
                                        >
                                            <span className="font-semibold text-slate-200">
                                                {prod.name}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                Stock: {prod.stock} {prod.unit} • Rs. {prod.price}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Manual entry / details editor */}
                        <div className="space-y-4 pt-2">
                            {selectedProduct && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 text-left">
                                    <FiInfo className="text-sm shrink-0" />
                                    <span>
                                        {language === "ta" ? (
                                            <>தேர்வு: <strong>{selectedProduct.name}</strong> • இருப்பு: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong></>
                                        ) : (
                                            <>Selected: <strong>{selectedProduct.name}</strong> • Stock remaining: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong></>
                                        )}
                                    </span>
                                </div>
                            )}

                            <Input
                                label={t("itemParticulars")}
                                placeholder="Enter custom item name"
                                value={customItemName}
                                onChange={(e) => setCustomItemName(e.target.value)}
                                required
                            />

                            <div className="flex items-center gap-3 py-1 text-slate-350 text-left">
                                <input
                                    type="checkbox"
                                    id="calc-toggle"
                                    checked={isCustomCalculation}
                                    onChange={(e) => setIsCustomCalculation(e.target.checked)}
                                    className="w-4 h-4 rounded text-purple-650 bg-slate-900 border-slate-800 focus:ring-purple-500"
                                />
                                <label htmlFor="calc-toggle" className="text-sm cursor-pointer select-none">
                                    {t("enableCustomCalc")}
                                </label>
                            </div>

                            {isCustomCalculation ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label={t("lengthWeight")}
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 155"
                                        value={lengthQty}
                                        onChange={(e) => setLengthQty(e.target.value)}
                                    />
                                    <div className="flex flex-col gap-2 text-left">
                                        <label className="text-sm font-medium text-slate-300">{t("unit")}</label>
                                        <select
                                            value={customUnit}
                                            onChange={(e) => setCustomUnit(e.target.value)}
                                            className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:outline-none w-full"
                                        >
                                            <option value="mtr">mtr (Meters)</option>
                                            <option value="kg">kg (Kilograms)</option>
                                            <option value="feet">feet (Feet)</option>
                                            <option value="set">set (Sets)</option>
                                            <option value="pcs">pcs (Pieces)</option>
                                        </select>
                                    </div>
                                    <Input
                                        label={t("ratePerUnit")}
                                        type="number"
                                        placeholder="e.g. 115"
                                        value={customRate}
                                        onChange={(e) => setCustomRate(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label={t("quantity")}
                                        type="number"
                                        placeholder="1"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                    />
                                    <div className="flex flex-col gap-2 text-left">
                                        <label className="text-sm font-medium text-slate-300">{t("unit")}</label>
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:outline-none w-full"
                                        >
                                            <option value="pcs">pcs (Pieces)</option>
                                            <option value="set">set (Sets)</option>
                                            <option value="mtr">mtr (Meters)</option>
                                            <option value="kg">kg (Kilograms)</option>
                                        </select>
                                    </div>
                                    <Input
                                        label={t("pricePerUnit")}
                                        type="number"
                                        placeholder="200"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            )}

                            <Button onClick={handleAddItem} variant="success" className="w-full mt-2">
                                <FiPlus /> {t("addItem")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Inline Summary and Checkout */}
                <div className="space-y-6">
                    <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-6">
                        <h3 className="text-md font-bold text-slate-200 text-left border-b border-slate-800 pb-3">
                            {t("billSummary")}
                        </h3>

                        {items.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-sm">
                                {language === "ta" ? "பொருட்கள் எதுவும் சேர்க்கப்படவில்லை." : "No items added to the bill."}
                            </div>
                        ) : (
                            <div className="overflow-x-auto pr-1 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-850 text-slate-500 font-mono">
                                            <th className="pb-2">Item</th>
                                            <th className="pb-2 text-center w-16">Qty</th>
                                            <th className="pb-2 text-right w-20">Rate</th>
                                            <th className="pb-2 text-right w-20">Amt</th>
                                            <th className="pb-2 text-center w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900 text-slate-300">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-900/10">
                                                <td className="py-2 text-slate-200 font-semibold truncate max-w-[90px]">
                                                    {item.name}
                                                    {item.formula && (
                                                        <span className="block text-[10px] text-purple-400 font-mono mt-0.5">
                                                            {item.formula}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => handleUpdateInline(index, "qty", e.target.value)}
                                                        className="w-12 bg-slate-950 border border-slate-850 text-slate-200 text-center rounded py-0.5 text-[11px] font-mono focus:outline-none focus:border-purple-500"
                                                        step="any"
                                                    />
                                                </td>
                                                <td className="py-2 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.salesPrice}
                                                        onChange={(e) => handleUpdateInline(index, "salesPrice", e.target.value)}
                                                        className="w-16 bg-slate-950 border border-slate-850 text-slate-200 text-right rounded py-0.5 pr-1 text-[11px] font-mono focus:outline-none focus:border-purple-500"
                                                        step="any"
                                                    />
                                                </td>
                                                <td className="py-2 text-right font-bold text-slate-200 font-mono">
                                                    {item.amount.toLocaleString()}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-red-400 hover:text-red-300 cursor-pointer"
                                                        title="Remove item"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summaries */}
                        <div className="space-y-3 pt-4 border-t border-slate-800 text-sm text-slate-400 font-sans">
                            <div className="flex justify-between">
                                <span>{t("subtotal")}</span>
                                <span className="font-bold text-slate-200 font-mono">
                                    Rs. {subTotal.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span>{t("discount")}</span>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder="0"
                                    className="glass-input px-3 py-1.5 rounded-lg text-right text-slate-100 w-24 text-xs focus:outline-none font-mono"
                                />
                            </div>

                            <div className="flex justify-between pt-3 border-t border-slate-800 text-lg font-bold text-slate-200">
                                <span>{t("grandTotal")}</span>
                                <span className="text-purple-400 font-mono">
                                    Rs. {total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="flex flex-col gap-2 pt-2 text-left">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
                                {t("paymentMode")}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Cash", "UPI", "Card"].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            paymentMode === mode
                                                ? "bg-purple-650 border-purple-500 text-purple-300"
                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Checkout save */}
                        <Button
                            onClick={handleSaveInvoice}
                            disabled={items.length === 0}
                            variant="primary"
                            className="w-full py-4 text-md font-bold mt-2"
                        >
                            {t("generateInvoice")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* HIDDEN PIXEL-PERFECT PRINTING TEMPLATE matching your paper receipt layout */}
            {isPrinting && lastCreatedInvoice && (
                <div className="print-invoice-only font-mono text-black">
                    {/* Blessings top line */}
                    <div className="flex justify-between text-[11px] font-bold border-b border-black pb-1 mb-2">
                        <span>எண் : {lastCreatedInvoice.invoiceNumber}</span>
                        <div className="text-center">
                            <span className="text-[9px] block">உ</span>
                            <span>ஸ்ரீ ஆகாச கருப்பர் துணை • ஸ்ரீ மதுரை வீரன் துணை • ஸ்ரீ பட்டவன் துணை</span>
                        </div>
                        <span className="text-right">
                            Cell: 86681 85758<br/>87600 76551
                        </span>
                    </div>

                    {/* Shop header banner */}
                    <div className="text-center mt-2">
                        <h1 className="text-3xl font-extrabold text-black tracking-wider leading-none m-0">
                            ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ்
                        </h1>
                        <p className="text-sm font-bold border-b border-black pb-2 mt-1">
                            ஸ்ரீ அங்காளபரமேஸ்வரி காம்ப்ளக்ஸ், விராலிமலை-இலுப்பூர் மெயின்ரோடு - மேலப்பட்டி.
                        </p>
                    </div>

                    {/* Customer meta */}
                    <div className="flex justify-between my-3 text-sm">
                        <div className="flex-1">
                            <span className="font-bold">பெறுதல் (To):</span>{" "}
                            <span className="border-b border-dotted border-black inline-block min-w-[280px] px-2 font-bold">
                                {lastCreatedInvoice.customerName} ({lastCreatedInvoice.customerPhone})
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold">தேதி (Date):</span>{" "}
                            <span className="border-b border-dotted border-black inline-block min-w-[100px] px-2 font-mono">
                                {new Date(lastCreatedInvoice.createdAt).toLocaleDateString("en-IN")}
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
                            {lastCreatedInvoice.items.map((item, index) => {
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
                            {lastCreatedInvoice.items.length < 10 &&
                                Array.from({ length: 10 - lastCreatedInvoice.items.length }).map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="border-b border-black h-7">
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td></td>
                                    </tr>
                                ))}

                            {/* Discount row */}
                            {lastCreatedInvoice.discount > 0 && (
                                <tr className="border-b border-black font-bold">
                                    <td colSpan="3" className="border-r border-black py-1.5 text-right px-2">
                                        TALLUPADI (Discount):
                                    </td>
                                    <td className="border-r border-black py-1.5 text-right px-2 font-mono">
                                        -{lastCreatedInvoice.discount}
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
                                    {String(lastCreatedInvoice.total).split(".")[0]}
                                </td>
                                <td className="py-2 text-right px-2 text-md font-extrabold font-mono">
                                    {String(lastCreatedInvoice.total).split(".")[1] ? String(lastCreatedInvoice.total).split(".")[1].padEnd(2, "0").slice(0, 2) : "00"}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Rubber Seal outline and footer address info */}
                    <div className="flex justify-between items-center mt-6">
                        {/* Box mimicking physical rubber stamp of store */}
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

export default Billing;
