#!/bin/bash

# FinFlow 대시보드 개발 서버 실행 스크립트 (macOS용 더블클릭 실행)

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# 터미널 제목 설정
echo -ne "\033]0;FinFlow Dashboard\007"

# 실행
./start.sh

