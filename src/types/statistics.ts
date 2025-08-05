// 통계 및 분석 관련 타입 정의

/**
 * 실시간 분석 엔진 타입
 */
export type AnalysisType = 
  | 'frequency'     // 빈도 분석
  | 'trend'         // 트렌드 분석
  | 'pattern'       // 패턴 분석
  | 'prediction'    // 예측 분석
  | 'comparison'    // 비교 분석
  | 'distribution'  // 분포 분석
  | 'correlation';  // 상관관계 분석

/**
 * 번호 상태 타입
 */
export type NumberState = 'hot' | 'cold' | 'neutral' | 'overdue' | 'frequent' | 'rare';

/**
 * 트렌드 방향
 */
export type TrendDirection = 'rising' | 'falling' | 'stable' | 'volatile';

/**
 * 실시간 번호 상태
 */
export interface RealtimeNumberState {
  number: number;
  state: NumberState;
  confidence: number;
  trend: TrendDirection;
  score: number;
  lastUpdate: string;
  metadata: {
    frequency: number;
    recentAppearances: number;
    daysSinceLastAppearance: number;
    averageGap: number;
    volatility: number;
  };
}

/**
 * Hot/Cold 분석 결과
 */
export interface HotColdAnalysis {
  hot: {
    numbers: number[];
    threshold: number;
    confidence: number;
    duration: number; // 얼마나 오래 hot 상태인지 (일)
  };
  cold: {
    numbers: number[];
    threshold: number;
    confidence: number;
    duration: number; // 얼마나 오래 cold 상태인지 (일)
  };
  neutral: {
    numbers: number[];
    range: [number, number]; // 중립 범위
  };
  overdue: {
    numbers: number[];
    daysSinceLastAppearance: number[];
    urgency: 'low' | 'medium' | 'high';
  };
  analysis: {
    totalAnalyzed: number;
    hotColdRatio: number;
    averageTemperature: number;
    stabilityIndex: number;
  };
}

/**
 * 트렌드 분석 결과
 */
export interface TrendAnalysis {
  shortTerm: {
    period: string; // "7 days", "14 days"
    trends: RealtimeNumberState[];
    summary: {
      rising: number;
      falling: number;
      stable: number;
      volatile: number;
    };
  };
  mediumTerm: {
    period: string; // "30 days", "60 days"
    trends: RealtimeNumberState[];
    summary: {
      rising: number;
      falling: number;
      stable: number;
      volatile: number;
    };
  };
  longTerm: {
    period: string; // "90 days", "180 days"
    trends: RealtimeNumberState[];
    summary: {
      rising: number;
      falling: number;
      stable: number;
      volatile: number;
    };
  };
  predictions: {
    nextDraw: {
      recommended: number[];
      avoid: number[];
      confidence: number;
    };
    next3Draws: {
      recommended: number[];
      avoid: number[];
      confidence: number;
    };
  };
}

/**
 * 패턴 분석 결과
 */
export interface PatternAnalysis {
  consecutivePatterns: {
    pairs: Array<{ numbers: [number, number]; frequency: number; lastSeen: string }>;
    triplets: Array<{ numbers: [number, number, number]; frequency: number; lastSeen: string }>;
    sequences: Array<{ numbers: number[]; frequency: number; lastSeen: string }>;
  };
  oddEvenPatterns: {
    distribution: Record<string, number>; // "3-3", "4-2", etc.
    mostCommon: string;
    leastCommon: string;
    recommendation: string;
  };
  rangePatterns: {
    distribution: Record<string, number>; // "2-2-2", "3-2-1", etc.
    mostCommon: string;
    leastCommon: string;
    recommendation: string;
  };
  sumPatterns: {
    distribution: Record<number, number>; // sum -> frequency
    averageSum: number;
    recommendedRange: [number, number];
    outliers: number[];
  };
}

/**
 * 예측 분석 결과
 */
