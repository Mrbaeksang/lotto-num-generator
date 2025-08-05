import { NextRequest, NextResponse } from 'next/server';
import { DHLotteryScraper } from '@/lib/scraper/dhlottery-scraper';
import { LotteryDataValidator } from '@/lib/scraper/data-validator';
import { retryAsync } from '@/lib/scraper/retry-logic';
import { lotteryCache } from '@/lib/cache/lottery-cache';
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

    // 1단계: 캐시에서 조회
    const cachedResults = await lotteryCache.getHistory(count, startRound || undefined, endRound || undefined);
    if (cachedResults) {
      console.log(`🚀 캐시에서 로또 이력 반환: ${cachedResults.length}개 회차`);
      
      // 캐시된 데이터로 응답 생성
      const freshnessCheck = LotteryDataValidator.checkDataFreshness(cachedResults);
      const completenessCheck = LotteryDataValidator.checkDataCompleteness(cachedResults);

      const response: HistoryApiResponse = {
        success: true,
        data: cachedResults,
        meta: {
          analyzedRounds: cachedResults.length,
          dateRange: cachedResults.length > 0 ? {
            from: cachedResults[cachedResults.length - 1].date,
            to: cachedResults[0].date
          } : undefined,
          qualityCheck: {
            dataFreshness: freshnessCheck.isFresh ? 'fresh' : 'stale',
            completeness: completenessCheck.isComplete ? 100 : Math.round((1 - completenessCheck.missingRounds.length / completenessCheck.totalRounds) * 100)
          }
        },
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    // 2단계: 캐시 미스 시 스크래핑
    console.log('💾 캐시 미스 - 새로운 이력 데이터 스크래핑 시작');

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

    // 3단계: 데이터 검증, 정리 및 캐시 저장
    const validResults = LotteryDataValidator.validateAndCleanResults(results);
    
    // 검증된 데이터를 캐시에 저장
    await lotteryCache.setHistory(validResults, count, startRound || undefined, endRound || undefined);
    
    // 데이터 신선도 및 완전성 체크
    const freshnessCheck = LotteryDataValidator.checkDataFreshness(validResults);
    const completenessCheck = LotteryDataValidator.checkDataCompleteness(validResults);

    console.log(`✅ 로또 이력 조회 및 캐시 저장 성공: ${validResults.length}개 회차`);

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