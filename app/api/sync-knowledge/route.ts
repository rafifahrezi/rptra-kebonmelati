import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongoose";
import Event from "../../../models/Event";
import News from "../../../models/News";
import About from "../../../models/About";
import { KnowledgeModel } from "../../../models/Knowledge";
import { generateEmbeddingsBatch } from "../../../services/api/embeddingService";
import {
  chunkTextWithContext,
  convertAboutToChunks,
} from "../../../services/api/chunkService";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch data from all collections
    const events = await Event.find({}).lean();
    const news = await News.find({}).lean();
    const aboutData = await About.findOne({ _id: "main" }).lean();

    // Clear the knowledge base before sync
    await KnowledgeModel.deleteMany({});

    const documentsToEmbed: {
      title: string;
      category: string;
      content: string;
      sourceId: string;
    }[] = [];

    // 2. Prepare About Data
    if (aboutData) {
      const aboutChunks = convertAboutToChunks(aboutData as any);

      aboutChunks.forEach((chunk, i) => {
        documentsToEmbed.push({
          title: `Informasi Umum RPTRA (${chunk.metadata?.section || "Bagian " + (i + 1)})`,
          category: "About",
          content: chunk.text,
          sourceId: "main",
        });
      });
    }

    // 3. Prepare Events
    for (const event of events) {
      const eventContent = `
        Kategori: ${event.category}
        Tanggal: ${event.date} Jam: ${event.time}
        Lokasi: ${event.location}
        Status: ${event.status}
        Deskripsi: ${event.description}
      `.trim();

      const eventChunks = chunkTextWithContext(
        eventContent,
        event.title,
        "ACARA RPTRA",
      );
      eventChunks.forEach((chunkText, i) => {
        documentsToEmbed.push({
          title: `Acara: ${event.title} (Bagian ${i + 1})`,
          category: "Event",
          content: chunkText,
          sourceId: event._id.toString(),
        });
      });
    }

    // 4. Prepare News
    for (const item of news) {
      const newsContent = `
        Kategori: ${item.category || "Umum"}
        Ditulis oleh: ${item.author || "Admin"}
        Konten: ${item.content}
      `.trim();

      const newsChunks = chunkTextWithContext(
        newsContent,
        item.title,
        "BERITA RPTRA",
      );
      newsChunks.forEach((chunkText, i) => {
        documentsToEmbed.push({
          title: `Berita: ${item.title} (Bagian ${i + 1})`,
          category: "News",
          content: chunkText,
          sourceId: item._id.toString(),
        });
      });
    }

    // Batch Embeddings Generation (up to 128 items per API call supported by Voyage)
    // We'll chunk it into groups of 30 just to be safe
    const CHUNK_SIZE = 30;
    for (let i = 0; i < documentsToEmbed.length; i += CHUNK_SIZE) {
      const chunk = documentsToEmbed.slice(i, i + CHUNK_SIZE);
      const texts = chunk.map((doc) => doc.content);

      const embeddings = await generateEmbeddingsBatch(texts);

      const knowledgeDocs = chunk.map((doc, index) => ({
        title: doc.title,
        category: doc.category,
        content: doc.content,
        sourceId: doc.sourceId,
        embedding: embeddings[index],
      }));

      await KnowledgeModel.insertMany(knowledgeDocs);
    }

    return NextResponse.json({
      success: true,
      message: "Unified Knowledge Base synchronization completed.",
      total_synced: documentsToEmbed.length,
    });
  } catch (error: any) {
    console.error("Error during sync:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}