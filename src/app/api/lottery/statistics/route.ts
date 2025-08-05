import { NextRequest, NextResponse } from 'next/server';
import { DHLotteryScraper } from '@/lib/scraper/dhlottery-scraper';
import { LotteryDataValidator } from '@/lib/scraper/data-validator';
import { retryAsync } from '@/lib/scraper/retry-logic';
import { lotteryCache } from '@/lib/cache/lottery-cache';
import type { LotteryResult, StatisticsApiResponse, NumberStatistics, StatisticsAnalysis } from '@/types/lottery';

// 타입은 이제 lottery.ts에서 가져옴

/**
 * GET /api/lottery/statistics?rounds=100&analysis=true
 * 로또 번호 통계 분석
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const rounds = parseInt(searchParams.get('rounds') || '100', 10);
    const includeAnalysis = searchParams.get('analysis') === 'true';
    
    console.log(`📊 로또 통계 분석 요청: rounds=${rounds}, analysis=${includeAnalysis}`);

    // 파라미터 검증
    if (rounds < 10 || rounds > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'rounds는 10-200 사이의 값이어야 합니다',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 1단계: 캐시에서 조회
    const cachedStats = await lotteryCache.getStatistics(rounds, includeAnalysis);
    if (cachedStats) {
      console.log(`🚀 캐시에서 통계 분석 반환: ${rounds}회차, analysis=${includeAnalysis}`);
      
      const response: StatisticsApiResponse = {
        success: true,
        data: {
          ...cachedStats,
          meta: {
            analyzedRounds: rounds,
            dateRange: {
              from: '',
              to: ''
            },
            totalNumbers: 45
          }
        },
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    // 2단계: 캐시 미스 시 스크래핑
    console.log('💾 캐시 미스 - 새로운 통계 분석 시작');

    const results = await retryAsync(
      async () => {
        const scraper = new DHLotteryScraper();
        try {
          await scraper.initialize();
          return await scraper.getRecentDraws(rounds);
        } finally {
          await scraper.cleanup();
        }
      },
      {
        maxAttempts: 2,
        baseDelay: 2000,
        maxDelay: 10000,
        backoffMultiplier: 2.5,
        retryableErrors: ['timeout', 'network', 'navigation']
      },
      'lottery statistics fetch'
    );

    // 데이터 검증
    const validResults = LotteryDataValidator.validateAndCleanResults(results);
    
    if (validResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '유효한 로또 데이터를 찾을 수 없습니다',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // 3단계: 번호별 통계 계산
    const numberStats = calculateNumberStatistics(validResults);
    
    // 추가 분석 (옵션)
    let analysis: StatisticsAnalysis | null = null;
    if (includeAnalysis) {
      analysis = performStatisticalAnalysis(numberStats, validResults);
    }

    // 계산된 통계를 캐시에 저장
    const statsData = {
      numberStatistics: numberStats,
      analysis: analysis
    };
    await lotteryCache.setStatistics(statsData, rounds, includeAnalysis);

    console.log(`✅ 로또 통계 분석 및 캐시 저장 완료: ${validResults.length}회차 데이터 기반`);

    const response: StatisticsApiResponse = {
      success: true,
      data: {
        ...statsData,
        meta: {
          analyzedRounds: validResults.length,
          dateRange: {
            from: validResults[validResults.length - 1].date,
            to: validResults[0].date
          },
          totalNumbers: Object.keys(numberStats).length
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 로또 통계 분석 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로또 통계를 분석하는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * 번호별 상세 통계 계산
 */
