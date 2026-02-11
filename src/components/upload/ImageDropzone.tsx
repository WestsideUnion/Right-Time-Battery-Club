'use client';

import { useRef, useState, DragEvent } from 'react';

interface ImageDropzoneProps {
    onFile: (file: File) => void;
    preview?: string;
}

export default function ImageDropzone({ onFile, preview }: ImageDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) onFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
    };

    return (
        <div
            className={`dropzone p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${isDragOver ? 'active' : ''
                }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {preview ? (
                <div className="space-y-4">
                    <img
                        src={preview}
                        alt="Receipt preview"
                        className="max-h-64 mx-auto rounded-lg border border-white/10"
                    />
                    <p className="text-sm text-[var(--brand-slate)]">
                        Click or drag to replace
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--brand-surface-light)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--brand-slate)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-medium">
                            Drop your receipt here
                        </p>
                        <p className="text-sm text-[var(--brand-slate)] mt-1">
                            or click to browse • PNG, JPG up to 10MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
