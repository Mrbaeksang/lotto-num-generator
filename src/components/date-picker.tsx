'use client';

import { useState } from 'react';

interface DatePickerProps {
  onDateSelect: (date: { lunarDay: number; lunarMonth: number; solarDate: string }) => void;
}

export default function DatePicker({ onDateSelect }: DatePickerProps) {
  const [isLunar, setIsLunar] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = () => {
    // 임시 데이터 - 실제로는 lunar-calendar.ts와 연동
    onDateSelect({
      lunarDay: 12,
      lunarMonth: 6,
      solarDate: selectedDate.toISOString().split('T')[0]
    });
  };

  return (
    <div className="neo-card">
      <h2 className="text-2xl font-black mb-6 uppercase">📅 날짜 선택</h2>
      
      {/* 음력/양력 토글 */}
      <div className="flex gap-4 mb-6">
        <button
          className={`neo-button ${isLunar ? 'bg-primary' : 'bg-gray-300'}`}
          onClick={() => setIsLunar(true)}
        >
          🌙 음력
        </button>
        <button
          className={`neo-button ${!isLunar ? 'bg-primary' : 'bg-gray-300'}`}
          onClick={() => setIsLunar(false)}
        >
          ☀️ 양력
        </button>
      </div>

      {/* 날짜 입력 */}
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="neo-input w-full"
        />
      </div>

      {/* 선택 확인 버튼 */}
      <button
        onClick={handleDateSelect}
        className="neo-button w-full bg-accent text-black font-black"
      >
        ✨ 이 날짜로 분석하기!
      </button>
    </div>
  );
}