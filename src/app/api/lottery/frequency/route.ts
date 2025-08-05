import { NextRequest, NextResponse } from 'next/server';
import { DHLotteryScraper } from '@/lib/scraper/dhlottery-scraper';
import { LotteryDataValidator } from '@/lib/scraper/data-validator';
import { retryAsync } from '@/lib/scraper/retry-logic';
import { lotteryCache } from '@/lib/cache/lottery-cache';
import type { 
  LotteryResult, 
  FrequencyApiResponse, 
  FrequencyData, 
  FrequencyAnalysis, 
  ComparativeAnalysis, 
  TrendComparison 
} from '@/types/lottery';

/**
 * GET /api/lottery/frequency?rounds=50&type=recent
 * 로또 번호 빈도 분석
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const rounds = parseInt(searchParams.get('rounds') || '50', 10);
    const analysisType = searchParams.get('type') || 'recent'; // recent, overall, comparative
    
    console.log(`📈 로또 빈도 분석 요청: rounds=${rounds}, type=${analysisType}`);

    // 파라미터 검증
    if (rounds < 5 || rounds > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'rounds는 5-200 사이의 값이어야 합니다',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (!['recent', 'overall', 'comparative'].includes(analysisType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'type은 recent, overall, comparative 중 하나여야 합니다',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 1단계: 캐시에서 조회
    const cachedFrequency = await lotteryCache.getFrequency(rounds, analysisType);
    if (cachedFrequency) {
      console.log(`🚀 캐시에서 빈도 분석 반환: ${rounds}회차, type=${analysisType}`);
      
      const response: FrequencyApiResponse = {
        success: true,
        data: cachedFrequency,
        meta: {
          analyzedRounds: rounds,
          analysisType: analysisType
        },
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    // 2단계: 캐시 미스 시 스크래핑
    console.log('💾 캐시 미스 - 새로운 빈도 분석 시작');

    let results: LotteryResult[];
    
    if (analysisType === 'comparative') {
      // 비교 분석의 경우 더 많은 데이터 필요
      results = await fetchLotteryData(Math.max(rounds * 2, 100));
    } else {
      results = await fetchLotteryData(rounds);
    }

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

    // 3단계: 빈도 분석 수행
    let frequencyAnalysis;
    
    switch (analysisType) {
      case 'recent':
        frequencyAnalysis = analyzeRecentFrequency(validResults.slice(0, rounds));
        break;
      case 'overall':
        frequencyAnalysis = analyzeOverallFrequency(validResults);
        break;
      case 'comparative':
        frequencyAnalysis = analyzeComparativeFrequency(validResults, rounds);
        break;
      default:
        frequencyAnalysis = analyzeRecentFrequency(validResults.slice(0, rounds));
    }

    // 분석 결과를 캐시에 저장
    await lotteryCache.setFrequency(frequencyAnalysis, rounds, analysisType);

    console.log(`✅ 로또 빈도 분석 및 캐시 저장 완료: ${analysisType} 타입, ${validResults.length}회차 기반`);

    const response: FrequencyApiResponse = {
      success: true,
      data: frequencyAnalysis,
      meta: {
        analysisType,
        analyzedRounds: analysisType === 'comparative' ? rounds : validResults.length,
        totalAvailableRounds: validResults.length,
        dateRange: {
          from: validResults[validResults.length - 1].date,
          to: validResults[0].date
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 로또 빈도 분석 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로또 빈도 분석에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * 로또 데이터 가져오기 (재시도 로직 포함)
 */
async function fetchLotteryData(rounds: number): Promise<LotteryResult[]> {
  return await retryAsync(
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
      maxDelay: 8000,
      backoffMultiplier: 2,
      retryableErrors: ['timeout', 'network', 'navigation']
    },
    'lottery frequency data fetch'
  );
}

/**
 * 최근 빈도 분석
 */
