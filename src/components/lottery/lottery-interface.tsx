'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratorSelector } from './generator-selector';
import { NumberDisplay } from './number-display';
import { ResultsHistory } from './results-history';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Import generators
import { LunarGenerator } from '@/lib/generators/lunar-generator';
import { StatisticalGenerator } from '@/lib/generators/statistical-generator';
import { PatternGenerator } from '@/lib/generators/pattern-generator';
import { PersonalGenerator } from '@/lib/generators/personal-generator';
import { IntuitiveGenerator } from '@/lib/generators/intuitive-generator';

interface GenerationResult {
  id: string;
  numbers: number[];
  generator: string;
  timestamp: Date;
  description?: string;
}

export function LotteryInterface() {
  const [selectedGenerator, setSelectedGenerator] = useState<string>('lunar');
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize generators with useMemo for performance
  const generators = useMemo(() => ({
    lunar: new LunarGenerator(),
    statistical: new StatisticalGenerator(),
    pattern: new PatternGenerator(),
    personal: new PersonalGenerator(),
    intuitive: new IntuitiveGenerator()
  }), []);

  const generateNumbers = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Add slight delay for animation effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generator = generators[selectedGenerator as keyof typeof generators];
      const numbers = generator.generateNumbers();
      const description = generator.getDescription();
      
      setCurrentNumbers(numbers);
      
      // Add to history
      const newResult: GenerationResult = {
        id: Date.now().toString(),
        numbers,
        generator: selectedGenerator,
        timestamp: new Date(),
        description
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 19)]); // Keep only last 20 results
      
      toast.success('번호가 생성되었습니다!', {
        description: `${numbers.join(', ')}`
      });
      
    } catch (error) {
      console.error('Error generating numbers:', error);
      toast.error('번호 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedGenerator, generators]);

  const copyNumbers = useCallback((numbers: number[]) => {
    navigator.clipboard.writeText(numbers.join(', '));
    toast.success('번호가 클립보드에 복사되었습니다');
  }, []);

  const shareResult = useCallback((result: GenerationResult) => {
    const text = `로또 번호: ${result.numbers.join(', ')}\n생성 방식: ${result.generator}\n생성 시간: ${result.timestamp.toLocaleString('ko-KR')}`;
    
    if (navigator.share) {
      navigator.share({
        title: '로또 번호 생성 결과',
        text
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('결과가 클립보드에 복사되었습니다');
    }
  }, []);

  const clearHistory = useCallback(() => {
    setResults([]);
    toast.success('기록이 삭제되었습니다');
  }, []);

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
          🌙 음력 로또 번호 생성기
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          전통 음력과 현대 통계학이 만나 당신만의 특별한 번호를 만들어드립니다
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Generator Selection & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <GeneratorSelector
            selectedGenerator={selectedGenerator}
            onSelect={setSelectedGenerator}
          />
          
          {/* Generate Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassButton
              onClick={generateNumbers}
              loading={isGenerating}
              size="lg"
              className="px-12 py-4 text-xl font-semibold"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {isGenerating ? '번호 생성 중...' : '행운의 번호 생성'}
            </GlassButton>
          </motion.div>
          
          {/* Current Numbers Display */}
          <AnimatePresence>
            {(currentNumbers.length > 0 || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <NumberDisplay
                  numbers={isGenerating ? [0, 0, 0, 0, 0, 0] : currentNumbers}
                  title="생성된 번호"
                  isGenerating={isGenerating}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick Actions */}
          {currentNumbers.length > 0 && !isGenerating && (
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassButton
                variant="secondary"
                onClick={() => copyNumbers(currentNumbers)}
              >
                📋 복사
              </GlassButton>
              
              <GlassButton
                variant="success"
                onClick={generateNumbers}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                다시 생성
              </GlassButton>
            </motion.div>
          )}
        </div>

        {/* Right Panel - History & Settings */}
        <div className="space-y-6">
          {/* History Toggle */}
          <GlassCard variant="subtle" className="text-center">
            <GlassButton
              variant="secondary"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full"
            >
              📚 생성 기록 {showHistory ? '숨기기' : '보기'}
            </GlassButton>
          </GlassCard>
          
          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsHistory
                  results={results}
                  onClear={clearHistory}
                  onCopy={copyNumbers}
                  onShare={shareResult}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Info Card */}
          <GlassCard variant="subtle">
            <div className="space-y-3 text-sm text-white/70">
              <h4 className="font-semibold text-white/90">💡 사용 팁</h4>
              <ul className="space-y-2">
                <li>• 다양한 생성 방식을 시도해보세요</li>
                <li>• 생성된 번호는 자동으로 기록됩니다</li>
                <li>• 복사 버튼으로 쉽게 번호를 복사할 수 있어요</li>
                <li>• 행운을 빕니다! 🍀</li>
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}