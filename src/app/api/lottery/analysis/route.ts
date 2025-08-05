import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentResults } from '@/lib/lottery-api';
import {
  analyzeConsecutiveNumbers,
  analyzeLastDigits,
  analyzeNumberGaps,
  analyzeSumRanges,
  analyzeRangeDistribution,
  analyzeBonusPatterns,
  analyzeWeekdayPatterns,
  analyzeSeasonalPreferences,
  analyzeMonthlyTrends,
  analyzeJackpotCombinations,
  analyzeMissingPeriods,
  analyzeConsecutiveAppearances,
  analyzeTrendDirection,
  analyzeOddEvenBalance,
  analyzeColorDistribution,
  type AnalysisResult
} from '@/lib/lottery-analysis';

/**
 * POST /api/lottery/analysis
 * 로또 매니아를 위한 15가지 심화 분석 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisCount = 50, analysisTypes = [] } = body;
    
    console.log(`🔍 로또 심화 분석 요청: ${analysisCount}회차, ${analysisTypes.length || 15}가지 분석`);

    // 분석용 데이터 가져오기
    const recentResults = await fetchRecentResults(analysisCount);
    
    if (recentResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: '분석할 데이터가 없습니다',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 15가지 분석 함수 매핑
    const analysisMap = {
      consecutive: () => analyzeConsecutiveNumbers(recentResults),
      lastDigits: () => analyzeLastDigits(recentResults),
      gaps: () => analyzeNumberGaps(recentResults),
      sumRanges: () => analyzeSumRanges(recentResults),
      rangeDistribution: () => analyzeRangeDistribution(recentResults),
      bonusPatterns: () => analyzeBonusPatterns(recentResults),
      weekdayPatterns: () => analyzeWeekdayPatterns(recentResults),
      seasonalPreferences: () => analyzeSeasonalPreferences(recentResults),
      monthlyTrends: () => analyzeMonthlyTrends(recentResults),
      jackpotCombinations: () => analyzeJackpotCombinations(recentResults),
      missingPeriods: () => analyzeMissingPeriods(recentResults),
      consecutiveAppearances: () => analyzeConsecutiveAppearances(recentResults),
      trendDirection: () => analyzeTrendDirection(recentResults),
      oddEvenBalance: () => analyzeOddEvenBalance(recentResults),
      colorDistribution: () => analyzeColorDistribution(recentResults)
    };

    // 요청된 분석 타입들만 실행 (빈 배열이면 전체 실행)
    const targetAnalyses = analysisTypes.length > 0 ? analysisTypes : Object.keys(analysisMap);
    const analysisResults: Record<string, AnalysisResult> = {};
    
    targetAnalyses.forEach((analysisType: string) => {
      if (analysisMap[analysisType as keyof typeof analysisMap]) {
        const startTime = Date.now();
        analysisResults[analysisType] = analysisMap[analysisType as keyof typeof analysisMap]();
        const duration = Date.now() - startTime;
        console.log(`✅ ${analysisType} 분석 완료 (${duration}ms)`);
      } else {
        console.warn(`⚠️ 알 수 없는 분석 타입: ${analysisType}`);
      }
    });

    console.log(`🎯 총 ${Object.keys(analysisResults).length}가지 분석 완료`);
    
    return NextResponse.json({
      success: true,
      data: {
        analyses: analysisResults,
        meta: {
          roundsAnalyzed: recentResults.length,
          analysisTypes: Object.keys(analysisResults),
          dateRange: {
            from: recentResults[recentResults.length - 1]?.date,
            to: recentResults[0]?.date
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 로또 분석 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로또 분석을 수행하는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lottery/analysis
 * 분석 타입 목록과 설명 조회
 */
export async function GET() {
  try {
    const analysisInfo = {
      consecutive: {
        name: '📊 연속번호 분석',
        description: '연속된 번호들의 출현 패턴 분석',
        category: 'pattern'
      },
      lastDigits: {
        name: '🔢 끝자리 분석',
        description: '각 끝자리(0-9)의 출현 빈도 분석',
        category: 'frequency'
      },
      gaps: {
        name: '📏 번호 간격 분석',
        description: '당첨번호들 사이의 간격 패턴 분석',
        category: 'pattern'
      },
      sumRanges: {
        name: '🎯 합계 범위 분석',
        description: '당첨번호 6개의 합계 분포 분석',
        category: 'statistical'
      },
      rangeDistribution: {
        name: '📍 구간 편중 분석',
        description: '1-15, 16-30, 31-45 구간별 편중도 분석',
        category: 'distribution'
      },
      bonusPatterns: {
        name: '🎁 보너스 번호 패턴',
        description: '보너스 번호의 출현 패턴과 특성 분석',
        category: 'bonus'
      },
      weekdayPatterns: {
        name: '📅 요일별 당첨 패턴',
        description: '추첨일 기준 당첨 패턴 분석',
        category: 'temporal'
      },
      seasonalPreferences: {
        name: '🌳 계절별 번호 선호도',
        description: '계절별 번호 출현 선호도 분석',
        category: 'temporal'
      },
      monthlyTrends: {
        name: '📊 월별 당첨 트렌드',
        description: '월별 당첨 번호 트렌드와 패턴 분석',
        category: 'temporal'
      },
      jackpotCombinations: {
        name: '💎 대박 조합 분석',
        description: '고액 당첨 회차의 번호 조합 패턴 분석',
        category: 'premium'
      },
      missingPeriods: {
        name: '⏰ 미출현 기간 분석',
        description: '오랫동안 안 나온 번호들의 패턴 분석',
        category: 'frequency'
      },
      consecutiveAppearances: {
        name: '🔄 연속 출현 분석',
        description: '연달아 나오는 번호들의 패턴 분석',
        category: 'pattern'
      },
      trendDirection: {
        name: '📈 상승/하락 트렌드',
        description: '최근 번호들의 출현 트렌드 방향 분석',
        category: 'trend'
      },
      oddEvenBalance: {
        name: '⚖️ 홀짝 균형도 분석',
        description: '홀수와 짝수의 균형도 패턴 분석',
        category: 'balance'
      },
      colorDistribution: {
        name: '🎨 색깔별 번호 분석',
        description: '로또공 색상별 번호 분포 분석',
        category: 'visual'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        availableAnalyses: analysisInfo,
        categories: {
          pattern: '패턴 분석',
          frequency: '빈도 분석', 
          statistical: '통계 분석',
          distribution: '분포 분석',
          bonus: '보너스 분석',
          temporal: '시간 분석',
          premium: '프리미엄 분석',
          trend: '트렌드 분석',
          balance: '균형 분석',
          visual: '시각적 분석'
        },
        totalCount: Object.keys(analysisInfo).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 분석 정보 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '분석 정보를 조회하는데 실패했습니다',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}