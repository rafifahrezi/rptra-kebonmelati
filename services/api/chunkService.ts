export interface OperationalData {
  title: string;
  hours: Record<string, string>;
}

export interface AboutData {
  title: string;
  subtitle: string;
  mission: { title: string; description: string; image?: string };
  vision: { title: string; description: string; image?: string };
  values: { title: string; description: string };
  programs: { title: string; description: string; items: any[] };
  facilities: {
    title: string;
    description: string;
    items: any[];
    images?: string[];
  };
  collaborations: { title: string; description: string; partners: any[] };
  operational: OperationalData;
  establishedYear: string;
  establishedText: string;
  lastUpdated?: string;
}

export interface RagChunk {
  text: string;
  metadata: {
    source: "about";
    section: string;
    lastUpdated?: string;
  };
}

/**
 * Konversi data operational hours menjadi natural language text
 * untuk keperluan embedding RAG
 */
export function convertOperationalToText(operational: OperationalData): string {
  if (!operational || !operational.hours)
    return "Tidak ada data jam operasional.";

  const dayOrder = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu",
  ];

  const dayLabels: Record<string, string> = {
    senin: "Senin",
    selasa: "Selasa",
    rabu: "Rabu",
    kamis: "Kamis",
    jumat: "Jumat",
    sabtu: "Sabtu",
    minggu: "Minggu",
  };

  // Group hari dengan jam yang sama untuk teks lebih natural
  const hoursMap = new Map<string, string[]>();

  for (const day of dayOrder) {
    const hours = operational.hours[day];
    if (!hours) continue;

    if (!hoursMap.has(hours)) {
      hoursMap.set(hours, []);
    }
    hoursMap.get(hours)!.push(dayLabels[day]);
  }

  // Generate kalimat per grup jam
  const sentences: string[] = [];

  for (const [hours, days] of hoursMap.entries()) {
    if (days.length === dayOrder.length) {
      // Semua hari sama
      sentences.push(
        `RPTRA Bonti buka setiap hari (Senin sampai Minggu) pukul ${hours}.`,
      );
    } else if (days.length >= 2) {
      const daysList = formatDaysList(days);
      sentences.push(`Pada hari ${daysList}, RPTRA Bonti buka pukul ${hours}.`);
    } else {
      sentences.push(`Pada hari ${days[0]}, RPTRA Bonti buka pukul ${hours}.`);
    }
  }

  // Tambahkan detail per hari juga untuk redundancy (membantu exact match retrieval)
  const perDayDetails = dayOrder
    .filter((day) => operational.hours[day])
    .map((day) => `${dayLabels[day]}: ${operational.hours[day]}`)
    .join(", ");

  const fullText = [
    `${operational.title || "Jam Operasional"} RPTRA Bonti Kebon Melati.`,
    ...sentences,
    `Rincian lengkap jam operasional: ${perDayDetails}.`,
  ].join(" ");

  return fullText;
}

function formatDaysList(days: string[]): string {
  if (days.length === 1) return days[0];
  const last = days[days.length - 1];
  const rest = days.slice(0, -1).join(", ");
  return `${rest}, dan ${last}`;
}

export function convertAboutToChunks(about: AboutData): RagChunk[] {
  const chunks: RagChunk[] = [];
  const baseMetadata = {
    source: "about" as const,
    lastUpdated: about.lastUpdated,
  };

  // Chunk 1: Info umum
  chunks.push({
    text: `${about.title}. ${about.subtitle}. RPTRA Bonti ${about.establishedText || "berdiri sejak"} ${about.establishedYear}.`,
    metadata: { ...baseMetadata, section: "general" },
  });

  // Chunk 2: Misi & Visi
  if (about.mission && about.vision) {
    chunks.push({
      text: `${about.mission.title}: ${about.mission.description}. ${about.vision.title}: ${about.vision.description}.`,
      metadata: { ...baseMetadata, section: "mission_vision" },
    });
  }

  // Chunk 3: Nilai-nilai
  if (about.values) {
    chunks.push({
      text: `${about.values.title}: ${about.values.description}.`,
      metadata: { ...baseMetadata, section: "values" },
    });
  }

  // Chunk 4: Program (per item agar lebih spesifik)
  if (about.programs && about.programs.items) {
    about.programs.items.forEach((item) => {
      chunks.push({
        text: `Program RPTRA Bonti - ${item.name}: ${item.description}.`,
        metadata: { ...baseMetadata, section: "programs" },
      });
    });
  }

  // Chunk 5: Fasilitas (per item)
  if (about.facilities && about.facilities.items) {
    about.facilities.items.forEach((item) => {
      chunks.push({
        text: `Fasilitas RPTRA Bonti - ${item.name}: ${item.description}.`,
        metadata: { ...baseMetadata, section: "facilities" },
      });
    });
  }

  // Chunk 6: Kemitraan
  if (about.collaborations && about.collaborations.partners) {
    const partnersList = about.collaborations.partners
      .map((p) => `${p.name} (${p.role})`)
      .join(", ");
    chunks.push({
      text: `${about.collaborations.title}: ${about.collaborations.description}. Mitra kerjasama: ${partnersList}.`,
      metadata: { ...baseMetadata, section: "collaborations" },
    });
  }

  // Chunk 7: Jam Operasional (PENTING - gunakan converter khusus)
  if (about.operational) {
    chunks.push({
      text: convertOperationalToText(about.operational),
      metadata: { ...baseMetadata, section: "operational" },
    });
  }

  return chunks;
}

/**
 * Memotong teks bebas (seperti berita atau acara) menjadi bagian-bagian lebih kecil
 * dengan menyertakan konteks secara eksplisit di awal tiap potongan.
 */
export function chunkTextWithContext(
  text: string,
  title: string,
  contextPrefix: string,
): string[] {
  if (!text) return [];

  // Pisahkan berdasarkan paragraf ganda
  const paragraphs = text.split("\n\n");
  const chunks: string[] = [];
  let currentChunk = `${contextPrefix}: ${title}\n`;

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > 1000) {
      chunks.push(currentChunk.trim());
      currentChunk = `${contextPrefix}: ${title}\n${para}\n\n`;
    } else {
      currentChunk += `${para}\n\n`;
    }
  }

  if (currentChunk.trim().length > `${contextPrefix}: ${title}`.length) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [`${contextPrefix}: ${title}\n${text}`];
}