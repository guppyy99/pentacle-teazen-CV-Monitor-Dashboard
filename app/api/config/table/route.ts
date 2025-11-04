import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const configPath = path.join(process.cwd(), "app", "dashboard", "data.json")

export async function GET() {
  try {
    const fileContents = await fs.readFile(configPath, "utf8")
    const data = JSON.parse(fileContents)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "데이터 파일을 읽을 수 없습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await fs.writeFile(configPath, JSON.stringify(data, null, 2), "utf8")
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "데이터 파일을 저장할 수 없습니다" },
      { status: 500 }
    )
  }
}

