// 로또 매니아를 위한 15가지 심화 분석 라이브러리

import type { LotteryResult } from './lottery-api';

export interface AnalysisResult {
  title: string;
  data: Record<string, unknown>;
  insight: string;
  recommendation?: string;
}

/**
 * 1. 📊 연속번호 분석 - 연속된 번호들의 출현 패턴
 */
export function analyzeConsecutiveNumbers(results: LotteryResult[]): AnalysisResult {
  const consecutiveStats = {
    none: 0,        // 연속 없음
    two: 0,         // 2개 연속
    three: 0,       // 3개 연속
    fourPlus: 0     // 4개 이상 연속
  };

  const consecutivePatterns: string[] = [];

  results.forEach(result => {
    const sortedNums = [...result.numbers].sort((a, b) => a - b);
    let maxConsecutive = 1;
    const consecutiveGroups: number[][] = [];
    let currentGroup: number[] = [sortedNums[0]];

    for (let i = 1; i < sortedNums.length; i++) {
      if (sortedNums[i] === sortedNums[i-1] + 1) {
        currentGroup.push(sortedNums[i]);
      } else {
        if (currentGroup.length >= 2) {
          consecutiveGroups.push([...currentGroup]);
        }
        currentGroup = [sortedNums[i]];
      }
    }
    
    if (currentGroup.length >= 2) {
      consecutiveGroups.push(currentGroup);
    }

    maxConsecutive = Math.max(maxConsecutive, ...consecutiveGroups.map(g => g.length));

    if (consecutiveGroups.length === 0) consecutiveStats.none++;
    else if (maxConsecutive === 2) consecutiveStats.two++;
    else if (maxConsecutive === 3) consecutiveStats.three++;
    else consecutiveStats.fourPlus++;

    if (consecutiveGroups.length > 0) {
      consecutivePatterns.push(`${result.round}회: ${consecutiveGroups.map(g => g.join('-')).join(', ')}`);
    }
  });

  const total = results.length;
  const hasConsecutive = ((consecutiveStats.two + consecutiveStats.three + consecutiveStats.fourPlus) / total * 100).toFixed(1);

  return {
    title: '📊 연속번호 분석',
    data: {
      stats: consecutiveStats,
      percentage: {
        none: (consecutiveStats.none / total * 100).toFixed(1),
        two: (consecutiveStats.two / total * 100).toFixed(1),
        three: (consecutiveStats.three / total * 100).toFixed(1),
        fourPlus: (consecutiveStats.fourPlus / total * 100).toFixed(1)
      },
      recentPatterns: consecutivePatterns.slice(0, 10)
    },
    insight: `최근 ${total}회차 중 ${hasConsecutive}%에서 연속번호 출현. 2개 연속이 가장 흔함(${(consecutiveStats.two / total * 100).toFixed(1)}%).`,
    recommendation: consecutiveStats.two > consecutiveStats.none ? '2개 연속번호 포함 추천' : '연속번호 제외 추천'
  };
}

/**
 * 2. 🔢 끝자리 분석 - 각 끝자리(0-9)의 출현 빈도
 */
export function analyzeLastDigits(results: LotteryResult[]): AnalysisResult {
  const digitFreq: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) digitFreq[i] = 0;

  results.forEach(result => {
    result.numbers.forEach(num => {
      const lastDigit = num % 10;
      digitFreq[lastDigit]++;
    });
  });

  const totalNumbers = results.length * 6;
  const avgFreq = totalNumbers / 10;
  
  const hotDigits = Object.entries(digitFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([digit, freq]) => ({ digit: parseInt(digit), freq, percentage: (freq / totalNumbers * 100).toFixed(1) }));

  const coldDigits = Object.entries(digitFreq)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 3)
    .map(([digit, freq]) => ({ digit: parseInt(digit), freq, percentage: (freq / totalNumbers * 100).toFixed(1) }));

  return {
    title: '🔢 끝자리 분석',
    data: {
      frequency: digitFreq,
      percentage: Object.fromEntries(
        Object.entries(digitFreq).map(([digit, freq]) => [digit, (freq / totalNumbers * 100).toFixed(1)])
      ),
      hotDigits,
      coldDigits,
      average: avgFreq.toFixed(1)
    },
    insight: `끝자리 ${hotDigits[0].digit}이 가장 자주 출현(${hotDigits[0].percentage}%). 끝자리 ${coldDigits[0].digit}은 가장 적게 출현(${coldDigits[0].percentage}%).`,
    recommendation: `끝자리 ${hotDigits.slice(0, 2).map(d => d.digit).join(', ')} 포함 번호 추천`
  };
}

