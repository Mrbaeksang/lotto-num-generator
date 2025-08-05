import { NextRequest, NextResponse } from 'next/server';
import { DHLotteryScraper } from '@/lib/scraper/dhlottery-scraper';
import { LotteryDataValidator } from '@/lib/scraper/data-validator';
import { retryAsync } from '@/lib/scraper/retry-logic';
import type { HistoryApiResponse } from '@/types/lottery';

/**
 * GET /api/lottery/history?count=20&start=1000&end=1020
 * 로또 당첨번호 이력 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const count = parseInt(searchParams.get('count') || '20', 10);
    const startRound = searchParams.get('start') ? parseInt(searchParams.get('start')!, 10) : null;
    const endRound = searchParams.get('end') ? parseInt(searchParams.get('end')!, 10) : null;

    console.log(`🔍 로또 이력 조회 요청: count=${count}, start=${startRound}, end=${endRound}`);

    // 파라미터 검증
    if (count < 1 || count > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'count는 1-100 사이의 값이어야 합니다',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (startRound && endRound) {
      if (startRound > endRound) {
        return NextResponse.json(
          {
            success: false,
            error: 'start 회차는 end 회차보다 작거나 같아야 합니다',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      if (endRound - startRound > 100) {
        return NextResponse.json(
          {
            success: false,
            error: '한 번에 최대 100회차까지만 조회할 수 있습니다',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
    }

    const results = await retryAsync(
      async () => {
        const scraper = new DHLotteryScraper();
        try {
          await scraper.initialize();
          
          let drawHistory;
          if (startRound && endRound) {
            // 특정 범위 조회
            drawHistory = await scraper.getDrawHistory(startRound, endRound);
          } else {
            // 최근 N회차 조회
            drawHistory = await scraper.getRecentDraws(count);
          }
          
          return drawHistory;
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
      'lottery history fetch'
    );

    // 데이터 검증 및 정리
    const validResults = LotteryDataValidator.validateAndCleanResults(results);
    
    // 데이터 신선도 및 완전성 체크
    const freshnessCheck = LotteryDataValidator.checkDataFreshness(validResults);
    const completenessCheck = LotteryDataValidator.checkDataCompleteness(validResults);

    console.log(`✅ 로또 이력 조회 성공: ${validResults.length}개 회차`);

    const response: HistoryApiResponse = {
      success: true,
      data: validResults,
      meta: {
        analyzedRounds: validResults.length,
        dateRange: validResults.length > 0 ? {
          from: validResults[validResults.length - 1].date,
          to: validResults[0].date
        } : undefined,
        qualityCheck: {
          dataFreshness: freshnessCheck.isFresh ? 'fresh' : 'stale',
          completeness: completenessCheck.isComplete ? 100 : Math.round((1 - completenessCheck.missingRounds.length / completenessCheck.totalRounds) * 100)
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 로또 이력 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로또 이력을 가져오는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}