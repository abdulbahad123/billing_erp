import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Button from "../components/Button";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from "react-icons/fi";

const Products = () => {
    const { api, user, language, t } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["All", "Motors", "Wires", "Hoses", "Fittings", "Accessories"]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form inputs
    const [name, setName] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("General");
    const [unit, setUnit] = useState("pcs");
    const [barcode, setBarcode] = useState("");

    const isAdmin = user?.role === "admin";

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/products?search=${search}&category=${selectedCategory}`);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (err) {
            console.error("Products load error:", err);
            setError("Failed to fetch product inventory.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user, search, selectedCategory]);

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setName(product.name);
            setPurchasePrice(product.purchasePrice);
            setPrice(product.price);
            setStock(product.stock);
            setCategory(product.category);
            setUnit(product.unit);
            setBarcode(product.barcode);
        } else {
            setEditingProduct(null);
            setName("");
            setPurchasePrice("");
            setPrice("");
            setStock("");
            setCategory("General");
            setUnit("pcs");
            setBarcode("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name,
            purchasePrice: Number(purchasePrice),
            price: Number(price),
            stock: Number(stock),
            category,
            unit,
            barcode,
        };

        try {
            if (editingProduct) {
                const res = await api.put(`/products/${editingProduct._id}`, payload);
                if (res.data.success) {
                    closeModal();
                    fetchProducts();
                }
            } else {
                const res = await api.post("/products", payload);
                if (res.data.success) {
                    closeModal();
                    fetchProducts();
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save product.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(language === "ta" ? "இந்த பொருளை நீக்க வேண்டுமா?" : "Are you sure you want to delete this product?")) {
            try {
                const res = await api.delete(`/products/${id}`);
                if (res.data.success) {
                    fetchProducts();
                }
            } catch (err) {
                alert("Failed to delete product.");
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                        {t("inventory")}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {t("inventorySubtitle")}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => openModal()} variant="primary" className="self-start">
                        <FiPlus /> {t("addProduct")}
                    </Button>
                )}
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Input
                        type="text"
                        placeholder={t("searchProduct")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    <FiSearch className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                                selectedCategory === cat
                                    ? "bg-purple-600 border-purple-500 text-white"
                                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Table Container */}
            {loading ? (
                <Loader size="lg" />
            ) : products.length === 0 ? (
                <div className="p-12 glass-card rounded-2xl text-center text-slate-500 border border-white/5">
                    <FiPackage className="text-4xl mx-auto mb-3 text-slate-600" />
                    <p>{language === "ta" ? "பொருட்கள் எதுவும் கிடைக்கவில்லை." : "No products found in this category."}</p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-6">{language === "ta" ? "பொருளின் பெயர்" : "Product Name"}</th>
                                    <th className="py-3 px-6">{t("category")}</th>
                                    <th className="py-3 px-6">{t("unit")}</th>
                                    {isAdmin && <th className="py-3 px-6 text-right">{t("purchasePrice")}</th>}
                                    <th className="py-3 px-6 text-right">{t("sellingPrice")}</th>
                                    {isAdmin && <th className="py-3 px-6 text-right">{t("stock")}</th>}
                                    {isAdmin && <th className="py-3 px-6 text-center">{t("actions")}</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                                {products.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-900/20">
                                        <td className="py-4 px-6 font-semibold text-slate-200 text-left">
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-400">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs">{item.unit}</td>
                                        {isAdmin && (
                                            <td className="py-4 px-6 text-right font-mono">
                                                Rs. {item.purchasePrice.toLocaleString()}
                                            </td>
                                        )}
                                        <td className="py-4 px-6 text-right font-bold text-slate-100 font-mono">
                                            Rs. {item.price.toLocaleString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="py-4 px-6 text-right font-mono">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs ${
                                                        item.stock < 5
                                                            ? "bg-red-500/10 text-red-400 font-bold"
                                                            : "text-slate-300"
                                                    }`}
                                                >
                                                    {item.stock}
                                                </span>
                                            </td>
                                        )}
                                        {isAdmin && (
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button
                                                        onClick={() => openModal(item)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
                                                        title="Edit Product"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                                        title="Delete Product"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg glass-card border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-6 text-left">
                            {editingProduct ? t("saveChanges") : t("addProduct")}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label={language === "ta" ? "பொருளின் பெயர்" : "Product Name"}
                                placeholder="Lakshmi Motor 1.5 HP"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={language === "ta" ? "கொள்முதல் விலை (Cost Price)" : "Purchase Price (Rs.)"}
                                    type="number"
                                    placeholder="10000"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    required
                                />
                                <Input
                                    label={language === "ta" ? "விற்பனை விலை (Selling Price)" : "Selling Price (Rs.)"}
                                    type="number"
                                    placeholder="12500"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={language === "ta" ? "இருப்பு அளவு (Stock)" : "Stock Quantity"}
                                    type="number"
                                    placeholder="10"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    required
                                />
                                <div className="flex flex-col gap-2 text-left">
                                    <label className="text-sm font-medium text-slate-300">{t("category")}</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:outline-none w-full"
                                    >
                                        <option value="General">General</option>
                                        <option value="Motors">Motors</option>
                                        <option value="Wires">Wires</option>
                                        <option value="Hoses">Hoses</option>
                                        <option value="Fittings">Fittings</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2 text-left">
                                    <label className="text-sm font-medium text-slate-300">{t("unit")}</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:outline-none w-full"
                                    >
                                        <option value="pcs">pcs (Pieces)</option>
                                        <option value="mtr">mtr (Meters)</option>
                                        <option value="kg">kg (Kilograms)</option>
                                        <option value="set">set (Sets)</option>
                                        <option value="feet">feet (Feet)</option>
                                    </select>
                                </div>
                                <Input
                                    label={language === "ta" ? "பார்கோடு / பொருள் குறியீடு" : "Barcode / Product Code"}
                                    placeholder="MTR-LAKSHMI"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                                <Button onClick={closeModal} variant="secondary">
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" variant="primary">
                                    {editingProduct ? t("saveChanges") : t("addCatalog")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
