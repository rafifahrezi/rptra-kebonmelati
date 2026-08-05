import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { error: NextResponse.json({ error: "Unauthorized: Token not provided" }, { status: 401 }) };

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    if ((decoded as any).role !== "superadmin") {
      return { error: NextResponse.json({ error: "Unauthorized: Superadmin access required" }, { status: 403 }) };
    }
    return { decoded, error: null };
  } catch (err) {
    console.error("Token verification error:", err);
    return { error: NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const { error: tokenError } = await verifyToken(req);
  if (tokenError) return tokenError;

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await Admin.find(query)
      .select("username email role lastLogin createdAt")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Admin.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error: tokenError } = await verifyToken(req);
  if (tokenError) return tokenError;

  await dbConnect();

  try {
    const { username, email, password, role } = await req.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: "Username, email, password, and role are required" }, { status: 400 });
    }

    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'superadmin'" }, { status: 400 });
    }

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await Admin.create({
      username,
      email,
      password: hashedPassword,
      role,
      lastLogin: null,
      createdAt: new Date(),
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ message: "User created successfully", user: userObj }, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
