/**
 * 패턴 조합 기반 번호 생성기
 * 수학적 패턴과 조합론을 활용한 체계적 번호 생성
 * 피보나치, 소수, 등차수열 등 다양한 수학적 패턴 활용
 */

export interface PatternOptions {
  useFibonacci?: boolean;     // 피보나치 수열 사용
  usePrimes?: boolean;        // 소수 사용  
  useArithmetic?: boolean;    // 등차수열 사용
  useGeometric?: boolean;     // 등비수열 사용
  useSquares?: boolean;       // 완전제곱수 사용
  useDigitalRoot?: boolean;   // 디지털 루트 사용
}

export interface MathPattern {
  name: string;
  numbers: number[];
  description: string;
}

export class PatternGenerator {
  private patterns: Map<string, MathPattern>;

  constructor() {
    this.patterns = new Map();
    this.initializePatterns();
  }

  /**
   * 패턴 기반 로또 번호 생성
   */
  generateNumbers(options: PatternOptions = {}): number[] {
    const {
      useFibonacci = true,
      usePrimes = true,
      useArithmetic = true,
      useGeometric = false,
      useSquares = true,
      useDigitalRoot = false
    } = options;

    const selectedNumbers = new Set<number>();
    const patternContributions: string[] = [];

    // 1. 피보나치 수열 기반 번호
    if (useFibonacci && selectedNumbers.size < 6) {
      const fibNumbers = this.selectFromPattern('fibonacci', 2);
      fibNumbers.forEach(num => selectedNumbers.add(num));
      if (fibNumbers.length > 0) patternContributions.push('피보나치');
    }

    // 2. 소수 기반 번호
    if (usePrimes && selectedNumbers.size < 6) {
      const primeNumbers = this.selectFromPattern('primes', 2);
      primeNumbers.forEach(num => selectedNumbers.add(num));
      if (primeNumbers.length > 0) patternContributions.push('소수');
    }

    // 3. 등차수열 기반 번호
    if (useArithmetic && selectedNumbers.size < 6) {
      const arithmeticNumbers = this.generateArithmeticSequence();
      arithmeticNumbers.slice(0, 2).forEach(num => selectedNumbers.add(num));
      if (arithmeticNumbers.length > 0) patternContributions.push('등차수열');
    }

    // 4. 등비수열 기반 번호
    if (useGeometric && selectedNumbers.size < 6) {
      const geometricNumbers = this.generateGeometricSequence();
      geometricNumbers.forEach(num => selectedNumbers.add(num));
      if (geometricNumbers.length > 0) patternContributions.push('등비수열');
    }

    // 5. 완전제곱수 기반 번호
    if (useSquares && selectedNumbers.size < 6) {
      const squareNumbers = this.selectFromPattern('squares', 1);
      squareNumbers.forEach(num => selectedNumbers.add(num));
      if (squareNumbers.length > 0) patternContributions.push('완전제곱수');
    }

    // 6. 디지털 루트 기반 번호
    if (useDigitalRoot && selectedNumbers.size < 6) {
      const digitalRootNumbers = this.generateDigitalRootNumbers();
      digitalRootNumbers.forEach(num => selectedNumbers.add(num));
      if (digitalRootNumbers.length > 0) patternContributions.push('디지털루트');
    }

    // 7. 부족한 번호는 조화평균 기반으로 채움
    while (selectedNumbers.size < 6) {
      const harmonicNumber = this.generateHarmonicNumber(selectedNumbers);
      if (harmonicNumber >= 1 && harmonicNumber <= 45 && !selectedNumbers.has(harmonicNumber)) {
        selectedNumbers.add(harmonicNumber);
        patternContributions.push('조화평균');
      } else {
        // 조화평균으로도 채울 수 없으면 패턴 기반 랜덤
        const randomPattern = this.generatePatternBasedRandom(selectedNumbers);
        selectedNumbers.add(randomPattern);
        patternContributions.push('패턴랜덤');
      }
    }

    // 사용된 패턴 저장 (추천 이유 생성용)
    this.lastUsedPatterns = [...new Set(patternContributions)];

    return Array.from(selectedNumbers).sort((a, b) => a - b);
  }

