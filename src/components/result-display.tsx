'use client';

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
  if (!results.success || !results.data) {
    return (
      <div className="neo-card bg-error/20">
        <h2 className="text-2xl font-black text-error">❌ 번호 생성 실패</h2>
        <p>다시 시도해주세요.</p>
      </div>
    );
  }

  const { data } = results;
  const methods = Object.entries(data.results);

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
      {/* 날짜 정보 헤더 */}
      <div className="neo-card bg-accent text-black">
        <h1 className="text-3xl font-black mb-4 uppercase">
          🎯 {data.meta.lunarInfo.month}월 {data.meta.lunarInfo.day}일 특별 분석 완료!
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm font-bold">
          <div>🌙 윤6월 특수 에너지</div>
          <div>🐍 을사년 직감의 해</div>
          <div>⭐ 대길일 보너스</div>
          <div>🎰 19년에 한 번 기회</div>
        </div>
      </div>

      {/* 생성된 번호들 */}
      <div className="grid gap-6">
        {methods.map(([key, result], index) => (
          <div key={key} className="neo-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getMethodIcon(key)}</span>
              <div>
                <h3 className="text-xl font-black uppercase">{result.method}</h3>
                <p className="text-sm text-gray-600">{result.description}</p>
              </div>
            </div>
            
            {/* 로또 번호 공들 */}
            <div className="flex gap-3 justify-center mb-4">
              {result.numbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`lotto-ball ${getMethodColor(index)} text-white`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* 가짜 분석 정보 */}
            <div className="neo-card bg-gray-50 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <div>📊 적중률: {85 + Math.floor(Math.random() * 10)}%</div>
                <div>🔥 열정도: {Math.floor(Math.random() * 5) + 1}/5</div>
                <div>💎 희소성: {Math.floor(Math.random() * 3) + 1}/3</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 보너스 인사이트 */}
      <div className="neo-card bg-success/20">
        <h3 className="text-xl font-black mb-4">🎰 보너스 인사이트</h3>
        <div className="space-y-2 text-sm font-bold">
          <p>🔮 윤달 예측: 12, 19, 33번이 이번 달 강세!</p>
          <p>📈 트렌드 분석: 30번대 숫자들이 상승세</p>
          <p>⚡ 특급 팁: 윤6월은 변화의 달 - 평소와 다른 선택을!</p>
          <p>💰 이번 회차 예상 1등 상금: {Math.floor(Math.random() * 20 + 30)}억원</p>
          <p>🍀 당신의 운세: 매우 좋음 (윤달 보너스!)</p>
        </div>
      </div>
    </div>
  );
}