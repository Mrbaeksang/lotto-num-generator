import { LunarDate, SolarDate, LunarInfo, GanZhiInfo } from '@/types/lunar';

/**
 * 음력 계산 및 변환 유틸리티 클래스
 * 양력 <-> 음력 변환, 간지, 띠 계산 등을 처리
 */
export class LunarCalendar {
  // 간지 및 띠 정보
  private static readonly ganZhiData: GanZhiInfo = {
    gan: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
    zhi: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'],
    elements: ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'],
    animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
    animalKorean: ['쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠', '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠']
  };

  // 요일 한국어 변환
  private static readonly dayOfWeekKor = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // 각 달의 일수 (평년 기준)
  private static readonly daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /**
   * 윤년 판별
   */
  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * 양력 날짜의 요일 계산 (0: 일요일, 6: 토요일)
   */
  private static getDayOfWeek(year: number, month: number, day: number): number {
    const date = new Date(year, month - 1, day);
    return date.getDay();
  }

  /**
   * 간지 계산 (연도 기준)
   */
  private static getGanZhi(year: number): { year: string; element: string } {
    // 갑자년은 1924년 (1924 % 60 = 4)
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    
    const gan = this.ganZhiData.gan[ganIndex];
    const zhi = this.ganZhiData.zhi[zhiIndex];
    const element = this.ganZhiData.elements[ganIndex];

    return {
      year: `${gan}${zhi}년`,
      element
    };
  }

  /**
   * 띠 계산
   */
  private static getZodiac(year: number): { animal: string; korean: string } {
    const zhiIndex = (year - 4) % 12;
    return {
      animal: this.ganZhiData.animals[zhiIndex],
      korean: this.ganZhiData.animalKorean[zhiIndex]
    };
  }

  /**
   * 간단한 양력 -> 음력 변환 (근사치)
   * 실제 구현에서는 정확한 천문학적 계산이 필요하지만, 
   * 여기서는 데모용 간단한 변환을 사용
   */
  public static solarToLunar(solar: Date): LunarDate {
    const year = solar.getFullYear();
    const month = solar.getMonth() + 1;
    const day = solar.getDate();

    // 간단한 변환 공식 (실제로는 복잡한 천문학적 계산 필요)
    // 음력은 대략 11일 정도 빠름
    let lunarYear = year;
    let lunarMonth = month;
    let lunarDay = day - 11;

    // 날짜 조정
    if (lunarDay <= 0) {
      lunarMonth--;
      if (lunarMonth <= 0) {
        lunarMonth = 12;
        lunarYear--;
      }
      lunarDay += 29; // 음력 한 달 평균 29일
    }

    // 윤달 계산 (간단한 근사치)
    const isLeapMonth = month === 6 && year === 2025; // 2025년 윤6월
    const leapMonth = isLeapMonth ? 6 : undefined;

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth,
      leapMonth
    };
  }

  /**
   * 완전한 음력 정보 가져오기
   */
  public static getLunarInfo(date?: Date): LunarInfo {
    const solarDate = date || new Date();
    const year = solarDate.getFullYear();
    const month = solarDate.getMonth() + 1;
    const day = solarDate.getDate();

    // 양력 정보
    const solar: SolarDate = {
      year,
      month, 
      day,
      dayOfWeek: this.getDayOfWeek(year, month, day),
      dayOfWeekKor: this.dayOfWeekKor[this.getDayOfWeek(year, month, day)]
    };

    // 음력 정보
    const lunar = this.solarToLunar(solarDate);

    // 간지 정보
    const ganZhi = this.getGanZhi(year);

    // 띠 정보
    const zodiac = this.getZodiac(year);

    // 특별한 날 계산
    let specialDay: string | undefined;
    if (lunar.isLeapMonth && lunar.leapMonth === 6) {
      specialDay = '윤6월';
    }

    return {
      lunar,
      solar,
      ganZhi,
      zodiac,
      specialDay
    };
  }

  /**
   * 오늘의 음력 정보
   */
  public static getTodayLunarInfo(): LunarInfo {
    return this.getLunarInfo(new Date());
  }

  /**
   * 음력 날짜를 문자열로 변환
   */
  public static formatLunarDate(lunar: LunarDate): string {
    const leapPrefix = lunar.isLeapMonth ? '윤' : '';
    return `${lunar.year}년 ${leapPrefix}${lunar.month}월 ${lunar.day}일`;
  }

  /**
   * 양력 날짜를 문자열로 변환  
   */
  public static formatSolarDate(solar: SolarDate): string {
    return `${solar.year}년 ${solar.month}월 ${solar.day}일 (${solar.dayOfWeekKor})`;
  }
}