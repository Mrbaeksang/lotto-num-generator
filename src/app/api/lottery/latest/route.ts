import { NextResponse } from 'next/server';
import { DHLotteryScraper } from '@/lib/scraper/dhlottery-scraper';
import { LotteryDataValidator } from '@/lib/scraper/data-validator';
import { retryAsync } from '@/lib/scraper/retry-logic';
import { lotteryCache } from '@/lib/cache/lottery-cache';
import type { LatestApiResponse } from '@/types/lottery';

/**
 * GET /api/lottery/latest
 * 최신 로또 당첨번호 조회
 */
export async function GET() {
  try {
    console.log('🎯 최신 로또 번호 API 요청 시작');

    // 1단계: 캐시에서 조회
    const cachedResult = await lotteryCache.getLatest();
    if (cachedResult) {
      console.log(`🚀 캐시에서 최신 로또 번호 반환: ${cachedResult.round}회차`);
      
      const response: LatestApiResponse = {
        success: true,
        data: cachedResult,
        meta: {
          validationPassed: true,
          dataFreshness: Date.now() - new Date(cachedResult.date).getTime() < 7 * 24 * 60 * 60 * 1000 ? 'fresh' : 'stale'
        },
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    // 2단계: 캐시 미스 시 스크래핑
    console.log('💾 캐시 미스 - 새로운 데이터 스크래핑 시작');
    
    const result = await retryAsync(
      async () => {
        const scraper = new DHLotteryScraper();
        try {
          await scraper.initialize();
          const latestDraw = await scraper.getLatestDraw();
          
          // 데이터 검증
          if (!LotteryDataValidator.validateLotteryResult(latestDraw)) {
            throw new Error('스크래핑된 데이터가 유효하지 않습니다');
          }
          
          return latestDraw;
        } finally {
          await scraper.cleanup();
        }
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        retryableErrors: ['timeout', 'network', 'navigation']
      },
      'latest lottery data fetch'
    );

    // 3단계: 새 데이터를 캐시에 저장
    await lotteryCache.setLatest(result);
    console.log(`✅ 최신 로또 번호 조회 및 캐시 저장 성공: ${result.round}회차`);

    const response: LatestApiResponse = {
      success: true,
      data: result,
      meta: {
        validationPassed: true,
        dataFreshness: Date.now() - new Date(result.date).getTime() < 7 * 24 * 60 * 60 * 1000 ? 'fresh' : 'stale'
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 최신 로또 번호 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '최신 로또 번호를 가져오는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}