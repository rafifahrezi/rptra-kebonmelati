import mongoose from 'mongoose';
import connectDB from '../lib/mongoose';
import About from '../models/About';

async function test() {
  await connectDB();
  const about = await About.findById('main');
  console.log(about);
  await mongoose.connection.close();
}
test();