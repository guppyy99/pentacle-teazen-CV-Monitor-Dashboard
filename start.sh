#!/bin/bash

# FinFlow 대시보드 개발 서버 실행 스크립트

echo "🚀 FinFlow 대시보드 개발 서버를 시작합니다..."
echo ""

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    pnpm install
    echo ""
fi

# 개발 서버 실행
echo "✅ 개발 서버를 시작합니다."
echo "🌐 브라우저에서 http://localhost:3000 을 열어주세요."
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo ""

pnpm dev

