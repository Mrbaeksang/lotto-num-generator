/**
 * 개인화 기반 번호 생성기
 * 사용자의 개인 정보와 중요한 날짜들을 활용한 맞춤형 번호 생성
 * 생년월일, 기념일, 전화번호, 주소 등 개인적 의미가 있는 숫자 활용
 */

export interface PersonalInfo {
  birthDate?: Date;           // 생년월일
  luckyNumbers?: number[];    // 개인 행운 번호
  anniversaries?: Date[];     // 기념일들
  phoneNumber?: string;       // 전화번호
  address?: string;          // 주소
  familyBirthDates?: Date[]; // 가족 생년월일
  significantNumbers?: number[]; // 의미있는 숫자들
}

export interface PersonalOptions {
  useBirthDate?: boolean;        // 생년월일 사용
  useLuckyNumbers?: boolean;     // 행운번호 사용
  useAnniversaries?: boolean;    // 기념일 사용
  usePhoneNumber?: boolean;      // 전화번호 사용
  useNumerology?: boolean;       // 수비학 사용
  useFamilyDates?: boolean;      // 가족 생일 사용
}

export class PersonalGenerator {
  private personalInfo: PersonalInfo;
  private generatedHistory: number[][] = []; // 이전 생성 기록

  constructor(personalInfo: PersonalInfo = {}) {
    this.personalInfo = personalInfo;
  }

  /**
   * 개인화된 로또 번호 생성
   */
  generateNumbers(options: PersonalOptions = {}): number[] {
    const {
      useBirthDate = true,
      useLuckyNumbers = true,
      useAnniversaries = true,
      usePhoneNumber = false,
      useNumerology = true,
      useFamilyDates = true
    } = options;

    const candidates = new Set<number>();
    const sources: string[] = [];

    // 1. 생년월일 기반 번호
    if (useBirthDate && this.personalInfo.birthDate) {
      const birthNumbers = this.extractFromDate(this.personalInfo.birthDate);
      birthNumbers.forEach(num => candidates.add(num));
      if (birthNumbers.length > 0) sources.push('생년월일');
    }

    // 2. 개인 행운 번호
    if (useLuckyNumbers && this.personalInfo.luckyNumbers) {
      const validLucky = this.personalInfo.luckyNumbers
        .filter(num => num >= 1 && num <= 45);
      validLucky.slice(0, 2).forEach(num => candidates.add(num));
      if (validLucky.length > 0) sources.push('행운번호');
    }

    // 3. 기념일 기반 번호
    if (useAnniversaries && this.personalInfo.anniversaries) {
      this.personalInfo.anniversaries.forEach(date => {
        const dateNumbers = this.extractFromDate(date);
        dateNumbers.slice(0, 1).forEach(num => candidates.add(num));
      });
      if (this.personalInfo.anniversaries.length > 0) sources.push('기념일');
    }

    // 4. 전화번호 기반 번호
    if (usePhoneNumber && this.personalInfo.phoneNumber) {
      const phoneNumbers = this.extractFromPhoneNumber(this.personalInfo.phoneNumber);
      phoneNumbers.forEach(num => candidates.add(num));
      if (phoneNumbers.length > 0) sources.push('전화번호');
    }

    // 5. 수비학 기반 번호
    if (useNumerology) {
      const numerologyNumbers = this.calculateNumerologyNumbers();
      numerologyNumbers.forEach(num => candidates.add(num));
      if (numerologyNumbers.length > 0) sources.push('수비학');
    }

    // 6. 가족 생일 기반 번호
    if (useFamilyDates && this.personalInfo.familyBirthDates) {
      this.personalInfo.familyBirthDates.forEach(date => {
        const familyNumbers = this.extractFromDate(date);
        familyNumbers.slice(0, 1).forEach(num => candidates.add(num));
      });
      if (this.personalInfo.familyBirthDates.length > 0) sources.push('가족생일');
    }

    // 7. 의미있는 숫자들
    if (this.personalInfo.significantNumbers) {
      const validSignificant = this.personalInfo.significantNumbers
        .filter(num => num >= 1 && num <= 45);
      validSignificant.slice(0, 2).forEach(num => candidates.add(num));
      if (validSignificant.length > 0) sources.push('의미있는숫자');
    }

    // 8. 부족한 번호는 개인화된 랜덤으로 채움
    const selectedNumbers = Array.from(candidates);
    while (selectedNumbers.length < 6) {
      const personalRandom = this.generatePersonalRandom(selectedNumbers);
      if (!selectedNumbers.includes(personalRandom)) {
        selectedNumbers.push(personalRandom);
        sources.push('개인화랜덤');
      }
    }

    // 6개로 제한
    const finalNumbers = selectedNumbers.slice(0, 6).sort((a, b) => a - b);
    
    // 생성 기록 저장
    this.generatedHistory.push(finalNumbers);
    this.lastUsedSources = [...new Set(sources)];

    return finalNumbers;
  }

