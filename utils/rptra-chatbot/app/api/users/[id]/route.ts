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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error: tokenError } = await verifyToken(req);
  if (tokenError) return tokenError;

  await dbConnect();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { username, email, password, role } = await req.json();

    if (!username || !email || !role) {
      return NextResponse.json({ error: "Username, email, and role are required" }, { status: 400 });
    }
    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'superadmin'" }, { status: 400 });
    }

    const updateData: any = { username, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select(
      "-password"
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error: tokenError } = await verifyToken(req);
  if (tokenError) return tokenError;

  await dbConnect();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const deletedUser = await Admin.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