  private lastUsedPatterns: string[] = [];

  /**
   * 특정 패턴에서 번호 선택
   */
  private selectFromPattern(patternName: string, maxCount: number): number[] {
    const pattern = this.patterns.get(patternName);
    if (!pattern) return [];

    // 랜덤하게 선택하되, 45 이하만 필터링
    const validNumbers = pattern.numbers.filter(num => num <= 45);
    const shuffled = [...validNumbers].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, maxCount);
  }

  /**
   * 등차수열 생성 (현재 날짜 기반)
   */
  private generateArithmeticSequence(): number[] {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    // 첫째 항을 날짜 기반으로, 공차를 월 기반으로 설정
    const firstTerm = Math.max(1, day % 10 || 1);
    const commonDiff = Math.max(1, month % 5 || 1);
    
    const sequence: number[] = [];
    for (let i = 0; i < 10; i++) {
      const term = firstTerm + (commonDiff * i);
      if (term <= 45) {
        sequence.push(term);
      }
    }
    
    return sequence;
  }

  /**
   * 등비수열 생성
   */
  private generateGeometricSequence(): number[] {
    const firstTerm = 2;
    const ratio = 1.5;
    
    const sequence: number[] = [];
    let current = firstTerm;
    
    while (current <= 45 && sequence.length < 5) {
      sequence.push(Math.floor(current));
      current *= ratio;
    }
    
    return sequence;
  }

  /**
   * 디지털 루트 기반 번호 생성
   * 디지털 루트: 각 자릿수를 더해서 한 자리가 될 때까지 반복
   */
  private generateDigitalRootNumbers(): number[] {
    const today = new Date();
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    const targetRoot = (seed % 9) + 1; // 1-9 범위
    
    const numbers: number[] = [];
    for (let i = 1; i <= 45; i++) {
      if (this.calculateDigitalRoot(i) === targetRoot) {
        numbers.push(i);
      }
    }
    
    // 최대 2개까지 선택
    return numbers.slice(0, 2);
  }

  /**
   * 디지털 루트 계산
   */
  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  }

  /**
   * 조화평균 기반 번호 생성
   */
  private generateHarmonicNumber(existingNumbers: Set<number>): number {
    if (existingNumbers.size === 0) return 1;
    
    const numbers = Array.from(existingNumbers);
    const harmonicMean = numbers.length / numbers.reduce((sum, num) => sum + (1 / num), 0);
    
    return Math.round(harmonicMean);
  }

  /**
   * 패턴 기반 랜덤 번호 생성
   */
  private generatePatternBasedRandom(existingNumbers: Set<number>): number {
    const excluded = Array.from(existingNumbers);
    let attempts = 0;
    
    while (attempts < 100) {
      // 기존 번호들의 평균을 기준으로 정규분포 근사
      const avg = excluded.length > 0 
        ? excluded.reduce((sum, num) => sum + num, 0) / excluded.length 
        : 23;
      
      const stdDev = 10;
      const random = this.normalRandom() * stdDev + avg;
      const candidate = Math.max(1, Math.min(45, Math.round(random)));
      
      if (!existingNumbers.has(candidate)) {
        return candidate;
      }
      attempts++;
    }
    
    // 최후의 수단: 단순 랜덤
    let num;
    do {
      num = Math.floor(Math.random() * 45) + 1;
    } while (existingNumbers.has(num));
    
    return num;
  }

  /**
   * 정규분포 근사 랜덤 생성 (Box-Muller 변환)
   */
  private normalRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // 0 제외
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * 수학적 패턴들 초기화
   */
  private initializePatterns(): void {
    // 피보나치 수열 (45 이하)
    const fibonacci = this.generateFibonacci(45);
    this.patterns.set('fibonacci', {
      name: '피보나치 수열',
      numbers: fibonacci,
      description: '자연계에서 발견되는 황금비율 기반 수열'
    });

    // 소수 (45 이하)
    const primes = this.generatePrimes(45);
    this.patterns.set('primes', {
      name: '소수',
      numbers: primes,
      description: '1과 자기 자신으로만 나누어지는 수'
    });

    // 완전제곱수 (45 이하)
    const squares = this.generateSquares(45);
    this.patterns.set('squares', {
      name: '완전제곱수',
      numbers: squares,
      description: '어떤 정수의 제곱이 되는 수'
    });

    // 삼각수 (45 이하)
    const triangular = this.generateTriangular(45);
    this.patterns.set('triangular', {
      name: '삼각수',
      numbers: triangular,
      description: '점을 삼각형 모양으로 배열할 때의 총 점의 개수'
    });
  }

  /**
   * 피보나치 수열 생성
   */
  private generateFibonacci(max: number): number[] {
    const fib = [1, 1];
    while (true) {
      const next = fib[fib.length - 1] + fib[fib.length - 2];
      if (next > max) break;
      fib.push(next);
    }
    return fib;
  }

  /**
   * 소수 생성 (에라토스테네스의 체)
   */
  private generatePrimes(max: number): number[] {
    const sieve = new Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;
    
    for (let i = 2; i * i <= max; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= max; j += i) {
          sieve[j] = false;
        }
      }
    }
    
    return sieve.map((isPrime, num) => isPrime ? num : -1)
               .filter(num => num > 0);
  }

  /**
   * 완전제곱수 생성
   */
  private generateSquares(max: number): number[] {
    const squares: number[] = [];
    for (let i = 1; i * i <= max; i++) {
      squares.push(i * i);
    }
    return squares;
  }

  /**
   * 삼각수 생성
   */
  private generateTriangular(max: number): number[] {
    const triangular: number[] = [];
    for (let n = 1; ; n++) {
      const triangularNum = (n * (n + 1)) / 2;
      if (triangularNum > max) break;
      triangular.push(triangularNum);
    }
    return triangular;
  }

  /**
   * 등록된 패턴 목록 반환
   */
  getPatterns(): MathPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * 생성 알고리즘 설명 반환
   */
  getDescription(): string {
    return '수학적 패턴과 조합론을 활용한 체계적 번호 생성 방식입니다. 피보나치 수열, 소수, 등차수열, 완전제곱수 등 다양한 수학적 규칙을 조합합니다.';
  }

  /**
   * 패턴 기반 추천 이유 생성
   */
  getRecommendationReason(): string {
    if (this.lastUsedPatterns.length === 0) {
      return '다양한 수학적 패턴을 조합하여 선택된 번호';
    }
    
    const patternDescriptions = {
      '피보나치': '자연의 황금비율',
      '소수': '수학의 기본 단위',
      '등차수열': '규칙적인 증가 패턴',
      '등비수열': '기하급수적 성장 패턴',
      '완전제곱수': '완전한 조화의 수',
      '디지털루트': '수비학적 의미',
      '조화평균': '균형과 조화',
      '패턴랜덤': '패턴 기반 확률'
    };

    const reasons = this.lastUsedPatterns.map(pattern => 
      patternDescriptions[pattern as keyof typeof patternDescriptions] || pattern
    );

    return `${reasons.join(', ')} 등의 수학적 원리 적용`;
  }

  /**
   * 특정 번호의 수학적 속성 분석
   */
  analyzeNumber(number: number): string[] {
    const properties: string[] = [];
    
    if (this.patterns.get('fibonacci')?.numbers.includes(number)) {
      properties.push('피보나치 수');
    }
    if (this.patterns.get('primes')?.numbers.includes(number)) {
      properties.push('소수');
    }
    if (this.patterns.get('squares')?.numbers.includes(number)) {
      properties.push('완전제곱수');
    }
    if (this.patterns.get('triangular')?.numbers.includes(number)) {
      properties.push('삼각수');
    }
    
    const digitalRoot = this.calculateDigitalRoot(number);
    properties.push(`디지털 루트: ${digitalRoot}`);
    
    if (number % 2 === 0) {
      properties.push('짝수');
    } else {
      properties.push('홀수');
    }
    
    return properties;
  }
}