# 🎯 로또 번호 생성기 - 실시간 데이터 & 음력 연동

DHLottery 공식 API를 활용한 실시간 로또 번호 생성 서비스

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/lottery/
│   │   ├── latest/route.ts      # 최신 당첨번호
│   │   ├── recent/route.ts      # 최근 N회차 
│   │   └── generate/route.ts    # 번호 생성
│   ├── page.tsx                 # 메인 페이지
│   ├── layout.tsx               # 레이아웃
│   └── globals.css              # 글로벌 스타일
├── components/
│   ├── date-picker.tsx          # 음력/양력 날짜 선택
│   ├── number-generator.tsx     # 번호 생성기
│   └── result-display.tsx       # 결과 표시
├── lib/
│   ├── lottery-api.ts           # DHLottery API 호출
│   ├── generators.ts            # 8가지 생성 알고리즘
│   ├── utils.ts                 # 유틸리티 함수
│   └── lunar/
│       └── lunar-calendar.ts    # 음력 계산
└── types/
    ├── lottery.ts               # 로또 관련 타입
    ├── generation.ts            # 생성 관련 타입
    ├── statistics.ts            # 통계 관련 타입
    └── lunar.ts                 # 음력 관련 타입
```

## 🔌 핵심 로직

### 1. 날짜 → 회차 계산
```typescript
// 1회차: 2002-12-07 (토요일)
// 매주 토요일 추첨
function calculateCurrentRound(): number {
  const firstDraw = new Date('2002-12-07');
  const today = new Date();
  const weeksDiff = Math.floor((today.getTime() - firstDraw.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return weeksDiff + 1;
}
```

### 2. DHLottery POST API
```typescript
// https://dhlottery.co.kr/gameResult.do?method=byWin
FormData: {
  method: 'byWin',
  drwNo: '1183',          // 회차 번호
  hdrwComb: '1',
  dwrNoList: '1183'
}
```

### 3. 현실 구현 가능한 8가지 생성 방식

#### 📊 데이터 기반 (실제 로또 데이터 활용)
1. **🔥 핫넘버**: 최근 N회차에서 가장 많이 나온 번호들
2. **❄️ 콜드넘버**: 오랫동안 안 나온 번호들의 "터질 때가 됐다" 심리
3. **📈 상승세**: 최근 출현 빈도가 증가하는 트렌드 번호들
4. **⚖️ 균형 조합**: 홀짝, 높낮이, 구간별 황금비율 적용

#### 🌙 음력/날짜 기반 (사용자 입력 활용)
5. **🎯 개인 특화**: 선택한 음력 날짜의 숫자들 + 관련 번호들
6. **🗓️ 요일 분석**: 토요일 추첨 기준 요일별 출현 패턴 분석
7. **📅 계절 가중**: 추첨 시기(봄/여름/가을/겨울)별 번호 선호도

#### 🎲 심리적 매력
8. **🔄 역발상**: 가장 적게 선택되는 번호 조합 (다른 사람과 겹칠 확률 최소화)

## 🎨 UX 플로우

1. **날짜 선택**: 음력/양력 달력에서 날짜 선택
2. **분석 시작**: 선택 날짜 정보 표시 (윤달, 간지, 띠 등)
3. **번호 생성**: 8가지 방식으로 번호 생성
4. **결과 표시**: 방식별 번호와 설명 표시

### 날짜 정보 예시
```
2025년 윤6월 12일 (윤달)
양력: 2025년 8월 5일 (화요일)
음력: 2025년 윤6월 12일
간지: 을사년
띠: 뱀띠
특별한 날: 윤6월
```


```
🎯 2025년 윤6월 12일 특별 분석 완료!

📅 선택한 날짜 정보  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
양력: 2025년 8월 5일 (화요일) ⭐ 대길일
음력: 2025년 윤6월 12일 🌙 윤달 특수 에너지  
간지: 을사년 (나무뱀의 해) 🐍 변화와 직감의 해
특별한 날: 윤6월 - 19년에 한 번 오는 특별한 달! 🎰

🔥 당신만의 특급 로또 번호 5가지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 [메인 추천] 윤달 특화 번호
   6 - 12 - 19 - 25 - 33 - 41
   ⚡ 윤6월 에너지 + 뱀띠 직감력 조합 
   📊 최근 20회차 분석: 이 조합 83% 적중률!

⚖️ 균형 조합 (안정형)  
   3 - 14 - 23 - 28 - 36 - 42
   🎯 홀짝 완벽 균형 + 구간별 황금비율

🔥 고빈도 번호 (데이터 기반)
   1 - 7 - 17 - 21 - 34 - 43  
   📈 최근 50회차에서 가장 뜨거운 번호들
   ⭐ 7번은 최근 3회 연속 출현!

🎲 윤달 가중 선택 (운명형)
   5 - 12 - 18 - 27 - 31 - 45
   🌙 윤6월의 신비한 힘이 담긴 조합
   ✨ 12일 + 윤6월 = 특별 가중치 적용

📊 통계 상위권 (검증형)
   2 - 9 - 20 - 29 - 37 - 44
   🏆 역대 최고 출현빈도 번호들  
   💪 1등 당첨자들이 가장 많이 선택한 범위

🎰 보너스 인사이트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 윤달 예측: 12, 19, 33번이 이번 달 강세!
📈 트렌드 분석: 30번대 숫자들이 상승세
⚡ 특급 팁: 윤6월은 변화의 달 - 평소와 다른 선택을!

💰 이번 회차 예상 1등 상금: 42억원
🍀 당신의 운세: 매우 좋음 (윤달 보너스!)
```

## 🔌 필요 API (총 3개)

1. **GET /api/lottery/latest** - 최신 당첨번호
2. **GET /api/lottery/recent?count=N** - 최근 N회차 (최대 50)  
3. **POST /api/lottery/generate** - 8가지 방식 번호 생성

## 📋 데이터 스키마

### LotteryResult
```typescript
interface LotteryResult {
  round: number;           // 회차
  date: string;           // YYYY-MM-DD
  numbers: [number, number, number, number, number, number];
  bonus: number;
}
```

### GeneratedNumbers  
```typescript
interface GeneratedNumbers {
  numbers: number[];      // 로또 번호 6개
  method: string;         // 생성 방식명  
  description: string;    // 방식 설명
}
```

### GenerateRequest
```typescript
interface GenerateRequest {
  lunarDay: number;       // 음력 일
  lunarMonth: number;     // 음력 월
  analysisCount?: number; // 분석 회차 (기본 20)  
}
```

## 🎨 네오브루탈리즘 디자인 타입

### 색상 팔레트
```css
/* 메인 색상 */
--primary: #FF3366;      /* 강렬한 핑크 */
--secondary: #0033CC;    /* 진한 블루 */ 
--accent: #FFCC00;       /* 밝은 노랑 */
--success: #00CC66;      /* 생생한 그린 */
--warning: #FF6600;      /* 주황 */
--error: #CC0000;        /* 빨강 */

/* 베이스 */
--black: #000000;        /* 순수 검정 */
--white: #FFFFFF;        /* 순수 흰색 */
```

### 핵심 스타일 규칙
```css
/* 네오브루탈리즘 기본 스타일 */
.neo-brutal {
  border: 4px solid #000000;           /* 굵은 검정 테두리 */
  border-radius: 0;                    /* 직각 모서리 */
  box-shadow: 6px 6px 0px #000000;     /* 강한 그림자 */
  font-weight: 800;                    /* 굵은 글꼴 */
  text-transform: uppercase;           /* 대문자 */
}

/* 버튼 */
.neo-button {
  padding: 16px 24px;
  background: #FF3366;
  color: #FFFFFF;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  cursor: pointer;
  transition: all 0.1s ease;
}

.neo-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0px #000000;
}

/* 카드 */
.neo-card {
  background: #FFFFFF;
  border: 4px solid #000000;
  box-shadow: 8px 8px 0px #000000;
  padding: 24px;
}

/* 로또 번호 공 */
.lotto-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  font-weight: 900;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 컴포넌트 타입
- **날짜 선택기**: 강렬한 색상의 달력 UI with 굵은 테두리
- **번호 생성 버튼**: 거대한 네온 색상 버튼 with 그림자 효과
- **결과 카드**: 검정 테두리 + 그림자로 띄워진 카드 스타일
- **로또 번호 공**: 3D 느낌의 원형 번호 표시기

## 🚀 개발 우선순위

### Phase 1: API 완성 (1일)
1. ✅ DHLottery API 통합
2. ✅ 5가지 생성 알고리즘
3. ✅ 기본 API 라우트

### Phase 2: UI 구현 (1일)  
1. 음력/양력 날짜 선택기
2. 번호 생성 인터페이스
3. 결과 표시 컴포넌트

### Phase 3: 데이터 분석 (1일)
1. 빈도 분석 차트
2. 트렌드 시각화
3. 통계 대시보드

---

**핵심**: 현재 날짜 기준으로 회차 계산 → DHLottery POST API로 최근 데이터 수집 → 5가지 방식으로 분석 및 번호 생성