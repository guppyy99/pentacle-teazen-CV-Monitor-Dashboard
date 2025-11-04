import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const token = cookies().get("auth-token")

    if (token && token.value === "authenticated") {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

