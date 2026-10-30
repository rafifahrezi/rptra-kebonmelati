"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TugasFungsiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TugasFungsi {
    _id: string;
    descTugas: string;
    descFungsi: string;
}

const MARKDOWN_CLASS =
    "space-y-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-green-600 [&_a]:underline";

export function TugasFungsiModal({ isOpen, onClose }: TugasFungsiModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(false);
    // undefined = belum dimuat, null = sudah dimuat tapi belum ada data
    const [data, setData] = useState<TugasFungsi | null | undefined>(undefined);
    const [error, setError] = useState(false);

    // Muat sekali saat pertama dibuka; gagal akan dicoba lagi saat dibuka berikutnya
    useEffect(() => {
        if (!isOpen || data !== undefined) return;

        const controller = new AbortController();
        setError(false);

        fetch("/api/tugas-fungsi", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => setData(json.items?.[0] ?? null)) // items[0] = yang terbaru
            .catch((err) => {
                if (err.name !== "AbortError") setError(true);
            });

        return () => controller.abort();
    }, [isOpen, data]);

    useEffect(() => {
        if (!isOpen) {
            setEntered(false);
            return;
        }

        const panel = panelRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        panel?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !panel) return;

            const focusables = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (e.shiftKey && (active === first || active === panel)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const raf = requestAnimationFrame(() => setEntered(true));

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const loading = data === undefined && !error;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${entered ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Konten Modal */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tugas-fungsi-title"
                aria-busy={loading}
                tabIndex={-1}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 outline-none transition-all duration-200 ${entered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
            >
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Profil</p>
                        <h2 id="tugas-fungsi-title" className="text-2xl font-bold text-gray-900">
                            Tugas &amp; Fungsi
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="text-gray-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    {loading && (
                        <div className="space-y-3 animate-pulse" role="status" aria-label="Memuat">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="text-red-600">
                            Gagal memuat data. Tutup lalu buka kembali untuk mencoba lagi.
                        </p>
                    )}

                    {data === null && <p>Belum ada informasi tugas dan fungsi.</p>}

                    {data && (
                        <>
                            {/* ReactMarkdown tidak merender HTML mentah, jadi aman untuk konten admin */}
                            <section aria-labelledby="tugas-heading">
                                <h3 id="tugas-heading" className="font-semibold text-gray-900 mb-2">
                                    Tugas
                                </h3>
                                <div className={MARKDOWN_CLASS}>
                                    <ReactMarkdown>{data.descTugas}</ReactMarkdown>
                                </div>
                            </section>

                            <section aria-labelledby="fungsi-heading">
                                <h3 id="fungsi-heading" className="font-semibold text-gray-900 mb-2">
                                    Fungsi
                                </h3>
                                <div className={MARKDOWN_CLASS}>
                                    <ReactMarkdown>{data.descFungsi}</ReactMarkdown>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}