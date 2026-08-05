import { EventItem } from "@/types/event";
import { getImageUrl } from "@/lib/image";

/**
 * Normalisasi dan urutkan event dari API
 * @param rawData - Data mentah dari API (bisa berisi objek gambar atau string)
 * @param limit - Jumlah maksimal event yang dikembalikan (default: 3)
 * @returns EventItem[] yang sudah dinormalisasi, diurutkan, dan dibatasi
 */
export const normalizeAndSortEvents = (
  rawData: any[],
  limit: number = 3
): EventItem[] => {
  if (!Array.isArray(rawData)) {
    console.warn("Expected array for event data, got:", typeof rawData);
    return [];
  }

  const normalized = rawData
    .map((item) => {
      // Pastikan semua field wajib ada
      const images = Array.isArray(item.images)
        ? item.images
            .map((img: any) => {
              // Jika img adalah string → gunakan langsung
              if (typeof img === "string" && img.trim() !== "") {
                return img;
              }
              // Jika img adalah objek → coba ambil properti umum
              if (img && typeof img === "object") {
                return img.url || img.fileId || img.id || null;
              }
              return null;
            })
            .filter((id): id is string => typeof id === "string" && id.trim() !== "")
        : [];

      return {
        _id: String(item._id || item.id || ""),
        title: String(item.title || "").trim() || "Tanpa Judul",
        description: String(item.description || "").trim(),
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
        time: item.time ? String(item.time).trim() : undefined,
        location: String(item.location || "").trim(),
        category: String(item.category || "Umum").trim(),
        participants: typeof item.participants === "number" ? item.participants : 0,
        maxParticipants: typeof item.maxParticipants === "number" ? item.maxParticipants : 0,
        images, // array string ID file
        status: ["upcoming", "ongoing", "completed"].includes(item.status)
          ? (item.status as EventItem["status"])
          : "upcoming",
      } as EventItem;
    })
    .filter((event) => event._id && event.date); // Hanya event valid

  // Urutkan: terbaru dulu
  const sorted = normalized.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Ambil sesuai limit
  return sorted.slice(0, limit);
};