import { chromium, Browser, Page } from 'playwright';
import { LotteryResult } from '@/types/lottery';

export class DHLotteryScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly baseUrl = 'https://dhlottery.co.kr';

  /**
   * 브라우저 초기화
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // 일반적인 브라우저처럼 보이도록 설정
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // 한국어 설정
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      });
      
      console.log('🤖 DHLottery 스크래퍼 초기화 완료');
    } catch (error) {
      console.error('❌ 스크래퍼 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 최신 회차 정보 가져오기
   */
  async getLatestDraw(): Promise<LotteryResult> {
    if (!this.page) throw new Error('스크래퍼가 초기화되지 않았습니다');

    try {
      console.log('🔍 최신 회차 정보 수집 중...');
      
      // 당첨번호 페이지로 이동
      await this.page.goto(`${this.baseUrl}/gameResult.do?method=byWin`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 페이지 로딩 대기
      await this.page.waitForSelector('.win_result', { timeout: 10000 });

      // 당첨번호 정보 추출
      const lotteryData = await this.page.evaluate(() => {
        // 회차 정보
        const roundElement = document.querySelector('.win_result h4');
        const roundText = roundElement?.textContent || '';
        const round = parseInt(roundText.match(/제(\d+)회/)?.[1] || '0');

        // 추첨일
        const dateElement = document.querySelector('.win_result .desc');
        const dateText = dateElement?.textContent || '';
        const dateMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
        const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

        // 당첨번호 (공 6개)
        const numberElements = document.querySelectorAll('.nums .num.win');
        const numbers: number[] = [];
        numberElements.forEach(el => {
          const num = parseInt(el.textContent || '0');
          if (num > 0) numbers.push(num);
        });

        // 보너스 번호
        const bonusElement = document.querySelector('.nums .num.bonus');
        const bonus = parseInt(bonusElement?.textContent || '0');

        // 상금 정보
        const prizeElements = document.querySelectorAll('.tbl_data_col tbody tr');
        const prize = {
          first: 0,
          firstWinners: 0,
          second: 0,
          secondWinners: 0,
          third: 0,
          thirdWinners: 0,
          fourth: 0,
          fourthWinners: 0,
          fifth: 0,
          fifthWinners: 0
        };

        if (prizeElements.length >= 5) {
          // 1등 정보
          const firstRow = prizeElements[0];
          const firstPrizeText = firstRow.querySelector('td:nth-child(4)')?.textContent || '0';
          const firstWinnersText = firstRow.querySelector('td:nth-child(3)')?.textContent || '0';
          
          prize.first = parseInt(firstPrizeText.replace(/[^\d]/g, ''));
          prize.firstWinners = parseInt(firstWinnersText.replace(/[^\d]/g, ''));

          // 2등 정보
          const secondRow = prizeElements[1];
          const secondPrizeText = secondRow.querySelector('td:nth-child(4)')?.textContent || '0';
          const secondWinnersText = secondRow.querySelector('td:nth-child(3)')?.textContent || '0';
          
          prize.second = parseInt(secondPrizeText.replace(/[^\d]/g, ''));
          prize.secondWinners = parseInt(secondWinnersText.replace(/[^\d]/g, ''));

          // 3등 정보
          const thirdRow = prizeElements[2];
          const thirdPrizeText = thirdRow.querySelector('td:nth-child(4)')?.textContent || '0';
          const thirdWinnersText = thirdRow.querySelector('td:nth-child(3)')?.textContent || '0';
          
          prize.third = parseInt(thirdPrizeText.replace(/[^\d]/g, ''));
          prize.thirdWinners = parseInt(thirdWinnersText.replace(/[^\d]/g, ''));

          // 4등 정보
          const fourthRow = prizeElements[3];
          const fourthPrizeText = fourthRow.querySelector('td:nth-child(4)')?.textContent || '0';
          const fourthWinnersText = fourthRow.querySelector('td:nth-child(3)')?.textContent || '0';
          
          prize.fourth = parseInt(fourthPrizeText.replace(/[^\d]/g, ''));
          prize.fourthWinners = parseInt(fourthWinnersText.replace(/[^\d]/g, ''));

          // 5등 정보
          const fifthRow = prizeElements[4];
          const fifthPrizeText = fifthRow.querySelector('td:nth-child(4)')?.textContent || '0';
          const fifthWinnersText = fifthRow.querySelector('td:nth-child(3)')?.textContent || '0';
          
          prize.fifth = parseInt(fifthPrizeText.replace(/[^\d]/g, ''));
          prize.fifthWinners = parseInt(fifthWinnersText.replace(/[^\d]/g, ''));
        }

        return {
          round,
          date,
          numbers: numbers.slice(0, 6) as [number, number, number, number, number, number],
          bonus,
          prize
        };
      });

      console.log(`✅ ${lotteryData.round}회차 데이터 수집 완료:`, lotteryData.numbers);
      return lotteryData;

    } catch (error) {
      console.error('❌ 최신 회차 정보 수집 실패:', error);
      throw error;
    }
  }

  /**
   * 과거 당첨번호 이력 가져오기 (지정된 범위)
   */
  async getDrawHistory(startRound: number, endRound: number): Promise<LotteryResult[]> {
    if (!this.page) throw new Error('스크래퍼가 초기화되지 않았습니다');

    const results: LotteryResult[] = [];
    
    try {
      console.log(`🔍 ${startRound}~${endRound}회차 이력 수집 중...`);

      for (let round = startRound; round <= endRound; round++) {
        try {
          // 특정 회차 페이지로 이동
          await this.page.goto(
            `${this.baseUrl}/gameResult.do?method=byWin&drwNo=${round}`,
            { waitUntil: 'networkidle', timeout: 15000 }
          );

          // 잠시 대기 (서버 부하 방지)
          await this.page.waitForTimeout(1000);

          // 당첨번호 정보 추출
          const roundData = await this.page.evaluate((roundNum) => {
            // 당첨번호 확인
            const numberElements = document.querySelectorAll('.nums .num.win');
            if (numberElements.length === 0) {
              return null; // 데이터가 없는 회차
            }

            // 추첨일
            const dateElement = document.querySelector('.win_result .desc');
            const dateText = dateElement?.textContent || '';
            const dateMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
            const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

            // 당첨번호
            const numbers: number[] = [];
            numberElements.forEach(el => {
              const num = parseInt(el.textContent || '0');
              if (num > 0) numbers.push(num);
            });

            // 보너스 번호
            const bonusElement = document.querySelector('.nums .num.bonus');
            const bonus = parseInt(bonusElement?.textContent || '0');

            // 기본 상금 정보 (간단히)
            const prize = {
              first: 0,
              firstWinners: 0,
              second: 0,
              secondWinners: 0,
              third: 0,
              thirdWinners: 0,
              fourth: 0,
              fourthWinners: 0,
              fifth: 0,
              fifthWinners: 0
            };

            return {
              round: roundNum,
              date,
              numbers: numbers.slice(0, 6) as [number, number, number, number, number, number],
              bonus,
              prize
            };
          }, round);

          if (roundData && roundData.numbers.length === 6) {
            results.push(roundData);
            console.log(`📊 ${round}회차 수집 완료: [${roundData.numbers.join(', ')}]`);
          } else {
            console.log(`⚠️ ${round}회차 데이터 없음`);
          }

        } catch (error) {
          console.warn(`⚠️ ${round}회차 수집 실패:`, error);
          continue; // 개별 회차 실패 시 다음으로 진행
        }
      }

      console.log(`✅ 총 ${results.length}개 회차 데이터 수집 완료`);
      return results;

    } catch (error) {
      console.error('❌ 당첨번호 이력 수집 실패:', error);
      throw error;
    }
  }

  /**
   * 최근 N회차 데이터 가져오기
   */
  async getRecentDraws(count: number = 20): Promise<LotteryResult[]> {
    try {
      // 먼저 최신 회차 확인
      const latest = await this.getLatestDraw();
      const startRound = Math.max(1, latest.round - count + 1);
      
      return await this.getDrawHistory(startRound, latest.round);
    } catch (error) {
      console.error('❌ 최근 당첨번호 수집 실패:', error);
      throw error;
    }
  }

  /**
   * 리소스 정리
   */
  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('🧹 스크래퍼 리소스 정리 완료');
    } catch (error) {
      console.error('❌ 리소스 정리 실패:', error);
    }
  }
}

// 사용 예시 함수
export async function scrapeLotteryData(rounds: number = 20): Promise<LotteryResult[]> {
  const scraper = new DHLotteryScraper();
  
  try {
    await scraper.initialize();
    const results = await scraper.getRecentDraws(rounds);
    return results;
  } finally {
    await scraper.cleanup();
  }
}