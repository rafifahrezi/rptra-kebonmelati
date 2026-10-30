export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const imgUrl = (id: string) => `/api/files/${id}`;

// Bearer dari localStorage (sama dengan useAuth) + cookie sebagai cadangan
export async function request(url: string, init: RequestInit = {}) {
  const token = localStorage.getItem("admin-token");
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || data.error || "Permintaan gagal");
  return data;
}
// shortcut: hapus simbol markdown umum lewat regex, bukan render penuh; upgrade ke renderer jika pratinjau perlu format
export const plain = (md: string) => md.replace(/[#*_`>~-]+\s?|\[([^\]]*)\]\([^)]*\)/g, "$1");