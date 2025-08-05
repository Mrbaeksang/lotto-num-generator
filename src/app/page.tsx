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
      {/* 컴팩트 헤더 */}
      <header className="neo-card bg-white text-black text-center mb-6 py-4">
        <h1 className="text-3xl font-black mb-2 uppercase">
          🎯 로또 번호 생성기
        </h1>
        <p className="text-sm font-bold text-gray-700">
          🌙 전통 음력 × 📊 실시간 데이터 = ✨ 당신만의 로또 번호!
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* 2단 레이아웃: 왼쪽 입력, 오른쪽 결과 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* 왼쪽: 입력 섹션 */}
          <div className="space-y-4">
            {/* 진행 상태 표시 */}
            <div className="neo-card bg-accent text-black text-center py-3">
              <div className="flex justify-center items-center gap-2 text-sm font-bold">
                <div className={`flex items-center gap-1 ${dateInfo ? 'text-success' : 'text-black'}`}>
                  <span>{dateInfo ? '✅' : '1️⃣'}</span>
                  <span>날짜선택</span>
                </div>
                <span>→</span>
                <div className={`flex items-center gap-1 ${dateInfo ? 'text-black' : 'text-gray-400'}`}>
                  <span>2️⃣</span>
                  <span>번호생성</span>
                </div>
                <span>→</span>
                <div className={`flex items-center gap-1 ${generationResults ? 'text-success' : 'text-gray-400'}`}>
                  <span>{generationResults ? '✅' : '3️⃣'}</span>
                  <span>결과확인</span>
                </div>
              </div>
            </div>
            
            {/* Step 1: 날짜 선택 */}
            <DatePicker onDateSelect={handleDateSelect} />

            {/* Step 2: 번호 생성 (날짜 선택 후에만 표시) */}
            {dateInfo && (
              <NumberGenerator 
                dateInfo={dateInfo}
                onGenerate={handleGenerate}
              />
            )}
            
            {/* 하단 정보 */}
            <div className="neo-card bg-gray-50 text-center py-3">
              <p className="font-bold text-sm mb-1">🎲 8가지 심리적 매력 방식</p>
              <p className="text-xs text-gray-600">핫넘버•콜드넘버•상승세•균형조합•개인특화•요일분석•계절가중•역발상</p>
            </div>
          </div>

          {/* 오른쪽: 결과 섹션 */}
          <div className="space-y-4">
            {generationResults ? (
              <ResultDisplay results={generationResults} />
            ) : (
              <div className="neo-card bg-gray-50 text-center py-16">
                <div className="text-6xl mb-4">🎰</div>
                <h3 className="text-xl font-black mb-2">결과 대기 중</h3>
                <p className="text-gray-600">날짜를 선택하고 번호를 생성해주세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 간단한 Footer */}
      <footer className="mt-8 py-4 text-center text-xs text-gray-500">
        <p>※ 재미와 참고용 • 공식 정보는 동행복권 공식 사이트 확인</p>
      </footer>
    </div>
  );
}