/**
 * 3. 📏 번호 간격 분석 - 당첨번호들 사이의 간격 패턴
 */
export function analyzeNumberGaps(results: LotteryResult[]): AnalysisResult {
  const gapStats: Record<string, number> = {};
  const gapPatterns: string[] = [];

  results.forEach(result => {
    const sortedNums = [...result.numbers].sort((a, b) => a - b);
    const gaps = [];
    
    for (let i = 1; i < sortedNums.length; i++) {
      const gap = sortedNums[i] - sortedNums[i-1];
      gaps.push(gap);
    }

    const gapPattern = gaps.join('-');
    gapStats[gapPattern] = (gapStats[gapPattern] || 0) + 1;
    gapPatterns.push(`${result.round}회: ${gapPattern}`);
  });

  const commonPatterns = Object.entries(gapStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([pattern, count]) => ({ pattern, count, percentage: (count / results.length * 100).toFixed(1) }));

  // 평균 간격 계산
  let totalGap = 0;
  let gapCount = 0;
  results.forEach(result => {
    const sortedNums = [...result.numbers].sort((a, b) => a - b);
    for (let i = 1; i < sortedNums.length; i++) {
      totalGap += sortedNums[i] - sortedNums[i-1];
      gapCount++;
    }
  });
  const avgGap = (totalGap / gapCount).toFixed(1);

  return {
    title: '📏 번호 간격 분석',
    data: {
      commonPatterns,
      averageGap: avgGap,
      recentPatterns: gapPatterns.slice(0, 10),
      uniquePatterns: Object.keys(gapStats).length
    },
    insight: `가장 흔한 간격 패턴: ${commonPatterns[0].pattern} (${commonPatterns[0].percentage}% 출현). 평균 간격: ${avgGap}`,
    recommendation: `간격 패턴 ${commonPatterns[0].pattern} 또는 ${commonPatterns[1].pattern} 활용 추천`
  };
}

/**
 * 4. 🎯 합계 범위 분석 - 당첨번호 6개의 합계 분포
 */
export function analyzeSumRanges(results: LotteryResult[]): AnalysisResult {
  const sumStats = {
    veryLow: 0,    // 21-90
    low: 0,        // 91-120
    medium: 0,     // 121-150
    high: 0,       // 151-180
    veryHigh: 0    // 181-255
  };

  const sumHistory: { round: number; sum: number; range: string }[] = [];

  results.forEach(result => {
    const sum = result.numbers.reduce((acc, num) => acc + num, 0);
    let range = '';
    
    if (sum <= 90) {
      sumStats.veryLow++;
      range = 'veryLow';
    } else if (sum <= 120) {
      sumStats.low++;
      range = 'low';
    } else if (sum <= 150) {
      sumStats.medium++;
      range = 'medium';
    } else if (sum <= 180) {
      sumStats.high++;
      range = 'high';
    } else {
      sumStats.veryHigh++;
      range = 'veryHigh';
    }

    sumHistory.push({ round: result.round, sum, range });
  });

  const total = results.length;
  const avgSum = (sumHistory.reduce((acc, item) => acc + item.sum, 0) / total).toFixed(1);
  
  const mostCommonRange = Object.entries(sumStats)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    title: '🎯 합계 범위 분석',
    data: {
      ranges: sumStats,
      percentage: {
        veryLow: (sumStats.veryLow / total * 100).toFixed(1),
        low: (sumStats.low / total * 100).toFixed(1),
        medium: (sumStats.medium / total * 100).toFixed(1),
        high: (sumStats.high / total * 100).toFixed(1),
        veryHigh: (sumStats.veryHigh / total * 100).toFixed(1)
      },
      averageSum: avgSum,
      recentSums: sumHistory.slice(0, 10)
    },
    insight: `평균 합계: ${avgSum}점. 가장 흔한 범위: ${mostCommonRange[0]} (${(mostCommonRange[1] / total * 100).toFixed(1)}%)`,
    recommendation: mostCommonRange[0] === 'medium' ? '121-150 범위 추천' : `${mostCommonRange[0]} 범위 활용 추천`
  };
}

