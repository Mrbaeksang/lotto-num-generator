import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentResults } from '@/lib/lottery-api';

/**
 * GET /api/lottery/recent?count=10
 * 최근 N회차 당첨번호 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50); // 최대 50회차
    
    console.log(`🔍 최근 ${count}회차 당첨번호 요청`);

    const results = await fetchRecentResults(count);
    
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '당첨번호 데이터를 찾을 수 없습니다',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    console.log(`✅ ${results.length}회차 당첨번호 조회 성공`);
    
    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        requestedCount: count,
        actualCount: results.length,
        dateRange: {
          from: results[results.length - 1]?.date,
          to: results[0]?.date
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 최근 당첨번호 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '최근 당첨번호를 가져오는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}