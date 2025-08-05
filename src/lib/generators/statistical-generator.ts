/**
 * 통계 분석 기반 번호 생성기
 * 과거 로또 당첨 번호의 통계적 패턴을 분석하여 번호 생성
 * 빈도 분석, 연속성 분석, 구간 분석 등을 활용
 */

export interface StatisticalOptions {
  useFrequency?: boolean;    // 빈도 분석 사용
  useConsecutive?: boolean;  // 연속성 분석 사용
  useRangeBalance?: boolean; // 구간 균형 분석 사용
  useEvenOdd?: boolean;      // 홀짝 균형 분석 사용
  excludeRecent?: boolean;   // 최근 당첨번호 제외
}

export interface LottoStatistics {
  frequency: Record<number, number>;     // 각 번호별 출현 빈도
  consecutiveCount: Record<number, number>; // 연속 출현 횟수
  rangeDistribution: {                   // 구간별 분포
    low: number[];    // 1-15
    mid: number[];    // 16-30
    high: number[];   // 31-45
  };
  evenOddRatio: { even: number; odd: number }; // 홀짝 비율
  lastDrawn: number[]; // 최근 당첨 번호들
}

export class StatisticalGenerator {
  private statistics: LottoStatistics;

  constructor() {
    // 실제 구현에서는 외부 API나 데이터베이스에서 통계 데이터를 가져와야 함
    // 여기서는 시뮬레이션된 통계 데이터 사용
    this.statistics = this.initializeStatistics();
  }

  /**
   * 통계 분석 기반 로또 번호 생성
   */
  generateNumbers(options: StatisticalOptions = {}): number[] {
    const {
      useFrequency = true,
      useConsecutive = true,
      useRangeBalance = true,
      useEvenOdd = true,
      excludeRecent = true
    } = options;

    const candidates = new Map<number, number>(); // 번호 -> 점수

    // 1-45 모든 번호에 대해 기본 점수 할당
    for (let i = 1; i <= 45; i++) {
      candidates.set(i, 0);
    }

    // 1. 빈도 분석 기반 점수
    if (useFrequency) {
      this.applyFrequencyScoring(candidates);
    }

    // 2. 연속성 분석 기반 점수
    if (useConsecutive) {
      this.applyConsecutiveScoring(candidates);
    }

    // 3. 구간 균형 분석
    if (useRangeBalance) {
      this.applyRangeBalancing(candidates);
    }

    // 4. 홀짝 균형 분석
    if (useEvenOdd) {
      this.applyEvenOddBalancing(candidates);
    }

    // 5. 최근 당첨번호 제외
    if (excludeRecent) {
      this.excludeRecentNumbers(candidates);
    }

    // 점수 기반으로 번호 선택
    return this.selectTopNumbers(candidates, 6);
  }

  /**
   * 빈도 분석을 통한 점수 할당
   * 출현 빈도가 평균보다 낮은 번호에 높은 점수 부여
   */
  private applyFrequencyScoring(candidates: Map<number, number>): void {
    const frequencies = Object.values(this.statistics.frequency);
    const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;

    for (let i = 1; i <= 45; i++) {
      const frequency = this.statistics.frequency[i] || 0;
      const deviation = avgFrequency - frequency;
      
      // 평균보다 적게 나온 번호일수록 높은 점수
      if (deviation > 0) {
        const score = Math.min(10, deviation * 2);
        candidates.set(i, candidates.get(i)! + score);
      }
    }
  }

  /**
   * 연속성 분석을 통한 점수 할당
   * 최근에 연속으로 나오지 않은 번호에 높은 점수 부여
   */
  private applyConsecutiveScoring(candidates: Map<number, number>): void {
    for (let i = 1; i <= 45; i++) {
      const consecutiveCount = this.statistics.consecutiveCount[i] || 0;
      
      // 연속으로 나오지 않은 번호일수록 높은 점수
      if (consecutiveCount === 0) {
        candidates.set(i, candidates.get(i)! + 5);
      } else if (consecutiveCount <= 2) {
        candidates.set(i, candidates.get(i)! + 3);
      }
    }
  }

  /**
   * 구간 균형을 위한 점수 조정
   * 각 구간(저/중/고)에서 균형있게 선택되도록 조정
   */
  private applyRangeBalancing(candidates: Map<number, number>): void {
    const { low, mid, high } = this.statistics.rangeDistribution;
    
    // 각 구간에서 상위 번호들에 보너스 점수
    [...low, ...mid, ...high]
      .sort((a, b) => (candidates.get(b) || 0) - (candidates.get(a) || 0))
      .slice(0, 10) // 각 구간 상위 10개
      .forEach(num => {
        candidates.set(num, candidates.get(num)! + 2);
      });
  }

