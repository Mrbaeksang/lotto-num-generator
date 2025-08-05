// 로또 분석 API를 위한 React Hook

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/lottery-analysis';

export interface AnalysisResponse {
  success: boolean;
  data?: {
    analyses: Record<string, AnalysisResult>;
    meta: {
      roundsAnalyzed: number; 
      analysisTypes: string[];
      dateRange: {
        from: string;
        to: string;
      };
    };
  };
  error?: string;
  timestamp: string;
}

export interface AnalysisInfoResponse {
  success: boolean;
  data?: {
    availableAnalyses: Record<string, {
      name: string;
      description: string;
      category: string;
    }>;
    categories: Record<string, string>;
    totalCount: number;
  };
  timestamp: string;
}

export function useLotteryAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse['data'] | null>(null);

  /**
   * 15가지 로또 분석 실행
   */
  const runAnalysis = async (options: {
    analysisCount?: number;
    analysisTypes?: string[];
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const { analysisCount = 50, analysisTypes = [] } = options;
      
      console.log(`🔍 분석 시작: ${analysisCount}회차, ${analysisTypes.length || 15}가지`);

      const response = await fetch('/api/lottery/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisCount,
          analysisTypes
        })
      });

      const result: AnalysisResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || '분석 실패');
      }

      setAnalysisData(result.data || null);
      console.log(`✅ 분석 완료: ${result.data?.meta.analysisTypes.length}가지`);

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('❌ 분석 오류:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 분석 정보 조회 (사용 가능한 분석 타입들)
   */
  const getAnalysisInfo = async (): Promise<AnalysisInfoResponse> => {
    try {
      const response = await fetch('/api/lottery/analysis', {
        method: 'GET'
      });

      const result: AnalysisInfoResponse = await response.json();

      if (!result.success) {
        throw new Error('분석 정보 조회 실패');
      }

      return result;

    } catch (err) {
      console.error('❌ 분석 정보 조회 오류:', err);
      throw err;
    }
  };

  /**
   * 특정 분석 결과 가져오기
   */
  const getAnalysisResult = (analysisType: string): AnalysisResult | null => {
    return analysisData?.analyses[analysisType] || null;
  };

  /**
   * 분석 결과 리셋
   */
  const clearAnalysis = () => {
    setAnalysisData(null);
    setError(null);
  };

  return {
    // 상태
    isLoading,
    error,
    analysisData,
    
    // 함수
    runAnalysis,
    getAnalysisInfo,
    getAnalysisResult,
    clearAnalysis,
    
    // 편의 속성
    hasData: !!analysisData,
    analysisCount: analysisData?.meta.roundsAnalyzed || 0,
    analysisTypes: analysisData?.analyses ? Object.keys(analysisData.analyses) : [],
    dateRange: analysisData?.meta.dateRange
  };
}

// 분석 타입 상수
export const ANALYSIS_TYPES = {
  CONSECUTIVE: 'consecutive',
  LAST_DIGITS: 'lastDigits',
  GAPS: 'gaps',
  SUM_RANGES: 'sumRanges',
  RANGE_DISTRIBUTION: 'rangeDistribution',
  BONUS_PATTERNS: 'bonusPatterns',
  WEEKDAY_PATTERNS: 'weekdayPatterns',
  SEASONAL_PREFERENCES: 'seasonalPreferences',
  MONTHLY_TRENDS: 'monthlyTrends',
  JACKPOT_COMBINATIONS: 'jackpotCombinations',
  MISSING_PERIODS: 'missingPeriods',
  CONSECUTIVE_APPEARANCES: 'consecutiveAppearances',
  TREND_DIRECTION: 'trendDirection',
  ODD_EVEN_BALANCE: 'oddEvenBalance',
  COLOR_DISTRIBUTION: 'colorDistribution'
} as const;

// 분석 카테고리 상수  
export const ANALYSIS_CATEGORIES = {
  PATTERN: 'pattern',
  FREQUENCY: 'frequency',
  STATISTICAL: 'statistical',
  DISTRIBUTION: 'distribution',
  BONUS: 'bonus',
  TEMPORAL: 'temporal',
  PREMIUM: 'premium',
  TREND: 'trend',
  BALANCE: 'balance',
  VISUAL: 'visual'
} as const;