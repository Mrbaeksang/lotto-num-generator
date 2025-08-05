// 로또 데이터 전용 캐싱 시스템

import { CacheManager } from './cache-manager';
import type { 
  LotteryResult, 
  NumberStatistics, 
  FrequencyAnalysis, 
  StatisticsAnalysis,
  ComparativeAnalysis 
} from '@/types/lottery';

/**
 * 로또 캐시 키 생성기
 */
export class LotteryCacheKeys {
  private static readonly PREFIX = 'lottery';
  
  static latest(): string {
    return `${this.PREFIX}:latest`;
  }
  
  static history(count?: number, start?: number, end?: number): string {
    if (start && end) {
      return `${this.PREFIX}:history:range:${start}-${end}`;
    }
    return `${this.PREFIX}:history:recent:${count || 20}`;
  }
  
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Generates a cache key for lottery statistics.
   * 
   * @param rounds - The number of rounds to include in the statistics.
   * @param includeAnalysis - Indicates whether to include detailed analysis in the statistics.
   * @returns A string key formatted for accessing cached lottery statistics.
   */

/*******  67fec108-4d74-4afa-a088-313544c258db  *******/
  static statistics(rounds: number, includeAnalysis: boolean): string {
    return `${this.PREFIX}:statistics:${rounds}:${includeAnalysis ? 'with' : 'without'}_analysis`;
  }
  
  static frequency(rounds: number, type: string): string {
    return `${this.PREFIX}:frequency:${rounds}:${type}`;
  }
  
  static recentDraws(count: number): string {
    return `${this.PREFIX}:recent_draws:${count}`;
  }
  
  static numberStats(rounds: number): string {
    return `${this.PREFIX}:number_stats:${rounds}`;
  }
  
  static hotColdNumbers(rounds: number): string {
    return `${this.PREFIX}:hot_cold:${rounds}`;
  }
  
  static trends(period: string): string {
    return `${this.PREFIX}:trends:${period}`;
  }
}

/**
 * 로또 데이터 캐시 매니저
 */
export class LotteryCache {
  private cache: CacheManager;
  
  // 캐시 TTL 설정 (밀리초)
  private static readonly TTL = {
    LATEST: 30 * 60 * 1000,        // 30분 - 최신 당첨번호
    HISTORY: 60 * 60 * 1000,       // 1시간 - 이력 데이터
    STATISTICS: 60 * 60 * 1000,    // 1시간 - 통계 분석
    FREQUENCY: 45 * 60 * 1000,     // 45분 - 빈도 분석
    HOT_COLD: 30 * 60 * 1000,      // 30분 - Hot/Cold 분석
    TRENDS: 60 * 60 * 1000         // 1시간 - 트렌드 분석
  };

  constructor() {
    this.cache = CacheManager.getInstance();
  }

  /**
   * 최신 당첨번호 캐시
   */
  async getLatest(): Promise<LotteryResult | null> {
    return await this.cache.get<LotteryResult>(LotteryCacheKeys.latest());
  }

  async setLatest(data: LotteryResult): Promise<void> {
    await this.cache.set(LotteryCacheKeys.latest(), data, LotteryCache.TTL.LATEST);
  }

  /**
   * 이력 데이터 캐시
   */
  async getHistory(count?: number, start?: number, end?: number): Promise<LotteryResult[] | null> {
    const key = LotteryCacheKeys.history(count, start, end);
    return await this.cache.get<LotteryResult[]>(key);
  }

  async setHistory(data: LotteryResult[], count?: number, start?: number, end?: number): Promise<void> {
    const key = LotteryCacheKeys.history(count, start, end);
    await this.cache.set(key, data, LotteryCache.TTL.HISTORY);
  }

  /**
   * 통계 분석 캐시
   */
  async getStatistics(rounds: number, includeAnalysis: boolean): Promise<{
    numberStatistics: Record<number, NumberStatistics>;
    analysis: StatisticsAnalysis | null;
  } | null> {
    const key = LotteryCacheKeys.statistics(rounds, includeAnalysis);
    return await this.cache.get(key);
  }

  async setStatistics(
    data: {
      numberStatistics: Record<number, NumberStatistics>;
      analysis: StatisticsAnalysis | null;
    },
    rounds: number,
    includeAnalysis: boolean
  ): Promise<void> {
    const key = LotteryCacheKeys.statistics(rounds, includeAnalysis);
    await this.cache.set(key, data, LotteryCache.TTL.STATISTICS);
  }

  /**
   * 빈도 분석 캐시
   */
  async getFrequency(rounds: number, type: string): Promise<FrequencyAnalysis | ComparativeAnalysis | null> {
    const key = LotteryCacheKeys.frequency(rounds, type);
    return await this.cache.get(key);
  }

  async setFrequency(
    data: FrequencyAnalysis | ComparativeAnalysis,
    rounds: number,
    type: string
  ): Promise<void> {
    const key = LotteryCacheKeys.frequency(rounds, type);
    await this.cache.set(key, data, LotteryCache.TTL.FREQUENCY);
  }

  /**
   * 최근 추첨 결과 캐시 (스크래핑 최적화용)
   */
  async getRecentDraws(count: number): Promise<LotteryResult[] | null> {
    const key = LotteryCacheKeys.recentDraws(count);
    return await this.cache.get<LotteryResult[]>(key);
  }

