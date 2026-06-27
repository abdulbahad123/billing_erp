const Loader = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div
                className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-purple-500/30 border-t-purple-500 animate-spin`}
            />
        </div>
    );
};

export default Loader;
