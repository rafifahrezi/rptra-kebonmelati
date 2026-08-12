export const chunkText = (text: string, chunkSize: number, overlap: number): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
    if (i + chunkSize >= words.length) {
      break;
    }
  }
  
  return chunks;
};
