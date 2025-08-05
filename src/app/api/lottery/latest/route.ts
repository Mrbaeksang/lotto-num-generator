import { NextResponse } from 'next/server';
import { fetchLotteryResult, calculateCurrentRound } from '@/lib/lottery-api';

/**
 * GET /api/lottery/latest
 * 최신 로또 당첨번호 조회
 */
export async function GET() {
  try {
    console.log('🔍 최신 로또 당첨번호 요청');

    const currentRound = calculateCurrentRound();
    
    // 현재 회차부터 역순으로 최대 3회차까지 시도
    for (let i = 0; i < 3; i++) {
      const round = currentRound - i;
      const result = await fetchLotteryResult(round);
      
      if (result) {
        console.log(`✅ ${round}회차 당첨번호 조회 성공`);
        
        return NextResponse.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: '최신 당첨번호를 찾을 수 없습니다',
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('❌ 최신 로또 당첨번호 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '최신 당첨번호를 가져오는데 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}