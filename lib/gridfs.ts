// lib/gridfs.ts
import mongoose from "mongoose";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

export interface FileUploadResult {
  id: string;
  filename: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  url: string;
}

export interface FileMetadata {
  originalName: string;
  uploadedBy?: string;
  category?: string;
  description?: string;
  alt?: string;
}

export class GridFSService {
  private static client: MongoClient | null = null;
  private static bucket: GridFSBucket | null = null;
  private static connecting = false;

  private static async ensureConnected(): Promise<void> {
    if (this.bucket && mongoose.connection.readyState === 1) return;

    if (this.connecting) {
      // wait for in-progress connect (simple spin-wait)
      for (let i = 0; i < 50; i++) {
        if (this.bucket && mongoose.connection.readyState === 1) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    if (this.bucket && mongoose.connection.readyState === 1) return;

    this.connecting = true;
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error("MONGODB_URI is not set");

      // connect mongoose if not connected
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      }

      if (!this.client) {
        this.client = new MongoClient(uri);
        await this.client.connect();
      }

      const db = this.client.db(mongoose.connection.db?.databaseName);
      this.bucket = new GridFSBucket(db, { bucketName: "uploads" });
    } finally {
      this.connecting = false;
    }
  }

  private static async getBucket(): Promise<GridFSBucket> {
    await this.ensureConnected();
    if (!this.bucket) throw new Error("GridFSBucket not initialized");
    return this.bucket;
  }

  static async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    metadata: FileMetadata
  ): Promise<FileUploadResult> {
    const bucket = await this.getBucket();
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: {
          ...metadata,
        },
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        reject(new Error("File upload failed"));
      });

      uploadStream.on("finish", () => {
        resolve({
          id: uploadStream.id.toString(),
          filename: uploadStream.filename,
          contentType,
          length: uploadStream.length,
          uploadDate: new Date(),
          url: `/api/files/${uploadStream.id.toString()}`,
        });
      });

      uploadStream.end(buffer);
    });
  }

  static async getFile(fileId: string) {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(fileId);

      const files = await bucket.find({ _id: objectId }).toArray();
      if (!files || files.length === 0) return null;

      const file = files[0];
      const stream = bucket.openDownloadStream(objectId);
      return { stream, file };
    } catch (err) {
      console.error("GridFS getFile error:", err);
      return null;
    }
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(fileId);
      await bucket.delete(objectId);
      return true;
    } catch (err) {
      console.error("GridFS deleteFile error:", err);
      return false;
    }
  }

  static async listFiles(page = 1, limit = 10, filter: any = {}) {
    const bucket = await this.getBucket();
    const skip = (page - 1) * limit;
    const cursor = bucket.find(filter).sort({ uploadDate: -1 }).skip(skip).limit(limit);
    const files = await cursor.toArray();
    const total = await bucket.find(filter).count();
    const totalPages = Math.ceil(total / limit);
    return {
      files: files.map((f) => ({
        id: f._id.toString(),
        filename: f.filename,
        contentType: f.contentType,
        length: f.length,
        uploadDate: f.uploadDate,
        metadata: f.metadata,
        url: `/api/files/${f._id.toString()}`,
      })),
      total,
      page,
      totalPages,
    };
  }

  static async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.bucket = null;
      }
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
    } catch (err) {
      console.warn("GridFS disconnect warning:", err);
    }
  }
}

export default GridFSService;
