# 🎯 로또 번호 생성기 - 실시간 데이터 & 네오브루탈리즘

전통 음력과 실시간 통계 데이터를 결합한 현대적 로또 번호 생성 서비스

## 📁 실시간 데이터 기반 디렉토리 구조

```
src/
├── app/
│   ├── api/
│   │   ├── lottery/
│   │   │   ├── latest/route.ts           # 최신 회차 조회
│   │   │   ├── history/route.ts          # 과거 당첨 이력
│   │   │   ├── statistics/route.ts       # 실시간 통계
│   │   │   └── trends/route.ts           # 트렌드 분석
│   │   ├── scraper/
│   │   │   ├── update/route.ts           # 수동 업데이트
│   │   │   └── status/route.ts           # 스크래핑 상태
│   │   └── charts/
│   │       ├── frequency/route.ts        # 빈도 차트 데이터
│   │       ├── trends/route.ts           # 트렌드 차트 데이터
│   │       └── distribution/route.ts     # 분포 차트 데이터
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                               # 기존 UI 컴포넌트 유지
│   ├── lottery/
│   │   ├── date-selector/
│   │   │   ├── calendar-toggle.tsx       # 양력/음력 토글
│   │   │   ├── solar-picker.tsx          # 양력 날짜 선택
│   │   │   ├── lunar-picker.tsx          # 음력 날짜 선택
│   │   │   └── date-info-display.tsx     # 날짜 정보 표시
│   │   ├── generators/
│   │   │   ├── generator-grid.tsx        # 5가지 방식 그리드
│   │   │   ├── algorithm-card.tsx        # 개별 알고리즘 카드
│   │   │   └── generation-controls.tsx   # 생성 제어 버튼
│   │   ├── results/
│   │   │   ├── main-result.tsx           # 추천 행운번호
│   │   │   ├── variant-results.tsx       # 5가지 방식별 번호
│   │   │   ├── generation-analysis.tsx   # 생성 분석 정보
│   │   │   └── save-numbers.tsx          # 번호 저장 기능
│   │   ├── charts/
│   │   │   ├── frequency-chart.tsx       # 번호별 출현 빈도
│   │   │   ├── trend-chart.tsx           # 당첨 번호 트렌드
│   │   │   ├── distribution-chart.tsx    # 번호 범위 분포
│   │   │   ├── hot-cold-chart.tsx        # Hot/Cold 번호 분석
│   │   │   └── pattern-analysis.tsx      # 패턴 분석 차트
│   │   └── analysis/
│   │       ├── statistics-panel.tsx     # 통계 요약 패널
│   │       ├── performance-metrics.tsx  # 성능 지표
│   │       └── prediction-confidence.tsx # 예측 신뢰도
├── lib/
│   ├── data/
│   │   ├── lottery-client.ts            # 로또 API 클라이언트
│   │   ├── cache-manager.ts             # 로컬/메모리 캐싱
│   │   ├── data-transformer.ts          # 데이터 변환 유틸
│   │   └── real-time-updater.ts         # 실시간 업데이트 관리
│   ├── scraper/
│   │   ├── dhlottery-scraper.ts         # 동행복권 스크래퍼
│   │   ├── data-validator.ts            # 데이터 검증
│   │   ├── retry-logic.ts               # 재시도 로직
│   │   └── rate-limiter.ts              # 요청 제한 관리
│   ├── algorithms/
│   │   ├── real-time/
│   │   │   ├── live-frequency.ts        # 실시간 빈도 분석
│   │   │   ├── trend-analyzer.ts        # 트렌드 분석기
│   │   │   ├── pattern-detector.ts      # 패턴 감지기
│   │   │   └── hot-cold-classifier.ts   # Hot/Cold 분류기
│   │   ├── enhanced/
│   │   │   ├── balanced-v2.ts           # 향상된 균형 조합
│   │   │   ├── frequency-v2.ts          # 향상된 고빈도
│   │   │   ├── weighted-v2.ts           # 향상된 가중 선택
│   │   │   ├── statistics-v2.ts         # 향상된 상위 통계
│   │   │   └── smart-random.ts          # 스마트 랜덤
│   │   └── base/
│   │       ├── algorithm-interface.ts   # 알고리즘 인터페이스
│   │       ├── number-validator.ts      # 번호 검증
│   │       └── confidence-calculator.ts # 신뢰도 계산
│   ├── analysis/
│   │   ├── statistical-engine.ts        # 통계 분석 엔진
│   │   ├── performance-tracker.ts       # 성능 추적기
│   │   ├── pattern-matcher.ts           # 패턴 매칭
│   │   └── prediction-model.ts          # 예측 모델
│   ├── charts/
│   │   ├── chart-data-processor.ts      # 차트 데이터 가공
│   │   ├── color-schemes.ts             # 차트 색상 테마
│   │   ├── animation-configs.ts         # 애니메이션 설정
│   │   └── responsive-utils.ts          # 반응형 유틸
├── hooks/
│   ├── data/
│   │   ├── use-lottery-data.ts          # 로또 데이터 훅
│   │   ├── use-real-time-stats.ts       # 실시간 통계 훅
│   │   ├── use-cache-status.ts          # 캐시 상태 훅
│   │   └── use-data-freshness.ts        # 데이터 신선도 훅
│   ├── generation/
│   │   ├── use-number-generator.ts      # 번호 생성 훅
│   │   ├── use-algorithm-selector.ts    # 알고리즘 선택 훅
│   │   ├── use-generation-history.ts    # 생성 이력 훅
│   │   └── use-confidence-score.ts      # 신뢰도 점수 훅
│   ├── charts/
│   │   ├── use-chart-data.ts            # 차트 데이터 훅
│   │   ├── use-animation-state.ts       # 애니메이션 상태 훅
│   │   └── use-responsive-charts.ts     # 반응형 차트 훅
│   └── ui/
│       ├── use-theme-switcher.ts        # 테마 스위처
│       ├── use-modal-state.ts           # 모달 상태 관리
│       └── use-toast-notifications.ts   # 토스트 알림
├── utils/
│   ├── date-helpers.ts                  # 날짜 유틸리티
│   ├── number-formatters.ts             # 숫자 포맷터
│   ├── error-handlers.ts                # 에러 핸들링
│   ├── performance-monitor.ts           # 성능 모니터링
│   └── debug-logger.ts                  # 디버그 로거
├── config/
│   ├── api-endpoints.ts                 # API 엔드포인트 설정
│   ├── cache-config.ts                  # 캐시 설정
│   ├── scraper-config.ts                # 스크래퍼 설정
│   └── chart-themes.ts                  # 차트 테마 설정
└── types/
    ├── lottery.ts                       # 로또 관련 타입
    ├── generation.ts                    # 생성 관련 타입
    ├── statistics.ts                    # 통계 관련 타입
    ├── charts.ts                        # 차트 관련 타입
    └── api.ts                           # API 응답 타입
```

