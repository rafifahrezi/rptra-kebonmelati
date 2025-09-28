// app/api/events/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";

/**
 * Safely resolve the (possibly thenable) context and return params object.
 * This prevents the Next warning about reading params synchronously.
 */
async function resolveParams(context: any): Promise<Record<string, any> | undefined> {
  const resolved = await Promise.resolve(context);
  if (!resolved || typeof resolved !== "object") return undefined;
  return resolved.params ?? undefined;
}

/* ------------------------------
   GET /api/events/:id
   ------------------------------ */
export async function GET(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    console.log('[GET /api/events/:id] resolved params:', { id });

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.findById(id).lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (err) {
    console.error("GET /api/events/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

/* ------------------------------
   PUT /api/events/:id
   ------------------------------ */
export async function PUT(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const data = await request.json();
    if (typeof data.title === "string") data.title = data.title.trim();
    if (typeof data.category === "string") data.category = data.category.trim();
    if (typeof data.location === "string") data.location = data.location.trim();

    await dbConnect();

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/events/:id error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

/* ------------------------------
   DELETE /api/events/:id
   ------------------------------ */
export async function DELETE(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const deleted = await Event.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/events/:id error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