  /**
   * 홀짝 균형을 위한 점수 조정
   * 홀수와 짝수가 균형있게 선택되도록 조정
   */
  private applyEvenOddBalancing(candidates: Map<number, number>): void {
    const evenNumbers: number[] = [];
    const oddNumbers: number[] = [];

    // 현재 후보들을 홀짝으로 분류
    for (let i = 1; i <= 45; i++) {
      if (i % 2 === 0) {
        evenNumbers.push(i);
      } else {
        oddNumbers.push(i);
      }
    }

    // 역사적 홀짝 비율에 따라 조정
    const { even: evenRatio, odd: oddRatio } = this.statistics.evenOddRatio;
    const totalRatio = evenRatio + oddRatio;
    
    const targetEvenCount = Math.round(6 * (evenRatio / totalRatio));
    const targetOddCount = 6 - targetEvenCount;

    // 홀수 번호들에 가중치 부여
    if (targetOddCount > targetEvenCount) {
      oddNumbers.forEach(num => {
        candidates.set(num, candidates.get(num)! + 1);
      });
    } else {
      evenNumbers.forEach(num => {
        candidates.set(num, candidates.get(num)! + 1);
      });
    }
  }

  /**
   * 최근 당첨번호 제외
   */
  private excludeRecentNumbers(candidates: Map<number, number>): void {
    this.statistics.lastDrawn.forEach(num => {
      candidates.set(num, candidates.get(num)! - 5); // 페널티 점수
    });
  }

  /**
   * 점수 기반으로 상위 번호 선택
   */
  private selectTopNumbers(candidates: Map<number, number>, count: number): number[] {
    const sorted = Array.from(candidates.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    const selected: number[] = [];
    const ranges = { low: 0, mid: 0, high: 0 };

    // 구간 균형을 맞추면서 선택
    for (const [number, score] of sorted) {
      if (selected.length >= count) break;
      
      const range = this.getNumberRange(number);
      
      // 각 구간에서 최대 3개까지만 선택
      if (ranges[range] < 3) {
        selected.push(number);
        ranges[range]++;
      }
    }

    // 부족한 번호는 나머지 후보에서 선택
    if (selected.length < count) {
      for (const [number] of sorted) {
        if (selected.length >= count) break;
        if (!selected.includes(number)) {
          selected.push(number);
        }
      }
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * 번호의 구간 판별 (low: 1-15, mid: 16-30, high: 31-45)
   */
  private getNumberRange(number: number): 'low' | 'mid' | 'high' {
    if (number <= 15) return 'low';
    if (number <= 30) return 'mid';
    return 'high';
  }

  /**
   * 통계 데이터 초기화 (실제로는 외부 데이터 소스에서 가져와야 함)
   */
  private initializeStatistics(): LottoStatistics {
    // 시뮬레이션된 빈도 데이터
    const frequency: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) {
      // 실제 로또 번호별 출현 빈도를 시뮬레이션
      frequency[i] = Math.floor(Math.random() * 50) + 30; // 30-80 범위
    }

    // 연속 출현 횟수 (0이면 최근에 나오지 않음)
    const consecutiveCount: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) {
      consecutiveCount[i] = Math.floor(Math.random() * 5); // 0-4 범위
    }

    return {
      frequency,
      consecutiveCount,
      rangeDistribution: {
        low: Array.from({ length: 15 }, (_, i) => i + 1),
        mid: Array.from({ length: 15 }, (_, i) => i + 16),
        high: Array.from({ length: 15 }, (_, i) => i + 31)
      },
      evenOddRatio: { even: 52, odd: 48 }, // 실제 통계 기반
      lastDrawn: [3, 7, 12, 24, 35, 41] // 최근 당첨 번호 예시
    };
  }

  /**
   * 현재 통계 데이터 반환
   */
  getStatistics(): LottoStatistics {
    return { ...this.statistics };
  }

  /**
   * 생성 알고리즘 설명 반환
   */
  getDescription(): string {
    return '과거 로또 당첨 번호의 통계적 패턴을 분석하여 생성하는 방식입니다. 출현 빈도, 연속성, 구간 균형, 홀짝 비율 등을 종합적으로 고려합니다.';
  }

  /**
   * 통계 기반 추천 이유 생성
   */
  getRecommendationReason(): string {
    const stats = this.getStatistics();
    const reasons: string[] = [];

    reasons.push('출현 빈도가 평균 이하인 번호 우선 선택');
    reasons.push('최근 연속 출현하지 않은 번호 포함');
    reasons.push('저/중/고 구간의 균형 있는 분포');
    
    const { even, odd } = stats.evenOddRatio;
    const total = even + odd;
    reasons.push(`홀짝 비율 ${Math.round(odd/total*100)}:${Math.round(even/total*100)} 반영`);
    
    reasons.push('최근 당첨번호 회피 전략 적용');

    return reasons.join(', ');
  }

  /**
   * 통계 데이터 업데이트 (실제 API 연동시 사용)
   */
  async updateStatistics(): Promise<void> {
    // 실제 구현에서는 로또 API나 웹 스크래핑으로 최신 데이터 수집
    console.log('통계 데이터 업데이트 중...');
    // TODO: 외부 데이터 소스 연동
  }
}