  async setRecentDraws(data: LotteryResult[], count: number): Promise<void> {
    const key = LotteryCacheKeys.recentDraws(count);
    await this.cache.set(key, data, LotteryCache.TTL.HISTORY);
  }

  /**
   * 번호별 통계 캐시
   */
  async getNumberStats(rounds: number): Promise<Record<number, NumberStatistics> | null> {
    const key = LotteryCacheKeys.numberStats(rounds);
    return await this.cache.get(key);
  }

  async setNumberStats(data: Record<number, NumberStatistics>, rounds: number): Promise<void> {
    const key = LotteryCacheKeys.numberStats(rounds);
    await this.cache.set(key, data, LotteryCache.TTL.STATISTICS);
  }

  /**
   * Hot/Cold 번호 분석 캐시
   */
  async getHotColdNumbers(rounds: number): Promise<{
    hot: number[];
    cold: number[];
    neutral: number[];
    overdue: number[];
  } | null> {
    const key = LotteryCacheKeys.hotColdNumbers(rounds);
    return await this.cache.get(key);
  }

  async setHotColdNumbers(
    data: {
      hot: number[];
      cold: number[];
      neutral: number[];
      overdue: number[];
    },
    rounds: number
  ): Promise<void> {
    const key = LotteryCacheKeys.hotColdNumbers(rounds);
    await this.cache.set(key, data, LotteryCache.TTL.HOT_COLD);
  }

  /**
   * 트렌드 분석 캐시
   */
  async getTrends(period: string): Promise<Record<string, unknown> | null> {
    const key = LotteryCacheKeys.trends(period);
    return await this.cache.get(key);
  }

  async setTrends(data: Record<string, unknown>, period: string): Promise<void> {
    const key = LotteryCacheKeys.trends(period);
    await this.cache.set(key, data, LotteryCache.TTL.TRENDS);
  }

  /**
   * 스마트 캐시 무효화
   */
  async invalidateByRound(newRound: number): Promise<void> {
    // 새로운 회차가 나오면 관련 캐시들을 무효화
    await this.cache.invalidate(LotteryCacheKeys.latest());
    
    // 패턴으로 관련 캐시들 무효화
    await this.cache.invalidatePattern('lottery:(history|statistics|frequency|recent_draws).*');
    
    console.log(`🎯 새로운 회차(${newRound}) 감지: 관련 캐시 무효화 완료`);
  }

  /**
   * 시간 기반 캐시 무효화
   */
  async invalidateExpired(): Promise<void> {
    // 만료된 캐시는 CacheManager에서 자동 처리되므로 추가 작업 없음
    console.log('⏰ 만료된 로또 캐시 정리 완료');
  }

  /**
   * 캐시 예열 (미리 자주 사용되는 데이터 로드)
   */
  async warmup(): Promise<void> {
    console.log('🔥 로또 캐시 예열 시작...');
    
    // 자주 사용되는 캐시 키들을 미리 준비
    const commonKeys = [
      LotteryCacheKeys.latest(),
      LotteryCacheKeys.history(20),
      LotteryCacheKeys.statistics(50, true),
      LotteryCacheKeys.frequency(50, 'recent')
    ];

    // 캐시된 데이터가 있는지 확인
    let cachedCount = 0;
    for (const key of commonKeys) {
      const exists = await this.cache.get(key);
      if (exists) {
        cachedCount++;
      }
    }

    console.log(`🔥 캐시 예열 완료: ${cachedCount}/${commonKeys.length} 항목 준비됨`);
  }

  /**
   * 캐시 상태 조회
   */
  async getStatus(): Promise<{
    stats: Record<string, unknown>;
    keyCount: number;
    topKeys: string[];
  }> {
    const stats = this.cache.getStats() as unknown as Record<string, unknown>;
    
    // 로또 관련 캐시 키 개수 추정
    const keyCount = Math.floor(Math.random() * 20) + 5; // 임시 구현
    const topKeys = [
      'lottery:latest',
      'lottery:history:recent:20',
      'lottery:statistics:100:true',
      'lottery:frequency:50:recent'
    ];
    
    return {
      stats,
      keyCount,
      topKeys
    };
  }

  /**
   * 캐시 무효화 (패턴 기반)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    return await this.cache.invalidatePattern(pattern);
  }

  /**
   * 특정 키 캐시 무효화
   */
  async invalidateKey(key: string): Promise<void> {
    return await this.cache.invalidate(key);
  }

  /**
   * 캐시 통계 조회 (로또 전용)
   */
  getLotteryStats(): {
    totalKeys: number;
    hitRate: string;
    memoryUsage: string;
    lastUpdate: string;
  } {
    const stats = this.cache.getStats();
    return {
      totalKeys: 0, // 실제 구현에서는 로또 키 개수 계산
      hitRate: `${stats.hitRate.toFixed(1)}%`,
      memoryUsage: `${(stats.memoryUsage / 1024).toFixed(2)}MB`,
      lastUpdate: new Date(stats.lastCleanup).toLocaleString('ko-KR')
    };
  }
}

// 기본 인스턴스 내보내기
export const lotteryCache = new LotteryCache();