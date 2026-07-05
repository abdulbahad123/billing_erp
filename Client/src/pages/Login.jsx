import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { FiLock, FiMail } from "react-icons/fi";
import logo from "../assets/logo.png";

const Login = () => {
    const { login, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            // Check user role from localStorage/state to redirect
            const user = JSON.parse(localStorage.getItem("token") ? atob(localStorage.getItem("token").split(".")[1]) : "{}");
            if (user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/billing");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            {/* Background glowing decorations */}
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md p-8 glass-card rounded-2xl relative z-10 border border-white/5 shadow-2xl">
                <div className="text-center mb-8">
                    <img src={logo} alt="Logo" className="h-24 mx-auto mb-4 object-contain" />
                    <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
                        Welcome Back
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Sign in to manage billing & inventory
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            placeholder="admin@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                        />
                        <FiMail className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                    </div>

                    <div className="relative">
                        <Input
                            label="Password"
                            type="password"
                            id="password"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10"
                        />
                        <FiLock className="absolute bottom-3.5 left-3.5 text-slate-500 text-lg" />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                {/* Credentials footer removed */}
            </div>
        </div>
    );
};

export default Login;
