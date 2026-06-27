import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const BACKEND_URL = "http://localhost:5000";

// Axios custom instance
export const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Translation Dictionary for English and Tamil
export const translations = {
    en: {
        // Sidebar & Navbar
        dashboard: "Dashboard",
        billing: "New Billing",
        invoices: "Invoices History",
        products: "Products Inventory",
        reports: "Analytics & Reports",
        settings: "Settings",
        logout: "Log Out",
        welcome: "Welcome",
        subtitle: "Sri Angala Parameswari Motors ERP",
        
        // Dashboard
        dbOverview: "Dashboard Overview",
        dbSubtitle: "Real-time performance indicators for Angala Parameswari Motors",
        totalRevenue: "Total Revenue",
        totalProfits: "Total Profits",
        activeCatalog: "Active Catalog",
        active: "Active",
        shiftStatus: "Shift Status",
        totalInvoices: "Total Invoices",
        lowStockAlerts: "Low Stock Alerts",
        recentInvoices: "Recent Invoices",
        billNo: "Bill No",
        customer: "Customer",
        phone: "Phone",
        payment: "Payment",
        totalAmount: "Total Amount",
        cashier: "Cashier",
        date: "Date",
        salesTrend: "30-Day Sales Trend",
        allStocked: "All products are well stocked.",
        left: "left",
        unit: "Unit",
        actions: "Actions",

        // Billing
        createNewBill: "Create New Bill",
        billingSubtitle: "Calculate dynamic rates, create receipts, and print invoices",
        customerInfo: "Customer Information",
        custPhone: "Customer Mobile Number",
        custName: "Customer Name",
        selectProduct: "Select Product / Add Item",
        searchCatalog: "Search Product Catalog",
        itemParticulars: "Item Particulars (Name)",
        enableCustomCalc: "Enable Custom Rate Calculation (e.g. 155 mtrs x Rs. 115)",
        quantity: "Quantity",
        pricePerUnit: "Price per Unit (Rs.)",
        addItem: "Add Item to Bill",
        billSummary: "Bill Summary",
        subtotal: "Subtotal",
        discount: "Discount (Rs.)",
        grandTotal: "Grand Total",
        paymentMode: "Payment Mode",
        generateInvoice: "Generate Invoice",
        lengthWeight: "Length / Weight",
        ratePerUnit: "Rate per Unit (Rs.)",

        // Products
        inventory: "Products Inventory",
        inventorySubtitle: "Manage catalog prices, unit metrics, and real-time stock levels",
        addProduct: "Add Product",
        searchProduct: "Search product name...",
        category: "Category",
        purchasePrice: "Purchase Price",
        sellingPrice: "Selling Price",
        stock: "Stock",
        saveChanges: "Save Changes",
        addCatalog: "Add Catalog",
        cancel: "Cancel",

        // Invoices
        invoiceSubtitle: "Retrieve past transactions, reprint bills, and share receipts with customers",
        reprint: "Print Receipt",
        share: "Share",
        billTo: "Bill To",
        invoiceDate: "Invoice Date",
        payMode: "Pay Mode",
        sNo: "S.No",
        particulars: "Particulars",
        qtyCalc: "Qty / Calculations",
        amtRs: "Amount (Rs)",

        // Reports
        reportsSubtitle: "Calculate profit margins, aggregate gross revenues, and audit transactions",
        cumulativeRevenue: "Cumulative Revenue",
        netStoreProfit: "Net Store Profit",
        avgProfitMargin: "Average Profit Margin",
        dailyAudit: "Daily Sales & Profit Auditing",

        // Settings
        systemSettings: "System Settings",
        settingsSubtitle: "Manage cashier accounts and customize bill headers",
        createCashier: "Create Cashier Account",
        customizeReceipt: "Customize Receipt Metadata",
        fullName: "Full Name",
        email: "Email Address",
        defaultPassword: "Default Password",
        registerAccount: "Register Account",
        businessName: "Business Name (Header)",
        shopAddress: "Shop Address",
        contactCell: "Contact Cell Phone Numbers",
        saveConfig: "Save Configurations",
    },
    ta: {
        // Sidebar & Navbar
        dashboard: "டேஷ்போர்டு",
        billing: "புதிய பில்லிங்",
        invoices: "பில் வரலாறு",
        products: "பொருட்கள் பட்டியல்",
        reports: "பகுப்பாய்வு மற்றும் அறிக்கைகள்",
        settings: "அமைப்புகள்",
        logout: "வெளியேறு",
        welcome: "வரவேற்கிறோம்",
        subtitle: "ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ் ERP",
        
        // Dashboard
        dbOverview: "நிர்வாக மேலோட்டம்",
        dbSubtitle: "ஸ்ரீ அங்காள பரமேஸ்வரி மோட்டார்ஸ் நேரடி செயல்பாடு",
        totalRevenue: "மொத்த விற்பனை",
        totalProfits: "மொத்த லாபம்",
        activeCatalog: "பொருட்கள் எண்ணிக்கை",
        active: "செயலில்",
        shiftStatus: "பணி நிலை",
        totalInvoices: "மொத்த பில்கள்",
        lowStockAlerts: "குறைந்த இருப்பு எச்சரிக்கை",
        recentInvoices: "சமீபத்திய பில்கள்",
        billNo: "பில் எண்",
        customer: "வாடிக்கையாளர்",
        phone: "கைபேசி",
        payment: "பணம் செலுத்துதல்",
        totalAmount: "மொத்த தொகை",
        cashier: "பில் போடுபவர்",
        date: "தேதி",
        salesTrend: "30-நாட்கள் விற்பனை வரைபடம்",
        allStocked: "அனைத்து பொருட்களும் போதிய அளவில் உள்ளன.",
        left: "மீதமுள்ளது",
        unit: "அலகு",
        actions: "செயல்கள்",

        // Billing
        createNewBill: "புதிய பில் போடுக",
        billingSubtitle: "விலை கணக்கிட்டு, பில்களை உருவாக்கி, அச்சிடுக",
        customerInfo: "வாடிக்கையாளர் விவரங்கள்",
        custPhone: "வாடிக்கையாளர் கைபேசி எண்",
        custName: "வாடிக்கையாளர் பெயர்",
        selectProduct: "பொருளைத் தேர்ந்தெடுக்கவும் / சேர்க்கவும்",
        searchCatalog: "பொருட்கள் தேடல்",
        itemParticulars: "பொருளின் பெயர் (Particulars)",
        enableCustomCalc: "நீள/எடை கணக்கீட்டை இயக்கு (உதாரணமாக: 155 மீட்டர் x ரூ. 115)",
        quantity: "அளவு (Quantity)",
        pricePerUnit: "ஒரு யூனிட் விலை (ரூ.)",
        addItem: "பில்லில் சேர்க்கவும்",
        billSummary: "பில் விவரம்",
        subtotal: "கூட்டுத்தொகை",
        discount: "தள்ளுபடி (ரூ.)",
        grandTotal: "மொத்த தொகை (Total)",
        paymentMode: "பணம் செலுத்தும் முறை",
        generateInvoice: "பில் உருவாக்கு (Invoice)",
        lengthWeight: "நீளம் / எடை",
        ratePerUnit: "யூனிட் விலை (ரூ.)",

        // Products
        inventory: "பொருட்கள் இருப்பு பட்டியல்",
        inventorySubtitle: "பொருட்களின் விலை, அளவீடுகள் மற்றும் இருப்பை நிர்வகிக்கவும்",
        addProduct: "புதிய பொருள் சேர்",
        searchProduct: "பொருளைத் தேடுக...",
        category: "வகை (Category)",
        purchasePrice: "கொள்முதல் விலை (Cost)",
        sellingPrice: "விற்பனை விலை (Price)",
        stock: "இருப்பு (Stock)",
        saveChanges: "மாற்றங்களைச் சேமி",
        addCatalog: "பட்டியலில் சேர்",
        cancel: "ரத்து செய்",

        // Invoices
        invoiceSubtitle: "முந்தைய பில்களைப் பார்க்கவும், மீண்டும் அச்சிடவும் மற்றும் வாடிக்கையாளருக்குப் பகிரவும்",
        reprint: "அச்சிடுக (Print)",
        share: "பகிருக (Share)",
        billTo: "பெறுநர்",
        invoiceDate: "பில் தேதி",
        payMode: "செலுத்தல் முறை",
        sNo: "வ.எண்",
        particulars: "பொருட்கள் விவரம்",
        qtyCalc: "அளவு / கணக்கீடு",
        amtRs: "தொகை (ரூ.)",

        // Reports
        reportsSubtitle: "லாப வரம்புகள், மொத்த வருமானம் மற்றும் கணக்கு தணிக்கை",
        cumulativeRevenue: "ஒட்டுமொத்த வருவாய்",
        netStoreProfit: "நிகர லாபம்",
        avgProfitMargin: "சராசரி லாப சதவீதம்",
        dailyAudit: "தினசரி விற்பனை மற்றும் லாப தணிக்கை",

        // Settings
        systemSettings: "அமைப்புகள் மற்றும் நிர்வகிப்பு",
        settingsSubtitle: "கேஷியர் கணக்குகளை நிர்வகிக்க மற்றும் பில் தலைப்பை மாற்றியமைக்க",
        createCashier: "புதிய கேஷியர் கணக்கு உருவாக்கு",
        customizeReceipt: "பில் தலைப்பு விவரங்கள்",
        fullName: "முழு பெயர்",
        email: "மின்னஞ்சல் முகவரி",
        defaultPassword: "கடவுச்சொல் (Password)",
        registerAccount: "கணக்கை பதிவுசெய்",
        businessName: "நிறுவனத்தின் பெயர் (Header)",
        shopAddress: "கடையின் முகவரி",
        contactCell: "தொடர்பு கைபேசி எண்கள்",
        saveConfig: "அமைப்புகளைச் சேமி",
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Language State ('ta' for Tamil, 'en' for English)
    const [language, setLanguageState] = useState(localStorage.getItem("language") || "ta");

    const setLanguage = (lang) => {
        localStorage.setItem("language", lang);
        setLanguageState(lang);
    };

    // Helper translation function
    const t = (key) => {
        return translations[language]?.[key] || translations["en"]?.[key] || key;
    };

    // Fetch user profile on startup if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await api.get("/auth/profile");
                    if (response.data.success) {
                        setUser(response.data.user);
                    } else {
                        logout();
                    }
                } catch (err) {
                    console.error("Failed to load user profile:", err);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        setError("");
        try {
            const response = await api.post("/auth/login", { email, password });
            if (response.data.success) {
                const { token: userToken, user: userData } = response.data;
                localStorage.setItem("token", userToken);
                setToken(userToken);
                setUser(userData);
                return { success: true };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Invalid credentials. Try again.";
            setError(errMsg);
            return { success: false, message: errMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                login,
                logout,
                api,
                BACKEND_URL,
                language,
                setLanguage,
                t,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
