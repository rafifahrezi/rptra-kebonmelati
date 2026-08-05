import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  // Hapus cookie
  response.cookies.set('admin-token', '', { maxAge: 0, path: '/' })
  return response
}