/**
 * 5. 📍 구간 편중 분석 - 1-15, 16-30, 31-45 구간별 편중도
 */
export function analyzeRangeDistribution(results: LotteryResult[]): AnalysisResult {
  const rangeStats = {
    low: { count: 0, numbers: [] as number[] },      // 1-15
    mid: { count: 0, numbers: [] as number[] },      // 16-30
    high: { count: 0, numbers: [] as number[] }      // 31-45
  };

  const distributionPatterns: string[] = [];

  results.forEach(result => {
    const distribution = { low: 0, mid: 0, high: 0 };
    
    result.numbers.forEach(num => {
      if (num <= 15) {
        distribution.low++;
        rangeStats.low.count++;
        rangeStats.low.numbers.push(num);
      } else if (num <= 30) {
        distribution.mid++;
        rangeStats.mid.count++;
        rangeStats.mid.numbers.push(num);
      } else {
        distribution.high++;
        rangeStats.high.count++;
        rangeStats.high.numbers.push(num);
      }
    });

    distributionPatterns.push(`${result.round}회: ${distribution.low}-${distribution.mid}-${distribution.high}`);
  });

  const totalNumbers = results.length * 6;
  const idealPercentage = 33.33;

  // 편중도 계산 (이상적인 33.33%와의 차이)
  const bias = {
    low: Math.abs((rangeStats.low.count / totalNumbers * 100) - idealPercentage).toFixed(1),
    mid: Math.abs((rangeStats.mid.count / totalNumbers * 100) - idealPercentage).toFixed(1),
    high: Math.abs((rangeStats.high.count / totalNumbers * 100) - idealPercentage).toFixed(1)
  };

  return {
    title: '📍 구간 편중 분석',
    data: {
      ranges: {
        low: { 
          count: rangeStats.low.count, 
          percentage: (rangeStats.low.count / totalNumbers * 100).toFixed(1),
          bias: bias.low
        },
        mid: { 
          count: rangeStats.mid.count, 
          percentage: (rangeStats.mid.count / totalNumbers * 100).toFixed(1),
          bias: bias.mid
        },
        high: { 
          count: rangeStats.high.count, 
          percentage: (rangeStats.high.count / totalNumbers * 100).toFixed(1),
          bias: bias.high
        }
      },
      recentPatterns: distributionPatterns.slice(0, 10)
    },
    insight: `구간별 비율 - 저구간: ${(rangeStats.low.count / totalNumbers * 100).toFixed(1)}%, 중구간: ${(rangeStats.mid.count / totalNumbers * 100).toFixed(1)}%, 고구간: ${(rangeStats.high.count / totalNumbers * 100).toFixed(1)}%`,
    recommendation: Object.entries(bias).sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))[0][0] === 'low' ? '저구간 보완 추천' : '균형 분배 추천'
  };
}

/**
 * 6. 🎁 보너스 번호 패턴 분석
 */
export function analyzeBonusPatterns(results: LotteryResult[]): AnalysisResult {
  const bonusFreq: Record<number, number> = {};
  const bonusRangeStats = { low: 0, mid: 0, high: 0 };
  const bonusParityStats = { odd: 0, even: 0 };

  results.forEach(result => {
    const bonus = result.bonus;
    bonusFreq[bonus] = (bonusFreq[bonus] || 0) + 1;

    // 구간 분석
    if (bonus <= 15) bonusRangeStats.low++;
    else if (bonus <= 30) bonusRangeStats.mid++;
    else bonusRangeStats.high++;

    // 홀짝 분석
    if (bonus % 2 === 1) bonusParityStats.odd++;
    else bonusParityStats.even++;
  });

  const hotBonusNumbers = Object.entries(bonusFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));

  const total = results.length;

  return {
    title: '🎁 보너스 번호 패턴',
    data: {
      frequency: bonusFreq,
      hotNumbers: hotBonusNumbers,
      rangeDistribution: {
        low: { count: bonusRangeStats.low, percentage: (bonusRangeStats.low / total * 100).toFixed(1) },
        mid: { count: bonusRangeStats.mid, percentage: (bonusRangeStats.mid / total * 100).toFixed(1) },
        high: { count: bonusRangeStats.high, percentage: (bonusRangeStats.high / total * 100).toFixed(1) }
      },
      parityDistribution: {
        odd: { count: bonusParityStats.odd, percentage: (bonusParityStats.odd / total * 100).toFixed(1) },
        even: { count: bonusParityStats.even, percentage: (bonusParityStats.even / total * 100).toFixed(1) }
      }
    },
    insight: `가장 자주 나온 보너스: ${hotBonusNumbers[0].number}번 (${hotBonusNumbers[0].frequency}회). 홀수 ${(bonusParityStats.odd / total * 100).toFixed(1)}%, 짝수 ${(bonusParityStats.even / total * 100).toFixed(1)}%`,
    recommendation: `보너스 후보: ${hotBonusNumbers.slice(0, 3).map(b => b.number).join(', ')}`
  };
}

