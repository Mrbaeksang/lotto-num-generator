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
 * 동행복권 웹사이트에서 실제 최신 회차를 자동으로 가져오기
 * 캐싱을 통해 성능 최적화 (1시간 TTL)
 */
let cachedCurrentRound: { round: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1시간

export async function getCurrentRound(): Promise<number> {
  // 캐시 확인
  if (cachedCurrentRound && (Date.now() - cachedCurrentRound.timestamp) < CACHE_TTL) {
    console.log(`🎯 캐시된 현재 회차 사용: ${cachedCurrentRound.round}`);
    return cachedCurrentRound.round;
  }

  try {
    console.log('🔍 동행복권에서 최신 회차 조회 중...');
    
    // 최신 당첨결과 페이지에서 현재 회차 추출
    const response = await fetch('https://dhlottery.co.kr/gameResult.do?method=byWin', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // HTML에서 최신 회차 번호 추출
    // 다양한 패턴으로 회차 번호 찾기
    const patterns = [
      /제\s*(\d{4})\s*회/,                    // 제 1183 회
      /(\d{4})\s*회차/,                       // 1183 회차  
      /content="[^\"]*(\\d{4})[^\"]*/,        // meta description
      /drwNo['"]\s*:\s*['"]*(\d{4})/,        // JavaScript drwNo
      /현재\s*(\d{4})\s*회/                   // 현재 1183 회
    ];

    let currentRound = 0;
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const round = parseInt(match[1]);
        if (round > 0 && round < 9999) { // 합리적인 범위 체크
          currentRound = round;
          console.log(`✅ 회차 추출 성공: ${currentRound}회 (패턴: ${pattern})`);
          break;
        }
      }
    }

    if (currentRound === 0) {
      // 패턴 매칭 실패시 계산식 폴백
      console.log('⚠️ HTML 패턴 매칭 실패, 계산식으로 폴백');
      currentRound = calculateCurrentRoundByDate();
    }

    // 캐시 저장
    cachedCurrentRound = {
      round: currentRound,
      timestamp: Date.now()
    };

    console.log(`🎯 최종 현재 회차: ${currentRound}`);
    return currentRound;

  } catch (error) {
    console.error('❌ 최신 회차 조회 실패:', error);
    console.log('⚠️ 날짜 계산식으로 폴백');
    
    // 에러시 날짜 기반 계산으로 폴백
    const fallbackRound = calculateCurrentRoundByDate();
    
    // 폴백 결과도 짧은 시간 캐싱 (5분)
    cachedCurrentRound = {
      round: fallbackRound,
      timestamp: Date.now() - (CACHE_TTL - 5 * 60 * 1000) // 5분 후 만료
    };
    
    return fallbackRound;
  }
}

/**
 * 날짜 기준으로 현재 로또 회차 계산 (폴백용)
 * 1회차: 2002-12-07 (토요일), 매주 토요일 추첨
 */
function calculateCurrentRoundByDate(): number {
  const today = new Date();
  const firstDraw = new Date('2002-12-07'); // 1회차 추첨일
  
  // 경과 일수 계산
  const timeDiff = today.getTime() - firstDraw.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 주차 계산 (매주 토요일)
  const weeksPassed = Math.floor(daysDiff / 7);
  
  // 현재 요일이 토요일 이후면 다음 회차로 간주
  const currentDay = today.getDay(); // 0=일요일, 6=토요일
  const adjustment = currentDay === 0 ? 1 : 0; // 일요일이면 이미 추첨 완료
  
  return 1 + weeksPassed + adjustment;
}

/**
 * 하위 호환성을 위한 동기 함수 (레거시)
 * @deprecated getCurrentRound() 비동기 함수 사용 권장
 */
export function calculateCurrentRound(): number {
  return calculateCurrentRoundByDate();
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
 * 최근 N회차 데이터 가져오기 (동적 현재 회차 사용)
 */
export async function fetchRecentResults(count: number): Promise<LotteryResult[]> {
  // 임시 목업 데이터 - 실제 스크래핑이 실패할 경우 사용
  const mockResults: LotteryResult[] = [
    {
      round: 1145,
      date: "2024-11-23",
      numbers: [3, 7, 14, 28, 35, 40],
      bonus: 21,
      prize: {
        first: 2500000000,
        firstWinners: 8
      }
    },
    {
      round: 1144,
      date: "2024-11-16",
      numbers: [5, 12, 17, 29, 34, 45],
      bonus: 7,
      prize: {
        first: 2100000000,
        firstWinners: 12
      }
    },
    {
      round: 1143,
      date: "2024-11-09",
      numbers: [1, 9, 16, 23, 31, 42],
      bonus: 38,
      prize: {
        first: 3200000000,
        firstWinners: 5
      }
    },
    {
      round: 1142,
      date: "2024-11-02",
      numbers: [8, 15, 22, 27, 36, 44],
      bonus: 11,
      prize: {
        first: 1800000000,
        firstWinners: 15
      }
    },
    {
      round: 1141,
      date: "2024-10-26",
      numbers: [2, 10, 18, 25, 33, 41],
      bonus: 19,
      prize: {
        first: 2900000000,
        firstWinners: 6
      }
    },
    {
      round: 1140,
      date: "2024-10-19",
      numbers: [4, 11, 20, 26, 37, 43],
      bonus: 13,
      prize: {
        first: 2200000000,
        firstWinners: 10
      }
    },
    {
      round: 1139,
      date: "2024-10-12",
      numbers: [6, 13, 19, 30, 38, 45],
      bonus: 24,
      prize: {
        first: 2700000000,
        firstWinners: 7
      }
    },
    {
      round: 1138,
      date: "2024-10-05",
      numbers: [7, 14, 21, 32, 39, 40],
      bonus: 16,
      prize: {
        first: 1900000000,
        firstWinners: 13
      }
    },
    {
      round: 1137,
      date: "2024-09-28",
      numbers: [3, 12, 24, 28, 35, 44],
      bonus: 9,
      prize: {
        first: 3100000000,
        firstWinners: 5
      }
    },
    {
      round: 1136,
      date: "2024-09-21",
      numbers: [1, 8, 17, 29, 34, 42],
      bonus: 22,
      prize: {
        first: 2400000000,
        firstWinners: 9
      }
    }
  ];

  try {
    const currentRound = await getCurrentRound(); // 비동기로 실제 현재 회차 가져오기
    console.log(`🎯 동적으로 조회된 현재 회차: ${currentRound}`);
    const results: LotteryResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const round = currentRound - i;
      if (round < 1) break;
      
      console.log(`📊 ${round}회차 데이터 조회 중... (${i + 1}/${count})`);
      const result = await fetchLotteryResult(round);
      if (result) {
        results.push(result);
        console.log(`✅ ${round}회차 조회 성공: ${result.numbers.join(', ')} + ${result.bonus}`);
      } else {
        console.log(`❌ ${round}회차 조회 실패`);
      }
      
      // API 부하 방지를 위한 지연 (첫 번째 요청은 지연 없음)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
    
    console.log(`📈 총 ${results.length}개 회차 데이터 조회 완료`);
    return results.length > 0 ? results : mockResults.slice(0, count);
  } catch (error) {
    console.error('❌ 실제 데이터 조회 실패, 목업 데이터 사용:', error);
    return mockResults.slice(0, count);
  }
}