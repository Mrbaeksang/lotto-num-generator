// 로또 번호 생성 관련 타입 정의

/**
 * 로또 번호 생성 알고리즘 타입
 */
export type GenerationAlgorithm = 
  | 'balanced'      // 균형 조합
  | 'frequency'     // 고빈도
  | 'weighted'      // 가중 선택
  | 'topStats'      // 상위 통계
  | 'random'        // 랜덤
  | 'intuitive'     // 직관적
  | 'statistical'   // 통계적
  | 'lunar';        // 음력 기반

/**
 * 생성된 번호 결과
 */
export interface GeneratedNumbers {
  algorithm: GenerationAlgorithm;
  numbers: number[];
  confidence: number;
  reasoning: string;
  metadata: GenerationMetadata;
}

/**
 * 생성 메타데이터
 */
export interface GenerationMetadata {
  timestamp: string;
  algorithm: GenerationAlgorithm;
  confidence: number;
  reason: string;
  parameters?: Record<string, unknown>;
  statistics?: {
    hotNumbers: number[];
    coldNumbers: number[];
    balanceScore: number;
    diversityScore: number;
  };
}

/**
 * 5가지 알고리즘 생성 결과
 */
export interface MultiGenerationResult {
  mainNumbers: number[];
  mainAlgorithm: GenerationAlgorithm;
  variants: {
    balanced: number[];
    frequency: number[];
    weighted: number[];
    topStats: number[];
    random: number[];
  };
  lunarInfo?: LunarInfo;
  generationMeta: GenerationMetadata;
}

/**
 * 음력 정보
 */
export interface LunarInfo {
  date: LunarDate;
  ganZhi: string;
  zodiac: string;
  specialDay?: string;
  season: string;
  element: string;
}

/**
 * 음력 날짜
 */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  cyclicalYear: string;
  cyclicalMonth: string;
  cyclicalDay: string;
}

/**
 * 생성 옵션 기본 인터페이스
 */
export interface BaseGenerationOptions {
  excludeNumbers?: number[];
  includeNumbers?: number[];
  balanceWeight?: number;
  randomSeed?: number;
}

/**
 * 균형 조합 생성 옵션
 */
export interface BalancedOptions extends BaseGenerationOptions {
  oddEvenRatio?: [number, number]; // [홀수, 짝수] 비율
  rangeDistribution?: [number, number, number]; // [저, 중, 고] 구간 개수
  consecutiveLimit?: number;
  sumRange?: [number, number];
}

/**
 * 고빈도 생성 옵션
 */
export interface FrequencyOptions extends BaseGenerationOptions {
  recentRounds?: number;
  hotThreshold?: number;
  coldAvoidance?: boolean;
  trendWeight?: number;
}

/**
 * 가중 선택 옵션
 */
export interface WeightedOptions extends BaseGenerationOptions {
  lunarWeight?: number; // 0-1
  statisticalWeight?: number; // 0-1
  personalWeight?: number; // 0-1
  inputDate?: string;
}

/**
 * 상위 통계 옵션
 */
export interface TopStatsOptions extends BaseGenerationOptions {
  topCount?: number; // 상위 몇 개 번호에서 선택
  conservativeMode?: boolean;
  recentBias?: number; // 최근 데이터 가중치
}

/**
 * 직관적 생성 옵션
 */
export interface IntuitiveOptions extends BaseGenerationOptions {
  preferredRange?: { min: number; max: number };
  avoidNumbers?: number[];
  favoriteNumbers?: number[];
  luckyColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';
  mood?: 'optimistic' | 'cautious' | 'adventurous' | 'balanced' | 'confident';
  intuitionMode?: 'random' | 'guided' | 'balanced' | 'systematic';
  symbols?: ('circle' | 'triangle' | 'square' | 'star' | 'heart')[];
  timeInfluence?: boolean;
  weatherMood?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
}

/**
 * 통계적 생성 옵션
 */
export interface StatisticalOptions extends BaseGenerationOptions {
  useFrequency?: boolean;
  useConsecutive?: boolean;
  useRangeBalance?: boolean;
  useEvenOdd?: boolean;
  excludeRecent?: boolean;
}

/**
 * 음력 생성 옵션
 */
export interface LunarOptions extends BaseGenerationOptions {
  solarDate?: string;
  lunarDate?: LunarDate;
  considerSeason?: boolean;
  considerElement?: boolean;
  considerZodiac?: boolean;
  traditionalWeights?: boolean;
}

/**
 * 생성 이력
 */
export interface GenerationHistory {
  id: string;
  timestamp: string;
  algorithm: GenerationAlgorithm;
  numbers: number[];
  options: BaseGenerationOptions | BalancedOptions | FrequencyOptions | WeightedOptions | TopStatsOptions | IntuitiveOptions | StatisticalOptions | LunarOptions;
  reasoning: string;
  userId?: string;
}

/**
 * 번호 분석 결과
 */
export interface NumberAnalysis {
  numbers: number[];
  analysis: {
    oddEvenRatio: [number, number];
    rangeDistribution: [number, number, number];
    consecutiveCount: number;
    sum: number;
    averageGap: number;
    balanceScore: number;
    diversityScore: number;
    hotColdRatio: [number, number];
  };
  recommendations: string[];
}

/**
 * 알고리즘 성능 메트릭
 */
export interface AlgorithmMetrics {
  algorithm: GenerationAlgorithm;
  accuracy: number;
  diversity: number;
  consistency: number;
  userSatisfaction: number;
  executionTime: number;
  lastUpdated: string;
}

/**
 * 생성 요청
 */
export interface GenerationRequest {
  algorithm: GenerationAlgorithm;
  options?: BaseGenerationOptions | BalancedOptions | FrequencyOptions | WeightedOptions | TopStatsOptions | IntuitiveOptions | StatisticalOptions | LunarOptions;
  count?: number; // 생성할 조합 수
  userId?: string;
}

/**
 * 생성 응답
 */
export interface GenerationResponse {
  success: boolean;
  data?: GeneratedNumbers | MultiGenerationResult;
  error?: string;
  timestamp: string;
  executionTime?: number;
}