'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.js 등록을 useEffect 내에서 처리
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
}

interface FrequencyChartProps {
  frequencyData: Record<string, number>;
  title?: string;
  highlightNumbers?: number[];
}

export default function FrequencyChart({ 
  frequencyData, 
  title = "📊 번호별 출현 빈도", 
  highlightNumbers = [] 
}: FrequencyChartProps) {
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 차트 준비
    setIsChartReady(true);
  }, []);
  // 데이터 정렬 (빈도 높은 순)
  const sortedData = Object.entries(frequencyData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20); // 상위 20개만 표시

  const labels = sortedData.map(([num]) => `${num}번`);
  const frequencies = sortedData.map(([,freq]) => freq);
  
  // 네오브루탈리즘 색상 적용
  const backgroundColors = sortedData.map(([num]) => {
    const numValue = parseInt(num);
    if (highlightNumbers.includes(numValue)) {
      return '#FF3366'; // 강렬한 핑크 (하이라이트)
    }
    return frequencies.indexOf(frequencies[sortedData.findIndex(([n]) => n === num)]) < 5 
      ? '#FFCC00' // 상위 5개는 노랑
      : '#0033CC'; // 나머지는 블루
  });

  const borderColors = sortedData.map(() => '#000000'); // 검정 테두리

  const data = {
    labels,
    datasets: [
      {
        label: '출현 횟수',
        data: frequencies,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 3,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
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
        display: false, // 단순화를 위해 범례 숨김
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cornerRadius: 0, // 네오브루탈리즘 스타일
        titleFont: {
          weight: 'bold'
        },
        callbacks: {
          label: function(context) {
            const num = context.label?.replace('번', '');
            const freq = context.parsed.y;
            const total = frequencies.reduce((sum, f) => sum + f, 0);
            const percentage = ((freq / total) * 100).toFixed(1);
            return [
              `${num}번: ${freq}회 출현`,
              `전체 대비 ${percentage}%`,
              highlightNumbers.includes(parseInt(num || '0')) ? '⭐ 생성된 번호!' : ''
            ].filter(text => text);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            weight: 'bold',
            size: 12
          },
          color: '#000000'
        },
        border: {
          color: '#000000',
          width: 3
        }
      },
      y: {
        beginAtZero: true,
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
          stepSize: 1
        },
        border: {
          color: '#000000',
          width: 3
        },
        title: {
          display: true,
          text: '출현 횟수',
          font: {
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        }
      },
    },
  };

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
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
      
      {/* 하이라이트된 번호 정보 */}
      {highlightNumbers.length > 0 && (
        <div className="mt-4 p-3 bg-accent/20 border-2 border-black">
          <h4 className="font-black text-sm mb-2">⭐ 생성된 번호 분석</h4>
          <div className="flex flex-wrap gap-2">
            {highlightNumbers.map(num => {
              const freq = frequencyData[num.toString()] || 0;
              const rank = sortedData.findIndex(([n]) => parseInt(n) === num) + 1;
              return (
                <div key={num} className="neo-badge bg-primary text-white text-xs">
                  {num}번: {freq}회 ({rank > 0 ? `${rank}위` : '순위권 밖'})
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}