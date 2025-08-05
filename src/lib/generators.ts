// 8가지 심리적으로 매력적인 로또 번호 생성 알고리즘

import type { LotteryResult } from './lottery-api';

export interface GeneratedNumbers {
  numbers: number[];
  method: string;
  description: string;
}

/**
 * 1. 🔥 핫넘버: 최근 N회차에서 가장 많이 나온 번호들
 */
export function generateHot(recentResults: LotteryResult[]): GeneratedNumbers {
  const frequency: Record<number, number> = {};
  
  // 최근 10회차만 집중 분석
  const recentData = recentResults.slice(0, 10);
  
  recentData.forEach(result => {
    result.numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
  });
  
  // 빈도순 정렬 후 상위 8개 중 6개 선택
  const hotNumbers = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([num]) => parseInt(num));
  
  const selected = hotNumbers.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '🔥 핫넘버',
    description: '요즘 계속 나오는 뜨거운 번호들 - 대세를 타라!'
  };
}

/**
 * 2. ❄️ 콜드넘버: 오랫동안 안 나온 번호들의 "터질 때가 됐다" 심리
 */
export function generateCold(recentResults: LotteryResult[]): GeneratedNumbers {
  const lastSeen: Record<number, number> = {};
  
  // 모든 번호의 마지막 출현 회차 찾기
  for (let i = 1; i <= 45; i++) {
    lastSeen[i] = 999; // 기본값: 매우 오래됨
  }
  
  recentResults.forEach((result, index) => {
    result.numbers.forEach(num => {
      if (lastSeen[num] === 999) {
        lastSeen[num] = index;
      }
    });
  });
  
  // 가장 오래된 번호들 선택
  const coldNumbers = Object.entries(lastSeen)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 12)
    .map(([num]) => parseInt(num));
  
  const selected = coldNumbers.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '❄️ 콜드넘버',
    description: '오랫동안 안 나온 번호들 - 이제 터질 차례!'
  };
}

/**
 * 3. 📈 상승세: 최근 출현 빈도가 증가하는 트렌드 번호들
 */
export function generateTrend(recentResults: LotteryResult[]): GeneratedNumbers {
  const recentFreq: Record<number, number> = {};
  const olderFreq: Record<number, number> = {};
  
  // 최근 5회차와 그 이전 5회차 비교
  const recent = recentResults.slice(0, 5);
  const older = recentResults.slice(5, 10);
  
  recent.forEach(result => {
    result.numbers.forEach(num => {
      recentFreq[num] = (recentFreq[num] || 0) + 1;
    });
  });
  
  older.forEach(result => {
    result.numbers.forEach(num => {
      olderFreq[num] = (olderFreq[num] || 0) + 1;
    });
  });
  
  // 상승 트렌드 계산
  const trendNumbers: { num: number; trend: number }[] = [];
  
  for (let i = 1; i <= 45; i++) {
    const recentCount = recentFreq[i] || 0;
    const olderCount = olderFreq[i] || 0;
    const trend = recentCount - olderCount;
    
    if (trend > 0) {
      trendNumbers.push({ num: i, trend });
    }
  }
  
  // 상승세 상위 번호들 중 선택
  const topTrend = trendNumbers
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 10)
    .map(item => item.num);
  
  const selected = topTrend.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '📈 상승세',
    description: '최근 출현이 늘고 있는 상승 트렌드 번호들!'
  };
}

/**
 * 4. ⚖️ 균형 조합: 홀짝, 높낮이, 구간별 황금비율 적용
 */
export function generateBalanced(): GeneratedNumbers {
  const numbers: number[] = [];
  
  // 1-15, 16-30, 31-45 구간에서 각각 2개씩
  const ranges = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 }
  ];
  
  ranges.forEach(range => {
    const rangeNumbers = [];
    for (let i = range.min; i <= range.max; i++) {
      rangeNumbers.push(i);
    }
    
    const selected = rangeNumbers.sort(() => 0.5 - Math.random()).slice(0, 2);
    numbers.push(...selected);
  });
  
  // 홀짝 균형 조정 (3:3 목표)
  const odds = numbers.filter(n => n % 2 === 1);
  const evens = numbers.filter(n => n % 2 === 0);
  
  if (odds.length > 3) {
    // 홀수가 많으면 짝수로 교체
    const replaceIndex = numbers.findIndex(n => n % 2 === 1);
    numbers[replaceIndex] = numbers[replaceIndex] + 1 <= 45 ? numbers[replaceIndex] + 1 : numbers[replaceIndex] - 1;
  }
  
  return {
    numbers: numbers.sort((a, b) => a - b),
    method: '⚖️ 균형 조합',
    description: '홀짝, 구간별 황금비율로 안정감 MAX!'
  };
}

