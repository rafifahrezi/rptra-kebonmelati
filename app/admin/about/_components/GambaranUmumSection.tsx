"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Trash2, Upload, Save, X, Loader2 } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";

interface Item {
    _id: string;
    deskripsi: string;
    gambar: string;
}

const EMPTY = { deskripsi: "", gambar: "" };
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const imgUrl = (id: string) => `/api/files/${id}`;

async function request(url: string, init: RequestInit = {}) {
    const token = localStorage.getItem("admin-token");
    const res = await fetch(url, {
        credentials: "include",
        ...init,
        headers: { ...(token && { Authorization: `Bearer ${token}` }), ...init.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Permintaan gagal");
    return data;
}

export default function GambaranUmumSection() {
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
            setItems((await request("/api/gambaran-umum")).items);
        } catch {
            setMsg({ text: "Gagal memuat Gambaran Umum", error: true });
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const reset = () => {
        setForm(EMPTY);
        setEditId(null);
    };

    const upload = (file: File) => {
        if (!TYPES.includes(file.type)) return setMsg({ text: "Gunakan JPG, PNG, atau WebP", error: true });
        if (file.size > MAX_SIZE) return setMsg({ text: "Ukuran file maks 5MB", error: true });
        run(async () => {
            const fd = new FormData();
            fd.append("file", file);
            const { fileId } = await request("/api/upload", { method: "POST", body: fd });
            if (!fileId) throw new Error("ID gambar tidak ditemukan");
            setForm((f) => ({ ...f, gambar: fileId }));
        }, "Gambar diupload, klik Simpan untuk menerapkan");
    };

    const save = () =>
        run(async () => {
            await request(editId ? `/api/gambaran-umum/${editId}` : "/api/gambaran-umum", {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            reset();
            await load();
        }, "Gambaran Umum disimpan");

    const remove = (id: string) => {
        if (!confirm("Hapus Gambaran Umum ini?")) return;
        run(async () => {
            await request(`/api/gambaran-umum/${id}`, { method: "DELETE" });
            if (editId === id) reset();
            await load();
        }, "Gambaran Umum dihapus");
    };
    // shortcut: hapus simbol markdown umum lewat regex, bukan render penuh; upgrade ke renderer jika pratinjau perlu format
    const plain = (md: string) => md.replace(/[#*_`>~-]+\s?|\[([^\]]*)\]\([^)]*\)/g, "$1");

    return (
        <div className="space-y-6">
            {msg && (
                <p className={`text-sm font-medium ${msg.error ? "text-red-600" : "text-green-600"}`}>{msg.text}</p>
            )}

            {/* Form */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-semibold text-gray-800">{editId ? "Edit Gambaran Umum" : "Tambah Gambaran Umum"}</h3>

                <div className="space-y-2">
                    {/* <label className="block text-sm font-medium text-gray-700">
                        Deskripsi <span className="text-red-500">*</span>
                    </label> */}
                    <MarkdownEditor
                        label="Deskripsi"
                        value={form.deskripsi}
                        onChange={(v) => setForm((f) => ({ ...f, deskripsi: v }))}
                        placeholder="Tulis gambaran umum RPTRA menggunakan markdown..."
                        required
                        rows={6}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gambar</label>
                    {form.gambar ? (
                        <div className="relative w-64 h-48">
                            <img
                                src={imgUrl(form.gambar)}
                                alt="Gambaran Umum"
                                className="w-full h-full object-cover rounded-lg border-2 border-green-200"
                            />
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, gambar: "" })}
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Lepas gambar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="inline-flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">Pilih Gambar (JPG, PNG, WebP, maks 5MB)</span>
                            <input
                                type="file"
                                accept={TYPES.join(",")}
                                disabled={busy}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) upload(file);
                                    e.target.value = "";
                                }}
                            />
                        </label>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={save}
                        disabled={busy || !form.deskripsi.trim()}
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
                <p className="text-center py-6 text-gray-500">Belum ada Gambaran Umum</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={item._id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                            {item.gambar && (
                                <img src={imgUrl(item.gambar)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            )}
                            <div className="flex-1 min-w-0">
                                {i === 0 && (
                                    <span className="inline-block mb-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Tampil di publik
                                    </span>
                                )}
                                <p className="text-sm text-gray-700 line-clamp-3">{plain(item.deskripsi)}</p>
                            </div>
                            <div className="flex items-start gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(item._id);
                                        setForm({ deskripsi: item.deskripsi, gambar: item.gambar });
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