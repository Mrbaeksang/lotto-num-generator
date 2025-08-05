# 음력 로또 번호 생성기 아키텍처 설계

## 📋 프로젝트 개요
- **목표**: 음력 기반 다중 알고리즘 로또 번호 생성기
- **스타일**: 글래스모피즘 디자인 시스템
- **기술 스택**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui

## 🗂️ 디렉토리 구조 (Next.js 베스트 프랙티스)

```
src/
├── app/
│   ├── globals.css         # 글래스모피즘 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── api/
│       └── generate/
│           └── route.ts    # API 엔드포인트
├── components/
│   ├── ui/                 # shadcn/ui 기본 컴포넌트
│   ├── lunar/              # 음력 관련 컴포넌트
│   │   ├── LunarDateInput.tsx
│   │   ├── LunarInfo.tsx
│   │   └── NumberDisplay.tsx
│   ├── generators/         # 생성기 UI 컴포넌트
│   │   ├── GenerateButton.tsx
│   │   └── AlgorithmSelector.tsx
│   └── modals/            # 모달 컴포넌트
│       ├── AnalysisModal.tsx
│       └── HelpModal.tsx
├── lib/                   # 비즈니스 로직 (Next.js 표준)
│   ├── generators/        # 5가지 생성 알고리즘
│   │   ├── lunar-generator.ts
│   │   ├── statistical-generator.ts
│   │   ├── pattern-generator.ts
│   │   ├── personal-generator.ts
│   │   └── intuitive-generator.ts
│   ├── lunar/            # 음력 계산 로직
│   │   ├── lunar-calendar.ts
│   │   └── solar-to-lunar.ts
│   ├── utils.ts          # 일반 유틸리티
│   └── constants.ts      # 상수 정의
├── hooks/
│   ├── use-lunar-date.ts
│   ├── use-number-generation.ts
│   └── use-local-storage.ts
├── types/
│   ├── lunar.ts
│   └── generator.ts
└── data/
    └── lotto-data.json   # 1,166회차 로또 데이터
```

## 🎯 핵심 컴포넌트 설계

### 메인 페이지 구성 (app/page.tsx)
1. **Header** - "음력 행운번호 생성기" 타이틀
2. **LunarDateInput** - 연도-월-일 입력 (미입력시 오늘)
3. **LunarInfo** - 음력 정보 카드 (간지, 띠, 특별한 날)
4. **GenerateButton** - "새 번호 생성" 버튼
5. **NumberDisplay** - 6개 번호 + 보너스 표시
6. **AnalysisModal** - "상세 분석" 클릭시 모달
7. **HelpModal** - 도움말 및 사용법

### 5가지 생성 알고리즘 (lib/generators/)
- 🔢 **lunar-generator.ts** - 음력 기반 방식
- 📊 **statistical-generator.ts** - 통계 분석 방식 
- 🎲 **pattern-generator.ts** - 패턴 조합 방식
- ⭐ **personal-generator.ts** - 개인화 방식
- 🔮 **intuitive-generator.ts** - 직관적 방식

## 📝 핵심 기능 명세

### 필수 기능
- [x] 글래스모피즘 디자인 시스템 설정 완료
- [ ] 음력 날짜 입력 및 변환
- [ ] 5가지 알고리즘 번호 생성
- [ ] 생성된 번호 표시 (애니메이션)
- [ ] 상세 분석 모달 (차트 포함)
- [ ] 도움말 모달

### 고급 기능 (향후 구현)
- [ ] 생성 히스토리 저장
- [ ] 통계 차트 시각화
- [ ] PWA 기능

## 🔧 기술 스택 세부사항

### Frontend
- **Next.js 15** - App Router
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션

### 데이터 관리
- **로컬 스토리지** - 사용자 데이터 저장
- **JSON 파일** - 로또 당첨 데이터 (1,166회차)

### 글래스모피즘 스타일
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.gradient-bg {
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 50%, 
    #f093fb 100%
  );
}
```

## 📊 구현 단계

### Phase 1: 기본 구조 (현재)
- [x] Next.js 프로젝트 설정
- [x] 글래스모피즘 디자인 시스템
- [x] 기본 컴포넌트 구조
- [ ] 음력 계산 로직

### Phase 2: 핵심 기능
- [ ] 5가지 번호 생성 알고리즘
- [ ] UI 컴포넌트 구현
- [ ] 상태 관리 (Context API)

### Phase 3: 고급 기능
- [ ] 상세 분석 모달
- [ ] 통계 차트
- [ ] 히스토리 관리

### Phase 4: 최적화
- [ ] 성능 최적화
- [ ] 반응형 디자인
- [ ] 접근성 개선

## 🎨 UI/UX 가이드라인

### 디자인 원칙
- **글래스모피즘**: 투명도와 블러 효과
- **그라디언트 배경**: 보라-핑크 톤
- **애니메이션**: Framer Motion 활용
- **반응형**: 모바일 우선 설계

### 색상 팔레트
- **Primary**: #667eea → #764ba2 → #f093fb
- **Glass**: rgba(255, 255, 255, 0.1)
- **Text**: white / rgba(255, 255, 255, 0.8)
- **Border**: rgba(255, 255, 255, 0.2)

## 📞 연락 정보
버전: 1.0.0 | 최종 업데이트: 2025.08.05
문의: nanireu@gmail.com