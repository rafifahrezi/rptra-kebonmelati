"use client";

import { useCallback, useMemo, useState } from "react";
import { ReadMoreModal } from "@/components/ReadMoreModal";

const PREVIEW_PARAGRAPHS = 2;
const PREVIEW_CHARS = 200; // shortcut: paragraf panjang dideteksi lewat jumlah karakter, bukan ukur baris; upgrade ke pengukuran DOM jika kurang akurat

interface ReadMoreTextProps {
    text?: string | null;
    modalTitle: string;
    /** Gaya teks (ukuran, warna, lebar). Dipasang di pembungkus, paragraf dan tombol mewarisinya. */
    className?: string;
}

export function ReadMoreText({ text, modalTitle, className = "" }: ReadMoreTextProps) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);

    // Paragraf = dipisah baris kosong (cara admin mengetik di textarea)
    const paragraphs = useMemo(
        () => (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        [text],
    );

    if (paragraphs.length === 0) return null;

    const preview = paragraphs.slice(0, PREVIEW_PARAGRAPHS);
    const hasMore =
        paragraphs.length > PREVIEW_PARAGRAPHS || preview.some((p) => p.length > PREVIEW_CHARS);

    return (
        <div className={`space-y-3 ${className}`}>
            {preview.map((p, i) => (
                <p key={i} className="line-clamp-3">
                    {p}
                </p>
            ))}

            {hasMore && (
                <>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-haspopup="dialog"
                        className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                    >
                        Selengkapnya
                    </button>

                    <ReadMoreModal isOpen={open} onClose={close} title={modalTitle}>
                        <div className="space-y-4">
                            {paragraphs.map((p, i) => (
                                <p key={i} className="whitespace-pre-line">
                                    {p}
                                </p>
                            ))}
                        </div>
                    </ReadMoreModal>
                </>
            )}
        </div>
    );
}