'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { Calendar, Trash2, Copy, Share } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

interface GenerationResult {
  id: string;
  numbers: number[];
  generator: string;
  timestamp: Date;
  description?: string;
}

interface ResultsHistoryProps {
  results: GenerationResult[];
  onClear?: () => void;
  onCopy?: (numbers: number[]) => void;
  onShare?: (result: GenerationResult) => void;
  className?: string;
}

const generatorNames: Record<string, string> = {
  lunar: '음력 생성기',
  statistical: '통계 분석기',
  pattern: '패턴 생성기',
  personal: '개인 맞춤형',
  intuitive: '직감 생성기'
};

const generatorColors: Record<string, string> = {
  lunar: 'from-amber-500/20 to-orange-500/20',
  statistical: 'from-blue-500/20 to-indigo-500/20',
  pattern: 'from-emerald-500/20 to-teal-500/20',
  personal: 'from-purple-500/20 to-pink-500/20',
  intuitive: 'from-rose-500/20 to-red-500/20'
};

export function ResultsHistory({ 
  results, 
  onClear, 
  onCopy, 
  onShare, 
  className 
}: ResultsHistoryProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (results.length === 0) {
    return (
      <GlassCard variant="subtle" className={cn('text-center py-12', className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Calendar className="w-12 h-12 text-white/30 mx-auto" />
          <p className="text-white/60">아직 생성된 번호가 없습니다</p>
          <p className="text-sm text-white/40">번호를 생성하면 여기에 기록됩니다</p>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <motion.h3 
          className="text-lg font-semibold text-white/90"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          생성 기록 ({results.length})
        </motion.h3>
        
        {onClear && results.length > 0 && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onClear}
            className="text-red-300 hover:text-red-200"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            전체 삭제
          </GlassButton>
        )}
      </div>

      <motion.div
        className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {results.map((result) => (
            <motion.div
              key={result.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <GlassCard variant="subtle" className="relative overflow-hidden">
                {/* Background gradient */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r opacity-20',
                  generatorColors[result.generator] || 'from-gray-500/20 to-slate-500/20'
                )} />
                
                <div className="relative z-10 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">
                      {generatorNames[result.generator] || result.generator}
                    </span>
                    <span className="text-white/50">
                      {formatTime(result.timestamp)}
                    </span>
                  </div>
                  
                  {/* Numbers */}
                  <div className="flex gap-2 flex-wrap">
                    {result.numbers.map((number, index) => (
                      <motion.div
                        key={index}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <span className="text-xs font-medium text-white/90">
                          {number}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Description */}
                  {result.description && (
                    <p className="text-xs text-white/60 italic">
                      {result.description}
                    </p>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {onCopy && (
                      <motion.button
                        className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white/80 transition-colors"
                        onClick={() => onCopy(result.numbers)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy className="w-3 h-3" />
                        복사
                      </motion.button>
                    )}
                    
                    {onShare && (
                      <motion.button
                        className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white/80 transition-colors"
                        onClick={() => onShare(result)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share className="w-3 h-3" />
                        공유
                      </motion.button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}