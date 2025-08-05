/**
 * 직관적 번호 생성기 (Intuitive Number Generator)
 * 
 * 사용자의 직감과 심리적 편안함을 중시하는 접근 방식
 * - 사용자 친화적 옵션
 * - 심리적 편안함 제공
 * - 간단하고 직관적인 선택 방법
 * - 랜덤성과 개인적 의미의 균형
 */

export interface IntuitiveOptions {
  /** 선호하는 번호 범위 */
  preferredRange?: {
    min: number;
    max: number;
  };
  /** 회피할 번호들 */
  avoidNumbers?: number[];
  /** 선호하는 번호들 */
  favoriteNumbers?: number[];
  /** 행운의 색깔 (숫자로 변환) */
  luckyColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';
  /** 기분 상태 */
  mood?: 'optimistic' | 'cautious' | 'adventurous' | 'balanced' | 'confident';
  /** 직감 모드 */
  intuitionMode?: 'random' | 'guided' | 'balanced' | 'systematic';
  /** 심볼 기반 선택 */
  symbols?: ('circle' | 'triangle' | 'square' | 'star' | 'heart')[];
  /** 시간대 영향 */
  timeInfluence?: boolean;
  /** 날씨 영향 */
  weatherMood?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
}

interface IntuitiveContext {
  currentHour: number;
  dayOfWeek: number;
  randomSeed: number;
  userPreferences: IntuitiveOptions;
}

