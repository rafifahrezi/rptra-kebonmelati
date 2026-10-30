"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Trash2, Upload, Save, X, Loader2, User } from "lucide-react";
import { IMAGE_TYPES, MAX_IMAGE_SIZE, imgUrl, request } from "./adminApi";

interface Item {
    _id: string;
    nama: string;
    jabatan: string;
    foto: string;
    urutan: number;
}

const EMPTY = { nama: "", jabatan: "", foto: "", urutan: 0 };
const INPUT =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500";

export default function PegawaiSection() {
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
            setItems((await request("/api/pegawai")).items);
        } catch {
            setMsg({ text: "Gagal memuat data Pegawai", error: true });
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
        if (!IMAGE_TYPES.includes(file.type)) return setMsg({ text: "Gunakan JPG, PNG, atau WebP", error: true });
        if (file.size > MAX_IMAGE_SIZE) return setMsg({ text: "Ukuran file maks 5MB", error: true });
        run(async () => {
            const fd = new FormData();
            fd.append("file", file);
            const { fileId } = await request("/api/upload", { method: "POST", body: fd });
            if (!fileId) throw new Error("ID gambar tidak ditemukan");
            setForm((f) => ({ ...f, foto: fileId }));
        }, "Foto diupload, klik Simpan untuk menerapkan");
    };

    const save = () =>
        run(async () => {
            await request(editId ? `/api/pegawai/${editId}` : "/api/pegawai", {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            reset();
            await load();
        }, "Pegawai disimpan");

    const remove = (item: Item) => {
        if (!confirm(`Hapus pegawai "${item.nama}"?`)) return;
        run(async () => {
            await request(`/api/pegawai/${item._id}`, { method: "DELETE" });
            if (editId === item._id) reset();
            await load();
        }, "Pegawai dihapus");
    };

    return (
        <div className="space-y-6">
            {msg && (
                <p className={`text-sm font-medium ${msg.error ? "text-red-600" : "text-green-600"}`}>{msg.text}</p>
            )}

            {/* Form */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-semibold text-gray-800">{editId ? "Edit Pegawai" : "Tambah Pegawai"}</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            placeholder="Nama pegawai"
                            className={INPUT}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Jabatan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.jabatan}
                            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                            placeholder="Contoh: Pengelola"
                            className={INPUT}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Urutan Tampil</label>
                        <input
                            type="number"
                            min={0}
                            value={form.urutan}
                            onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) || 0 })}
                            className={INPUT}
                        />
                        <p className="text-xs text-gray-500">Angka kecil tampil paling atas.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Foto</label>
                    {form.foto ? (
                        <div className="relative w-40 h-40">
                            <img
                                src={imgUrl(form.foto)}
                                alt="Foto pegawai"
                                className="w-full h-full object-cover rounded-lg border-2 border-green-200"
                            />
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, foto: "" })}
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Lepas foto"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="inline-flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">Pilih Foto (JPG, PNG, WebP, maks 5MB)</span>
                            <input
                                type="file"
                                accept={IMAGE_TYPES.join(",")}
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
                        disabled={busy || !form.nama.trim() || !form.jabatan.trim()}
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

            {/* List (sudah terurut dari API: urutan kecil di atas) */}
            {items.length === 0 ? (
                <p className="text-center py-6 text-gray-500">Belum ada pegawai</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            {item.foto ? (
                                <img src={imgUrl(item.foto)} alt={item.nama} className="w-14 h-14 object-cover rounded-full" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{item.nama}</p>
                                <p className="text-sm text-gray-600 truncate">{item.jabatan}</p>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full" title="Urutan tampil">
                                #{item.urutan}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(item._id);
                                        setForm({ nama: item.nama, jabatan: item.jabatan, foto: item.foto, urutan: item.urutan });
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(item)}
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