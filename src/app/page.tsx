'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Moon, Star, Dices } from 'lucide-react';

export default function Home() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNumbers = () => {
    setIsGenerating(true);
    
    // 랜덤 번호 생성 (1-45, 6개)
    setTimeout(() => {
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      setGeneratedNumbers(Array.from(numbers).sort((a, b) => a - b));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">음력 로또 번호 생성기</h1>
            <Star className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl text-white/80">전통 음력과 현대 데이터 과학의 만남</p>
        </motion.div>

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                행운의 번호
                <Sparkles className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* 번호 표시 영역 */}
              <div className="min-h-24 flex items-center justify-center">
                {generatedNumbers.length > 0 ? (
                  <motion.div 
                    className="flex gap-4 flex-wrap justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {generatedNumbers.map((number, index) => (
                      <motion.div
                        key={number}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="w-14 h-14 text-xl font-bold flex items-center justify-center glass-dark text-white border-white/30"
                        >
                          {number}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-white/60 text-lg">
                    버튼을 클릭하여 행운의 번호를 생성하세요
                  </div>
                )}
              </div>

              {/* 생성 버튼 */}
              <div className="flex justify-center">
                <Button
                  onClick={generateNumbers}
                  disabled={isGenerating}
                  size="lg"
                  className="glass-dark text-white border-white/30 hover:bg-white/20 px-8 py-6 text-lg"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Dices className="w-6 h-6 mr-2" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-6 h-6 mr-2" />
                  )}
                  {isGenerating ? '번호 생성 중...' : '행운의 번호 생성'}
                </Button>
              </div>

              {/* 오늘의 음력 정보 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-dark rounded-lg p-4 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  오늘의 음력 정보
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                  <div>
                    <span className="font-medium">양력:</span> 2025년 8월 5일 (화요일)
                  </div>
                  <div>
                    <span className="font-medium">음력:</span> 2025년 윤6월 12일
                  </div>
                  <div>
                    <span className="font-medium">간지:</span> 을사년
                  </div>
                  <div>
                    <span className="font-medium">띠:</span> 뱀띠
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 푸터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          <p>※ 이 앱에서 생성된 번호는 재미와 참고용입니다</p>
          <p>※ 공식 정보는 동행복권 공식 사이트에서 확인하세요</p>
        </motion.div>
      </div>
    </div>
  );
}
