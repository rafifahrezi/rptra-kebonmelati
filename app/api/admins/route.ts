import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose"; // import sesuai export default
import Admin from "@/models/Admin";
import mongoose from "mongoose";

// Utility function for consistent error handling
const handleServerError = (error: unknown, context: string) => {
  console.error(`${context} error:`, error);

  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json(
      {
        error: "Validation Error",
        details: Object.values(error.errors).map(err => err.message),
      },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Internal Server Error", details: String(error) },
    { status: 500 }
  );
};

// Input validation and sanitization
const validateAdminInput = (data: any) => {
  const errors: string[] = [];

  if (!data.username || data.username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Invalid email format");
  }

  const validRoles = ['admin', 'superadmin', 'editor'];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.push("Invalid role");
  }

  return errors;
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 10)));
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      Admin.find()
        .select("username email role lastLogin createdAt updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Admin.countDocuments()
    ]);

    return NextResponse.json({
      data: admins,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });

  } catch (error) {
    return handleServerError(error, "Admin GET");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const validationErrors = validateAdminInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation Failed", details: validationErrors },
        { status: 400 }
      );
    }

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: body.username },
        { email: body.email }
      ]
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    const admin = new Admin({
      username: body.username,
      email: body.email,
      role: body.role,
      password: body.password, // Pastikan password di-hash di model atau middleware
      lastLogin: null,
    });

    await admin.save();

    const { password, ...adminResponse } = admin.toObject();

    return NextResponse.json(adminResponse, { status: 201 });

  } catch (error) {
    return handleServerError(error, "Admin POST");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { id } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Admin deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    return handleServerError(error, "Admin DELETE");
  }
}
