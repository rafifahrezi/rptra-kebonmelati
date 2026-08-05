import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongoose';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    // Ambil data dari request
    const { email, password } = await request.json();

    // Validasi input
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Connect ke database
    await connectDB();

    // Cari admin berdasarkan email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Data user untuk response
    const userData = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin.toISOString(),
    };

    // Buat response JSON + set cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Login berhasil',
      token,
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 jam
      path: '/', 
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
