import { LotteryInterface } from '@/components/lottery/lottery-interface';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      <LotteryInterface />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />
      
      {/* Footer */}
      <footer className="text-center pb-8 text-white/60 text-sm">
        <p>※ 이 앱에서 생성된 번호는 재미와 참고용입니다</p>
        <p>※ 공식 정보는 동행복권 공식 사이트에서 확인하세요</p>
      </footer>
    </div>
  );
}
