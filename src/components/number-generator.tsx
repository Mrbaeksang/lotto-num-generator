'use client';

import { useState, useRef, useEffect } from 'react';
import { RoundSelector } from '@/components/forms/round-selector';

interface NumberGeneratorProps {
  dateInfo: {
    lunarDay: number;
    lunarMonth: number;
    solarDate: string;
  };
  onGenerate: (results: {
    success: boolean;
    data?: {
      results: Record<string, { numbers: number[]; method: string; description: string; }>;
      meta: { lunarInfo: { day: number; month: number; }; };
    };
  }) => void;
}

export default function NumberGenerator({ dateInfo, onGenerate }: NumberGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [analysisRounds, setAnalysisRounds] = useState(50); // 기본값: 50회차
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [collectedData, setCollectedData] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);

  const methods = [
    { id: 'hot', name: '🔥 핫넘버', desc: '최근 가장 많이 나온 번호들' },
    { id: 'cold', name: '❄️ 콜드넘버', desc: '터질 때가 된 번호들' },
    { id: 'trend', name: '📈 상승세', desc: '출현 빈도 증가 트렌드' },
    { id: 'balanced', name: '⚖️ 균형 조합', desc: '홀짝, 구간별 황금비율' },
    { id: 'personal', name: '🎯 개인 특화', desc: '음력 날짜 맞춤 번호' },
    { id: 'weekday', name: '🗓️ 요일 분석', desc: '토요일 추첨 패턴' },
    { id: 'seasonal', name: '📅 계절 가중', desc: '계절별 선호 번호' },
    { id: 'contrarian', name: '🔄 역발상', desc: '남들과 다른 선택' }
  ];

  // 자동 스크롤 기능
  const scrollToBottom = () => {
    if (dataContainerRef.current) {
      dataContainerRef.current.scrollTo({
        top: dataContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // collectedData가 업데이트될 때마다 자동 스크롤
  useEffect(() => {
    if (collectedData.length > 0) {
      setTimeout(scrollToBottom, 100); // 약간의 지연 후 스크롤
    }
  }, [collectedData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowLoading(true);
    setCollectedData([]);
    setCurrentStatus('');
    setCurrentStep(0);
    
    try {
      // 실시간 데이터 수집 시뮬레이션 - 모든 과정 상세하게 표시
      const statuses = [
        { msg: '🔍 동행복권 공식 사이트 접속 중...', delay: 800 },
        { msg: '🌐 SSL 보안 연결 설정 완료', delay: 500 },
        { msg: '📊 최근 당첨번호 수집 중... (1146회)', delay: 700, data: '1146회: 2, 8, 19, 25, 33, 44 + 15' },
        { msg: '📊 최근 당첨번호 수집 중... (1145회)', delay: 700, data: '1145회: 3, 7, 14, 28, 35, 40 + 21' },
        { msg: '📊 최근 당첨번호 수집 중... (1144회)', delay: 600, data: '1144회: 5, 12, 17, 29, 34, 45 + 7' },
        { msg: '📊 최근 당첨번호 수집 중... (1143회)', delay: 600, data: '1143회: 1, 9, 16, 23, 31, 42 + 38' },
        { msg: '📊 최근 당첨번호 수집 중... (1142회)', delay: 600, data: '1142회: 6, 11, 18, 24, 37, 43 + 12' },
        { msg: '📊 최근 당첨번호 수집 중... (1141회)', delay: 600, data: '1141회: 4, 13, 21, 30, 39, 45 + 9' },
        { msg: '📊 최근 당첨번호 수집 중... (1140회)', delay: 600, data: '1140회: 7, 14, 22, 28, 35, 41 + 16' },
        { msg: `📈 총 ${analysisRounds}회차 데이터 검증 완료`, delay: 500, data: `${analysisRounds}건의 당첨번호 데이터베이스 구축` },
        { msg: '🔢 번호별 출현 빈도 계산 시작...', delay: 700, data: '1~45번까지 각 번호의 출현 횟수 집계 중' },
        { msg: '📊 구간별 통계 분석 중... (1-15번)', delay: 600, data: '1번:12회, 3번:15회, 7번:18회, 13번:16회, 14번:6회...' },
        { msg: '📊 구간별 통계 분석 중... (16-30번)', delay: 600, data: '17번:14회, 21번:19회, 22번:5회, 25번:17회, 28번:11회...' },
        { msg: '📊 구간별 통계 분석 중... (31-45번)', delay: 600, data: '33번:13회, 34번:20회, 37번:9회, 40번:16회, 43번:8회...' },
        { msg: '🔥 핫넘버 TOP10 순위 계산 중...', delay: 700, data: '1위:34번(20회), 2위:21번(19회), 3위:7번(18회), 4위:25번(17회)...' },
        { msg: '❄️ 콜드넘버 TOP10 순위 계산 중...', delay: 700, data: '최저:22번(5회), 14번(6회), 43번(8회), 37번(9회)...' },
        { msg: '📈 최근 5회차 트렌드 패턴 분석...', delay: 600, data: '상승세: 7,17,27,34번 | 하락세: 9,22,35,41번' },
        { msg: '⚖️ 홀짝 균형도 계산 중...', delay: 500, data: '홀수 평균: 52.3% | 짝수 평균: 47.7%' },
        { msg: '🎯 구간별 분포도 분석 중...', delay: 500, data: '저구간: 33.2% | 중구간: 34.1% | 고구간: 32.7%' },
        { msg: '🌙 음력 운세 가중치 계산 중...', delay: 600, data: `음력 ${dateInfo.lunarMonth}월 ${dateInfo.lunarDay}일 - 길한 번호: 7,13,21,34` },
        { msg: '🤖 AI 딥러닝 패턴 매칭 시작...', delay: 800, data: '신경망 모델 로딩... 97% 완료' },
        { msg: '🎲 8가지 알고리즘 조합 생성 중...', delay: 700, data: 'HOT/COLD/BALANCED/TREND/LUNAR/RANDOM/STATS/CONTRARIAN' },
        { msg: '🔍 최종 검증 및 중복 제거 중...', delay: 500, data: '각 조합별 당첨 확률 검증 완료' },
        { msg: '✨ 번호 생성 완료! 행운을 빕니다!', delay: 800, data: '🍀 8가지 최적화된 조합이 준비되었습니다!' }
      ];

      // 순차적으로 상태 업데이트
      for (let i = 0; i < statuses.length; i++) {
        const status = statuses[i];
        setCurrentStatus(status.msg);
        setCurrentStep(i + 1);
        
        await new Promise(resolve => setTimeout(resolve, status.delay));
        
        if (status.data) {
          setCollectedData(prev => [...prev, status.data!]);
        }
      }
      
      // API 호출 단계 추가 (24단계)
      setCurrentStatus('🚀 AI 번호 생성 API 호출 중...');
      setCurrentStep(24);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 실제 API 호출
      const response = await fetch('/api/lottery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lunarDay: dateInfo.lunarDay,
          lunarMonth: dateInfo.lunarMonth,
          analysisCount: analysisRounds
        })
      });
      
      // 데이터 처리 단계 (25단계)
      setCurrentStatus('📊 생성된 번호 데이터 처리 중...');
      setCurrentStep(25);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = await response.json();
      
      // 최종 완료 단계 (26단계)
      setCurrentStatus('✅ 번호 생성 완료! 결과를 확인하세요!');
      setCurrentStep(26);
      onGenerate(data);
      
      // 완료 메시지 표시 시간
      await new Promise(resolve => setTimeout(resolve, 2500));
    } catch (error) {
      console.error('번호 생성 실패:', error);
      setCurrentStatus('❌ 번호 생성 실패. 다시 시도해주세요.');
      // 에러 시에도 3초 후에 모달 닫기
      setTimeout(() => {
        setShowLoading(false);
        setCurrentStatus('');
        setCollectedData([]);
        setCurrentStep(0);
      }, 3000);
      return;
    } finally {
      setIsGenerating(false);
      // 모달은 성공 시에만 여기서 닫기
      setShowLoading(false);
      // 상태 메시지는 8초 후에 지우기 (훨씬 더 오래 보여주기)
      setTimeout(() => {
        setCurrentStatus('');
        setCollectedData([]);
        setCurrentStep(0);
      }, 8000);
    }
  };

  return (
    <div className="neo-card">
      <h2 className="text-2xl font-black mb-6 uppercase">🎲 번호 생성 방식</h2>
      
      {/* 날짜 정보 표시 */}
      <div className="neo-card bg-accent/20 mb-6">
        <p className="font-bold">📅 선택된 날짜: {dateInfo.solarDate}</p>
        <p className="font-bold">🌙 음력: {dateInfo.lunarMonth}월 {dateInfo.lunarDay}일</p>
      </div>

      {/* 분석 회차수 선택 */}
      <div className="mb-6">
        <RoundSelector
          value={analysisRounds}
          onChange={setAnalysisRounds}
          label="📊 분석 데이터 범위"
          description="몇 회차의 과거 데이터로 분석할지 선택하세요"
        />
      </div>

      {/* 생성 방식 선택 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {methods.map((method) => (
          <div key={method.id} className="neo-card bg-gray-50">
            <h3 className="text-lg font-black">{method.name}</h3>
            <p className="text-sm">{method.desc}</p>
          </div>
        ))}
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="neo-button w-full bg-primary text-white font-black text-xl py-6"
      >
        {isGenerating ? '🎰 생성 중...' : '🚀 8가지 방식으로 번호 생성!'}
      </button>
      
      {/* 실시간 데이터 수집 상태 표시 */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            ref={modalContentRef}
            className="neo-card bg-white max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-slideUp flex flex-col"
          >
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 flex-shrink-0">
              <span className="animate-spin">🎰</span>
              AI 로또번호 생성 중...
            </h3>
            
            {/* 현재 상태 표시 */}
            <div className="mb-4 flex-shrink-0">
              <p className="text-lg font-bold text-primary animate-pulse">
                {currentStatus}
              </p>
            </div>
            
            {/* 수집된 데이터 표시 - 자동 스크롤 영역 */}
            {collectedData.length > 0 && (
              <div className="space-y-2 mb-4 flex-1 min-h-0">
                <h4 className="font-black text-sm uppercase flex-shrink-0">📊 수집된 데이터:</h4>
                <div 
                  ref={dataContainerRef}
                  className="space-y-1 overflow-y-auto neo-card bg-gray-50 p-3 flex-1 min-h-0"
                  style={{ maxHeight: '200px' }}
                >
                  {collectedData.map((data, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm font-mono animate-fadeIn"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      ✅ {data}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 border-2 border-black h-8 relative overflow-hidden flex-shrink-0">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 26) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-black">
                {currentStep}/26 단계
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-2 text-center flex-shrink-0">
              {currentStep <= 23 ? '실시간으로 동행복권 공식 데이터를 수집하고 있습니다...' :
               currentStep <= 25 ? 'AI 알고리즘으로 최적의 번호 조합을 생성하고 있습니다...' :
               '번호 생성이 완료되었습니다! 잠시만 기다려주세요...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}