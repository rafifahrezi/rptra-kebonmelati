import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_ROLES = ["admin", "superadmin"];

// Urutan sama dengan useAuth: Bearer dulu, lalu cookie "admin-token"
function getToken(req: NextRequest) {
  return (
    req.headers.get("authorization")?.replace(/^Bearer /, "") ??
    req.cookies.get("admin-token")?.value
  );
}

// shortcut: role dibaca dari payload JWT tanpa cek DB; akun yang dicabut tetap lolos sampai token kedaluwarsa, upgrade ke cek DB kalau perlu
export function isAdmin(req: NextRequest): boolean {
  const secret = process.env.JWT_SECRET;
  const token = getToken(req);
  if (!secret || !token) return false; // tanpa secret, jangan pernah meloloskan siapa pun

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as {
      role?: string;
    };
    return ADMIN_ROLES.includes(payload.role ?? "");
  } catch {
    return false;
  }
}

export const unauthorized = () =>
  NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 },
  );

export function fail(error: unknown) {
  if (error instanceof Error && error.name === "ValidationError") {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
  console.error("gambaran-umum error:", error);
  return NextResponse.json(
    { success: false, message: "Terjadi kesalahan server" },
    { status: 500 },
  );
}
