// src/lib/image.ts
export const getImageUrl = (id: string): string => {
  if (!id || id.trim() === "") return "/placeholder-image.jpg";
  return `/api/files/${encodeURIComponent(id)}`;
};