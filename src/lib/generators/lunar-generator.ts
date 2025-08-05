/**
 * 음력 기반 번호 생성기
 * 음력 달력 정보를 활용한 행운 번호 생성
 * 간지, 띠, 음력 날짜 등을 기반으로 한 전통적인 방식
 */

import { LunarCalendar } from '../lunar/lunar-calendar';
import type { LunarInfo } from '../../types/lunar';

export interface LunarGeneratorOptions {
  useGanZhi?: boolean;      // 간지 활용
  useZodiac?: boolean;      // 띠 활용  
  useLunarDay?: boolean;    // 음력 일 활용
  useSpecialDays?: boolean; // 특별한 날 (보름, 그믐 등) 활용
}

export class LunarGenerator {
  private lunarCalendar: LunarCalendar;

  constructor() {
    this.lunarCalendar = new LunarCalendar();
  }

  /**
   * 음력 정보 기반 로또 번호 생성
   */
  generateNumbers(options: LunarGeneratorOptions = {}): number[] {
    const {
      useGanZhi = true,
      useZodiac = true,
      useLunarDay = true,
      useSpecialDays = true
    } = options;

    const lunarInfo = LunarCalendar.getTodayLunarInfo();
    const numbers = new Set<number>();

    // 1. 간지 기반 번호 (천간 + 지지)
    if (useGanZhi && numbers.size < 6) {
      const ganZhiNumbers = this.getGanZhiNumbers(lunarInfo);
      ganZhiNumbers.forEach(num => numbers.add(num));
    }

    // 2. 띠 기반 번호
    if (useZodiac && numbers.size < 6) {
      const zodiacNumbers = this.getZodiacNumbers(lunarInfo.zodiac.animal);
      zodiacNumbers.forEach(num => numbers.add(num));
    }

    // 3. 음력 날짜 기반 번호
    if (useLunarDay && numbers.size < 6) {
      const dayNumbers = this.getLunarDayNumbers(lunarInfo);
      dayNumbers.forEach(num => numbers.add(num));
    }

    // 4. 특별한 날 보너스 번호
    if (useSpecialDays && numbers.size < 6) {
      const specialNumbers = this.getSpecialDayNumbers(lunarInfo);
      specialNumbers.forEach(num => numbers.add(num));
    }

    // 5. 부족한 번호는 음력 기반 랜덤으로 채움
    while (numbers.size < 6) {
      const randomNum = this.generateLunarInfluencedRandom(lunarInfo);
      if (randomNum >= 1 && randomNum <= 45) {
        numbers.add(randomNum);
      }
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  /**
   * 간지(干支) 기반 번호 생성
   */
  private getGanZhiNumbers(lunarInfo: LunarInfo): number[] {
    const numbers: number[] = [];
    
    // 천간(天干) 번호 (1-10)
    const tianGanIndex = this.getTianGanIndex(lunarInfo.ganZhi.year);
    if (tianGanIndex > 0) {
      numbers.push(Math.min(45, tianGanIndex * 4)); // 천간 * 4로 스케일링
    }

    // 지지(地支) 번호 (1-12)
    const diZhiIndex = this.getDiZhiIndex(lunarInfo.ganZhi.year);
    if (diZhiIndex > 0) {
      numbers.push(Math.min(45, diZhiIndex * 3 + 5)); // 지지 * 3 + 5로 스케일링
    }

    return numbers;
  }

  /**
   * 띠 기반 번호 생성
   */
  private getZodiacNumbers(zodiac: string): number[] {
    const zodiacMap: Record<string, number[]> = {
      '쥐': [1, 13, 25, 37],
      '소': [2, 14, 26, 38],
      '호랑이': [3, 15, 27, 39],
      '토끼': [4, 16, 28, 40],
      '용': [5, 17, 29, 41],
      '뱀': [6, 18, 30, 42],
      '말': [7, 19, 31, 43],
      '양': [8, 20, 32, 44],
      '원숭이': [9, 21, 33, 45],
      '닭': [10, 22, 34],
      '개': [11, 23, 35],
      '돼지': [12, 24, 36]
    };

    const candidates = zodiacMap[zodiac] || [];
    // 2-3개의 대표 번호 선택
    return candidates.slice(0, Math.min(3, candidates.length));
  }

  /**
   * 음력 날짜 기반 번호 생성
   */
  private getLunarDayNumbers(lunarInfo: LunarInfo): number[] {
    const numbers: number[] = [];
    
    // 음력 월
    if (lunarInfo.lunar.month <= 45) {
      numbers.push(lunarInfo.lunar.month);
    }

    // 음력 일
    if (lunarInfo.lunar.day <= 45) {
      numbers.push(lunarInfo.lunar.day);
    }

    // 월 + 일 조합
    const combination = lunarInfo.lunar.month + lunarInfo.lunar.day;
    if (combination <= 45 && combination >= 1) {
      numbers.push(combination);
    }

    return numbers;
  }

  /**
   * 특별한 날 기반 번호 생성
   */
  private getSpecialDayNumbers(lunarInfo: LunarInfo): number[] {
    const numbers: number[] = [];
    const { lunar } = lunarInfo;

    // 보름달 (15일)
    if (lunar.day === 15) {
      numbers.push(15, 30, 45); // 보름 관련 번호
    }

    // 그믐달 (29-30일)
    if (lunar.day >= 29) {
      numbers.push(1, 16, 31); // 새로운 시작 의미
    }

    // 초하루 (1일)
    if (lunar.day === 1) {
      numbers.push(1, 11, 21, 31, 41); // 시작과 희망의 번호
    }

    // 윤달
    if (lunar.isLeapMonth) {
      numbers.push(7, 14, 21, 28, 35, 42); // 7의 배수 (행운)
    }

    return numbers;
  }

  /**
   * 음력 영향을 받은 랜덤 번호 생성
   */
  private generateLunarInfluencedRandom(lunarInfo: LunarInfo): number {
    const { lunar } = lunarInfo;
    
    // 음력 정보를 시드로 활용
    const seed = (lunar.year % 100) * 10000 + 
                 lunar.month * 100 + 
                 lunar.day;
    
    // 간단한 선형 합동 생성기
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    const random = ((a * seed + c) % m) / m;
    return Math.floor(random * 45) + 1;
  }

  /**
   * 천간 인덱스 추출 (甲乙丙丁戊己庚辛壬癸 = 1-10)
   */
  private getTianGanIndex(ganZhi: string): number {
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const firstChar = ganZhi.charAt(0);
    return tianGan.indexOf(firstChar) + 1;
  }

  /**
   * 지지 인덱스 추출 (子丑寅卯辰巳午未申酉戌亥 = 1-12)
   */
  private getDiZhiIndex(ganZhi: string): number {
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const secondChar = ganZhi.charAt(1);
    return diZhi.indexOf(secondChar) + 1;
  }

  /**
   * 생성 알고리즘 설명 반환
   */
  getDescription(): string {
    return '전통 음력 정보를 활용한 행운 번호 생성 방식입니다. 간지(干支), 띠, 음력 날짜, 특별한 날(보름, 그믐 등)의 의미를 종합하여 번호를 선택합니다.';
  }

  /**
   * 오늘의 음력 정보 기반 추천 이유 생성
   */
  getRecommendationReason(): string {
    const lunarInfo = LunarCalendar.getTodayLunarInfo();
    const reasons: string[] = [];

    reasons.push(`${lunarInfo.ganZhi}년의 기운을 담은 번호`);
    reasons.push(`${lunarInfo.zodiac}띠의 행운 번호`);
    reasons.push(`음력 ${lunarInfo.lunar.month}월 ${lunarInfo.lunar.day}일의 특별한 의미`);

    if (lunarInfo.lunar.day === 15) {
      reasons.push('보름달의 완성된 에너지');
    } else if (lunarInfo.lunar.day === 1) {
      reasons.push('초하루의 새로운 시작');
    } else if (lunarInfo.lunar.day >= 29) {
      reasons.push('그믐달의 변화와 준비');
    }

    if (lunarInfo.lunar.isLeapMonth) {
      reasons.push('윤달의 특별한 기운');
    }

    return reasons.join(', ');
  }
}