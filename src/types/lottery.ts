// 로또 관련 타입 정의

/**
 * 기본 로또 당첨 결과 데이터
 */
export interface LotteryResult {
  round: number;
  date: string;
  numbers: [number, number, number, number, number, number];
  bonus: number;
  prize: {
    first: number;
    firstWinners: number;
    second: number;
    secondWinners: number;
    third: number;
    thirdWinners: number;
    fourth: number;
    fourthWinners: number;
    fifth: number;
    fifthWinners: number;
  };
}

/**
 * API 응답 표준 형식
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * 메타데이터 정보
 */
export interface ApiMeta {
  analyzedRounds?: number;
  totalAvailableRounds?: number;
  dateRange?: {
    from: string;
    to: string;
  };
  totalNumbers?: number;
  analysisType?: string;
}

/**
 * 번호별 상세 통계 정보
 */
export interface NumberStatistics {
  number: number;
  frequency: number;
  lastAppeared: string;
  lastRound: number;
  averageGap: number;
  trend: 'hot' | 'cold' | 'neutral';
  recentAppearances: Array<{ round: number; date: string }>;
}

/**
 * 통계 분석 결과
 */
export interface StatisticsAnalysis {
  mostFrequent: number[];
  leastFrequent: number[];
  hotNumbers: number[];
  coldNumbers: number[];
  overdue: number[];
  recentTrends: {
    rising: number[];
    falling: number[];
  };
}

export interface LotteryTrend {
  number: number;
  trend: 'hot' | 'cold' | 'neutral';
  frequency: number;
  lastSeen: number; // rounds ago
}

/**
 * 빈도 분석 데이터
 */
export interface FrequencyData {
  number: number;
  frequency: number;
  percentage: number;
  lastAppeared: string;
  daysSinceAppearance: number;
}

/**
 * 빈도 분석 결과
 */
export interface FrequencyAnalysis {
  frequencyData: FrequencyData[];
  mostFrequent: FrequencyData[];
  leastFrequent: FrequencyData[];
  hotNumbers: FrequencyData[];
  coldNumbers: FrequencyData[];
  summary: {
    totalDraws: number;
    averageFrequency: number;
    expectedPercentage: number;
  };
  statistics?: {
    mean: number;
    standardDeviation: number;
    variance: number;
    outliers: Array<{
      number: number;
      frequency: number;
      deviation: number;
    }>;
  };
  distribution?: {
    highFrequency: number;
    normalFrequency: number;
    lowFrequency: number;
  };
}

/**
 * 비교 분석 트렌드
 */
export interface TrendComparison {
  number: number;
  recentFrequency: number;
  recentPercentage: number;
  olderPercentage: number;
  trendValue: number;
  trend: 'rising' | 'falling' | 'stable';
}

/**
 * 비교 분석 결과
 */
export interface ComparativeAnalysis {
  recent: FrequencyAnalysis;
  comparison: TrendComparison[];
  trends: {
    rising: TrendComparison[];
    falling: TrendComparison[];
    stable: number;
  };
  periods: {
    recent: {
      rounds: number;
      dateRange: {
        from: string;
        to: string;
      };
    };
    comparison: {
      rounds: number;
      dateRange: {
        from: string;
        to: string;
      };
    };
  };
}

/**
 * API 응답 타입들
 */
export interface LatestApiResponse extends ApiResponse<LotteryResult> {
  meta?: {
    validationPassed: boolean;
    dataFreshness: 'fresh' | 'stale';
  };
}

export interface HistoryApiResponse extends ApiResponse<LotteryResult[]> {
  meta?: ApiMeta & {
    qualityCheck: {
      dataFreshness: 'fresh' | 'stale';
      completeness: number;
    };
  };
}

export type StatisticsApiResponse = ApiResponse<{
  numberStatistics: Record<number, NumberStatistics>;
  analysis: StatisticsAnalysis | null;
  meta: ApiMeta;
}>;

export interface FrequencyApiResponse extends ApiResponse<FrequencyAnalysis | ComparativeAnalysis> {
  meta?: ApiMeta;
}

/**
 * 스크래핑 관련 타입
 */
export interface ScrapeResult {
  results: LotteryResult[];
  lastUpdated: string;
  totalRounds: number;
}

/**
 * 데이터 검증 관련
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cleanedData?: LotteryResult[];
}

/**
 * 캐시 관련 타입
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
  compression?: boolean;
}