'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface NumberDisplayProps {
  numbers: number[];
  title?: string;
  isGenerating?: boolean;
  className?: string;
}

export function NumberDisplay({ numbers, title, isGenerating = false, className }: NumberDisplayProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const numberVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      rotateY: -90 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      }
    },
    generating: {
      scale: [1, 1.1, 1],
      rotateY: [0, 180, 360],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <GlassCard variant="elevated" className={cn('space-y-4', className)}>
      {title && (
        <motion.h3 
          className="text-lg font-semibold text-center text-white/90"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
      )}
      
      <motion.div
        className="flex justify-center gap-3 flex-wrap"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {numbers.map((number, index) => (
            <motion.div
              key={`${number}-${index}`}
              className="relative"
              variants={numberVariants}
              animate={isGenerating ? "generating" : "visible"}
            >
              <div className="w-14 h-14 rounded-full backdrop-blur-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  {number}
                </span>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-sm -z-10" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {isGenerating && (
        <motion.div 
          className="text-center text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          번호를 생성하고 있습니다...
        </motion.div>
      )}
    </GlassCard>
  );
}