  private lastUsedSources: string[] = [];

  /**
   * 날짜에서 로또 번호 추출
   */
  private extractFromDate(date: Date): number[] {
    const numbers: number[] = [];
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 연도에서 숫자 추출
    const yearDigits = year.toString().split('').map(Number);
    const yearSum = yearDigits.reduce((sum, digit) => sum + digit, 0);
    if (yearSum >= 1 && yearSum <= 45) numbers.push(yearSum);

    // 월
    if (month >= 1 && month <= 45) numbers.push(month);

    // 일
    if (day >= 1 && day <= 45) numbers.push(day);

    // 월 + 일 조합
    const monthDay = month + day;
    if (monthDay >= 1 && monthDay <= 45) numbers.push(monthDay);

    // 생년월일 전체의 디지털 루트
    const allDigits = (year.toString() + month.toString().padStart(2, '0') + day.toString().padStart(2, '0'))
      .split('').map(Number);
    const digitalRoot = this.calculateDigitalRoot(allDigits.reduce((sum, digit) => sum + digit, 0));
    if (digitalRoot >= 1 && digitalRoot <= 45) numbers.push(digitalRoot);

    return [...new Set(numbers)]; // 중복 제거
  }

  /**
   * 전화번호에서 로또 번호 추출
   */
  private extractFromPhoneNumber(phoneNumber: string): number[] {
    const numbers: number[] = [];
    const digits = phoneNumber.replace(/\D/g, '').split('').map(Number);

    if (digits.length === 0) return numbers;

    // 연속된 2자리 숫자들 추출
    for (let i = 0; i < digits.length - 1; i++) {
      const twoDigit = digits[i] * 10 + digits[i + 1];
      if (twoDigit >= 1 && twoDigit <= 45) {
        numbers.push(twoDigit);
      }
    }

    // 전화번호 전체의 디지털 루트
    const sum = digits.reduce((acc, digit) => acc + digit, 0);
    const digitalRoot = this.calculateDigitalRoot(sum);
    if (digitalRoot >= 1 && digitalRoot <= 45) numbers.push(digitalRoot);

    // 앞자리와 뒷자리 조합
    if (digits.length >= 4) {
      const firstTwo = digits[0] * 10 + digits[1];
      const lastTwo = digits[digits.length - 2] * 10 + digits[digits.length - 1];
      
      if (firstTwo >= 1 && firstTwo <= 45) numbers.push(firstTwo);
      if (lastTwo >= 1 && lastTwo <= 45) numbers.push(lastTwo);
    }

    return [...new Set(numbers)].slice(0, 3); // 최대 3개, 중복 제거
  }

  /**
   * 수비학 기반 번호 계산
   */
  private calculateNumerologyNumbers(): number[] {
    const numbers: number[] = [];

    if (!this.personalInfo.birthDate) return numbers;

    const birthDate = this.personalInfo.birthDate;
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    // 생명수 (Life Path Number)
    const lifePathSum = this.calculateDigitalRoot(year + month + day);
    if (lifePathSum >= 1 && lifePathSum <= 45) numbers.push(lifePathSum);

    // 운명수 (Destiny Number) - 이름이 있다면 계산
    // 여기서는 생년월일로 대체 계산
    const destinySum = this.calculateDigitalRoot(year * month * day);
    if (destinySum >= 1 && destinySum <= 45) numbers.push(destinySum);

    // 영혼수 (Soul Number)
    const soulSum = this.calculateDigitalRoot(month * day);
    if (soulSum >= 1 && soulSum <= 45) numbers.push(soulSum);

    // 성격수 (Personality Number)
    const personalitySum = this.calculateDigitalRoot(year - month + day);
    if (personalitySum >= 1 && personalitySum <= 45) numbers.push(personalitySum);

    // 성숙수 (Maturity Number)
    const maturitySum = this.calculateDigitalRoot(lifePathSum + destinySum);
    if (maturitySum >= 1 && maturitySum <= 45) numbers.push(maturitySum);

    return [...new Set(numbers)]; // 중복 제거
  }

