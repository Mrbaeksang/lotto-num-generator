'use client';

import { useState } from 'react';
import DatePicker from '@/components/date-picker';
import NumberGenerator from '@/components/number-generator';
import ResultDisplay from '@/components/result-display';

export default function Home() {
  const [dateInfo, setDateInfo] = useState<{
    lunarDay: number;
    lunarMonth: number; 
    solarDate: string;
  } | null>(null);
  
  const [generationResults, setGenerationResults] = useState<{
    success: boolean;
    data?: {
      results: Record<string, { numbers: number[]; method: string; description: string; }>;
      meta: { lunarInfo: { day: number; month: number; }; };
    };
  } | null>(null);

  const handleDateSelect = (selectedDate: { lunarDay: number; lunarMonth: number; solarDate: string }) => {
    setDateInfo(selectedDate);
    setGenerationResults(null); // 날짜 변경시 결과 초기화
  };

  const handleGenerate = (results: {
    success: boolean;
    data?: {
      results: Record<string, { numbers: number[]; method: string; description: string; }>;
      meta: { lunarInfo: { day: number; month: number; }; };
    };
  }) => {
    setGenerationResults(results);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="neo-card bg-primary text-white text-center mb-8">
        <h1 className="text-4xl font-black mb-4 uppercase">
          🎯 로또 번호 생성기
        </h1>
        <p className="text-xl font-bold">
          🌙 전통 음력 × 📊 실시간 데이터 = ✨ 당신만의 로또 번호!
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Step 1: 날짜 선택 */}
        <div className="neo-grid">
          <DatePicker onDateSelect={handleDateSelect} />
        </div>

        {/* Step 2: 번호 생성 (날짜 선택 후에만 표시) */}
        {dateInfo && (
          <div className="neo-grid">
            <NumberGenerator 
              dateInfo={dateInfo}
              onGenerate={handleGenerate}
            />
          </div>
        )}

        {/* Step 3: 결과 표시 (생성 후에만 표시) */}
        {generationResults && (
          <div className="neo-grid">
            <ResultDisplay results={generationResults} />
          </div>
        )}

        {/* 진행 상태 표시 */}
        <div className="neo-card bg-gray-50 text-center">
          <div className="flex justify-center items-center gap-4">
            <div className={`flex items-center gap-2 ${dateInfo ? 'text-success' : 'text-gray-400'}`}>
              <span className="text-2xl">{dateInfo ? '✅' : '1️⃣'}</span>
              <span className="font-bold">날짜 선택</span>
            </div>
            
            <div className="text-3xl text-gray-300">→</div>
            
            <div className={`flex items-center gap-2 ${dateInfo ? 'text-black' : 'text-gray-400'}`}>
              <span className="text-2xl">{dateInfo ? '2️⃣' : '2️⃣'}</span>
              <span className="font-bold">번호 생성</span>
            </div>
            
            <div className="text-3xl text-gray-300">→</div>
            
            <div className={`flex items-center gap-2 ${generationResults ? 'text-success' : 'text-gray-400'}`}>
              <span className="text-2xl">{generationResults ? '✅' : '3️⃣'}</span>
              <span className="font-bold">결과 확인</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600">
        <div className="neo-card bg-gray-50">
          <p className="font-bold mb-2">🎲 8가지 심리적 매력 방식</p>
          <p className="text-sm">핫넘버 • 콜드넘버 • 상승세 • 균형조합 • 개인특화 • 요일분석 • 계절가중 • 역발상</p>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs">
            <p>※ 이 앱에서 생성된 번호는 재미와 참고용입니다</p>
            <p>※ 공식 정보는 동행복권 공식 사이트에서 확인하세요</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
