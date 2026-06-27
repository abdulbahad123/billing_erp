const Button = ({
    children,
    type = "button",
    variant = "primary",
    onClick,
    disabled = false,
    className = "",
    ...props
}) => {
    const baseStyle =
        "px-5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer";

    const variants = {
        primary:
            "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25",
        secondary:
            "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-white",
        danger:
            "bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300",
        success:
            "bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