export interface PredictionAnalysis {
  algorithm: 'frequency' | 'pattern' | 'trend' | 'hybrid';
  confidence: number;
  predictions: {
    mostLikely: number[];
    alternative: number[];
    surprise: number[]; // 예상치 못한 후보
  };
  reasoning: string[];
  accuracy: {
    historical: number; // 과거 예측 정확도
    recent: number; // 최근 예측 정확도
    trend: TrendDirection;
  };
  metadata: {
    dataRange: string;
    analysisDepth: 'shallow' | 'deep' | 'comprehensive';
    computedAt: string;
  };
}

/**
 * 분포 분석 결과
 */
export interface DistributionAnalysis {
  frequency: {
    mean: number;
    median: number;
    mode: number[];
    standardDeviation: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
  ranges: {
    low: { numbers: number[]; frequency: number; percentage: number };
    middle: { numbers: number[]; frequency: number; percentage: number };
    high: { numbers: number[]; frequency: number; percentage: number };
  };
  gaps: {
    average: number;
    shortest: number;
    longest: number;
    distribution: Record<number, number>;
  };
  clustering: {
    clusters: Array<{
      center: number;
      members: number[];
      density: number;
    }>;
    outliers: number[];
  };
}

/**
 * 상관관계 분석 결과
 */
export interface CorrelationAnalysis {
  numberPairs: Array<{
    pair: [number, number];
    correlation: number;
    significance: 'low' | 'medium' | 'high';
    frequency: number;
  }>;
  seasonalCorrelation: {
    spring: number[];
    summer: number[];
    autumn: number[];
    winter: number[];
  };
  weekdayCorrelation: {
    monday: number[];
    tuesday: number[];
    wednesday: number[];
    thursday: number[];
    friday: number[];
    saturday: number[];
    sunday: number[];
  };
  temporalPatterns: {
    monthly: Record<string, number[]>;
    quarterly: Record<string, number[]>;
    yearly: Record<string, number[]>;
  };
}

/**
 * 통합 실시간 분석 결과
 */
export interface RealtimeAnalysis {
  hotCold: HotColdAnalysis;
  trends: TrendAnalysis;
  patterns: PatternAnalysis;
  predictions: PredictionAnalysis;
  distribution: DistributionAnalysis;
  correlation: CorrelationAnalysis;
  metadata: {
    lastUpdate: string;
    dataFreshness: 'fresh' | 'stale' | 'outdated';
    analysisQuality: 'high' | 'medium' | 'low';
    computationTime: number;
    confidence: number;
  };
}

/**
 * 분석 설정
 */
export interface AnalysisSettings {
  analysisTypes: AnalysisType[];
  timeWindows: {
    short: number; // days
    medium: number; // days
    long: number; // days
  };
  thresholds: {
    hotThreshold: number;
    coldThreshold: number;
    trendThreshold: number;
    confidenceThreshold: number;
  };
  advanced: {
    includeSeasonalAnalysis: boolean;
    includeCorrelationAnalysis: boolean;
    includePredictions: boolean;
    maxDepth: 'shallow' | 'medium' | 'deep';
  };
}

/**
 * 차트 데이터 타입
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * 트렌드 차트 데이터
 */
export interface TrendChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }>;
}

/**
 * 빈도 차트 데이터
 */
export interface FrequencyChartData {
  numbers: number[];
  frequencies: number[];
  colors: string[];
  percentages: number[];
}

/**
 * 히트맵 데이터
 */
export interface HeatmapData {
  data: Array<{
    number: number;
    intensity: number;
    state: NumberState;
    label: string;
  }>;
  colorScale: {
    min: string;
    max: string;
    neutral: string;
  };
}

/**
 * 실시간 업데이트 이벤트
 */
export interface RealtimeUpdateEvent {
  type: 'data-update' | 'analysis-complete' | 'error' | 'warning';
  timestamp: string;
  data?: unknown;
  message?: string;
  severity?: 'info' | 'warning' | 'error';
}