## 🎨 네오브루탈리즘 디자인 시스템

### 색상 팔레트
```css
primary: #FF3366      /* 강렬한 핑크 */
secondary: #0033CC    /* 진한 블루 */
accent: #FFCC00       /* 밝은 노랑 */
success: #00CC66      /* 생생한 그린 */
warning: #FF6600      /* 주황 */
error: #CC0000        /* 빨강 */
black: #000000        /* 순수 검정 */
white: #FFFFFF        /* 순수 흰색 */
```

### 스타일 특징
- **굵은 테두리**: 4-6px solid border
- **강한 그림자**: 6px 6px 0px #000000
- **직각 모서리**: border-radius: 0
- **고대비 색상**: 검정 테두리 + 밝은 배경
- **굵은 타이포그래피**: font-weight: 800-900

## 🔌 실시간 API 명세서

### 기본 데이터 조회
```typescript
// 최신 회차 정보
GET /api/lottery/latest
Response: ApiResponse<{
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  prize: PrizeInfo;
}>

// 과거 당첨 이력
GET /api/lottery/history?limit=100&offset=0
Response: ApiResponse<{
  results: LotteryResult[];
  totalCount: number;
  pagination: PaginationInfo;
}>

// 실시간 통계 데이터
GET /api/lottery/statistics
Response: ApiResponse<{
  [number: string]: NumberStatistics;
}>
```

### 분석 데이터 조회
```typescript
// Hot/Cold 번호 트렌드
GET /api/lottery/trends
Response: ApiResponse<{
  hot: LotteryTrend[];
  cold: LotteryTrend[];
  neutral: LotteryTrend[];
}>

// 번호별 출현 빈도
GET /api/lottery/frequency
Response: ApiResponse<FrequencyData>

// 패턴 분석 결과
GET /api/lottery/patterns
Response: ApiResponse<{
  consecutivePatterns: PatternData[];
  rangeDistribution: RangeData;
  oddEvenRatio: number;
}>
```

### 차트 데이터 API
```typescript
// 빈도 차트용 데이터
GET /api/charts/frequency
Response: ApiResponse<ChartFrequencyData>

// 트렌드 차트용 데이터
GET /api/charts/trends?period=20
Response: ApiResponse<ChartTrendData>

// 분포 차트용 데이터
GET /api/charts/distribution
Response: ApiResponse<ChartDistributionData>
```

