'use client';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="neo-card bg-white p-8 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          {/* 로또 공 애니메이션 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary border-4 border-black animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-accent border-4 border-black animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-secondary border-4 border-black animate-spin" style={{ animationDuration: '0.6s' }} />
          </div>
        </div>
        
        <h2 className="text-2xl font-black mb-2 animate-pulse">
          🎰 행운의 번호 생성 중...
        </h2>
        <p className="text-sm font-bold text-gray-600">
          음력 운세와 AI가 만나는 순간!
        </p>
        
        {/* 재미있는 로딩 메시지 */}
        <div className="mt-4 space-y-1">
          <p className="text-xs animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            ✨ 오늘의 운세 분석 중...
          </p>
          <p className="text-xs animate-fadeIn" style={{ animationDelay: '1s' }}>
            📊 빅데이터 패턴 매칭 중...
          </p>
          <p className="text-xs animate-fadeIn" style={{ animationDelay: '1.5s' }}>
            🎯 당첨 확률 극대화 중...
          </p>
        </div>
      </div>
    </div>
  );
}