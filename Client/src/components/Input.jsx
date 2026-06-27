const Input = ({
    label,
    type = "text",
    id,
    placeholder = "",
    value,
    onChange,
    required = false,
    className = "",
    ...props
}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-slate-300">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`glass-input px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none w-full ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
