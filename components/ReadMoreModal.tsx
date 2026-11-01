"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadMoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function ReadMoreModal({ isOpen, onClose, title, children }: ReadMoreModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(false);
    const titleId = useId();

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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${entered ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 outline-none transition-all duration-200 ${entered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
                <div className="flex items-start justify-between gap-4 mb-6">
                    <h2 id={titleId} className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>
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
                <div className="text-gray-600 leading-relaxed">{children}</div>
            </div>
        </div>
    );
}