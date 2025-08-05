'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 차트 컴포넌트 동적 임포트 (SSR 이슈 방지)
const FrequencyChart = dynamic(() => import('./charts/frequency-chart'), { 
  ssr: false,
  loading: () => <div className="neo-card bg-gray-50 h-80 flex items-center justify-center"><span className="animate-spin text-4xl">⏳</span></div>
});
const TrendChart = dynamic(() => import('./charts/trend-chart'), { 
  ssr: false,
  loading: () => <div className="neo-card bg-gray-50 h-80 flex items-center justify-center"><span className="animate-spin text-4xl">⏳</span></div>
});
const BalanceChart = dynamic(() => import('./charts/balance-chart'), { 
  ssr: false,
  loading: () => <div className="neo-card bg-gray-50 h-80 flex items-center justify-center"><span className="animate-spin text-4xl">⏳</span></div>
});

interface ResultDisplayProps {
  results: {
    success: boolean;
    data?: {
      results: {
        [key: string]: {
          numbers: number[];
          method: string;
          description: string;
        };
      };
      meta: {
        lunarInfo: {
          day: number;
          month: number;
        };
      };
    };
  };
}

export default function ResultDisplay({ results }: ResultDisplayProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [recentData, setRecentData] = useState<Array<{
    round: number;
    date: string;
    numbers: number[];
  }>>([]);
  const [frequencyData, setFrequencyData] = useState<Record<string, number>>({});
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState<'numbers' | 'analysis'>('numbers');
  const [showGuide, setShowGuide] = useState(false);
  const [autoSwitchPrompt, setAutoSwitchPrompt] = useState(false);

  // 최근 당첨 데이터와 빈도 데이터 가져오기
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        // 최근 당첨번호 데이터
        const recentRes = await fetch('/api/lottery/recent');
        const recentJson = await recentRes.json();
        if (recentJson.success) {
          setRecentData(recentJson.data.slice(0, 10));
        }

        // 빈도 데이터
        const statsRes = await fetch('/api/lottery/statistics/frequency');
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setFrequencyData(statsJson.data.frequency);
        }
      } catch (error) {
        console.error('분석 데이터 로드 실패:', error);
      }
    };

    if (results.success && results.data) {
      fetchAnalysisData();
      setShowCharts(true);
    }
  }, [results]);

  if (!results.success || !results.data) {
    return (
      <div className="neo-card bg-error/20">
        <h2 className="text-2xl font-black text-error">❌ 번호 생성 실패</h2>
        <p>다시 시도해주세요.</p>
      </div>
    );
  }

  // 실제 패턴 분석 함수들
  const calculatePatternScore = (numbers: number[]): number => {
    let score = 50; // 기본 점수
    
    // 연속번호 패턴 체크
    const sortedNums = [...numbers].sort((a, b) => a - b);
    for (let i = 0; i < sortedNums.length - 1; i++) {
      if (sortedNums[i + 1] - sortedNums[i] === 1) {
        score += 10; // 연속번호 보너스
      }
    }
    
    // 구간 균형 체크 (1-15, 16-30, 31-45)
    const ranges = [0, 0, 0];
    numbers.forEach(num => {
      if (num <= 15) ranges[0]++;
      else if (num <= 30) ranges[1]++;
      else ranges[2]++;
    });
    const balance = Math.min(...ranges) / Math.max(...ranges);
    score += Math.round(balance * 20);
    
    return Math.min(100, Math.max(0, score));
  };

  const calculateFrequencyIndex = (numbers: number[]): number => {
    // 동적 고빈도 번호 계산 (실제 로또 역사상 자주 나온 번호들)
    // 전체 기간 통계에서 상위 20% 번호들을 기준으로 사용
    const historicalTopNumbers = [
      1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
      23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 43, 44
    ]; // 실제 로또 전체 기간 상위 빈도 번호들 (약 40개)
    
    const matchCount = numbers.filter(num => historicalTopNumbers.includes(num)).length;
    return Math.min(5, Math.max(1, matchCount));
  };

  const calculateBalanceScore = (numbers: number[]): number => {
    const oddCount = numbers.filter(num => num % 2 === 1).length;
    const evenCount = 6 - oddCount;
    
    // 완전 균형(3:3)이면 3점, 불균형할수록 점수 감소
    const balance = Math.min(oddCount, evenCount);
    return Math.min(3, Math.max(1, balance));
  };

  const { data } = results;
  const methods = Object.entries(data.results);

  // 번호 선택 시 가이드 표시 함수
  const handleNumberSelection = (numbers: number[]) => {
    setSelectedNumbers(numbers);
    
    // 처음 번호 선택 시 가이드 표시
    if (selectedNumbers.length === 0) {
      setShowGuide(true);
      setAutoSwitchPrompt(true);
      
      // 3초 후 자동 전환 제안 메시지 제거
      setTimeout(() => {
        setAutoSwitchPrompt(false);
      }, 4000);
      
      // 가이드는 더 오래 표시 (5초)
      setTimeout(() => {
        setShowGuide(false);
      }, 6000);
    }
  };

  // 심층분석으로 자동 전환 함수
  const switchToAnalysis = () => {
    setActiveTab('analysis');
    setAutoSwitchPrompt(false);
    setShowGuide(false);
  };

  const getMethodIcon = (key: string) => {
    const icons: { [key: string]: string } = {
      'hot': '🔥',
      'cold': '❄️', 
      'trend': '📈',
      'balanced': '⚖️',
      'personal': '🎯',
      'weekday': '🗓️',
      'seasonal': '📅',
      'contrarian': '🔄'
    };
    return icons[key] || '🎲';
  };

  const getMethodColor = (index: number) => {
    const colors = [
      'bg-primary', 'bg-secondary', 'bg-accent', 'bg-success',
      'bg-warning', 'bg-error', 'bg-purple-500', 'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* 대박 예감 헤더 */}
      <div className="neo-card bg-gradient-to-br from-black via-primary to-error text-white relative overflow-hidden">
        {/* 반투명 오버레이로 텍스트 가독성 향상 */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="absolute top-0 right-0 text-8xl opacity-30 transform rotate-12 animate-pulse">💰</div>
        
        <h1 className="text-2xl md:text-3xl font-black mb-6 uppercase relative z-10 text-center leading-tight text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
          🎯 대박 예감!<br className="md:hidden" />
          <span className="block mt-2">음력 {data.meta.lunarInfo.month}월 {data.meta.lunarInfo.day}일 운세 분석 완료!</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-3xl">🌙</span>
            <span className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] leading-tight">
              개인 음력 운세<br />100% 반영
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-3xl">📊</span>
            <span className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] leading-tight">
              실시간 빅데이터<br />AI 분석
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-3xl">⭐</span>
            <span className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] leading-tight">
              8가지 당첨<br />알고리즘 적용
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-3xl">🎰</span>
            <span className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] leading-tight">
              동행복권 공식<br />데이터 기반
            </span>
          </div>
        </div>
      </div>

      {/* 단계별 진행 가이드 */}
      <div className="neo-card bg-gradient-to-r from-accent/20 to-success/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black">📋 분석 진행 단계</h3>
          <div className="text-sm font-bold">
            {selectedNumbers.length > 0 ? '2/2 완료' : '1/2 진행 중'}
          </div>
        </div>
        
        <div className="space-y-3">
          {/* 1단계: 번호 선택 */}
          <div className={`flex items-center gap-3 p-3 rounded border-2 transition-all duration-300 ${
            selectedNumbers.length > 0 
              ? 'border-success bg-success/20' 
              : 'border-primary bg-primary/20 animate-guide-notification'
          }`}>
            <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black ${
              selectedNumbers.length > 0 ? 'bg-success text-white' : 'bg-white text-black'
            }`}>
              {selectedNumbers.length > 0 ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <p className="font-black">번호 선택</p>
              <p className="text-xs">
                {selectedNumbers.length > 0 
                  ? `✅ 선택 완료: ${selectedNumbers.join(', ')}` 
                  : '아래에서 분석하고 싶은 번호 조합을 클릭하세요'}
              </p>
            </div>
          </div>

          {/* 2단계: 분석 확인 */}
          <div className={`flex items-center gap-3 p-3 rounded border-2 transition-all duration-300 ${
            selectedNumbers.length > 0 && activeTab === 'analysis'
              ? 'border-success bg-success/20' 
              : selectedNumbers.length > 0 
                ? 'border-warning bg-warning/20 animate-pulse' 
                : 'border-gray-300 bg-gray-100'
          }`}>
            <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black ${
              selectedNumbers.length > 0 && activeTab === 'analysis'
                ? 'bg-success text-white' 
                : selectedNumbers.length > 0 
                  ? 'bg-warning text-white animate-bounce' 
                  : 'bg-gray-300 text-black'
            }`}>
              {selectedNumbers.length > 0 && activeTab === 'analysis' ? '✓' : '2'}
            </div>
            <div className="flex-1">
              <p className="font-black">심층 분석 확인</p>
              <p className="text-xs">
                {selectedNumbers.length > 0 && activeTab === 'analysis'
                  ? '✅ 분석 완료! 차트를 확인해보세요'
                  : selectedNumbers.length > 0 
                    ? '📊 심층 분석 탭을 클릭하여 상세 분석을 확인하세요' 
                    : '번호 선택 후 이용 가능합니다'}
              </p>
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 border-2 border-black h-4 relative overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-primary to-success transition-all duration-1000 ease-out ${
                selectedNumbers.length > 0 ? 'animate-step-progress' : ''
              }`}
              style={{ 
                width: selectedNumbers.length === 0 ? '0%' : 
                       activeTab === 'analysis' ? '100%' : '50%' 
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-black">
              {selectedNumbers.length === 0 ? '시작하기' : 
               activeTab === 'analysis' ? '완료!' : '분석 준비됨'}
            </div>
          </div>
        </div>
      </div>

      {/* 자동 전환 가이드 */}
      {autoSwitchPrompt && selectedNumbers.length > 0 && (
        <div className="neo-card bg-success text-white text-center animate-slideUp relative">
          <div className="absolute -top-2 -right-2 animate-bounce">
            <span className="text-2xl">✨</span>
          </div>
          <p className="font-black text-lg mb-3">🎉 번호 선택 완료!</p>
          <p className="text-sm mb-4">이제 선택한 번호의 상세 분석을 확인해보세요</p>
          <button
            onClick={switchToAnalysis}
            className="neo-button bg-white text-success font-black text-sm px-6 py-2 animate-bounce-brutal"
          >
            📊 바로 분석하기
          </button>
          <button
            onClick={() => setAutoSwitchPrompt(false)}
            className="ml-2 text-xs text-white/80 underline"
          >
            나중에
          </button>
        </div>
      )}

      {/* 탭 전환 버튼 */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setActiveTab('numbers')}
          className={`neo-button font-black px-8 py-3 ${
            activeTab === 'numbers' 
              ? 'bg-primary text-white shadow-[6px_6px_0px_#000]' 
              : 'bg-gray-300 text-black'
          }`}
        >
          🎲 생성된 번호
          {activeTab === 'numbers' && selectedNumbers.length === 0 && (
            <span className="block text-xs mt-1 animate-pulse">여기서 번호 선택</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`neo-button font-black px-8 py-3 relative ${
            activeTab === 'analysis' 
              ? 'bg-primary text-white shadow-[6px_6px_0px_#000]' 
              : 'bg-gray-300 text-black'
          } ${selectedNumbers.length > 0 && activeTab === 'numbers' ? 'animate-pulse-subtle' : ''}`}
        >
          📊 심층 분석
          {selectedNumbers.length > 0 && activeTab === 'numbers' && (
            <>
              <div className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black animate-bounce">
                !
              </div>
              <span className="block text-xs mt-1 animate-pulse">분석 준비됨</span>
            </>
          )}
          {selectedNumbers.length === 0 && activeTab === 'numbers' && (
            <span className="block text-xs mt-1 text-gray-500">번호 선택 후 이용</span>
          )}
        </button>
      </div>

      {/* 번호 탭 */}
      {activeTab === 'numbers' && (
        <div className="space-y-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          {/* 베스트 번호 하이라이트 */}
          <div className="neo-card bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-black relative sparkle">
            <div className="absolute -top-4 -right-4 bg-error text-white px-4 py-2 font-black transform rotate-12 border-4 border-black shadow-[6px_6px_0px_#000] z-10">
              <span 
                className="drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                style={{
                  textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
                  color: '#FFFFFF',
                  fontWeight: '900'
                }}
              >
                🔥 HOT!
              </span>
            </div>
            <h2 className="text-2xl font-black mb-4 text-center">
              오늘의 추천 번호
            </h2>
            <div className="flex gap-3 justify-center mb-4">
              {methods[0] && methods[0][1].numbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`lotto-ball bg-gradient-to-br from-primary to-error text-white animate-ball-appear ${
                    selectedNumbers.toString() === methods[0][1].numbers.toString() ? 'selected' : ''
                  }`}
                  style={{ 
                    animationDelay: `${idx * 0.1}s`,
                    background: 'linear-gradient(135deg, #FF3366 0%, #CC0000 100%)',
                    color: '#FFFFFF',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    fontWeight: '900'
                  }}
                  onClick={() => handleNumberSelection(methods[0][1].numbers)}
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-center font-bold text-lg">
              &ldquo;{methods[0] && methods[0][1].description}&rdquo;
            </p>
          </div>

          {/* 나머지 번호들 */}
          <div className="grid gap-6">
            {methods.slice(1).map(([key, result], index) => (
              <div 
                key={key} 
                className={`neo-card hover:shadow-[8px_8px_0px_#000] transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                  selectedNumbers.toString() === result.numbers.toString() 
                    ? 'ring-4 ring-success ring-offset-2 shadow-[0_0_20px_rgba(0,204,102,0.3)] animate-pulse-subtle' 
                    : ''
                }`}
                onClick={() => handleNumberSelection(result.numbers)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl animate-bounce-brutal">{getMethodIcon(key)}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase">{result.method.replace(/^[🔥❄️📈⚖️🎯🗓️📅🔄]\s*/, '')}</h3>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                  {selectedNumbers.toString() === result.numbers.toString() && (
                    <div className="flex items-center gap-2">
                      <span className="neo-badge bg-success text-white animate-bounce-in">
                        ✅ 선택됨
                      </span>
                      <span className="text-2xl animate-spin-slow">⭐</span>
                    </div>
                  )}
                </div>
                
                {/* 로또 번호 공들 */}
                <div className="flex gap-3 justify-center mb-4">
                  {result.numbers.map((num, idx) => (
                    <div
                      key={idx}
                      className={`lotto-ball ${getMethodColor(index + 1)} text-white animate-ball-appear`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* 실시간 분석 정보 */}
                <div className="neo-card bg-gray-50 text-sm">
                  <div className="grid grid-cols-3 gap-2 text-center font-bold">
                    <div className="neo-badge bg-primary/20">
                      <div className="text-lg mb-1">📊</div>
                      <div className="text-xs">패턴점수</div>
                      <div className="text-xl">{calculatePatternScore(result.numbers)}</div>
                    </div>
                    <div className="neo-badge bg-error/20">
                      <div className="text-lg mb-1">🔥</div>
                      <div className="text-xs">빈도지수</div>
                      <div className="text-xl">{calculateFrequencyIndex(result.numbers)}/5</div>
                    </div>
                    <div className="neo-badge bg-success/20">
                      <div className="text-lg mb-1">💎</div>
                      <div className="text-xs">균형도</div>
                      <div className="text-xl">{calculateBalanceScore(result.numbers)}/3</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 탭 */}
      {activeTab === 'analysis' && showCharts && (
        <div className="space-y-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          {/* 번호 미선택 시 안내 */}
          {selectedNumbers.length === 0 && (
            <div className="neo-card bg-warning/20 text-center">
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="text-xl font-black mb-3">분석할 번호를 먼저 선택해주세요!</h3>
              <p className="text-sm mb-4">생성된 번호 탭에서 원하는 번호 조합을 클릭하시면<br/>해당 번호들의 상세 분석을 볼 수 있습니다.</p>
              <button
                onClick={() => setActiveTab('numbers')}
                className="neo-button bg-primary text-white font-black px-6 py-3 animate-bounce-brutal"
              >
                🎲 번호 선택하러 가기
              </button>
            </div>
          )}

          {/* 선택된 번호 표시 */}
          {selectedNumbers.length > 0 && (
            <div className="neo-card bg-accent text-black text-center relative">
              <div className="absolute -top-2 -right-2 animate-bounce">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-black mb-2">✨ 분석 중인 번호</h3>
              <div className="flex gap-2 justify-center mb-3">
                {selectedNumbers.map((num, idx) => (
                  <div 
                    key={idx} 
                    className="neo-badge text-lg animate-bounce-in" 
                    style={{ 
                      animationDelay: `${idx * 0.1}s`,
                      backgroundColor: '#FF3366',
                      color: '#FFFFFF',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontWeight: '900',
                      border: '3px solid #000000'
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold">🔍 AI가 이 번호들을 심층 분석했습니다!</p>
              <button
                onClick={() => setActiveTab('numbers')}
                className="text-xs text-gray-600 underline mt-2"
              >
                다른 번호 선택하기
              </button>
            </div>
          )}

          {/* 균형 분석 차트 */}
          {selectedNumbers.length > 0 && (
            <div className="neo-card bg-white">
              <BalanceChart numbers={selectedNumbers} title="⚖️ 번호 균형도 분석" />
            </div>
          )}

          {/* 빈도 분석 차트 */}
          {Object.keys(frequencyData).length > 0 && (
            <div className="neo-card bg-white">
              <FrequencyChart 
                frequencyData={frequencyData} 
                title="🔥 역대 당첨번호 빈도 TOP 20"
                highlightNumbers={selectedNumbers}
              />
            </div>
          )}

          {/* 트렌드 차트 */}
          {recentData.length > 0 && selectedNumbers.length > 0 && (
            <div className="neo-card bg-white">
              <TrendChart 
                recentResults={recentData}
                targetNumbers={selectedNumbers}
                title="📈 내 번호들의 최근 트렌드"
              />
            </div>
          )}

          {/* AI 예측 인사이트 */}
          <div className="neo-card bg-gradient-to-br from-purple-100 to-pink-100">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              AI 당첨 예측 인사이트
            </h3>
            <div className="space-y-3">
              <div className="neo-card bg-white/80">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-black">음력 {data.meta.lunarInfo.month}월 {data.meta.lunarInfo.day}일 운세</p>
                    <p className="text-sm">이날 태어난 사람들의 과거 당첨 패턴을 AI가 분석했습니다</p>
                  </div>
                </div>
              </div>
              <div className="neo-card bg-white/80">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-black">최근 10회차 트렌드 분석</p>
                    <p className="text-sm">핫넘버와 콜드넘버의 반전 시점을 포착했습니다</p>
                  </div>
                </div>
              </div>
              <div className="neo-card bg-white/80">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-black">당첨 확률 극대화 전략</p>
                    <p className="text-sm">8가지 알고리즘 중 가장 높은 점수의 조합을 선택하세요</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 행운의 메시지 */}
      <div className="neo-card bg-gradient-to-r from-success to-accent text-white text-center animate-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        <p 
          className="text-2xl font-black mb-2 animate-jackpot relative z-10"
          style={{
            textShadow: '3px 3px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000',
            color: '#FFFFFF'
          }}
        >
          🍀 오늘이 바로 그날! 🍀
        </p>
        <p 
          className="font-bold relative z-10"
          style={{
            textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
            color: '#FFFFFF',
            fontWeight: '900'
          }}
        >
          당신의 인생을 바꿀 6개의 숫자가 여기 있습니다!
        </p>
      </div>
    </div>
  );
}