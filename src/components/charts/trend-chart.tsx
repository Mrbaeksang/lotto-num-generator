'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartDataset,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 등록을 브라우저 환경에서만 처리
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
  );
}

interface TrendChartProps {
  recentResults: Array<{
    round: number;
    date: string;
    numbers: number[];
  }>;
  targetNumbers?: number[];
  title?: string;
}

export default function TrendChart({ 
  recentResults, 
  targetNumbers = [],
  title = "📈 최근 당첨번호 트렌드" 
}: TrendChartProps) {
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 차트 준비
    setIsChartReady(true);
  }, []);

  // 최근 10회차 데이터로 트렌드 분석
  const recentData = recentResults.slice(0, 10).reverse(); // 오래된 것부터 정렬
  
  // 각 회차별로 타겟 번호들의 출현 여부 추적
  const datasets: ChartDataset<'line'>[] = targetNumbers.map((num, index) => {
    const appearances = recentData.map(result => 
      result.numbers.includes(num) ? 1 : 0
    );
    
    const colors = [
      '#FF3366', '#0033CC', '#FFCC00', '#00CC66', 
      '#FF6600', '#CC0000', '#9933CC', '#33CCCC'
    ];
    
    return {
      label: `${num}번`,
      data: appearances,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      borderWidth: 4,
      pointRadius: 6,
      pointBorderWidth: 3,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: colors[index % colors.length],
      tension: 0.1,
      fill: false
    };
  });

  // 전체 평균 출현율 라인 추가
  const avgAppearanceRate = recentData.map(() => targetNumbers.length * (6/45)); // 이론적 기댓값
  
  datasets.push({
    label: '이론적 기댓값',
    data: avgAppearanceRate,
    borderColor: '#00000050',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5],
    pointRadius: 0,
    tension: 0,
    fill: false
  });

  const data = {
    labels: recentData.map(result => `${result.round}회`),
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: 'bold',
          family: 'system-ui'
        },
        color: '#000000',
        padding: 20
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            weight: 'bold',
            size: 12
          },
          color: '#000000',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cornerRadius: 0,
        titleFont: {
          weight: 'bold'
        },
        callbacks: {
          title: function(context) {
            const round = context[0].label;
            const dataIndex = context[0].dataIndex;
            const date = recentData[dataIndex]?.date || '';
            return [`${round} (${date})`];
          },
          label: function(context) {
            const num = context.dataset.label?.replace('번', '');
            const appeared = context.parsed.y === 1;
            if (context.dataset.label?.includes('이론적')) {
              return `이론적 기댓값: ${context.parsed.y.toFixed(2)}개`;
            }
            return `${num}번: ${appeared ? '✅ 당첨' : '❌ 미당첨'}`;
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const roundData = recentData[dataIndex];
            if (roundData) {
              return [`실제 당첨번호: ${roundData.numbers.join(', ')}`];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#00000020',
          lineWidth: 1
        },
        ticks: {
          font: {
            weight: 'bold',
            size: 11
          },
          color: '#000000',
          maxRotation: 45
        },
        border: {
          color: '#000000',
          width: 3
        },
        title: {
          display: true,
          text: '회차',
          font: {
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        }
      },
      y: {
        beginAtZero: true,
        max: 1.2,
        grid: {
          color: '#00000020',
          lineWidth: 1
        },
        ticks: {
          font: {
            weight: 'bold',
            size: 12
          },
          color: '#000000',
          stepSize: 0.2,
          callback: function(value) {
            if (value === 0) return '미출현';
            if (value === 1) return '출현';
            return value;
          }
        },
        border: {
          color: '#000000',
          width: 3
        },
        title: {
          display: true,
          text: '출현 여부',
          font: {
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        }
      },
    },
  };

  // 통계 계산
  const stats = targetNumbers.map(num => {
    const appearances = recentData.filter(result => result.numbers.includes(num)).length;
    const rate = (appearances / recentData.length * 100).toFixed(1);
    return { num, appearances, rate };
  });

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
      <div className="h-80 mb-4">
        <Line data={data} options={options} />
      </div>
      
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(({ num, appearances, rate }) => (
          <div key={num} className="neo-card bg-gray-50 text-center py-2">
            <div className="text-lg font-black text-primary">{num}번</div>
            <div className="text-sm font-bold">
              {appearances}/{recentData.length}회
            </div>
            <div className="text-xs text-gray-600">
              {rate}% 출현율
            </div>
          </div>
        ))}
      </div>
      
      {/* 트렌드 분석 */}
      <div className="mt-4 p-3 bg-accent/20 border-2 border-black">
        <h4 className="font-black text-sm mb-2">📊 트렌드 분석</h4>
        <div className="text-xs space-y-1">
          {stats.map(({ num, rate }) => {
            const expectedRate = (6/45 * 100).toFixed(1); // 이론적 출현율 13.3%
            const isHot = parseFloat(rate) > parseFloat(expectedRate);
            return (
              <div key={num} className="flex justify-between items-center">
                <span>{num}번:</span>
                <span className={`font-bold ${isHot ? 'text-error' : 'text-success'}`}>
                  {isHot ? '🔥 핫' : '❄️ 콜드'} ({rate}% vs {expectedRate}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}