export class IntuitiveGenerator {
  private generationHistory: number[][] = [];
  private readonly MAX_HISTORY = 50;

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('intuitive-generator-history');
        if (stored) {
          this.generationHistory = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.warn('Failed to load intuitive generator history:', error);
    }
  }

  private saveHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'intuitive-generator-history',
          JSON.stringify(this.generationHistory.slice(-this.MAX_HISTORY))
        );
      }
    } catch (error) {
      console.warn('Failed to save intuitive generator history:', error);
    }
  }

  generateNumbers(options: IntuitiveOptions = {}): number[] {
    const context = this.buildContext(options);
    const candidates = new Set<number>();

    // 1. 기본 직감적 번호 생성
    this.addIntuitiveCandidates(candidates, context);

    // 2. 선호 번호 추가
    this.addFavoriteNumbers(candidates, options);

    // 3. 색깔 기반 번호
    this.addColorBasedNumbers(candidates, options);

    // 4. 기분 상태 반영
    this.addMoodBasedNumbers(candidates, context);

    // 5. 심볼 기반 번호
    this.addSymbolBasedNumbers(candidates, options);

    // 6. 시간/날씨 영향
    this.addTimeWeatherNumbers(candidates, context);

    // 7. 회피 번호 제거
    this.removeAvoidedNumbers(candidates, options);

    // 8. 최종 선택
    const finalNumbers = this.selectFinalNumbers(candidates, context);

    // 히스토리 저장
    this.generationHistory.push([...finalNumbers]);
    this.saveHistory();

    return finalNumbers.sort((a, b) => a - b);
  }

  private buildContext(options: IntuitiveOptions): IntuitiveContext {
    const now = new Date();
    return {
      currentHour: now.getHours(),
      dayOfWeek: now.getDay(),
      randomSeed: Math.random(),
      userPreferences: options
    };
  }

  private addIntuitiveCandidates(candidates: Set<number>, context: IntuitiveContext): void {
    const { intuitionMode = 'balanced' } = context.userPreferences;

    switch (intuitionMode) {
      case 'random':
        this.addRandomCandidates(candidates, 15);
        break;
      case 'guided':
        this.addGuidedCandidates(candidates, context);
        break;
      case 'systematic':
        this.addSystematicCandidates(candidates);
        break;
      case 'balanced':
      default:
        this.addBalancedCandidates(candidates, context);
        break;
    }
  }

  private addRandomCandidates(candidates: Set<number>, count: number): void {
    while (candidates.size < count && candidates.size < 45) {
      const num = Math.floor(Math.random() * 45) + 1;
      candidates.add(num);
    }
  }

  private addGuidedCandidates(candidates: Set<number>, context: IntuitiveContext): void {
    // 시간 기반 가이드
    const hourRange = Math.floor(context.currentHour / 4); // 0-5 범위
    const baseNumber = (hourRange * 7) + 1;
    
    for (let i = 0; i < 3; i++) {
      const num = Math.min(45, baseNumber + i);
      candidates.add(num);
    }

    // 요일 기반 가이드
    const dayBase = context.dayOfWeek * 6 + 1;
    for (let i = 0; i < 2; i++) {
      const num = Math.min(45, dayBase + i);
      candidates.add(num);
    }

    // 랜덤 시드 기반
    const seedNumbers = this.generateSeedBasedNumbers(context.randomSeed, 8);
    seedNumbers.forEach(num => candidates.add(num));
  }

  private addSystematicCandidates(candidates: Set<number>): void {
    // 체계적인 분포
    const ranges = [
      { min: 1, max: 9 },   // 낮은 범위
      { min: 10, max: 19 }, // 중간-낮은 범위
      { min: 20, max: 29 }, // 중간 범위
      { min: 30, max: 39 }, // 중간-높은 범위
      { min: 40, max: 45 }  // 높은 범위
    ];

    ranges.forEach((range, index) => {
      const count = index === 4 ? 1 : 2; // 마지막 범위는 1개만
      for (let i = 0; i < count; i++) {
        const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        candidates.add(num);
      }
    });
  }

  private addBalancedCandidates(candidates: Set<number>, context: IntuitiveContext): void {
    // 가이드와 랜덤의 조합
    this.addGuidedCandidates(candidates, context);
    this.addRandomCandidates(candidates, 8);

    // 균형잡힌 분포 보장
    this.ensureBalancedDistribution(candidates);
  }

  private addFavoriteNumbers(candidates: Set<number>, options: IntuitiveOptions): void {
    if (options.favoriteNumbers?.length) {
      options.favoriteNumbers.forEach(num => {
        if (num >= 1 && num <= 45) {
          candidates.add(num);
        }
      });
    }
  }

  private addColorBasedNumbers(candidates: Set<number>, options: IntuitiveOptions): void {
    if (!options.luckyColor) return;

    const colorNumbers = this.getColorNumbers(options.luckyColor);
    colorNumbers.forEach(num => candidates.add(num));
  }

  private getColorNumbers(color: string): number[] {
    const colorMappings = {
      red: [3, 12, 21, 30, 39], // 정열, 에너지
      blue: [2, 11, 20, 29, 38], // 평온, 신뢰
      green: [4, 13, 22, 31, 40], // 성장, 자연
      yellow: [1, 10, 19, 28, 37], // 행복, 창의
      purple: [6, 15, 24, 33, 42], // 신비, 지혜
      orange: [5, 14, 23, 32, 41], // 활력, 열정
      pink: [7, 16, 25, 34, 43]  // 사랑, 부드러움
    };

    return colorMappings[color as keyof typeof colorMappings] || [];
  }

  private addMoodBasedNumbers(candidates: Set<number>, context: IntuitiveContext): void {
    const { mood = 'balanced' } = context.userPreferences;

    const moodNumbers = this.getMoodNumbers(mood);
    moodNumbers.forEach(num => candidates.add(num));
  }

  private getMoodNumbers(mood: string): number[] {
    const moodMappings = {
      optimistic: [8, 17, 26, 35, 44], // 긍정적, 상승
      cautious: [9, 18, 27, 36, 45],   // 신중함, 완성
      adventurous: [1, 11, 22, 33, 44], // 모험, 도전
      balanced: [5, 15, 25, 35, 45],    // 균형, 중도
      confident: [1, 10, 19, 28, 37]    // 자신감, 리더십
    };

    return moodMappings[mood as keyof typeof moodMappings] || [];
  }

  private addSymbolBasedNumbers(candidates: Set<number>, options: IntuitiveOptions): void {
    if (!options.symbols?.length) return;

    options.symbols.forEach(symbol => {
      const symbolNumbers = this.getSymbolNumbers(symbol);
      symbolNumbers.forEach(num => candidates.add(num));
    });
  }

  private getSymbolNumbers(symbol: string): number[] {
    const symbolMappings = {
      circle: [9, 18, 27, 36, 45],     // 완전함, 순환
      triangle: [3, 6, 9, 12, 15],     // 안정성, 균형
      square: [4, 8, 12, 16, 20],      // 견고함, 질서
      star: [5, 10, 15, 20, 25],       // 희망, 꿈
      heart: [2, 14, 26, 38, 41]       // 사랑, 감정
    };

    return symbolMappings[symbol as keyof typeof symbolMappings] || [];
  }

  private addTimeWeatherNumbers(candidates: Set<number>, context: IntuitiveContext): void {
    const { timeInfluence = false, weatherMood } = context.userPreferences;

    if (timeInfluence) {
      // 시간대별 특별 번호
      const timeNumbers = this.getTimeBasedNumbers(context.currentHour);
      timeNumbers.forEach(num => candidates.add(num));
    }

    if (weatherMood) {
      const weatherNumbers = this.getWeatherNumbers(weatherMood);
      weatherNumbers.forEach(num => candidates.add(num));
    }
  }

  private getTimeBasedNumbers(hour: number): number[] {
    if (hour >= 6 && hour < 12) {
      return [7, 14, 21, 28, 35]; // 아침 - 시작, 활력
    } else if (hour >= 12 && hour < 18) {
      return [12, 24, 36, 45]; // 오후 - 활동, 정점
    } else if (hour >= 18 && hour < 22) {
      return [6, 18, 30, 42]; // 저녁 - 완성, 안정
    } else {
      return [3, 9, 27, 33]; // 밤 - 직감, 신비
    }
  }

  private getWeatherNumbers(weather: string): number[] {
    const weatherMappings = {
      sunny: [1, 8, 15, 22, 29],    // 밝음, 긍정
      cloudy: [2, 11, 20, 29, 38],  // 차분함, 사색
      rainy: [4, 13, 22, 31, 40],   // 정화, 새로움
      snowy: [6, 12, 18, 24, 30],   // 순수함, 평온
      windy: [5, 14, 23, 32, 41]    // 변화, 자유
    };

    return weatherMappings[weather as keyof typeof weatherMappings] || [];
  }

  private removeAvoidedNumbers(candidates: Set<number>, options: IntuitiveOptions): void {
    if (options.avoidNumbers?.length) {
      options.avoidNumbers.forEach(num => {
        candidates.delete(num);
      });
    }

    // 선호 범위 적용
    if (options.preferredRange) {
      const toRemove: number[] = [];
      candidates.forEach(num => {
        if (num < options.preferredRange!.min || num > options.preferredRange!.max) {
          toRemove.push(num);
        }
      });
      toRemove.forEach(num => candidates.delete(num));
    }
  }

  private selectFinalNumbers(candidates: Set<number>, context: IntuitiveContext): number[] {
    const candidateArray = Array.from(candidates);
    
    if (candidateArray.length <= 6) {
      // 후보가 부족하면 추가 생성
      while (candidateArray.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!candidateArray.includes(num)) {
          candidateArray.push(num);
        }
      }
    }

    // 스코어링 시스템으로 최종 선택
    const scoredCandidates = candidateArray.map(num => ({
      number: num,
      score: this.calculateIntuitiveScore(num, context)
    }));

    // 점수순 정렬 후 상위 6개 선택
    scoredCandidates.sort((a, b) => b.score - a.score);
    
    return scoredCandidates.slice(0, 6).map(item => item.number);
  }

  private calculateIntuitiveScore(num: number, context: IntuitiveContext): number {
    let score = 0;

    // 기본 직감 점수 (랜덤)
    score += Math.random() * 50;

    // 시간 기반 보너스
    const timeBonus = this.getTimeBonus(num, context.currentHour);
    score += timeBonus;

    // 요일 기반 보너스
    const dayBonus = this.getDayBonus(num, context.dayOfWeek);
    score += dayBonus;

    // 개인 선호도 반영
    const preferenceBonus = this.getPreferenceBonus(num, context.userPreferences);
    score += preferenceBonus;

    // 최근 생성 이력 페널티 (중복 방지)
    const historyPenalty = this.getHistoryPenalty(num);
    score -= historyPenalty;

    return score;
  }

  private getTimeBonus(num: number, hour: number): number {
    // 특정 시간대에 특정 번호 선호
    const timePreferences = [
      { hours: [6, 7, 8], numbers: [1, 8, 15, 22] },
      { hours: [9, 10, 11], numbers: [9, 18, 27, 36] },
      { hours: [12, 13, 14], numbers: [12, 24, 36] },
      { hours: [15, 16, 17], numbers: [3, 15, 30, 45] },
      { hours: [18, 19, 20], numbers: [6, 18, 30, 42] },
      { hours: [21, 22, 23], numbers: [21, 33, 39] },
      { hours: [0, 1, 2, 3, 4, 5], numbers: [3, 9, 27, 33] }
    ];

    const preference = timePreferences.find(p => p.hours.includes(hour));
    return preference?.numbers.includes(num) ? 10 : 0;
  }

  private getDayBonus(num: number, dayOfWeek: number): number {
    // 요일별 선호 번호
    const dayPreferences = {
      0: [7, 14, 21, 28, 35], // 일요일 - 휴식
      1: [1, 8, 15, 22, 29],  // 월요일 - 시작
      2: [2, 9, 16, 23, 30],  // 화요일 - 활력
      3: [3, 10, 17, 24, 31], // 수요일 - 중간점
      4: [4, 11, 18, 25, 32], // 목요일 - 추진력
      5: [5, 12, 19, 26, 33], // 금요일 - 성취
      6: [6, 13, 20, 27, 34]  // 토요일 - 자유
    };

    const dayNums = dayPreferences[dayOfWeek as keyof typeof dayPreferences];
    return dayNums.includes(num) ? 8 : 0;
  }

  private getPreferenceBonus(num: number, preferences: IntuitiveOptions): number {
    let bonus = 0;

    if (preferences.favoriteNumbers?.includes(num)) {
      bonus += 20;
    }

    if (preferences.luckyColor) {
      const colorNumbers = this.getColorNumbers(preferences.luckyColor);
      if (colorNumbers.includes(num)) {
        bonus += 15;
      }
    }

    if (preferences.mood) {
      const moodNumbers = this.getMoodNumbers(preferences.mood);
      if (moodNumbers.includes(num)) {
        bonus += 12;
      }
    }

    return bonus;
  }

  private getHistoryPenalty(num: number): number {
    let penalty = 0;
    const recentGenerations = this.generationHistory.slice(-10);

    recentGenerations.forEach((generation, index) => {
      if (generation.includes(num)) {
        // 최근일수록 높은 페널티
        penalty += (10 - index) * 2;
      }
    });

    return penalty;
  }

  private generateSeedBasedNumbers(seed: number, count: number): number[] {
    const numbers: number[] = [];
    let currentSeed = seed;

    for (let i = 0; i < count; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const num = Math.floor((currentSeed / 233280) * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    return numbers;
  }

  private ensureBalancedDistribution(candidates: Set<number>): void {
    const candidateArray = Array.from(candidates);
    
    // 범위별 분포 확인
    const ranges = [
      { min: 1, max: 15, current: 0, target: 2 },
      { min: 16, max: 30, current: 0, target: 2 },
      { min: 31, max: 45, current: 0, target: 2 }
    ];

    candidateArray.forEach(num => {
      ranges.forEach(range => {
        if (num >= range.min && num <= range.max) {
          range.current++;
        }
      });
    });

    // 부족한 범위에 번호 추가
    ranges.forEach(range => {
      if (range.current < range.target) {
        const needed = range.target - range.current;
        for (let i = 0; i < needed; i++) {
          const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          candidates.add(num);
        }
      }
    });
  }

  getDescription(): string {
    return "직관과 개인적 선호를 바탕으로 한 번호 생성 방식입니다. 사용자의 기분, 선호 색깔, 시간대 등을 고려하여 심리적으로 편안한 번호를 선택합니다.";
  }

  getReasoning(numbers: number[], options: IntuitiveOptions = {}): string {
    const reasons: string[] = [];

    if (options.mood) {
      reasons.push(`${options.mood} 기분 상태를 반영`);
    }

    if (options.luckyColor) {
      reasons.push(`${options.luckyColor} 색깔의 에너지 적용`);
    }

    if (options.intuitionMode) {
      const modeDescriptions = {
        random: '완전한 직감적 선택',
        guided: '시간과 상황을 고려한 가이드',
        systematic: '체계적 분포 기반 선택',
        balanced: '직감과 논리의 균형'
      };
      reasons.push(modeDescriptions[options.intuitionMode]);
    }

    if (options.timeInfluence) {
      reasons.push('현재 시간대의 에너지 반영');
    }

    if (options.symbols?.length) {
      reasons.push(`${options.symbols.join(', ')} 심볼의 의미 적용`);
    }

    if (options.favoriteNumbers?.length) {
      reasons.push('개인 선호 번호 우선 고려');
    }

    if (reasons.length === 0) {
      reasons.push('순수한 직감과 현재 순간의 에너지를 바탕으로 선택');
    }

    return reasons.join(', ');
  }

  clearHistory(): void {
    this.generationHistory = [];
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('intuitive-generator-history');
      }
    } catch (error) {
      console.warn('Failed to clear intuitive generator history:', error);
    }
  }

  getHistory(): number[][] {
    return [...this.generationHistory];
  }

  getAvailableOptions(): {
    colors: string[];
    moods: string[];
    modes: string[];
    symbols: string[];
    weather: string[];
  } {
    return {
      colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
      moods: ['optimistic', 'cautious', 'adventurous', 'balanced', 'confident'],
      modes: ['random', 'guided', 'balanced', 'systematic'],
      symbols: ['circle', 'triangle', 'square', 'star', 'heart'],
      weather: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']
    };
  }
}