function calculateNumberStatistics(results: LotteryResult[]): Record<number, NumberStatistics> {
  const stats: Record<number, NumberStatistics> = {};
  
  // 1-45 번호 초기화
  for (let i = 1; i <= 45; i++) {
    stats[i] = {
      number: i,
      frequency: 0,
      lastAppeared: '',
      lastRound: 0,
      averageGap: 0,
      trend: 'neutral',
      recentAppearances: []
    };
  }
  
  // 결과를 회차순으로 정렬 (오래된 것부터)
  const sortedResults = [...results].sort((a, b) => a.round - b.round);
  
  // 각 번호의 출현 기록
  sortedResults.forEach((result) => {
    result.numbers.forEach(number => {
      const stat = stats[number];
      stat.frequency++;
      stat.lastAppeared = result.date;
      stat.lastRound = result.round;
      stat.recentAppearances.push({
        round: result.round,
        date: result.date
      });
      
      // 최근 10회 출현만 유지
      if (stat.recentAppearances.length > 10) {
        stat.recentAppearances = stat.recentAppearances.slice(-10);
      }
    });
  });
  
  // 평균 간격 및 트렌드 계산
  Object.values(stats).forEach(stat => {
    if (stat.frequency > 1) {
      const gaps: number[] = [];
      const appearances = stat.recentAppearances;
      
      for (let i = 1; i < appearances.length; i++) {
        gaps.push(appearances[i].round - appearances[i-1].round);
      }
      
      if (gaps.length > 0) {
        stat.averageGap = Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length * 100) / 100;
      }
      
      // 트렌드 분석 (최근 출현 패턴 기반)
      if (appearances.length >= 3) {
        const recent = appearances.slice(-3);
        const recentGaps = [];
        for (let i = 1; i < recent.length; i++) {
          recentGaps.push(recent[i].round - recent[i-1].round);
        }
        
        const avgRecentGap = recentGaps.reduce((sum, gap) => sum + gap, 0) / recentGaps.length;
        
        if (avgRecentGap < stat.averageGap * 0.7) {
          stat.trend = 'hot';
        } else if (avgRecentGap > stat.averageGap * 1.3) {
          stat.trend = 'cold';
        }
      }
    }
  });
  
  return stats;
}

/**
 * 통계 분석 수행
 */
function performStatisticalAnalysis(
  numberStats: Record<number, NumberStatistics>, 
  results: LotteryResult[]
): StatisticsAnalysis {
  const numbers = Object.values(numberStats);
  
  // 빈도순 정렬
  const byFrequency = [...numbers].sort((a, b) => b.frequency - a.frequency);
  
  // 트렌드별 분류
  const hotNumbers = numbers.filter(n => n.trend === 'hot').map(n => n.number);
  const coldNumbers = numbers.filter(n => n.trend === 'cold').map(n => n.number);
  
  // 최근 출현이 오래된 번호들 (오버듀)
  const latestRound = Math.max(...results.map(r => r.round));
  const overdue = numbers
    .filter(n => n.lastRound > 0 && latestRound - n.lastRound > 10)
    .sort((a, b) => (latestRound - b.lastRound) - (latestRound - a.lastRound))
    .slice(0, 10)
    .map(n => n.number);
  
  // 최근 트렌드 분석 (최근 20회차 기준)
  const recentResults = results.slice(0, 20);
  const recentFreq: Record<number, number> = {};
  
  // 최근 빈도 계산
  recentResults.forEach(result => {
    result.numbers.forEach(num => {
      recentFreq[num] = (recentFreq[num] || 0) + 1;
    });
  });
  
  // 전체 평균과 비교해서 상승/하락 트렌드 파악
  const rising: number[] = [];
  const falling: number[] = [];
  
  Object.entries(recentFreq).forEach(([numStr, recentCount]) => {
    const num = parseInt(numStr);
    const overallFreq = numberStats[num].frequency;
    const expectedRecent = (overallFreq / results.length) * 20;
    
    if (recentCount > expectedRecent * 1.2) {
      rising.push(num);
    } else if (recentCount < expectedRecent * 0.8) {
      falling.push(num);
    }
  });
  
  return {
    mostFrequent: byFrequency.slice(0, 10).map(n => n.number),
    leastFrequent: byFrequency.slice(-10).reverse().map(n => n.number),
    hotNumbers: hotNumbers.slice(0, 10),
    coldNumbers: coldNumbers.slice(0, 10),
    overdue: overdue,
    recentTrends: {
      rising: rising.slice(0, 10),
      falling: falling.slice(0, 10)
    }
  };
}