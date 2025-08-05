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
  
  // 1~45 범위 검증 및 수정
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
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
  
  // 1~45 범위 검증 및 수정
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
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
  
  // 1~45 범위 검증 및 수정
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '📈 상승세',
    description: '최근 출현이 늘고 있는 상승 트렌드 번호들!'
  };
}

/**
 * 4. ⚖️ 균형 조합: 실제 로또 데이터 기반 홀짝, 구간별 균형 분석
 */
export function generateBalanced(recentResults: LotteryResult[]): GeneratedNumbers {
  // 실제 데이터에서 구간별, 홀짝 분포 분석
  const rangeStats = { low: 0, mid: 0, high: 0 }; // 1-15, 16-30, 31-45
  const parityStats = { odd: 0, even: 0 };
  
  recentResults.forEach(result => {
    result.numbers.forEach(num => {
      // 구간 분석
      if (num <= 15) rangeStats.low++;
      else if (num <= 30) rangeStats.mid++;
      else rangeStats.high++;
      
      // 홀짝 분석
      if (num % 2 === 1) parityStats.odd++;
      else parityStats.even++;
    });
  });
  
  // 실제 데이터 기반 가중치 계산
  const totalNums = recentResults.length * 6;
  const rangeWeights = {
    low: rangeStats.low / totalNums,
    mid: rangeStats.mid / totalNums,
    high: rangeStats.high / totalNums
  };
  
  const numbers: number[] = [];
  const ranges = [
    { min: 1, max: 15, weight: rangeWeights.low },
    { min: 16, max: 30, weight: rangeWeights.mid },
    { min: 31, max: 45, weight: rangeWeights.high }
  ];
  
  // 각 구간에서 가중치에 따라 번호 선택
  ranges.forEach(range => {
    const targetCount = Math.max(1, Math.round(range.weight * 6));
    const rangeNumbers = [];
    for (let i = range.min; i <= range.max; i++) {
      rangeNumbers.push(i);
    }
    
    const selected = rangeNumbers.sort(() => 0.5 - Math.random()).slice(0, targetCount);
    numbers.push(...selected);
  });
  
  // 6개 맞추기 (부족하면 추가, 초과하면 제거)
  while (numbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }
  numbers.splice(6); // 6개로 제한
  
  // 1~45 범위 검증 및 수정
  const validNumbers = numbers.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  // 실제 데이터 기반 홀짝 균형 정보 표시
  const currentOdds = validNumbers.filter(n => n % 2 === 1).length;
  const actualOddRatio = Math.round((parityStats.odd / totalNums) * 100);
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '⚖️ 균형 조합',
    description: `실제 데이터 균형: 홀${currentOdds}:짝${6-currentOdds} (과거 홀수 ${actualOddRatio}%)`
  };
}

/**
 * 5. 🎯 개인 특화: 음력 날짜와 실제 로또 패턴 결합
 */
