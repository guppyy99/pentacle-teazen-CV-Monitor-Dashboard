# 🎉 Pentacle Dashboard 설정 완료

## ✅ 구현된 기능

### 1. 인증 시스템
- **로그인 페이지** (`/login`)
  - 아이디: `admin`
  - 비밀번호: `admin`
- **세션 관리** (쿠키 기반, 7일간 유효)
- **자동 리다이렉트**
  - 비로그인 → `/login`
  - 로그인 완료 → `/dashboard`

### 2. 관리자 페이지
- **URL**: `/admin`
- **기능**:
  - 사이드바 메뉴 수정 (제목, 아이콘)
  - 대시보드 카드 수정 (제목, 값, 트렌드, 설명)
  - 사용자 정보 수정 (이름, 이메일, 아바타)
  - 실시간 저장 (JSON 파일에 저장)

### 3. 동적 데이터 로딩
- 사이드바 메뉴: `/config/sidebar-menu.json`에서 로드
- 대시보드 카드: `/config/dashboard-cards.json`에서 로드
- 관리자 페이지에서 수정 시 즉시 반영

### 4. 헤더 기능
- 관리자 페이지 이동 버튼
- 로그아웃 버튼
- 토스트 알림

---

## 🚀 사용 방법

### 1️⃣ 개발 서버 실행
```bash
# 방법 1: 퀵 스타트
./start.sh

# 방법 2: pnpm 직접 실행
pnpm dev
```

### 2️⃣ 로그인
1. 브라우저에서 `http://localhost:3000` 접속
2. 자동으로 `/login` 페이지로 이동
3. 아이디: `admin`, 비밀번호: `admin` 입력
4. 대시보드로 자동 이동

### 3️⃣ 관리자 페이지 접속
1. 대시보드 우측 상단 **"관리자"** 버튼 클릭
2. 또는 직접 `http://localhost:3000/admin` 접속

### 4️⃣ 설정 수정
#### 사이드바 메뉴 탭
- 메인 네비게이션 메뉴 제목 수정
- 보조 메뉴 제목 수정
- 아이콘 변경 (IconName 형식)

#### 대시보드 카드 탭
- 카드 제목, 값 수정
- 트렌드 값 및 방향 (up/down) 변경
- 설명 및 부제목 수정

#### 사용자 정보 탭
- 이름, 이메일 변경
- 프로필 이미지 경로 변경

⚠️ **중요**: 각 탭에서 수정 후 **"저장하기"** 버튼을 꼭 클릭하세요!

---

## 📁 파일 구조

```
/Teazen-Dashboard/
│
├── 🔐 인증 관련
│   ├── app/login/page.tsx              # 로그인 페이지
│   ├── app/api/auth/
│   │   ├── login/route.ts              # 로그인 API
│   │   ├── logout/route.ts             # 로그아웃 API
│   │   └── check/route.ts              # 인증 확인 API
│   └── middleware.ts                   # 인증 미들웨어
│
├── 👨‍💼 관리자 페이지
│   └── app/admin/page.tsx              # 관리자 마스터 페이지
│
├── ⚙️ 설정 API
│   └── app/api/config/
│       ├── sidebar/route.ts            # 사이드바 설정 API
│       ├── cards/route.ts              # 카드 설정 API
│       └── table/route.ts              # 테이블 데이터 API
│
├── 🎨 동적 컴포넌트
│   ├── components/app-sidebar.tsx      # 동적 사이드바
│   ├── components/section-cards.tsx    # 동적 카드
│   └── components/site-header.tsx      # 헤더 (로그아웃 버튼)
│
└── 📄 설정 파일
    └── config/
        ├── sidebar-menu.json           # 사이드바 설정
        └── dashboard-cards.json        # 카드 설정
```

---

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/check` - 인증 상태 확인

### 설정
- `GET /api/config/sidebar` - 사이드바 설정 읽기
- `POST /api/config/sidebar` - 사이드바 설정 저장
- `GET /api/config/cards` - 카드 설정 읽기
- `POST /api/config/cards` - 카드 설정 저장
- `GET /api/config/table` - 테이블 데이터 읽기
- `POST /api/config/table` - 테이블 데이터 저장

---

## 🎯 라우팅

| 경로 | 설명 | 인증 필요 |
|------|------|-----------|
| `/` | 루트 (자동 리다이렉트) | ❌ |
| `/login` | 로그인 페이지 | ❌ |
| `/dashboard` | 메인 대시보드 | ✅ |
| `/admin` | 관리자 페이지 | ✅ |

---

## 💡 주요 기능 설명

### 1. 자동 인증 확인
- 모든 보호된 페이지는 자동으로 로그인 확인
- 비로그인 시 자동으로 `/login`으로 리다이렉트
- 로그인 후 7일간 세션 유지

### 2. 실시간 설정 반영
- 관리자 페이지에서 설정 저장 시 즉시 JSON 파일 업데이트
- 페이지 새로고침 시 변경된 설정 자동 적용

### 3. 아이콘 시스템
관리자 페이지에서 사용 가능한 아이콘:
- `IconDashboard`, `IconListDetails`, `IconChartBar`
- `IconFolder`, `IconUsers`, `IconCamera`
- `IconFileDescription`, `IconFileAi`
- `IconSettings`, `IconHelp`, `IconSearch`
- `IconDatabase`, `IconReport`, `IconFileWord`

---

## 🔒 보안

### 현재 구현
- ✅ 쿠키 기반 세션 관리
- ✅ HTTP Only 쿠키
- ✅ 미들웨어 기반 라우트 보호
- ✅ API 엔드포인트 보호

### 프로덕션 권장사항
- 데이터베이스 기반 사용자 관리
- 비밀번호 해싱 (bcrypt)
- JWT 토큰 사용
- HTTPS 강제
- Rate limiting
- CSRF 토큰

---

## 📝 수정 방법

### 방법 1: 관리자 페이지 (추천)
1. `/admin` 접속
2. 원하는 탭 선택
3. 값 수정
4. 저장 버튼 클릭

### 방법 2: 직접 JSON 파일 수정
1. `config/sidebar-menu.json` 또는 `config/dashboard-cards.json` 열기
2. 값 수정
3. 저장
4. 브라우저 새로고침

---

## 🐛 문제 해결

### 로그인이 안 돼요
- 아이디: `admin`, 비밀번호: `admin` 정확히 입력
- 브라우저 쿠키가 활성화되어 있는지 확인
- 개발자 도구(F12) > 네트워크 탭에서 오류 확인

### 설정 변경이 반영이 안 돼요
- 관리자 페이지에서 "저장하기" 버튼 클릭했는지 확인
- 브라우저 새로고침 (F5 또는 Cmd+R)
- 개발 서버 재시작

### 페이지가 로딩만 돼요
- 개발 서버가 실행 중인지 확인
- 터미널에서 오류 메시지 확인
- `pnpm dev` 재실행

---

## 🎓 추가 학습 자료

- [EDITING_GUIDE.md](./EDITING_GUIDE.md) - 초보자용 수정 가이드
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 상세 프로젝트 구조
- [README.md](./README.md) - 프로젝트 개요

---

## 🎉 완료!

모든 기능이 정상적으로 구현되었습니다.

**시작하기:**
```bash
./start.sh
```

그런 다음 브라우저에서 `http://localhost:3000`을 열고 `admin/admin`으로 로그인하세요!

---

**작성일**: 2025-11-04  
**버전**: 2.0 (인증 및 관리자 기능 추가)

