import { generateContent } from './groqService';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '../../constants/prompts';
import { getConversationHistory } from './memoryService';
import { searchRelevantDocuments } from './vectorSearchService';
import { generateEmbedding } from './embeddingService';
import Event from '../../models/Event';
import moment from 'moment';
import 'moment/locale/id';

export const processRAGQuery = async (query: string, sessionId: string) => {
  // 1. Heuristic Query Expansion (Best Practice untuk kueri implisit)
  // Jika user bertanya "besok buka jam berapa?", model embedding mungkin tidak tahu
  // subjek utamanya. Kita tambahkan subjek secara implisit untuk memperkuat Vector Search.
  let searchQuery = query;
  if (!/rptra/i.test(searchQuery)) {
    searchQuery = `${searchQuery} RPTRA Kebon Melati`;
  }

  // 2. Generate query embedding
  const queryEmbedding = await generateEmbedding(searchQuery);
  // 2. Retrieve Top Documents using Vector Search
  const topDocs = await searchRelevantDocuments(queryEmbedding);

  // 3. Fallback: If no documents found (filtered by threshold), return static string to save API costs
  if (topDocs.length === 0) {
    return "Maaf, kami tidak menemukan informasi terkait.";
  }

  // 4. Build context string from the retrieved documents
  let contextText = "";

  // 4a. Real-time Event Injection for temporal queries
  const eventKeywords =
    /acara|kegiatan|event|jadwal|minggu ini|bulan ini|hari ini|besok|lusa/i;
  if (eventKeywords.test(query)) {
    try {
      const upcomingEvents = await Event.find({
        status: { $in: ["upcoming", "ongoing"] },
      })
        .sort({ date: 1 })
        .limit(5)
        .lean();

      if (upcomingEvents.length > 0) {
        contextText += "[DATA ACARA TERKINI DARI DATABASE]:\n";
        upcomingEvents.forEach((ev: any) => {
          contextText += `- Acara: ${ev.title}\n  Tanggal: ${ev.date}, Jam: ${ev.time}\n  Lokasi: ${ev.location}\n  Status: ${ev.status}\n  Deskripsi: ${ev.description}\n\n`;
        });
      }
    } catch (err) {
      console.error("Gagal mengambil data acara terkini:", err);
    }
  }

  topDocs.forEach((doc: any, index: number) => {
    contextText += `[Dokumen ${index + 1} - ${doc.title}]\n${doc.content}\n\n`;
  });

  // 5. Get conversation history
  const history = await getConversationHistory(sessionId);
  const historyText = history
    .map(
      (msg) =>
        `${msg.role === "user" ? "User" : "RPTRA Assistant"}: ${msg.message}`,
    )
    .join("\n");

  // 6. Construct final user prompt
  moment.locale("id");
  const currentDate = moment().format("dddd, D MMMM YYYY, HH:mm");

  const userPrompt = USER_PROMPT_TEMPLATE.replace("{current_date}", currentDate)
    .replace("{retrieved_context}", contextText.trim())
    .replace("{conversation_history}", historyText)
    .replace("{user_query}", query);

  // 7. Generate response from Groq
  const answer = await generateContent(SYSTEM_PROMPT, userPrompt);

  return answer;
};;

