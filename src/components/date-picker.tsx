'use client';

import { useState } from 'react';
import { LunarCalendar } from '@/lib/lunar/lunar-calendar';

interface DatePickerProps {
  onDateSelect: (date: { lunarDay: number; lunarMonth: number; solarDate: string }) => void;
}

export default function DatePicker({ onDateSelect }: DatePickerProps) {
  const [isLunar, setIsLunar] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = () => {
    // 날짜 유효성 검사
    if (isNaN(selectedDate.getTime())) {
      console.error('Invalid date selected:', selectedDate);
      return;
    }

    try {
      if (isLunar) {
        // 음력 모드: 입력된 날짜를 그대로 음력으로 사용
        const lunarDay = selectedDate.getDate();
        const lunarMonth = selectedDate.getMonth() + 1;
        
        onDateSelect({
          lunarDay,
          lunarMonth,
          solarDate: formatDateForInput(selectedDate)
        });
        
        console.log(`📅 음력 날짜 선택: 음력 ${lunarMonth}월 ${lunarDay}일 (입력날짜: ${formatDateForInput(selectedDate)})`);
      } else {
        // 양력 모드: 양력을 음력으로 변환
        const lunarInfo = LunarCalendar.getLunarInfo(selectedDate);
        
        onDateSelect({
          lunarDay: lunarInfo.lunar.day,
          lunarMonth: lunarInfo.lunar.month,
          solarDate: formatDateForInput(selectedDate)
        });
        
        console.log(`📅 양력→음력 변환: 양력 ${formatDateForInput(selectedDate)} → 음력 ${lunarInfo.lunar.month}월 ${lunarInfo.lunar.day}일`);
      }
    } catch (error) {
      console.error('Date processing failed:', error);
      // 폴백: 기본값 사용
      onDateSelect({
        lunarDay: selectedDate.getDate(),
        lunarMonth: selectedDate.getMonth() + 1,
        solarDate: formatDateForInput(selectedDate)
      });
    }
  };

  // 안전한 날짜 문자열 변환 함수
  const formatDateForInput = (date: Date): string => {
    if (isNaN(date.getTime())) {
      // 유효하지 않은 날짜일 경우 오늘 날짜 사용
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  // 안전한 날짜 파싱 함수
  const parseInputDate = (dateString: string): Date => {
    if (!dateString) {
      return new Date(); // 빈 문자열이면 오늘 날짜 반환
    }
    
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date string:', dateString, 'Using today instead');
      return new Date(); // 유효하지 않으면 오늘 날짜 반환
    }
    
    return parsedDate;
  };

  return (
    <div className="neo-card">
      <h2 className="text-2xl font-black mb-6 uppercase">📅 날짜 선택</h2>
      
      {/* 음력/양력 토글 */}
      <div className="flex gap-4 mb-6">
        <button
          className={`neo-button ${isLunar ? 'bg-primary text-white' : 'bg-gray-300 text-black'}`}
          onClick={() => setIsLunar(true)}
        >
          🌙 음력
        </button>
        <button
          className={`neo-button ${!isLunar ? 'bg-primary text-white' : 'bg-gray-300 text-black'}`}
          onClick={() => setIsLunar(false)}
        >
          ☀️ 양력
        </button>
      </div>

      {/* 현재 모드 설명 */}
      <div className="neo-card bg-accent/20 mb-4">
        <p className="text-sm font-bold text-black">
          {isLunar ? 
            '🌙 음력 모드: 입력한 날짜를 음력으로 인식합니다' : 
            '☀️ 양력 모드: 입력한 양력 날짜를 음력으로 변환합니다'
          }
        </p>
      </div>

      {/* 날짜 입력 */}
      <div className="mb-6">
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={(e) => setSelectedDate(parseInputDate(e.target.value))}
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