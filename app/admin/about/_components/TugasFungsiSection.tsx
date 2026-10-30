"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import { request, plain } from "./adminApi";

interface Item {
    _id: string;
    descTugas: string;
    descFungsi: string;
}

const EMPTY = { descTugas: "", descFungsi: "" };

export default function TugasFungsiSection() {
    const [items, setItems] = useState<Item[]>([]);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

    const run = async (fn: () => Promise<void>, okText: string) => {
        setBusy(true);
        setMsg(null);
        try {
            await fn();
            setMsg({ text: okText });
        } catch (e) {
            setMsg({ text: e instanceof Error ? e.message : "Terjadi kesalahan", error: true });
        } finally {
            setBusy(false);
        }
    };

    const load = useCallback(async () => {
        try {
            setItems((await request("/api/tugas-fungsi")).items);
        } catch {
            setMsg({ text: "Gagal memuat Tugas & Fungsi", error: true });
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const reset = () => {
        setForm(EMPTY);
        setEditId(null);
    };

    const save = () =>
        run(async () => {
            await request(editId ? `/api/tugas-fungsi/${editId}` : "/api/tugas-fungsi", {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            reset();
            await load();
        }, "Tugas & Fungsi disimpan");

    const remove = (id: string) => {
        if (!confirm("Hapus Tugas & Fungsi ini?")) return;
        run(async () => {
            await request(`/api/tugas-fungsi/${id}`, { method: "DELETE" });
            if (editId === id) reset();
            await load();
        }, "Tugas & Fungsi dihapus");
    };

    return (
        <div className="space-y-6">
            {msg && (
                <p className={`text-sm font-medium ${msg.error ? "text-red-600" : "text-green-600"}`}>{msg.text}</p>
            )}

            {/* Form */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-semibold text-gray-800">{editId ? "Edit Tugas & Fungsi" : "Tambah Tugas & Fungsi"}</h3>

                <MarkdownEditor
                    label="Deskripsi Tugas"
                    value={form.descTugas}
                    onChange={(v) => setForm((f) => ({ ...f, descTugas: v }))}
                    placeholder="Tulis tugas RPTRA menggunakan markdown..."
                    required
                    rows={6}
                />
                <MarkdownEditor
                    label="Deskripsi Fungsi"
                    value={form.descFungsi}
                    onChange={(v) => setForm((f) => ({ ...f, descFungsi: v }))}
                    placeholder="Tulis fungsi RPTRA menggunakan markdown..."
                    required
                    rows={6}
                />

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={save}
                        disabled={busy || !form.descTugas.trim() || !form.descFungsi.trim()}
                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editId ? "Simpan Perubahan" : "Tambah"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={reset}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            <X className="w-4 h-4" /> Batal
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            {items.length === 0 ? (
                <p className="text-center py-6 text-gray-500">Belum ada Tugas & Fungsi</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={item._id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 min-w-0 space-y-2">
                                {i === 0 && (
                                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Tampil di publik
                                    </span>
                                )}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Tugas</p>
                                    <p className="text-sm text-gray-700 line-clamp-2">{plain(item.descTugas)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Fungsi</p>
                                    <p className="text-sm text-gray-700 line-clamp-2">{plain(item.descFungsi)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(item._id);
                                        setForm({ descTugas: item.descTugas, descFungsi: item.descFungsi });
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(item._id)}
                                    disabled={busy}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}