/**
 * 5. 🎯 개인 특화: 음력 날짜 기반 개인 맞춤 번호
 */
export function generatePersonal(lunarDay: number, lunarMonth: number): GeneratedNumbers {
  const numbers: number[] = [];
  
  // 기본 개인 번호들
  const personalNums = [
    lunarDay <= 45 ? lunarDay : lunarDay % 45 + 1,
    lunarMonth <= 45 ? lunarMonth : lunarMonth % 45 + 1,
    (lunarDay + lunarMonth) % 45 + 1,
    (lunarDay * 2) % 45 + 1,
    (lunarMonth * 3) % 45 + 1,
    (lunarDay + lunarMonth + 7) % 45 + 1
  ];
  
  // 중복 제거 후 6개 확보
  const uniqueNums = [...new Set(personalNums)];
  
  while (uniqueNums.length < 6) {
    const newNum = Math.floor(Math.random() * 45) + 1;
    if (!uniqueNums.includes(newNum)) {
      uniqueNums.push(newNum);
    }
  }
  
  numbers.push(...uniqueNums.slice(0, 6));
  
  return {
    numbers: numbers.sort((a, b) => a - b),
    method: '🎯 개인 특화',
    description: '당신만의 음력 생일 에너지가 담긴 특별한 번호!'
  };
}

/**
 * 6. 🗓️ 요일 분석: 토요일 추첨 패턴 분석
 */
export function generateWeekday(recentResults: LotteryResult[]): GeneratedNumbers {
  const weekdayFreq: Record<number, number> = {};
  
  // 토요일에 자주 나오는 번호 패턴 분석
  recentResults.forEach(result => {
    result.numbers.forEach(num => {
      // 토요일 특성: 끝자리 6, 짝수 선호 가정
      if (num % 10 === 6 || num % 2 === 0) {
        weekdayFreq[num] = (weekdayFreq[num] || 0) + 2;
      } else {
        weekdayFreq[num] = (weekdayFreq[num] || 0) + 1;
      }
    });
  });
  
  const weekdayNumbers = Object.entries(weekdayFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([num]) => parseInt(num));
  
  const selected = weekdayNumbers.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '🗓️ 요일 분석',
    description: '토요일 추첨 특성을 반영한 요일 맞춤 번호!'
  };
}

/**
 * 7. 📅 계절 가중: 계절별 선호 번호 패턴
 */
export function generateSeasonal(): GeneratedNumbers {
  const now = new Date();
  const month = now.getMonth() + 1;
  
  // 계절별 선호 번호 패턴
  let seasonalNums: number[] = [];
  
  if (month >= 3 && month <= 5) {
    // 봄: 1-15 구간 선호
    seasonalNums = Array.from({length: 15}, (_, i) => i + 1);
  } else if (month >= 6 && month <= 8) {
    // 여름: 16-30 구간 선호
    seasonalNums = Array.from({length: 15}, (_, i) => i + 16);
  } else if (month >= 9 && month <= 11) {
    // 가을: 31-45 구간 선호
    seasonalNums = Array.from({length: 15}, (_, i) => i + 31);
  } else {
    // 겨울: 전체에서 균등
    seasonalNums = Array.from({length: 45}, (_, i) => i + 1);
  }
  
  const selected = seasonalNums.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '📅 계절 가중',
    description: '현재 계절의 특별한 에너지를 담은 번호!'
  };
}

/**
 * 8. 🔄 역발상: 남들과 다른 선택으로 독점 확률 UP
 */
export function generateContrarian(recentResults: LotteryResult[]): GeneratedNumbers {
  const frequency: Record<number, number> = {};
  
  // 빈도 계산
  recentResults.forEach(result => {
    result.numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
  });
  
  // 빈도가 낮은 번호들 (역발상)
  const contrarian = Object.entries(frequency)
    .sort(([,a], [,b]) => a - b) // 낮은 빈도순
    .slice(0, 12)
    .map(([num]) => parseInt(num));
  
  // 아예 안 나온 번호들도 추가
  const unused = [];
  for (let i = 1; i <= 45; i++) {
    if (!frequency[i]) {
      unused.push(i);
    }
  }
  
  const allContrarian = [...contrarian, ...unused];
  const selected = allContrarian.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return {
    numbers: selected.sort((a, b) => a - b),
    method: '🔄 역발상',
    description: '남들이 안 뽑는 번호로 독점 당첨 노리기!'
  };
}