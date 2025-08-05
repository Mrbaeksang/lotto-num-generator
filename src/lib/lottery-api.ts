// DHLottery 공식 API 호출 라이브러리

export interface LotteryResult {
  round: number;
  date: string;
  numbers: [number, number, number, number, number, number];
  bonus: number;
  prize?: {
    first?: number;
    firstWinners?: number;
    second?: number;
    secondWinners?: number;
  };
}

/**
 * 날짜 기준으로 현재 로또 회차 계산
 * 1회차: 2002-12-07 (토요일)
 * 매주 토요일 추첨
 */
export function calculateCurrentRound(): number {
  // 현재 최신 회차를 기준으로 계산 (2025-08-05 기준 1183회차)
  // 2025-08-02이 1183회차였으므로 오늘(2025-08-05)은 1183회차
  const today = new Date();
  const aug2_2025 = new Date('2025-08-02'); // 1183회차 추첨일
  
  // 토요일 기준으로 계산
  const daysDiff = Math.floor((today.getTime() - aug2_2025.getTime()) / (1000 * 60 * 60 * 24));
  const weeksPassed = Math.floor(daysDiff / 7);
  
  return 1183 + weeksPassed;
}

/**
 * DHLottery HTML 페이지 파싱
 * https://dhlottery.co.kr/gameResult.do?method=byWin
 */
export async function fetchLotteryResult(round: number): Promise<LotteryResult | null> {
  try {
    const formData = new URLSearchParams();
    formData.append('method', 'byWin');
    formData.append('drwNo', round.toString());
    formData.append('hdrwComb', '1');
    formData.append('dwrNoList', round.toString());

    const response = await fetch('https://dhlottery.co.kr/gameResult.do?method=byWin', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Referer': 'https://dhlottery.co.kr/gameResult.do?method=byWin',
        'Origin': 'https://dhlottery.co.kr',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // HTML에서 당첨번호 파싱
    const result = parseHtmlResponse(html);
    return result;

  } catch (error) {
    console.error(`로또 ${round}회차 조회 실패:`, error);
    return null;
  }
}

/**
 * HTML 응답에서 당첨번호 파싱
 */
function parseHtmlResponse(html: string): LotteryResult | null {
  try {    
    // meta description에서 로또 정보 추출 (EUC-KR 인코딩 문제 회피)
    // 패턴: 회차 번호는 정확히 4자리로 가정 (1100번대), 당첨번호는 쉼표로 구분된 6개 숫자
    // "���ູ�� 1168ȸ ��÷��ȣ 9,21,24,30,33,37+29. 1�� ��..."
    const metaMatch = html.match(/content="[^"]*(\d{4})[^"]*(\d{1,2}(?:,\d{1,2}){5})\+(\d{1,2})[^"]*"/);
    
    if (!metaMatch) {
      console.log('meta description에서 로또 정보를 찾을 수 없음');
      console.log('HTML 샘플:', html.substring(0, 500));
      return null;
    }

    const actualRound = parseInt(metaMatch[1]);
    const numbersString = metaMatch[2]; // "14,23,25,27,29,42"
    const bonusNumber = parseInt(metaMatch[3]);

    console.log(`파싱 성공 - 회차: ${actualRound}, 번호: ${numbersString}, 보너스: ${bonusNumber}`);

    // 당첨번호 배열로 변환
    const winningNumbers = numbersString.split(',').map(n => parseInt(n.trim())) as [number, number, number, number, number, number];

    // 날짜는 현재 계산 (토요일 기준)
    const date = calculateDrawDate(actualRound);

    return {
      round: actualRound,
      date,
      numbers: winningNumbers,
      bonus: bonusNumber
    };

  } catch (error) {
    console.error('HTML 파싱 오류:', error);
    return null;
  }
}

/**
 * 회차를 기반으로 추첨 날짜 계산
 */
function calculateDrawDate(round: number): string {
  const firstDraw = new Date('2002-12-07'); // 1회차 날짜
  const drawDate = new Date(firstDraw);
  drawDate.setDate(firstDraw.getDate() + (round - 1) * 7); // 매주 토요일
  
  return drawDate.toISOString().split('T')[0]; // YYYY-MM-DD 형태
}

/**
 * 최근 N회차 데이터 가져오기
 */
export async function fetchRecentResults(count: number): Promise<LotteryResult[]> {
  const currentRound = calculateCurrentRound();
  console.log(`🎯 계산된 현재 회차: ${currentRound}`);
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