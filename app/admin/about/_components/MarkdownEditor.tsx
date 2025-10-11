"use client";

import { memo, useEffect, useRef } from "react";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

interface MarkdownEditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    debounceMs?: number; // optional: delay sebelum emit ke parent
}

const MarkdownEditor = memo(function MarkdownEditor({
    label,
    value,
    onChange,
    placeholder = "",
    required = false,
    rows = 4,
    debounceMs = 300,
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const editorRef = useRef<EasyMDE | null>(null);
    const lastEmittedRef = useRef<string | null>(null);
    const debounceTimerRef = useRef<number | null>(null);
    const isSettingFromPropRef = useRef(false);

    useEffect(() => {
        if (!textareaRef.current) return;

        if (!editorRef.current) {
            editorRef.current = new EasyMDE({
                element: textareaRef.current,
                initialValue: value || "",
                minHeight: `${rows * 40}px`,
                maxHeight: "400px",
                placeholder,
                spellChecker: false,
                toolbar: [
                    "bold",
                    "italic",
                    "heading",
                    "|",
                    "quote",
                    "unordered-list",
                    "ordered-list",
                    "|",
                    "link",
                    "image",
                    "|",
                    "preview",
                    "side-by-side",
                    "fullscreen",
                ],
                status: false,
                autosave: { enabled: false },
            });

            // editor -> parent sync (debounced)
            editorRef.current.codemirror.on("change", () => {
                if (!editorRef.current) return;
                const current = editorRef.current.value();
                // prevent an immediate loop if we are currently applying a prop value
                if (isSettingFromPropRef.current) return;

                if (debounceTimerRef.current) {
                    window.clearTimeout(debounceTimerRef.current);
                }
                debounceTimerRef.current = window.setTimeout(() => {
                    // only emit if changed since last emit
                    if (lastEmittedRef.current !== current) {
                        lastEmittedRef.current = current;
                        onChange(current);
                    }
                }, debounceMs);
            });
        }

        // keep editor value synchronized from prop -> editor, but careful:
        // only update editor when prop `value` is truly different from editor value
        const editor = editorRef.current;
        if (editor) {
            const editorValue = editor.value();
            if (value !== editorValue) {
                // preserve cursor/scroll
                try {
                    isSettingFromPropRef.current = true;
                    const cm = editor.codemirror;
                    const cursor = cm.getCursor();
                    const scrollInfo = cm.getScrollInfo();

                    // set value (this can move cursor) then restore
                    editor.value(value ?? "");

                    // restore cursor and scroll
                    cm.setCursor(cursor);
                    cm.scrollTo(scrollInfo.left, scrollInfo.top);
                } finally {
                    // small delay to allow change events to settle before clearing flag
                    setTimeout(() => {
                        isSettingFromPropRef.current = false;
                    }, 0);
                }
            }
        }

        return () => {
            // cleanup debounce timer
            if (debounceTimerRef.current) {
                window.clearTimeout(debounceTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, onChange, placeholder, rows, debounceMs]);

    useEffect(() => {
        return () => {
            // cleanup on unmount
            if (editorRef.current) {
                try {
                    editorRef.current.toTextArea();
                } catch { }
                editorRef.current = null;
            }
            if (debounceTimerRef.current) {
                window.clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea ref={textareaRef} className="hidden" aria-required={required} placeholder={placeholder} />
        </div>
    );
});

export default MarkdownEditor;
