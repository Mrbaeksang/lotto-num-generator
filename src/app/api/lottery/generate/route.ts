import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentResults } from '@/lib/lottery-api';
import { 
  generateHot,
  generateCold,
  generateTrend,
  generateBalanced,
  generatePersonal,
  generateWeekday,
  generateSeasonal,
  generateContrarian
} from '@/lib/generators';

/**
 * POST /api/lottery/generate
 * 8가지 심리적으로 매력적인 방식으로 로또 번호 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lunarDay, lunarMonth, analysisCount = 20 } = body;
    
    console.log(`🎲 로또 번호 생성 요청: 음력 ${lunarMonth}월 ${lunarDay}일, 분석 ${analysisCount}회차`);

    // 최근 데이터 가져오기 (통계 분석용)
  
    const recentResults = await fetchRecentResults(analysisCount);
    
    // 8가지 심리적으로 매력적인 방식으로 번호 생성 (모두 실제 데이터 기반)
    const results = {
      hot: generateHot(recentResults),
      cold: generateCold(recentResults),
      trend: generateTrend(recentResults),
      balanced: generateBalanced(recentResults),
      personal: generatePersonal(lunarDay || 1, lunarMonth || 1, recentResults),
      weekday: generateWeekday(recentResults),
      seasonal: generateSeasonal(recentResults),
      contrarian: generateContrarian(recentResults)
    };

    console.log('✅ 8가지 방식 로또 번호 생성 완료');
    
    return NextResponse.json({
      success: true,
      data: {
        results,
        meta: {
          lunarInfo: {
            day: lunarDay,
            month: lunarMonth
          },
          analysisBase: {
            roundsAnalyzed: recentResults.length,
            dateRange: {
              from: recentResults[recentResults.length - 1]?.date,
              to: recentResults[0]?.date
            }
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 로또 번호 생성 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로또 번호를 생성하는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}