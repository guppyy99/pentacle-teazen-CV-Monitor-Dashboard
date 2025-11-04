# 📝 Pentacle Dashboard 수정 가이드

이 문서는 개발 지식 없이도 대시보드의 내용을 쉽게 수정할 수 있도록 돕습니다.

---

## 🎯 빠른 수정 가이드

### 1️⃣ 사이드바 메뉴 수정

**파일**: `config/sidebar-menu.json`

#### 메뉴 항목 추가
```json
{
  "title": "새 메뉴 이름",
  "url": "#",
  "icon": "IconDashboard"
}
```

#### 사용 가능한 아이콘
- `IconDashboard` - 대시보드
- `IconListDetails` - 목록
- `IconChartBar` - 차트
- `IconFolder` - 폴더
- `IconUsers` - 사용자
- `IconCamera` - 카메라
- `IconFileDescription` - 문서
- `IconFileAi` - AI
- `IconSettings` - 설정
- `IconHelp` - 도움말
- `IconSearch` - 검색
- `IconDatabase` - 데이터베이스
- `IconReport` - 보고서
- `IconFileWord` - 워드

#### 예시: 메인 메뉴에 "리포트" 추가
```json
"navMain": [
  ...
  {
    "title": "리포트",
    "url": "#",
    "icon": "IconReport"
  }
]
```

---

### 2️⃣ 대시보드 카드 수정

**파일**: `config/dashboard-cards.json`

#### 카드 값 변경
```json
{
  "title": "총 수익",           ← 카드 제목
  "value": "$1,250.00",         ← 표시할 숫자
  "trend": {
    "value": "+12.5%",          ← 증감률
    "direction": "up"            ← "up" 또는 "down"
  },
  "description": "이번 달 상승 추세",  ← 메인 설명
  "subtitle": "최근 6개월 방문자 수"    ← 부제
}
```

#### 예시: 수익 카드 업데이트
```json
{
  "id": "revenue",
  "title": "총 수익",
  "value": "$2,450.00",      ← 변경
  "trend": {
    "value": "+25.8%",       ← 변경
    "direction": "up"
  },
  "description": "전년 대비 크게 상승",  ← 변경
  "subtitle": "2025년 1분기 실적"       ← 변경
}
```

---

### 3️⃣ 테이블 데이터 수정

**파일**: `app/dashboard/data.json`

#### 행 추가
파일 끝에 새 항목 추가:
```json
{
  "id": 100,                           ← 고유 번호 (중복 금지)
  "header": "새 프로젝트",              ← 제목
  "type": "Technical content",         ← 유형
  "status": "In Process",              ← 상태
  "target": "10",                      ← 목표
  "limit": "15",                       ← 제한
  "reviewer": "홍길동"                  ← 검토자
}
```

#### 상태 값
- `"Done"` - 완료 (✓ 표시)
- `"In Process"` - 진행 중 (⟳ 표시)
- `"Not Started"` - 시작 안 함

#### 타입 값
- `"Technical content"` - 기술 문서
- `"Narrative"` - 서술형
- `"Legal"` - 법률
- `"Visual"` - 시각 자료
- `"Financial"` - 재무
- `"Research"` - 리서치
- `"Planning"` - 기획

---

### 4️⃣ 사용자 정보 변경

**파일**: `config/sidebar-menu.json`

```json
"user": {
  "name": "홍길동",              ← 이름 변경
  "email": "hong@example.com",   ← 이메일 변경
  "avatar": "/avatars/shadcn.jpg"  ← 프로필 이미지 경로
}
```

---

## 🎨 텍스트 수정 팁

### 한글 사용
- 모든 텍스트는 한글로 작성 가능합니다
- 특수문자, 이모지도 사용 가능합니다

### JSON 형식 주의사항
1. **쌍따옴표** 사용: `"제목"` ✅ / `'제목'` ❌
2. **쉼표** 필수: 항목 사이에 `,` 추가
3. **마지막 항목**: 쉼표 없음
```json
{
  "item1": "값1",  ← 쉼표 O
  "item2": "값2"   ← 쉼표 X (마지막)
}
```

---

## 🔧 수정 후 적용하기

### 방법 1: 개발 서버 실행 중인 경우
1. 파일 저장
2. 브라우저 자동 새로고침 (Hot Reload)

### 방법 2: 개발 서버 재시작
```bash
# 터미널에서
./start.sh
```

---

## 📁 파일 구조 요약

```
/Teazen-Dashboard/
├── config/
│   ├── sidebar-menu.json      ⭐ 사이드바 메뉴 설정
│   └── dashboard-cards.json   ⭐ 대시보드 카드 설정
├── app/
│   └── dashboard/
│       └── data.json           ⭐ 테이블 데이터
├── PROJECT_STRUCTURE.md        📖 전체 구조 문서
└── EDITING_GUIDE.md            📖 이 문서
```

⭐ = 주로 수정하는 파일

---

## ❓ 자주 묻는 질문

### Q1: 메뉴 순서를 바꾸고 싶어요
**A**: JSON 배열에서 항목 순서를 위아래로 이동하면 됩니다.

### Q2: 아이콘을 바꾸고 싶어요
**A**: `"icon": "IconName"` 부분을 위의 아이콘 목록에서 선택하여 변경하세요.

### Q3: 카드를 3개만 표시하고 싶어요
**A**: `config/dashboard-cards.json`에서 원하는 카드만 남기고 나머지 삭제하세요.

### Q4: 테이블 데이터를 모두 삭제하고 새로 시작하고 싶어요
**A**: `app/dashboard/data.json` 파일을 다음과 같이 수정:
```json
[
  {
    "id": 1,
    "header": "첫 번째 항목",
    "type": "Narrative",
    "status": "In Process",
    "target": "10",
    "limit": "5",
    "reviewer": "홍길동"
  }
]
```

### Q5: 한글이 깨져요
**A**: 파일을 UTF-8 인코딩으로 저장했는지 확인하세요.

---

## 🆘 문제 해결

### 에러가 발생한 경우
1. JSON 형식이 올바른지 확인 (쉼표, 따옴표)
2. 온라인 JSON 검증기 사용: https://jsonlint.com/
3. 파일을 이전 버전으로 복원 (Ctrl+Z)

### 변경사항이 반영되지 않는 경우
1. 파일을 저장했는지 확인
2. 브라우저 새로고침 (F5 또는 Cmd+R)
3. 개발 서버 재시작

---

## 💡 유용한 팁

### 빠른 복사
기존 항목을 복사하여 수정하면 형식 오류를 줄일 수 있습니다.

### 백업
수정 전에 원본 파일을 복사해두세요:
- `sidebar-menu.json` → `sidebar-menu.backup.json`

### 주석 사용 불가
JSON 파일은 주석을 지원하지 않습니다. 메모는 별도 파일에 작성하세요.

---

**작성일**: 2025-11-04  
**난이도**: 초급 ⭐  
**소요시간**: 5-10분