### 관리용 API
```typescript
// 수동 데이터 업데이트
POST /api/scraper/update
Response: ApiResponse<{
  updated: boolean;
  lastRound: number;
  totalResults: number;
}>

// 스크래핑 상태 확인
GET /api/scraper/status
Response: ApiResponse<{
  isRunning: boolean;
  lastUpdate: string;
  nextScheduled: string;
}>
```

### 표준 응답 형식
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    dataFreshness: number; // 분 단위
    cacheHit: boolean;
    requestId: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

## 📊 데이터 스키마

### 로또 당첨 데이터
```typescript
interface LotteryResult {
  round: number;
  date: string;
  numbers: [number, number, number, number, number, number];
  bonus: number;
  prize: {
    first: number;
    firstWinners: number;
    second: number;
    secondWinners: number;
  };
}
```

### 번호 통계 데이터
```typescript
interface NumberStatistics {
  number: number;
  frequency: number;
  lastAppeared: string;
  averageGap: number;
  trend: 'hot' | 'cold' | 'neutral';
  recentAppearances: string[];
}
```

### 생성 결과 데이터
```typescript
interface GenerationResult {
  mainNumbers: number[];
  variants: {
    balanced: number[];
    frequency: number[];
    weighted: number[];
    topStats: number[];
    random: number[];
  };
  lunarInfo: {
    date: LunarDate;
    ganZhi: string;
    zodiac: string;
    specialDay?: string;
  };
  generationMeta: {
    algorithm: string;
    confidence: number;
    reason: string;
    timestamp: string;
  };
}
```

## 🤖 실시간 데이터 기반 5가지 생성 알고리즘

### 1. 균형 조합 v2 (Enhanced Balanced)
실시간 데이터 기반 균형 최적화 조합 생성
- **실시간 홀짝 비율**: 최근 20회차 홀짝 분포 분석
- **동적 구간 분배**: 1-15, 16-30, 31-45 구간별 실시간 비율 적용
- **연속번호 패턴**: 최근 트렌드 기반 연속번호 확률 조정
- **신뢰도**: 85-92% (안정적 패턴 기반)

### 2. 고빈도 v2 (Live Frequency)
실시간 Hot 번호 우선 선택 알고리즘
- **실시간 빈도 분석**: 최근 50회차 가중 빈도 계산
- **트렌드 가속도**: 상승/하락 패턴의 변화율 반영
- **Hot Number 우선**: 현재 Hot 상태 번호에 2.5x 가중치
- **신뢰도**: 78-88% (트렌드 의존도 높음)

### 3. 가중 선택 v2 (Smart Weighted)
음력 정보와 실시간 통계의 지능형 결합
- **음력 가중치**: 특별한 날(윤달 등) 기반 번호 선호도 30%
- **실시간 통계 가중치**: Live 데이터 기반 70%
- **개인화 팩터**: 입력 날짜의 간지와 띠 정보 반영
- **신뢰도**: 80-90% (개인화 요소 포함)

### 4. 상위 통계 v2 (Top Statistics Plus)
실시간 성능 지표 기반 보수적 선택
- **성능 추적**: 각 번호의 최근 성과 지표 분석
- **상위 풀 동적 조정**: 실시간 데이터로 상위 풀 업데이트
- **안정성 점수**: 변동성 최소화 번호 우선 선택
- **신뢰도**: 88-95% (가장 안정적)

### 5. 스마트 랜덤 (Smart Random)
완전 무작위가 아닌 제약 조건 기반 랜덤
- **제약 조건**: 극단적 패턴 배제 (모두 홀수, 연속 6개 등)
- **균형 보정**: 완전 무작위 후 최소한의 균형 조정
- **비교 기준**: 다른 알고리즘과의 성능 비교용
- **신뢰도**: 65-75% (기준선 역할)

## 🕷️ 실시간 스크래핑 & 데이터 파이프라인

### 동행복권 실시간 스크래핑
**Playwright 기반 지능형 스크래퍼**
- **동행복권 공식 사이트**: https://dhlottery.co.kr/
- **스크래핑 대상**: 당첨번호, 상금 정보, 당첨자 수
- **데이터 검증**: 번호 범위, 중복 검사, 형식 검증
- **에러 핸들링**: 재시도 로직, 대체 소스, 알림 시스템

### 3단계 캐싱 전략
```typescript
L1: 메모리 캐시 (1분)     // 빈번한 조회용
└── Redis/In-Memory      // 최신 회차, Hot 데이터

L2: 로컬 스토리지 (1시간)  // 사용자 세션용  
└── Browser Storage      // 차트 데이터, 생성 이력

L3: API 캐시 (24시간)     // 안정적 데이터
└── File System/DB       // 과거 당첨 이력, 통계
```