/**
 * 7. 📅 요일별 당첨 패턴 분석 (토요일 고정이지만 날짜별 특성)
 */
export function analyzeWeekdayPatterns(results: LotteryResult[]): AnalysisResult {
  const datePatterns: Record<string, number> = {};
  const monthlyStats: Record<number, number> = {};

  results.forEach(result => {
    const date = new Date(result.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const dateKey = `${month}월${day}일`;
    datePatterns[dateKey] = (datePatterns[dateKey] || 0) + 1;
    monthlyStats[month] = (monthlyStats[month] || 0) + 1;
  });

  const commonDates = Object.entries(datePatterns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([date, count]) => ({ date, count }));

  const monthlyDistribution = Object.entries(monthlyStats)
    .map(([month, count]) => ({ month: parseInt(month), count, percentage: (count / results.length * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  return {
    title: '📅 요일별 당첨 패턴',
    data: {
      commonDates,
      monthlyDistribution,
      totalDraws: results.length
    },
    insight: `가장 흔한 추첨일: ${commonDates[0].date} (${commonDates[0].count}회). 가장 많은 추첨 월: ${monthlyDistribution[0].month}월 (${monthlyDistribution[0].percentage}%)`,
    recommendation: `${monthlyDistribution.slice(0, 2).map(m => m.month).join(', ')}월 패턴 주목`
  };
}

/**
 * 8. 🌳 계절별 번호 선호도 분석
 */
export function analyzeSeasonalPreferences(results: LotteryResult[]): AnalysisResult {
  const seasonalStats = {
    spring: { count: 0, numbers: new Set<number>() },  // 3-5월
    summer: { count: 0, numbers: new Set<number>() },  // 6-8월
    autumn: { count: 0, numbers: new Set<number>() },  // 9-11월
    winter: { count: 0, numbers: new Set<number>() }   // 12-2월
  };

  results.forEach(result => {
    const date = new Date(result.date);
    const month = date.getMonth() + 1;
    
    let season: keyof typeof seasonalStats;
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';

    seasonalStats[season].count++;
    result.numbers.forEach(num => seasonalStats[season].numbers.add(num));
  });

  const seasonalPreferences = Object.entries(seasonalStats).map(([season, data]) => ({
    season,
    count: data.count,
    uniqueNumbers: data.numbers.size,
    percentage: (data.count / results.length * 100).toFixed(1)
  }));

  const currentMonth = new Date().getMonth() + 1;
  let currentSeason = '';
  if (currentMonth >= 3 && currentMonth <= 5) currentSeason = 'spring';
  else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = 'summer';
  else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = 'autumn';
  else currentSeason = 'winter';

  return {
    title: '🌳 계절별 번호 선호도',
    data: {
      seasonalPreferences,
      currentSeason,
      currentSeasonStats: seasonalStats[currentSeason as keyof typeof seasonalStats]
    },
    insight: `현재 계절(${currentSeason})에 ${seasonalStats[currentSeason as keyof typeof seasonalStats].count}회 추첨, ${seasonalStats[currentSeason as keyof typeof seasonalStats].numbers.size}개 고유번호 출현`,
    recommendation: `현재 ${currentSeason} 시즌 고유 패턴 활용 추천`
  };
}

/**
 * 9. 📊 월별 당첨 트렌드 분석
 */
export function analyzeMonthlyTrends(results: LotteryResult[]): AnalysisResult {
  const monthlyData: Record<number, { count: number; numbers: number[]; avgSum: number }> = {};
  
  for (let i = 1; i <= 12; i++) {
    monthlyData[i] = { count: 0, numbers: [], avgSum: 0 };
  }

  results.forEach(result => {
    const date = new Date(result.date);
    const month = date.getMonth() + 1;
    const sum = result.numbers.reduce((acc, num) => acc + num, 0);
    
    monthlyData[month].count++;
    monthlyData[month].numbers.push(...result.numbers);
    monthlyData[month].avgSum += sum;
  });

  // 평균 계산
  Object.keys(monthlyData).forEach(month => {
    const monthNum = parseInt(month);
    if (monthlyData[monthNum].count > 0) {
      monthlyData[monthNum].avgSum = monthlyData[monthNum].avgSum / monthlyData[monthNum].count;
    }
  });

  const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
    month: parseInt(month),
    count: data.count,
    percentage: (data.count / results.length * 100).toFixed(1),
    avgSum: data.avgSum.toFixed(1),
    totalNumbers: data.numbers.length
  }));

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthData = monthlyData[currentMonth];

  return {
    title: '📊 월별 당첨 트렌드',
    data: {
      monthlyTrends,
      currentMonth,
      currentMonthStats: {
        count: currentMonthData.count,
        percentage: (currentMonthData.count / results.length * 100).toFixed(1),
        avgSum: currentMonthData.avgSum.toFixed(1)
      }
    },
    insight: `이번 달(${currentMonth}월) 평균 합계: ${currentMonthData.avgSum.toFixed(1)}점, 총 ${currentMonthData.count}회 추첨`,
    recommendation: `${currentMonth}월 평균 패턴(합계 ${currentMonthData.avgSum.toFixed(1)}점 근처) 활용`
  };
}

/**
 * 10. 💎 대박 조합 분석 - 고액 당첨 패턴
 */
export function analyzeJackpotCombinations(results: LotteryResult[]): AnalysisResult {
  // 1등 당첨금이 높은 회차들을 대박으로 간주 (상위 30%)
  const sortedByPrize = results
    .filter(r => r.prize?.first)
    .sort((a, b) => (b.prize?.first || 0) - (a.prize?.first || 0));
  
  const topPercentile = Math.ceil(sortedByPrize.length * 0.3);
  const jackpotRounds = sortedByPrize.slice(0, topPercentile);

  const jackpotNumberFreq: Record<number, number> = {};
  const jackpotPatterns = {
    consecutiveCount: 0,
    evenOddBalance: { balanced: 0, evenHeavy: 0, oddHeavy: 0 },
    sumRange: { low: 0, medium: 0, high: 0 }
  };

  jackpotRounds.forEach(result => {
    // 번호 빈도
    result.numbers.forEach(num => {
      jackpotNumberFreq[num] = (jackpotNumberFreq[num] || 0) + 1;
    });

    // 연속번호 체크
    const sortedNums = [...result.numbers].sort((a, b) => a - b);
    let hasConsecutive = false;
    for (let i = 1; i < sortedNums.length; i++) {
      if (sortedNums[i] === sortedNums[i-1] + 1) {
        hasConsecutive = true;
        break;
      }
    }
    if (hasConsecutive) jackpotPatterns.consecutiveCount++;

    // 홀짝 균형
    const oddCount = result.numbers.filter(n => n % 2 === 1).length;
    if (oddCount === 3) jackpotPatterns.evenOddBalance.balanced++;
    else if (oddCount > 3) jackpotPatterns.evenOddBalance.oddHeavy++;
    else jackpotPatterns.evenOddBalance.evenHeavy++;

    // 합계 범위
    const sum = result.numbers.reduce((acc, num) => acc + num, 0);
    if (sum <= 120) jackpotPatterns.sumRange.low++;
    else if (sum <= 150) jackpotPatterns.sumRange.medium++;
    else jackpotPatterns.sumRange.high++;
  });

  const luckyNumbers = Object.entries(jackpotNumberFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([num, freq]) => ({ 
      number: parseInt(num), 
      frequency: freq, 
      percentage: (freq / jackpotRounds.length * 100).toFixed(1) 
    }));

  return {
    title: '💎 대박 조합 분석',
    data: {
      jackpotRoundsCount: jackpotRounds.length,
      luckyNumbers,
      patterns: {
        consecutive: {
          count: jackpotPatterns.consecutiveCount,
          percentage: (jackpotPatterns.consecutiveCount / jackpotRounds.length * 100).toFixed(1)
        },
        evenOdd: jackpotPatterns.evenOddBalance,
        sumRange: jackpotPatterns.sumRange
      },
      topJackpots: jackpotRounds.slice(0, 5).map(r => ({
        round: r.round,
        prize: r.prize?.first,
        numbers: r.numbers
      }))
    },
    insight: `상위 ${topPercentile}개 대박 회차 분석. 럭키넘버 1위: ${luckyNumbers[0].number}번 (${luckyNumbers[0].percentage}% 출현)`,
    recommendation: `럭키넘버 ${luckyNumbers.slice(0, 6).map(n => n.number).join(', ')} 조합 추천`
  };
}

/**
 * 11. ⏰ 미출현 기간 분석 - 오랫동안 안 나온 번호들
 */
export function analyzeMissingPeriods(results: LotteryResult[]): AnalysisResult {
  const lastAppearance: Record<number, number> = {};
  
  // 모든 번호 초기화
  for (let i = 1; i <= 45; i++) {
    lastAppearance[i] = 999; // 매우 오래됨으로 초기화
  }

  // 최근부터 역순으로 검색하여 마지막 출현 회차 기록
  results.forEach((result, index) => {
    result.numbers.forEach(num => {
      if (lastAppearance[num] === 999) {
        lastAppearance[num] = index; // 최근부터의 거리
      }
    });
  });

  const missingAnalysis = Object.entries(lastAppearance)
    .map(([num, lastSeen]) => ({
      number: parseInt(num),
      weeksSinceLastSeen: lastSeen,
      status: lastSeen === 999 ? 'never' : lastSeen > 20 ? 'cold' : lastSeen > 10 ? 'warm' : 'hot'
    }))
    .sort((a, b) => b.weeksSinceLastSeen - a.weeksSinceLastSeen);

  const statusCounts = {
    never: missingAnalysis.filter(n => n.status === 'never').length,
    cold: missingAnalysis.filter(n => n.status === 'cold').length,
    warm: missingAnalysis.filter(n => n.status === 'warm').length,
    hot: missingAnalysis.filter(n => n.status === 'hot').length
  };

  const longestMissing = missingAnalysis.slice(0, 10);

  return {
    title: '⏰ 미출현 기간 분석',
    data: {
      missingAnalysis: longestMissing,
      statusDistribution: statusCounts,
      neverAppeared: missingAnalysis.filter(n => n.status === 'never'),
      coldNumbers: missingAnalysis.filter(n => n.status === 'cold').slice(0, 10)
    },
    insight: `가장 오래 안 나온 번호: ${longestMissing[0].number}번 (${longestMissing[0].weeksSinceLastSeen}회차 전). 콜드넘버 ${statusCounts.cold}개`,
    recommendation: `콜드넘버 ${missingAnalysis.filter(n => n.status === 'cold').slice(0, 3).map(n => n.number).join(', ')} 터질 타이밍`
  };
}

/**
 * 12. 🔄 연속 출현 분석 - 연달아 나오는 번호들
 */
export function analyzeConsecutiveAppearances(results: LotteryResult[]): AnalysisResult {
  // 연속 출현 추적을 위한 기록
  const streakHistory: { number: number; streak: number; startRound: number }[] = [];
  
  // 각 번호별 연속 출현 추적
  for (let num = 1; num <= 45; num++) {
    let currentStreak = 0;
    let streakStart = 0;
    
    results.forEach((result) => {
      if (result.numbers.includes(num)) {
        if (currentStreak === 0) {
          streakStart = result.round;
        }
        currentStreak++;
      } else {
        if (currentStreak > 1) {
          streakHistory.push({
            number: num,
            streak: currentStreak,
            startRound: streakStart
          });
        }
        currentStreak = 0;
      }
    });
    
    // 마지막 연속 기록
    if (currentStreak > 1) {
      streakHistory.push({
        number: num,
        streak: currentStreak,
        startRound: streakStart
      });
    }
  }

  const longestStreaks = streakHistory
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 20);

  const currentStreaks: { number: number; streak: number }[] = [];
  for (let num = 1; num <= 45; num++) {
    let currentStreak = 0;
    for (let i = 0; i < Math.min(10, results.length); i++) {
      if (results[i].numbers.includes(num)) {
        currentStreak++;
      } else {
        break;
      }
    }
    if (currentStreak > 1) {
      currentStreaks.push({ number: num, streak: currentStreak });
    }
  }

  return {
    title: '🔄 연속 출현 분석',
    data: {
      longestStreaks,
      currentStreaks: currentStreaks.sort((a, b) => b.streak - a.streak),
      totalStreaks: streakHistory.length,
      averageStreak: (streakHistory.reduce((acc, s) => acc + s.streak, 0) / streakHistory.length).toFixed(1)
    },
    insight: `최장 연속기록: ${longestStreaks[0].number}번 ${longestStreaks[0].streak}회 연속. 현재 연속중인 번호 ${currentStreaks.length}개`,
    recommendation: currentStreaks.length > 0 ? `현재 연속중: ${currentStreaks.slice(0, 3).map(s => `${s.number}번(${s.streak}회)`).join(', ')}` : '연속 출현 번호 없음'
  };
}

/**
 * 13. 📈 상승/하락 트렌드 분석
 */
export function analyzeTrendDirection(results: LotteryResult[]): AnalysisResult {
  const recentPeriod = results.slice(0, 10);  // 최근 10회
  const olderPeriod = results.slice(10, 20);  // 이전 10회
  
  const recentFreq: Record<number, number> = {};
  const olderFreq: Record<number, number> = {};

  recentPeriod.forEach(result => {
    result.numbers.forEach(num => {
      recentFreq[num] = (recentFreq[num] || 0) + 1;
    });
  });

  olderPeriod.forEach(result => {
    result.numbers.forEach(num => {
      olderFreq[num] = (olderFreq[num] || 0) + 1;
    });
  });

  const trendAnalysis: { number: number; trend: number; direction: string; recentCount: number; olderCount: number }[] = [];

  for (let num = 1; num <= 45; num++) {
    const recentCount = recentFreq[num] || 0;
    const olderCount = olderFreq[num] || 0;
    const trend = recentCount - olderCount;
    
    let direction = 'stable';
    if (trend > 1) direction = 'rising';
    else if (trend < -1) direction = 'falling';
    else if (trend > 0) direction = 'slight_up';
    else if (trend < 0) direction = 'slight_down';

    trendAnalysis.push({
      number: num,
      trend,
      direction,
      recentCount,
      olderCount
    });
  }

  const risingNumbers = trendAnalysis.filter(t => t.direction === 'rising' || t.direction === 'slight_up').sort((a, b) => b.trend - a.trend);
  const fallingNumbers = trendAnalysis.filter(t => t.direction === 'falling' || t.direction === 'slight_down').sort((a, b) => a.trend - b.trend);
  const stableNumbers = trendAnalysis.filter(t => t.direction === 'stable');

  return {
    title: '📈 상승/하락 트렌드',
    data: {
      rising: risingNumbers.slice(0, 10),
      falling: fallingNumbers.slice(0, 10),
      stable: stableNumbers.length,
      summary: {
        risingCount: risingNumbers.length,
        fallingCount: fallingNumbers.length,
        stableCount: stableNumbers.length
      }
    },
    insight: `상승 트렌드 ${risingNumbers.length}개, 하락 트렌드 ${fallingNumbers.length}개. 최강 상승: ${risingNumbers[0]?.number}번 (+${risingNumbers[0]?.trend})`,
    recommendation: risingNumbers.length > 0 ? `상승 트렌드: ${risingNumbers.slice(0, 6).map(n => n.number).join(', ')}` : '안정적 번호 선택 추천'
  };
}

/**
 * 14. ⚖️ 홀짝 균형도 분석
 */
export function analyzeOddEvenBalance(results: LotteryResult[]): AnalysisResult {
  const balanceStats = {
    '0-6': 0,  // 홀수 0개, 짝수 6개
    '1-5': 0,  // 홀수 1개, 짝수 5개
    '2-4': 0,  // 홀수 2개, 짝수 4개
    '3-3': 0,  // 홀수 3개, 짝수 3개 (완전 균형)
    '4-2': 0,  // 홀수 4개, 짝수 2개
    '5-1': 0,  // 홀수 5개, 짝수 1개
    '6-0': 0   // 홀수 6개, 짝수 0개
  };

  const balanceHistory: { round: number; odds: number; evens: number; balance: string }[] = [];

  results.forEach(result => {
    const oddCount = result.numbers.filter(n => n % 2 === 1).length;
    const evenCount = 6 - oddCount;
    const balanceKey = `${oddCount}-${evenCount}` as keyof typeof balanceStats;
    
    balanceStats[balanceKey]++;
    balanceHistory.push({
      round: result.round,
      odds: oddCount,
      evens: evenCount,
      balance: balanceKey
    });
  });

  const total = results.length;
  const mostCommonBalance = Object.entries(balanceStats)
    .sort(([,a], [,b]) => b - a)[0];

  const balanceDistribution = Object.entries(balanceStats).map(([balance, count]) => ({
    balance,
    count,
    percentage: (count / total * 100).toFixed(1)
  }));

  return {
    title: '⚖️ 홀짝 균형도 분석',
    data: {
      distribution: balanceDistribution,
      mostCommon: {
        balance: mostCommonBalance[0],
        count: mostCommonBalance[1],
        percentage: (mostCommonBalance[1] / total * 100).toFixed(1)
      },
      recentBalance: balanceHistory.slice(0, 10),
      perfectBalance: {
        count: balanceStats['3-3'],
        percentage: (balanceStats['3-3'] / total * 100).toFixed(1)
      }
    },
    insight: `가장 흔한 균형: ${mostCommonBalance[0]} (${(mostCommonBalance[1] / total * 100).toFixed(1)}%). 완전균형(3-3) ${(balanceStats['3-3'] / total * 100).toFixed(1)}%`,
    recommendation: mostCommonBalance[0] === '3-3' ? '홀짝 균형(3-3) 추천' : `${mostCommonBalance[0]} 패턴 활용 추천`
  };
}

/**
 * 15. 🎨 색깔별 번호 분석 (로또공 색상 기준)
 */
export function analyzeColorDistribution(results: LotteryResult[]): AnalysisResult {
  // 로또공 색상 분류 (실제 로또공 색상)
  const colorMapping = {
    yellow: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],           // 노랑
    blue: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],     // 파랑  
    red: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],      // 빨강
    black: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],    // 검정
    green: [41, 42, 43, 44, 45]                          // 초록
  };

  const colorStats = {
    yellow: 0,
    blue: 0, 
    red: 0,
    black: 0,
    green: 0
  };

  const colorHistory: { round: number; colors: Record<string, number> }[] = [];

  results.forEach(result => {
    const roundColors = { yellow: 0, blue: 0, red: 0, black: 0, green: 0 };
    
    result.numbers.forEach(num => {
      if (colorMapping.yellow.includes(num)) {
        colorStats.yellow++;
        roundColors.yellow++;
      } else if (colorMapping.blue.includes(num)) {
        colorStats.blue++;
        roundColors.blue++;
      } else if (colorMapping.red.includes(num)) {
        colorStats.red++;
        roundColors.red++;
      } else if (colorMapping.black.includes(num)) {
        colorStats.black++;
        roundColors.black++;
      } else if (colorMapping.green.includes(num)) {
        colorStats.green++;
        roundColors.green++;
      }
    });

    colorHistory.push({ round: result.round, colors: roundColors });
  });

  const totalNumbers = results.length * 6;
  const colorDistribution = Object.entries(colorStats).map(([color, count]) => ({
    color,
    count,
    percentage: (count / totalNumbers * 100).toFixed(1),
    expectedPercentage: color === 'green' ? '11.1' : '22.2' // 초록은 5개, 나머지는 10개씩
  }));

  const favoriteColor = colorDistribution.sort((a, b) => b.count - a.count)[0];

  return {
    title: '🎨 색깔별 번호 분석',
    data: {
      colorMapping,
      distribution: colorDistribution,
      favoriteColor,
      recentPatterns: colorHistory.slice(0, 10),
      averagePerRound: {
        yellow: (colorStats.yellow / results.length).toFixed(1),
        blue: (colorStats.blue / results.length).toFixed(1),
        red: (colorStats.red / results.length).toFixed(1),
        black: (colorStats.black / results.length).toFixed(1),
        green: (colorStats.green / results.length).toFixed(1)
      }
    },
    insight: `가장 선호되는 색상: ${favoriteColor.color} (${favoriteColor.percentage}%). 회차당 평균 ${(favoriteColor.count / results.length).toFixed(1)}개 출현`,
    recommendation: `${favoriteColor.color} 계열 번호 ${colorMapping[favoriteColor.color as keyof typeof colorMapping].slice(0, 3).join(', ')} 등 추천`
  };
}