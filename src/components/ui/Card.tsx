import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
}

export default function Card({ children, className = '', glow = false }: CardProps) {
    return (
        <div
            className={`glass p-6 ${glow ? 'glow-gold' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`mb-4 ${className}`}>{children}</div>
    );
}

export function CardTitle({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={`text-lg font-semibold text-white ${className}`}>
            {children}
        </h3>
    );
}
