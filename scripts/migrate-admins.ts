import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

async function migrateAdmins() {
  await connectToDatabase();
  const admins = await Admin.find({ password: { $exists: false } });
  for (const admin of admins) {
    admin.password = await bcrypt.hash("defaultPassword123", 10); // Set a default or prompt for input
    await admin.save();
    console.log(`Migrated password for ${admin.username}`);
  }
  console.log("Migration complete");
}

migrateAdmins().then(() => process.exit(0));