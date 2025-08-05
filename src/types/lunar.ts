// 음력 관련 타입 정의

export interface LunarDate {
  year: number;          // 음력 연도
  month: number;         // 음력 월 (1-12)
  day: number;           // 음력 일 (1-30)
  isLeapMonth: boolean;  // 윤달 여부
  leapMonth?: number;    // 윤달이 있는 월
}

export interface SolarDate {
  year: number;          // 양력 연도
  month: number;         // 양력 월 (1-12)
  day: number;           // 양력 일 (1-31)
  dayOfWeek: number;     // 요일 (0: 일요일 ~ 6: 토요일)
  dayOfWeekKor: string;  // 한국어 요일
}

export interface LunarInfo {
  lunar: LunarDate;
  solar: SolarDate;
  ganZhi: {
    year: string;        // 간지 (예: 을사년)
    element: string;     // 오행 (목, 화, 토, 금, 수)
  };
  zodiac: {
    animal: string;      // 띠 (예: 뱀)
    korean: string;      // 한국어 띠명
  };
  specialDay?: string;   // 특별한 날 (윤6월, 절기 등)
}

export interface GanZhiInfo {
  gan: string[];         // 십간
  zhi: string[];         // 십이지
  elements: string[];    // 오행
  animals: string[];     // 십이지 동물
  animalKorean: string[];// 한국어 동물명
}