import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--brand-slate)]"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full px-4 py-2.5 bg-[var(--brand-surface)] border border-white/10 rounded-xl text-white placeholder:text-[var(--brand-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/50 focus:border-[var(--brand-gold)]/50 transition-all duration-200 ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}
