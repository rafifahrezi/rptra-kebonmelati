import mongoose from "mongoose";
import { KnowledgeModel } from "../../models/Knowledge";
import { generateEmbedding } from "./embeddingService";

/**
 * Sync data to knowledge_base synchronously.
 * If generation of embedding fails, it will throw an error to trigger manual rollback/abortTransaction.
 */
export async function syncToKnowledgeBase(
  sourceId: string,
  category: string,
  title: string,
  content: string,
  session?: mongoose.ClientSession,
) {
  try {
    // Generate embedding first. This calls external Voyage API.
    // If it fails, the error will bubble up and the caller can abort transaction.
    const embedding = await generateEmbedding(content);

    // Upsert to Knowledge Base
    await KnowledgeModel.findOneAndUpdate(
      { sourceId },
      {
        sourceId,
        category,
        title,
        content,
        embedding,
      },
      { upsert: true, new: true, session },
    );
  } catch (error) {
    console.error(
      `[Dual-Write Sync] Failed to sync to Knowledge Base for sourceId: ${sourceId}`,
      error,
    );
    throw new Error(
      "Gagal menyinkronkan data ke Knowledge Base (AI Service Error)",
    );
  }
}

/**
 * Sync multiple chunks to knowledge_base synchronously.
 */
export async function syncMultipleToKnowledgeBase(
  sourceId: string,
  category: string,
  chunks: { title: string; content: string }[],
  session?: mongoose.ClientSession,
) {
  try {
    // 1. Delete existing chunks for this sourceId
    await KnowledgeModel.deleteMany({ sourceId }, { session });

    // 2. Generate embeddings and insert
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      await KnowledgeModel.create(
        [
          {
            sourceId,
            category,
            title: chunk.title,
            content: chunk.content,
            embedding,
          },
        ],
        { session },
      );
    }
  } catch (error) {
    console.error(
      `[Dual-Write Sync] Failed to sync multiple chunks for sourceId: ${sourceId}`,
      error,
    );
    throw new Error("Gagal menyinkronkan data chunk ke Knowledge Base");
  }
}

/**
 * Remove data from knowledge_base
 */
export async function removeFromKnowledgeBase(
  sourceId: string,
  session?: mongoose.ClientSession,
) {
  try {
    await KnowledgeModel.findOneAndDelete({ sourceId }, { session });
  } catch (error) {
    console.error(
      `[Dual-Write Sync] Failed to remove from Knowledge Base for sourceId: ${sourceId}`,
      error,
    );
    throw new Error("Gagal menghapus data dari Knowledge Base");
  }
}
