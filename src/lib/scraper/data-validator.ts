import { LotteryResult } from '@/types/lottery';

/**
 * 로또 번호 유효성 검증
 */
export class LotteryDataValidator {
  /**
   * 단일 로또 번호 유효성 검사
   */
  static isValidNumber(num: number): boolean {
    return Number.isInteger(num) && num >= 1 && num <= 45;
  }

  /**
   * 로또 번호 배열 유효성 검사
   */
  static isValidNumberArray(numbers: number[]): boolean {
    // 6개 번호여야 함
    if (numbers.length !== 6) {
      return false;
    }

    // 모든 번호가 1-45 범위 내여야 함
    if (!numbers.every(num => this.isValidNumber(num))) {
      return false;
    }

    // 중복 번호가 없어야 함
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 6) {
      return false;
    }

    return true;
  }

  /**
   * 날짜 형식 유효성 검사 (YYYY-MM-DD)
   */
  static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  /**
   * 회차 번호 유효성 검사
   */
  static isValidRound(round: number): boolean {
    return Number.isInteger(round) && round > 0 && round < 10000; // 합리적인 상한선
  }

  /**
   * 상금 정보 유효성 검사
   */
  static isValidPrizeInfo(prize: unknown): boolean {
    const requiredFields = [
      'first', 'firstWinners',
      'second', 'secondWinners', 
      'third', 'thirdWinners',
      'fourth', 'fourthWinners',
      'fifth', 'fifthWinners'
    ];

    if (typeof prize !== 'object' || prize === null) {
      return false;
    }
    
    return requiredFields.every(field => {
      const value = (prize as Record<string, unknown>)[field];
      return typeof value === 'number' && value >= 0;
    });
  }

  /**
   * 완전한 로또 결과 데이터 유효성 검사
   */
  static validateLotteryResult(result: unknown): result is LotteryResult {
    try {
      // 필수 필드 존재 확인
      if (!result || typeof result !== 'object') {
        console.warn('❌ 로또 결과가 객체가 아닙니다');
        return false;
      }

      const data = result as Record<string, unknown>;
      
      // 회차 검증
      if (!this.isValidRound(data.round as number)) {
        console.warn(`❌ 잘못된 회차: ${data.round}`);
        return false;
      }

      // 날짜 검증
      if (!this.isValidDate(data.date as string)) {
        console.warn(`❌ 잘못된 날짜 형식: ${data.date}`);
        return false;
      }

      // 당첨번호 검증
      if (!this.isValidNumberArray(data.numbers as number[])) {
        console.warn(`❌ 잘못된 당첨번호: [${(data.numbers as number[])?.join(', ')}]`);
        return false;
      }

      // 보너스 번호 검증
      if (!this.isValidNumber(data.bonus as number)) {
        console.warn(`❌ 잘못된 보너스 번호: ${data.bonus}`);
        return false;
      }

      // 보너스 번호가 당첨번호와 중복되면 안됨
      if ((data.numbers as number[]).includes(data.bonus as number)) {
        console.warn(`❌ 보너스 번호가 당첨번호와 중복: ${data.bonus}`);
        return false;
      }

      // 상금 정보 검증
      if (!this.isValidPrizeInfo(data.prize)) {
        console.warn('❌ 잘못된 상금 정보');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('❌ 로또 결과 검증 중 오류:', error);
      return false;
    }
  }

  /**
   * 로또 결과 배열 유효성 검사 및 정리
   */
  static validateAndCleanResults(results: unknown[]): LotteryResult[] {
    if (!Array.isArray(results)) {
      console.warn('❌ 결과가 배열이 아닙니다');
      return [];
    }

    const validResults: LotteryResult[] = [];
    const invalidResults: { index: number; result: unknown }[] = [];

    results.forEach((result, index) => {
      if (this.validateLotteryResult(result)) {
        validResults.push(result);
      } else {
        invalidResults.push({ index, result });
      }
    });

    if (invalidResults.length > 0) {
      console.warn(`⚠️ ${invalidResults.length}개의 잘못된 결과를 제외했습니다:`, invalidResults);
    }

    // 회차별로 정렬 (최신 순)
    validResults.sort((a, b) => b.round - a.round);

    // 중복 회차 제거
    const uniqueResults = validResults.filter((result, index, array) => 
      array.findIndex(r => r.round === result.round) === index
    );

    if (uniqueResults.length !== validResults.length) {
      console.warn(`⚠️ ${validResults.length - uniqueResults.length}개의 중복 회차를 제거했습니다`);
    }

    console.log(`✅ ${uniqueResults.length}개의 유효한 로또 결과를 검증했습니다`);
    return uniqueResults;
  }

  /**
   * 데이터 신선도 확인 (최신 데이터인지)
   */
  static checkDataFreshness(results: LotteryResult[]): {
    isFresh: boolean;
    lastUpdate: string;
    ageInHours: number;
  } {
    if (results.length === 0) {
      return {
        isFresh: false,
        lastUpdate: 'No data',
        ageInHours: Infinity
      };
    }

    // 가장 최신 회차 찾기
    const latestResult = results.reduce((latest, current) => 
      current.round > latest.round ? current : latest
    );

    const lastDrawDate = new Date(latestResult.date);
    const now = new Date();
    const ageInHours = (now.getTime() - lastDrawDate.getTime()) / (1000 * 60 * 60);

    // 로또는 매주 토요일 추첨이므로, 7일(168시간) 이내면 신선한 데이터
    const isFresh = ageInHours <= 168;

    return {
      isFresh,
      lastUpdate: latestResult.date,
      ageInHours: Math.round(ageInHours * 100) / 100
    };
  }

  /**
   * 스크래핑된 데이터의 완전성 체크
   */
  static checkDataCompleteness(results: LotteryResult[]): {
    isComplete: boolean;
    missingRounds: number[];
    totalRounds: number;
  } {
    if (results.length === 0) {
      return {
        isComplete: false,
        missingRounds: [],
        totalRounds: 0
      };
    }

    const rounds = results.map(r => r.round).sort((a, b) => a - b);
    const minRound = rounds[0];
    const maxRound = rounds[rounds.length - 1];
    
    const expectedRounds = Array.from(
      { length: maxRound - minRound + 1 }, 
      (_, i) => minRound + i
    );
    
    const missingRounds = expectedRounds.filter(round => !rounds.includes(round));
    
    return {
      isComplete: missingRounds.length === 0,
      missingRounds,
      totalRounds: expectedRounds.length
    };
  }
}

/**
 * 빠른 검증 함수들 (유틸리티)
 */
export const quickValidation = {
  isValidLotteryNumber: (num: number) => LotteryDataValidator.isValidNumber(num),
  isValidLotteryNumbers: (numbers: number[]) => LotteryDataValidator.isValidNumberArray(numbers),
  isValidResult: (result: unknown) => LotteryDataValidator.validateLotteryResult(result),
  cleanResults: (results: unknown[]) => LotteryDataValidator.validateAndCleanResults(results)
};