import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import connectDB from '../lib/mongoose';
import About from '../models/About';

async function addImagesField() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const result = await About.updateMany(
      { images: { $exists: false } }, // Hanya dokumen tanpa field images
      { $set: { images: [] } } // Tambahkan array kosong
    );

    console.log(`Updated ${result.modifiedCount} documents with images field`);
  } catch (error) {
    console.error('Error adding images field:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

addImagesField();