### 실시간 업데이트 주기
- **즉시 업데이트**: 사용자 요청 시 (Rate Limit: 분당 3회)
- **자동 업데이트**: 매주 토요일 21:30 (추첨 후 30분)
- **백그라운드 갱신**: 캐시 만료 시 비동기 업데이트
- **긴급 업데이트**: 데이터 불일치 감지 시

## 📱 사용자 플로우

1. **날짜 입력**: 양력/음력 선택 → 달력 또는 직접 입력
2. **생성 방식 선택**: 5가지 알고리즘 중 선택
3. **번호 생성**: 메인 번호 + 5가지 변형 번호
4. **결과 분석**: 차트로 당첨 확률 및 패턴 분석
5. **이력 관리**: 생성 기록 저장 및 관리

## 🎯 핵심 기능

### 스마트 날짜 입력
- 양력/음력 토글 선택
- 시각적 달력 인터페이스
- 직접 입력 폼 (YYYY-MM-DD)
- 윤달 지원

### 실시간 분석
- 최근 당첨번호 트렌드
- 번호별 출현 빈도
- Hot/Cold 번호 분석
- 나의 번호 당첨 확률

### 네오브루탈리즘 UI
- 강렬한 색상과 굵은 테두리
- 직관적인 블록 레이아웃
- 고대비 타이포그래피
- 반응형 격자 시스템

## 🚀 실시간 구현 우선순위

### Phase 1: 실시간 데이터 인프라 (1-2일)
1. **Playwright 스크래퍼 구현**
   - 동행복권 사이트 스크래핑
   - 데이터 검증 및 변환
   - 에러 핸들링 및 재시도 로직

2. **API 라우트 구축**
   - 기본 CRUD 엔드포인트
   - 캐싱 미들웨어 적용
   - 응답 형식 표준화

### Phase 2: 고도화된 알고리즘 (1일)
1. **실시간 분석 엔진**
   - 트렌드 분석기 (Hot/Cold)
   - 패턴 감지 알고리즘
   - 예측 신뢰도 계산

2. **알고리즘 v2 구현**
   - 기존 5가지 방식에 실시간 데이터 연동
   - 신뢰도 기반 추천 시스템
   - 성능 추적 및 학습

### Phase 3: 차트 시각화 (1일)
1. **Recharts + Framer Motion 통합**
   - 4가지 핵심 차트 구현 (빈도, 트렌드, 분포, 히트맵)
   - 반응형 디자인 적용
   - 실시간 애니메이션 효과

2. **실시간 업데이트 시스템**
   - 차트 데이터 자동 갱신
   - 사용자 피드백 시스템
   - 데이터 신선도 표시

### Phase 4: 최적화 및 완성 (0.5일)
1. **성능 최적화**
   - 코드 스플리팅 및 지연 로딩
   - 번들 사이즈 최소화
   - 캐시 전략 최적화

2. **품질 보장**
   - 에러 바운더리 및 로딩 상태
   - 오프라인 지원
   - 접근성 개선

## 📊 추천 기술 스택

### 프론트엔드
- **Next.js 15**: App Router, Server Components
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 네오브루탈리즘 스타일링
- **Recharts**: 차트 라이브러리 (가벼움 + React 네이티브)
- **Framer Motion**: 애니메이션
- **React Query/SWR**: 서버 상태 관리

### 백엔드
- **Next.js API Routes**: 서버리스 API
- **Playwright**: 웹 스크래핑
- **Node.js**: 런타임

### 데이터 & 캐싱
- **File System**: JSON 기반 데이터 저장
- **Memory Cache**: 런타임 캐싱
- **Browser Storage**: 클라이언트 캐싱

### 배포 & 모니터링
- **Vercel**: 배포 플랫폼
- **Vercel Analytics**: 성능 모니터링
- **Vercel Cron Jobs**: 스케줄링

## 💡 핵심 베스트 프랙티스

### 1. 데이터 무결성
- **스크래핑 검증**: 다중 검증 레이어
- **백업 전략**: 로컬 파일 + 클라우드 백업
- **장애 복구**: 자동 복구 메커니즘

### 2. 사용자 경험
- **로딩 최적화**: 스켈레톤 UI, 지연 로딩
- **에러 처리**: 사용자 친화적 에러 메시지
- **오프라인 지원**: Service Worker 활용

### 3. 성능 최적화
- **번들 최적화**: 코드 스플리팅, Tree Shaking
- **이미지 최적화**: Next.js Image 컴포넌트
- **캐싱 전략**: 다층 캐싱 시스템

### 4. 확장성 & 유지보수성
- **모듈형 아키텍처**: 기능별 분리
- **타입 안정성**: 100% TypeScript 커버리지
- **테스트 커버리지**: 핵심 로직 테스트

---

**🎯 구현 목표**: 실시간 로또 데이터와 전통 음력을 결합한 혁신적이고 직관적인 번호 생성 서비스