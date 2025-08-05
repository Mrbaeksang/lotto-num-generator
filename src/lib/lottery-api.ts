// DHLottery 공식 API 호출 라이브러리

export interface LotteryResult {
  round: number;
  date: string;
  numbers: [number, number, number, number, number, number];
  bonus: number;
}

/**
 * 날짜 기준으로 현재 로또 회차 계산
 * 1회차: 2002-12-07 (토요일)
 * 매주 토요일 추첨
 */
export function calculateCurrentRound(): number {
  const firstDraw = new Date('2002-12-07');
  const today = new Date();
  
  // 일주일 단위로 차이 계산
  const timeDiff = today.getTime() - firstDraw.getTime();
  const weeksDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
  
  return weeksDiff + 1;
}

/**
 * DHLottery POST API 호출
 * https://dhlottery.co.kr/gameResult.do?method=byWin
 */
export async function fetchLotteryResult(round: number): Promise<LotteryResult | null> {
  try {
    const formData = new FormData();
    formData.append('method', 'byWin');
    formData.append('drwNo', round.toString());
    formData.append('hdrwComb', '1');
    formData.append('dwrNoList', round.toString());

    const response = await fetch('https://dhlottery.co.kr/gameResult.do?method=byWin', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 응답 데이터 검증 및 변환
    if (data.returnValue === 'success') {
      return {
        round: data.drwNo,
        date: data.drwNoDate,
        numbers: [
          data.drwtNo1,
          data.drwtNo2,
          data.drwtNo3,
          data.drwtNo4,
          data.drwtNo5,
          data.drwtNo6
        ] as [number, number, number, number, number, number],
        bonus: data.bnusNo
      };
    }

    return null;
  } catch (error) {
    console.error(`로또 ${round}회차 조회 실패:`, error);
    return null;
  }
}

/**
 * 최근 N회차 데이터 가져오기
 */
export async function fetchRecentResults(count: number): Promise<LotteryResult[]> {
  const currentRound = calculateCurrentRound();
  const results: LotteryResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const round = currentRound - i;
    if (round < 1) break;
    
    const result = await fetchLotteryResult(round);
    if (result) {
      results.push(result);
    }
    
    // API 부하 방지를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}