function analyzeRecentFrequency(results: LotteryResult[]): FrequencyAnalysis {
  const frequency: Record<number, number> = {};
  const totalDraws = results.length;
  const totalNumbers = totalDraws * 6;

  // 빈도 계산
  results.forEach(result => {
    result.numbers.forEach(number => {
      frequency[number] = (frequency[number] || 0) + 1;
    });
  });

  // FrequencyData 배열 생성
  const frequencyData: FrequencyData[] = [];
  const now = new Date();

  for (let i = 1; i <= 45; i++) {
    const count = frequency[i] || 0;
    const percentage = Math.round((count / totalNumbers) * 10000) / 100; // 소수점 2자리
    
    // 마지막 출현일 찾기
    let lastAppeared = '';
    let daysSince = Infinity;
    
    for (const result of results) {
      if (result.numbers.includes(i)) {
        lastAppeared = result.date;
        const lastDate = new Date(result.date);
        daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        break;
      }
    }

    frequencyData.push({
      number: i,
      frequency: count,
      percentage,
      lastAppeared: lastAppeared || 'Never',
      daysSinceAppearance: daysSince === Infinity ? -1 : daysSince
    });
  }

  // 빈도순으로 정렬
  const sortedByFrequency = [...frequencyData].sort((a, b) => b.frequency - a.frequency);
  
  return {
    frequencyData: sortedByFrequency,
    mostFrequent: sortedByFrequency.slice(0, 10),
    leastFrequent: sortedByFrequency.slice(-10).reverse(),
    hotNumbers: sortedByFrequency.filter(item => item.percentage > 2.5).slice(0, 15),
    coldNumbers: sortedByFrequency.filter(item => item.daysSinceAppearance > 14).slice(0, 15),
    summary: {
      totalDraws,
      averageFrequency: Math.round(totalNumbers / 45 * 100) / 100,
      expectedPercentage: Math.round(10000 / 45) / 100
    }
  };
}

/**
 * 전체 빈도 분석
 */
function analyzeOverallFrequency(results: LotteryResult[]): FrequencyAnalysis {
  const recentData = analyzeRecentFrequency(results);
  
  // 전체 기간에 대한 추가 통계
  const frequencies = recentData.frequencyData.map(item => item.frequency);
  const mean = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
  const variance = frequencies.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / frequencies.length;
  const standardDeviation = Math.sqrt(variance);
  
  // 이상치 감지 (표준편차 기준)
  const outliers = recentData.frequencyData.filter(item => 
    Math.abs(item.frequency - mean) > standardDeviation * 2
  );

  return {
    ...recentData,
    statistics: {
      mean: Math.round(mean * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      outliers: outliers.map(item => ({
        number: item.number,
        frequency: item.frequency,
        deviation: Math.round((item.frequency - mean) * 100) / 100
      }))
    },
    distribution: {
      highFrequency: recentData.frequencyData.filter(item => item.frequency > mean + standardDeviation).length,
      normalFrequency: recentData.frequencyData.filter(item => 
        item.frequency >= mean - standardDeviation && item.frequency <= mean + standardDeviation
      ).length,
      lowFrequency: recentData.frequencyData.filter(item => item.frequency < mean - standardDeviation).length
    }
  };
}

/**
 * 비교 분석 (최근 vs 전체)
 */
function analyzeComparativeFrequency(allResults: LotteryResult[], recentRounds: number): FrequencyAnalysis | ComparativeAnalysis {
  const recentResults = allResults.slice(0, recentRounds);
  const olderResults = allResults.slice(recentRounds);
  
  if (olderResults.length < 10) {
    // 비교할 과거 데이터가 부족한 경우
    return analyzeRecentFrequency(recentResults);
  }

  const recentAnalysis = analyzeRecentFrequency(recentResults);
  const olderAnalysis = analyzeRecentFrequency(olderResults);

  // 번호별 트렌드 비교
  const trendComparison = recentAnalysis.frequencyData.map(recentItem => {
    const olderItem = olderAnalysis.frequencyData.find(item => item.number === recentItem.number);
    const olderPercentage = olderItem ? olderItem.percentage : 0;
    
    const trendValue = recentItem.percentage - olderPercentage;
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    
    if (trendValue > 0.5) {
      trend = 'rising';
    } else if (trendValue < -0.5) {
      trend = 'falling';
    }

    return {
      number: recentItem.number,
      recentFrequency: recentItem.frequency,
      recentPercentage: recentItem.percentage,
      olderPercentage,
      trendValue: Math.round(trendValue * 100) / 100,
      trend
    } as TrendComparison;
  });

  const risingNumbers = trendComparison.filter(item => item.trend === 'rising')
    .sort((a, b) => b.trendValue - a.trendValue);
  
  const fallingNumbers = trendComparison.filter(item => item.trend === 'falling')
    .sort((a, b) => a.trendValue - b.trendValue);

  return {
    recent: recentAnalysis,
    comparison: trendComparison,
    trends: {
      rising: risingNumbers.slice(0, 10),
      falling: fallingNumbers.slice(0, 10),
      stable: trendComparison.filter(item => item.trend === 'stable').length
    },
    periods: {
      recent: {
        rounds: recentRounds,
        dateRange: {
          from: recentResults[recentResults.length - 1].date,
          to: recentResults[0].date
        }
      },
      comparison: {
        rounds: olderResults.length,
        dateRange: {
          from: olderResults[olderResults.length - 1].date,
          to: olderResults[0].date
        }
      }
    }
  };
}