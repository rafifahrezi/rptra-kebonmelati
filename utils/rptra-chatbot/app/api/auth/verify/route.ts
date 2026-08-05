import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-token')?.value
    if (!token) return NextResponse.json({ valid: false })

    const decoded = verify(token, process.env.JWT_SECRET!) as any
    const user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username || decoded.email,
    }

    return NextResponse.json({ valid: true, user })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
