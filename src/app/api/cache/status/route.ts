import { NextResponse } from 'next/server';
import { lotteryCache } from '@/lib/cache/lottery-cache';

/**
 * GET /api/cache/status
 * 캐시 시스템 상태 조회
 */
export async function GET() {
  try {
    console.log('📊 캐시 상태 조회 요청');

    const cacheStatus = await lotteryCache.getStatus();
    const lotteryStats = lotteryCache.getLotteryStats();

    const response = {
      success: true,
      data: {
        system: cacheStatus.stats,
        lottery: {
          keyCount: cacheStatus.keyCount,
          topKeys: cacheStatus.topKeys,
          stats: lotteryStats
        },
        performance: {
          hitRate: `${Number(cacheStatus.stats.hitRate || 0).toFixed(1)}%`,
          totalRequests: Number(cacheStatus.stats.totalRequests || 0),
          memoryUsage: `${(Number(cacheStatus.stats.memoryUsage || 0) / 1024).toFixed(2)}MB`,
          lastCleanup: new Date(Number(cacheStatus.stats.lastCleanup || Date.now())).toLocaleString('ko-KR')
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 캐시 상태 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '캐시 상태를 조회하는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache/status
 * 캐시 무효화 (특정 패턴)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');
    const key = searchParams.get('key');

    if (pattern) {
      await lotteryCache.invalidatePattern(pattern);
      console.log(`🗑️ 패턴 캐시 무효화: ${pattern}`);
      
      return NextResponse.json({
        success: true,
        message: `패턴 '${pattern}'에 해당하는 캐시를 무효화했습니다`,
        timestamp: new Date().toISOString()
      });
    }

    if (key) {
      await lotteryCache.invalidateKey(key);
      console.log(`🗑️ 특정 캐시 무효화: ${key}`);
      
      return NextResponse.json({
        success: true,
        message: `키 '${key}'에 해당하는 캐시를 무효화했습니다`,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'pattern 또는 key 파라미터가 필요합니다',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ 캐시 무효화 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '캐시 무효화에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}