  /**
   * 디지털 루트 계산
   */
  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num === 0 ? 9 : num; // 0은 9로 처리
  }

  /**
   * 개인화된 랜덤 번호 생성
   */
  private generatePersonalRandom(existingNumbers: number[]): number {
    const personalSeed = this.generatePersonalSeed();
    
    // 선형 합동 생성기 (Personal LCG)
    const a = 1664525;
    const c = personalSeed % 1000000 + 1013904223;
    const m = Math.pow(2, 32);
    
    let attempts = 0;
    let random = personalSeed;
    
    while (attempts < 100) {
      random = ((a * random + c) % m);
      const candidate = (Math.abs(random) % 45) + 1;
      
      if (!existingNumbers.includes(candidate)) {
        return candidate;
      }
      attempts++;
    }
    
    // 최후의 수단
    for (let i = 1; i <= 45; i++) {
      if (!existingNumbers.includes(i)) {
        return i;
      }
    }
    
    return 1; // 이론적으로 도달하지 않음
  }

  /**
   * 개인 시드값 생성
   */
  private generatePersonalSeed(): number {
    let seed = 12345; // 기본값

    if (this.personalInfo.birthDate) {
      const date = this.personalInfo.birthDate;
      seed ^= date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    }

    if (this.personalInfo.phoneNumber) {
      const phoneDigits = this.personalInfo.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length > 0) {
        seed ^= parseInt(phoneDigits.slice(-8)) || 0;
      }
    }

    if (this.personalInfo.luckyNumbers && this.personalInfo.luckyNumbers.length > 0) {
      seed ^= this.personalInfo.luckyNumbers.reduce((acc, num) => acc + num * 1000, 0);
    }

    // 생성 이력도 시드에 반영 (같은 번호 반복 방지)
    if (this.generatedHistory.length > 0) {
      const lastGenerated = this.generatedHistory[this.generatedHistory.length - 1];
      seed ^= lastGenerated.reduce((acc, num) => acc + num, 0) * 100;
    }

    return Math.abs(seed);
  }

  /**
   * 개인 정보 업데이트
   */
  updatePersonalInfo(newInfo: Partial<PersonalInfo>): void {
    this.personalInfo = { ...this.personalInfo, ...newInfo };
  }

  /**
   * 생성 기록 조회
   */
  getGenerationHistory(): number[][] {
    return [...this.generatedHistory];
  }

  /**
   * 생성 기록 초기화
   */
  clearHistory(): void {
    this.generatedHistory = [];
  }

  /**
   * 현재 개인 정보 반환
   */
  getPersonalInfo(): PersonalInfo {
    return { ...this.personalInfo };
  }

  /**
   * 생성 알고리즘 설명 반환
   */
  getDescription(): string {
    return '사용자의 개인 정보와 중요한 날짜들을 활용한 맞춤형 번호 생성 방식입니다. 생년월일, 기념일, 행운번호, 수비학 등 개인적 의미가 있는 요소들을 종합합니다.';
  }

  /**
   * 개인화 기반 추천 이유 생성
   */
  getRecommendationReason(): string {
    if (this.lastUsedSources.length === 0) {
      return '개인 정보를 종합하여 선택된 맞춤형 번호';
    }

    const sourceDescriptions = {
      '생년월일': '태어난 날의 특별한 에너지',
      '행운번호': '개인적으로 의미있는 숫자',
      '기념일': '소중한 추억의 날짜',
      '전화번호': '일상과 밀접한 숫자',
      '수비학': '이름과 생년월일의 신비한 조합',
      '가족생일': '가족의 사랑과 축복',
      '의미있는숫자': '특별한 의미를 가진 개인 번호',
      '개인화랜덤': '개인 정보 기반 확률적 선택'
    };

    const reasons = this.lastUsedSources.map(source => 
      sourceDescriptions[source as keyof typeof sourceDescriptions] || source
    );

    return `${reasons.join(', ')} 등 개인적 의미 반영`;
  }

  /**
   * 특정 번호의 개인적 의미 분석
   */
  analyzePersonalMeaning(number: number): string[] {
    const meanings: string[] = [];

    // 생년월일 관련성 확인
    if (this.personalInfo.birthDate) {
      const date = this.personalInfo.birthDate;
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (number === month) meanings.push('태어난 달');
      if (number === day) meanings.push('태어난 날');
      if (number === month + day) meanings.push('생일 조합수');
    }

    // 행운번호 확인
    if (this.personalInfo.luckyNumbers?.includes(number)) {
      meanings.push('개인 행운번호');
    }

    // 기념일 관련성 확인
    if (this.personalInfo.anniversaries) {
      this.personalInfo.anniversaries.forEach((date, index) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        if (number === month || number === day || number === month + day) {
          meanings.push(`기념일 ${index + 1} 관련`);
        }
      });
    }

    // 수비학적 의미
    const numerologyNumbers = this.calculateNumerologyNumbers();
    if (numerologyNumbers.includes(number)) {
      meanings.push('수비학적 의미');
    }

    if (meanings.length === 0) {
      meanings.push('개인화 알고리즘으로 선택');
    }

    return meanings;
  }
}