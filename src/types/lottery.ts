// 로또 관련 타입 정의

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

export interface NumberStatistics {
  number: number;
  frequency: number;
  lastAppeared: string;
  averageGap: number;
  trend: 'hot' | 'cold' | 'neutral';
  recentAppearances: string[];
}

export interface LotteryTrend {
  number: number;
  trend: 'hot' | 'cold' | 'neutral';
  frequency: number;
  lastSeen: number; // rounds ago
}

export interface FrequencyData {
  mostFrequent: number[];
  leastFrequent: number[];
  recentTrends: {
    hot: number[];
    cold: number[];
  };
  statistics: Record<number, NumberStatistics>;
}

export interface LotteryApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ScrapeResult {
  results: LotteryResult[];
  lastUpdated: string;
  totalRounds: number;
}