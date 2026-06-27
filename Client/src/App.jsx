import { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-400">
                Verifying session...
            </div>
        );
    }
    return token ? children : <Navigate to="/login" replace />;
};

// Route guard for Admin roles
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user && user.role === "admin" ? children : <Navigate to="/billing" replace />;
};

// Application shell layout
const AppLayout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            {/* Sidebar navigation */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content viewport */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar toggleSidebar={toggleSidebar} />

                {/* Primary route outlet */}
                <main className="flex-1 overflow-y-auto px-6 py-8 relative">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to={user?.role === "admin" ? "/dashboard" : "/billing"}
                                    replace
                                />
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <AdminRoute>
                                    <Dashboard />
                                </AdminRoute>
                            }
                        />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                            path="/reports"
                            element={
                                <AdminRoute>
                                    <Reports />
                                </AdminRoute>
                            }
                        />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
