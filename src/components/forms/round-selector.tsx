'use client';

import { useState } from 'react';

interface RoundSelectorProps {
  value: number;
  onChange: (rounds: number) => void;
  min?: number;
  max?: number;
  label?: string;
  description?: string;
}

const PRESET_ROUNDS = [20, 30, 50, 70, 100];

export function RoundSelector({ 
  value, 
  onChange, 
  min = 20, 
  max = 100, 
  label = "분석 회차수",
  description = "최근 몇 회차를 분석할지 선택하세요"
}: RoundSelectorProps) {
  const [customValue, setCustomValue] = useState(value.toString());
  const [isCustomMode, setIsCustomMode] = useState(!PRESET_ROUNDS.includes(value));

  const handlePresetClick = (rounds: number) => {
    setIsCustomMode(false);
    setCustomValue(rounds.toString());
    onChange(rounds);
  };

  const handleCustomChange = (inputValue: string) => {
    setCustomValue(inputValue);
    const numValue = parseInt(inputValue);
    
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const toggleCustomMode = () => {
    if (isCustomMode) {
      // 커스텀 모드에서 나갈 때, 가장 가까운 프리셋으로 설정
      const closestPreset = PRESET_ROUNDS.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      handlePresetClick(closestPreset);
    } else {
      setIsCustomMode(true);
    }
  };

  return (
    <div className="neo-card bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-black text-black mb-2">{label}</h3>
        <p className="text-sm font-medium text-gray-700 normal-case">{description}</p>
      </div>

      {/* 프리셋 버튼들 */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {PRESET_ROUNDS.map((rounds) => (
          <button
            key={rounds}
            onClick={() => handlePresetClick(rounds)}
            className={`neo-button py-2 px-3 text-sm transition-all ${
              !isCustomMode && value === rounds
                ? 'bg-primary text-white'
                : 'bg-gray-300 text-black hover:bg-gray-400'
            }`}
          >
            {rounds}회차
          </button>
        ))}
      </div>

      {/* 커스텀 입력 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-black">직접 입력</span>
          <button
            onClick={toggleCustomMode}
            className={`neo-button py-1 px-3 text-xs transition-all ${
              isCustomMode 
                ? 'bg-accent text-black' 
                : 'bg-gray-300 text-black hover:bg-gray-400'
            }`}
          >
            {isCustomMode ? '활성' : '비활성'}
          </button>
        </div>

        {isCustomMode && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={min}
                max={max}
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="neo-input flex-1 text-center text-lg"
                placeholder={`${min}-${max}`}
              />
              <span className="text-sm font-bold text-black">회차</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">최소: {min}회차</span>
              <span className="text-gray-600">최대: {max}회차</span>
            </div>

            {/* 유효성 검증 메시지 */}
            {(() => {
              const numValue = parseInt(customValue);
              if (isNaN(numValue)) {
                return <p className="text-error text-xs">숫자를 입력해주세요</p>;
              }
              if (numValue < min) {
                return <p className="text-error text-xs">최소 {min}회차 이상 입력해주세요</p>;
              }
              if (numValue > max) {
                return <p className="text-error text-xs">최대 {max}회차 이하로 입력해주세요</p>;
              }
              return <p className="text-success text-xs">✓ 유효한 회차수입니다</p>;
            })()}
          </div>
        )}
      </div>

      {/* 현재 선택 상태 표시 */}
      <div className="mt-4 p-3 bg-accent/20 border-2 border-black">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-black">현재 선택:</span>
          <span className="text-lg font-black text-primary">{value}회차</span>
        </div>
        <p className="text-xs text-gray-700 mt-1 normal-case">
          최근 {value}회차 데이터로 분석을 진행합니다
        </p>
      </div>

      {/* 회차수별 분석 시간 가이드 */}
      <div className="mt-3 text-xs text-gray-600 normal-case">
        <div className="flex justify-between">
          <span>20-30회차: 빠른 분석 (~3초)</span>
          <span>50-70회차: 보통 분석 (~5초)</span>
          <span>100회차: 심화 분석 (~8초)</span>
        </div>
      </div>
    </div>
  );
}