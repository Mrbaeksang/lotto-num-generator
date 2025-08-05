'use client';

import { useState } from 'react';
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
  const [analysisRounds, setAnalysisRounds] = useState(50); // 기본값: 50회차

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/lottery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lunarDay: dateInfo.lunarDay,
          lunarMonth: dateInfo.lunarMonth,
          analysisCount: analysisRounds
        })
      });
      
      const data = await response.json();
      onGenerate(data);
    } catch (error) {
      console.error('번호 생성 실패:', error);
    } finally {
      setIsGenerating(false);
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
    </div>
  );
}