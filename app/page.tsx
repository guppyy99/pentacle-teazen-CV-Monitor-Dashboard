"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 인증 확인
    fetch("/api/auth/check")
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>로딩 중...</p>
    </div>
  )
}