export function generatePersonal(lunarDay: number, lunarMonth: number, recentResults: LotteryResult[]): GeneratedNumbers {
  // 실제 로또 데이터에서 개인 번호들의 출현 패턴 분석
  const frequency: Record<number, number> = {};
  
  recentResults.forEach(result => {
    result.numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
  });
  
  // 음력 기반 개인 번호들
  const personalNums = [
    lunarDay <= 45 ? lunarDay : lunarDay % 45 + 1,
    lunarMonth <= 45 ? lunarMonth : lunarMonth % 45 + 1,
    (lunarDay + lunarMonth) % 45 + 1,
    (lunarDay * 2) % 45 + 1,
    (lunarMonth * 3) % 45 + 1,
    (lunarDay + lunarMonth + 7) % 45 + 1
  ];
  
  // 개인 번호들을 실제 출현 빈도로 가중치 부여
  const weightedPersonalNums = personalNums.map(num => ({
    number: num,
    weight: (frequency[num] || 0) + Math.random() // 실제 빈도 + 랜덤 요소
  }));
  
  // 가중치 기반 정렬 후 상위 3개 선택
  const topPersonalNums = weightedPersonalNums
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(item => item.number);
  
  // 나머지 3개는 개인 번호와 관련된 패턴에서 선택
  const relatedNums: number[] = [];
  const personalSum = lunarDay + lunarMonth;
  
  // 합계와 관련된 번호들 찾기
  for (let i = 1; i <= 45; i++) {
    if (i % personalSum === lunarDay % 10 || i % personalSum === lunarMonth % 10) {
      relatedNums.push(i);
    }
  }
  
  // 관련 번호들도 실제 빈도로 가중치 부여
  const weightedRelatedNums = relatedNums
    .filter(num => !topPersonalNums.includes(num))
    .map(num => ({
      number: num,
      weight: (frequency[num] || 0) + Math.random()
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(item => item.number);
  
  const finalNumbers = [...topPersonalNums, ...weightedRelatedNums];
  
  // 6개 미만이면 고빈도 번호로 채우기
  if (finalNumbers.length < 6) {
    const highFreqNums = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([num]) => parseInt(num))
      .filter(num => !finalNumbers.includes(num));
    
    while (finalNumbers.length < 6 && highFreqNums.length > 0) {
      finalNumbers.push(highFreqNums.shift()!);
    }
  }
  
  // 1~45 범위 검증 및 수정
  const validNumbers = finalNumbers.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '🎯 개인 특화',
    description: `음력 ${lunarMonth}월${lunarDay}일 + 실제 출현패턴 결합!`
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
  
  // 1~45 범위 검증 및 수정
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '🗓️ 요일 분석',
    description: '토요일 추첨 특성을 반영한 요일 맞춤 번호!'
  };
}

/**
 * 7. 📅 계절 가중: 실제 월별 당첨 패턴 분석
 */
export function generateSeasonal(recentResults: LotteryResult[]): GeneratedNumbers {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // 실제 로또 데이터에서 월별 번호 패턴 분석
  const monthlyFreq: Record<number, number> = {};
  
  recentResults.forEach(result => {
    const drawDate = new Date(result.date);
    const drawMonth = drawDate.getMonth() + 1;
    
    // 현재 월과 같은 월의 당첨번호만 분석
    if (drawMonth === currentMonth) {
      result.numbers.forEach(num => {
        monthlyFreq[num] = (monthlyFreq[num] || 0) + 1;
      });
    }
  });
  
  // 현재 월 데이터가 충분하지 않으면 같은 계절 데이터 활용
  if (Object.keys(monthlyFreq).length < 20) {
    const currentSeason = Math.ceil(currentMonth / 3); // 1:겨울, 2:봄, 3:여름, 4:가을
    
    recentResults.forEach(result => {
      const drawDate = new Date(result.date);
      const drawMonth = drawDate.getMonth() + 1;
      const drawSeason = Math.ceil(drawMonth / 3);
      
      if (drawSeason === currentSeason) {
        result.numbers.forEach(num => {
          monthlyFreq[num] = (monthlyFreq[num] || 0) + 0.5; // 같은 계절은 0.5 가중치
        });
      }
    });
  }
  
  // 계절별 특성 가중치 추가
  const seasonalWeights: Record<number, number> = {};
  const seasons = ['겨울', '봄', '여름', '가을'];
  const currentSeasonIndex = Math.ceil(currentMonth / 3) - 1;
  const currentSeasonName = seasons[currentSeasonIndex];
  
  for (let i = 1; i <= 45; i++) {
    seasonalWeights[i] = monthlyFreq[i] || 0;
    
    // 계절별 추가 가중치
    if (currentMonth >= 3 && currentMonth <= 5) {
      // 봄: 낮은 번호 선호
      if (i <= 15) seasonalWeights[i] += 1;
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      // 여름: 중간 번호 선호
      if (i >= 16 && i <= 30) seasonalWeights[i] += 1;
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      // 가을: 높은 번호 선호
      if (i >= 31) seasonalWeights[i] += 1;
    } else {
      // 겨울: 전체 균등 + 끝자리 0, 5 선호
      if (i % 10 === 0 || i % 10 === 5) seasonalWeights[i] += 0.5;
    }
  }
  
  // 가중치 기반 번호 선택
  const seasonalNumbers = Object.entries(seasonalWeights)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 12)
    .map(([num]) => parseInt(num));
  
  const selected = seasonalNumbers.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  // 1~45 범위 검증 및 수정
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '📅 계절 가중',
    description: `${currentSeasonName} ${currentMonth}월 실제 당첨패턴 반영!`
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
  
  // 1~45 범위 검증 및 수정 (0번 방지)
  const validNumbers = selected.filter(n => n >= 1 && n <= 45);
  while (validNumbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!validNumbers.includes(randomNum)) {
      validNumbers.push(randomNum);
    }
  }
  
  return {
    numbers: validNumbers.slice(0, 6).sort((a, b) => a - b),
    method: '🔄 역발상',
    description: '남들이 안 뽑는 번호로 독점 당첨 노리기!'
  };
}