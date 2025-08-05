'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Chart.js 등록을 브라우저 환경에서만 처리
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );
}

interface BalanceChartProps {
  numbers: number[];
  title?: string;
}

export default function BalanceChart({ 
  numbers, 
  title = "⚖️ 번호 균형 분석" 
}: BalanceChartProps) {
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 차트 준비
    setIsChartReady(true);
  }, []);

  // 홀짝 분석
  const oddCount = numbers.filter(n => n % 2 === 1).length;
  const evenCount = numbers.length - oddCount;
  
  // 구간 분석 (1-15, 16-30, 31-45)
  const lowCount = numbers.filter(n => n <= 15).length;
  const midCount = numbers.filter(n => n >= 16 && n <= 30).length;
  const highCount = numbers.filter(n => n >= 31).length;
  
  // 끝자리 분석
  const lastDigits = numbers.map(n => n % 10);
  const lastDigitCounts = Array.from({length: 10}, (_, i) => 
    lastDigits.filter(d => d === i).length
  );

  // 홀짝 도넛 차트 데이터
  const oddEvenData = {
    labels: ['홀수', '짝수'],
    datasets: [{
      data: [oddCount, evenCount],
      backgroundColor: ['#FF3366', '#0033CC'],
      borderColor: ['#000000', '#000000'],
      borderWidth: 3,
      hoverBorderWidth: 4
    }]
  };

  // 구간 분포 막대 차트 데이터
  const rangeData = {
    labels: ['1-15\n(저구간)', '16-30\n(중구간)', '31-45\n(고구간)'],
    datasets: [{
      label: '개수',
      data: [lowCount, midCount, highCount],
      backgroundColor: ['#FFCC00', '#00CC66', '#FF6600'],
      borderColor: ['#000000', '#000000', '#000000'],
      borderWidth: 3
    }]
  };

  // 끝자리 분포 막대 차트 데이터
  const lastDigitData = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [{
      label: '개수',
      data: lastDigitCounts,
      backgroundColor: lastDigitCounts.map(count => 
        count > 0 ? '#FF3366' : '#E5E5E5'
      ),
      borderColor: '#000000',
      borderWidth: 2
    }]
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '홀수 vs 짝수',
        font: { size: 14, weight: 'bold' },
        color: '#000000'
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { weight: 'bold', size: 12 },
          color: '#000000',
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cornerRadius: 0,
        callbacks: {
          label: function(context) {
            const total = oddCount + evenCount;
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}개 (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '구간별 분포',
        font: { size: 14, weight: 'bold' },
        color: '#000000'
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cornerRadius: 0,
        callbacks: {
          label: function(context) {
            const percentage = ((context.parsed.y / numbers.length) * 100).toFixed(1);
            return `${context.parsed.y}개 (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold', size: 10 }, color: '#000000' },
        border: { color: '#000000', width: 2 }
      },
      y: {
        beginAtZero: true,
        max: Math.max(3, Math.max(lowCount, midCount, highCount) + 1),
        grid: { color: '#00000020' },
        ticks: { 
          font: { weight: 'bold', size: 12 }, 
          color: '#000000',
          stepSize: 1
        },
        border: { color: '#000000', width: 2 }
      }
    }
  };

  const lastDigitOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '끝자리 분포',
        font: { size: 14, weight: 'bold' },
        color: '#000000'
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cornerRadius: 0,
        callbacks: {
          label: function(context) {
            const digit = context.label;
            const count = context.parsed.y;
            const relatedNumbers = numbers.filter(n => n % 10 === parseInt(digit));
            return count > 0 
              ? [`끝자리 ${digit}: ${count}개`, `번호: ${relatedNumbers.join(', ')}`]
              : `끝자리 ${digit}: 없음`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold', size: 12 }, color: '#000000' },
        border: { color: '#000000', width: 2 }
      },
      y: {
        beginAtZero: true,
        max: 3,
        grid: { color: '#00000020' },
        ticks: { 
          font: { weight: 'bold', size: 12 }, 
          color: '#000000',
          stepSize: 1
        },
        border: { color: '#000000', width: 2 }
      }
    }
  };

  // 균형도 점수 계산
  const calculateBalanceScore = () => {
    // 홀짝 균형 (이상적: 3:3)
    const oddEvenBalance = 100 - Math.abs(oddCount - evenCount) * 25;
    
    // 구간 균형 (이상적: 2:2:2)
    const avgRange = numbers.length / 3;
    const rangeDeviation = (Math.abs(lowCount - avgRange) + 
                           Math.abs(midCount - avgRange) + 
                           Math.abs(highCount - avgRange)) / 3;
    const rangeBalance = Math.max(0, 100 - rangeDeviation * 25);
    
    // 연속번호 체크 (적을수록 좋음)
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 0;
    for (let i = 0; i < sortedNumbers.length - 1; i++) {
      if (sortedNumbers[i + 1] - sortedNumbers[i] === 1) {
        consecutiveCount++;
      }
    }
    const consecutiveBalance = Math.max(0, 100 - consecutiveCount * 20);
    
    const totalScore = (oddEvenBalance + rangeBalance + consecutiveBalance) / 3;
    return Math.round(totalScore);
  };

  const balanceScore = calculateBalanceScore();

  if (!isChartReady) {
    return (
      <div className="neo-card bg-white animate-slideUp">
        <div className="h-80 flex items-center justify-center">
          <span className="animate-spin text-4xl">⏳</span>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card bg-white animate-slideUp">
      <div className="mb-6">
        <h3 className="text-xl font-black mb-2 text-center">{title}</h3>
        <div className="text-center">
          <div className="text-sm font-bold mb-2">선택된 번호</div>
          <div className="flex justify-center gap-2 mb-4">
            {numbers.sort((a, b) => a - b).map(num => (
              <div key={num} className="neo-badge bg-primary text-white text-lg font-black">
                {num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 균형도 점수 */}
      <div className={`neo-card text-center mb-6 ${
        balanceScore >= 80 ? 'bg-success/20' : 
        balanceScore >= 60 ? 'bg-accent/20' : 'bg-error/20'
      }`}>
        <div className="text-lg font-black">균형도 점수</div>
        <div className={`text-3xl font-black ${
          balanceScore >= 80 ? 'text-success' : 
          balanceScore >= 60 ? 'text-warning' : 'text-error'
        }`}>
          {balanceScore}점
        </div>
        <div className="text-sm font-bold">
          {balanceScore >= 80 ? '🏆 매우 균형잡힌 조합!' : 
           balanceScore >= 60 ? '👍 적당한 균형' : '⚠️ 균형 개선 필요'}
        </div>
      </div>

      {/* 차트들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 홀짝 도넛 차트 */}
        <div className="neo-card bg-gray-50">
          <div className="h-40">
            <Doughnut data={oddEvenData} options={doughnutOptions} />
          </div>
          <div className="text-center mt-2 text-sm font-bold">
            홀{oddCount}:짝{evenCount}
          </div>
        </div>

        {/* 구간 분포 차트 */}
        <div className="neo-card bg-gray-50">
          <div className="h-40">
            <Bar data={rangeData} options={barOptions} />
          </div>
          <div className="text-center mt-2 text-sm font-bold">
            {lowCount}:{midCount}:{highCount}
          </div>
        </div>

        {/* 끝자리 분포 차트 */}
        <div className="neo-card bg-gray-50">
          <div className="h-40">
            <Bar data={lastDigitData} options={lastDigitOptions} />
          </div>
          <div className="text-center mt-2 text-sm font-bold">
            {lastDigitCounts.filter(c => c > 0).length}가지 끝자리
          </div>
        </div>
      </div>

      {/* 상세 분석 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="neo-card bg-accent/10">
          <h4 className="font-black text-sm mb-2">📊 구성 분석</h4>
          <div className="text-xs space-y-1">
            <div>홀수: {numbers.filter(n => n % 2 === 1).join(', ')}</div>
            <div>짝수: {numbers.filter(n => n % 2 === 0).join(', ')}</div>
            <div>저구간(1-15): {numbers.filter(n => n <= 15).join(', ') || '없음'}</div>
            <div>중구간(16-30): {numbers.filter(n => n >= 16 && n <= 30).join(', ') || '없음'}</div>
            <div>고구간(31-45): {numbers.filter(n => n >= 31).join(', ') || '없음'}</div>
          </div>
        </div>

        <div className="neo-card bg-accent/10">
          <h4 className="font-black text-sm mb-2">🎯 균형 팁</h4>
          <div className="text-xs space-y-1">
            {oddCount === evenCount ? 
              <div className="text-success">✅ 홀짝 균형 완벽!</div> : 
              <div className="text-warning">⚠️ 홀짝 균형: {Math.abs(oddCount - evenCount)}개 차이</div>
            }
            {lowCount >= 1 && midCount >= 1 && highCount >= 1 ? 
              <div className="text-success">✅ 전 구간 포함!</div> : 
              <div className="text-warning">⚠️ 특정 구간 편중</div>
            }
            {numbers.some((n, i) => i > 0 && n - numbers[i-1] === 1) ?
              <div className="text-warning">⚠️ 연속번호 있음</div> :
              <div className="text-success">✅ 연속번호 없음</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}