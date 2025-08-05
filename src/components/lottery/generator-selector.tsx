'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  User, 
  Sparkles,
  Moon,
  Hash
} from 'lucide-react';

interface GeneratorType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; }>;
  color: string;
  bgGradient: string;
}

const generators: GeneratorType[] = [
  {
    id: 'lunar',
    name: '음력 생성기',
    description: '전통 음력과 간지, 띠를 활용한 번호 생성',
    icon: Moon,
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/20 to-orange-500/20'
  },
  {
    id: 'statistical',
    name: '통계 분석기',
    description: '과거 당첨 패턴 분석을 통한 스마트 선택',
    icon: BarChart3,
    color: 'text-blue-300',
    bgGradient: 'from-blue-500/20 to-indigo-500/20'
  },
  {
    id: 'pattern',
    name: '패턴 생성기',
    description: '수학적 패턴과 규칙성을 활용한 생성',
    icon: Hash,
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    id: 'personal',
    name: '개인 맞춤형',
    description: '생년월일과 개인정보 기반 특별한 번호',
    icon: User,
    color: 'text-purple-300',
    bgGradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'intuitive',
    name: '직감 생성기',
    description: '기분과 색상, 시간을 반영한 직관적 선택',
    icon: Sparkles,
    color: 'text-rose-300',
    bgGradient: 'from-rose-500/20 to-red-500/20'
  }
];

interface GeneratorSelectorProps {
  selectedGenerator: string;
  onSelect: (generatorId: string) => void;
  className?: string;
}

export function GeneratorSelector({ selectedGenerator, onSelect, className }: GeneratorSelectorProps) {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <motion.h2 
        className="text-2xl font-bold text-center text-white/90 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        번호 생성 방식을 선택하세요
      </motion.h2>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {generators.map((generator) => {
          const Icon = generator.icon;
          const isSelected = selectedGenerator === generator.id;
          
          return (
            <motion.div
              key={generator.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlassCard
                variant={isSelected ? "elevated" : "default"}
                hover={false}
                onClick={() => onSelect(generator.id)}
                className={cn(
                  'relative overflow-hidden transition-all duration-300',
                  isSelected && 'ring-2 ring-white/50 shadow-2xl'
                )}
              >
                {/* Background gradient */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-30',
                  generator.bgGradient
                )} />
                
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      />
                    </div>
                  </motion.div>
                )}
                
                <div className="relative z-10 text-center space-y-3">
                  <motion.div
                    className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center', generator.bgGradient)}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className={cn('w-8 h-8', generator.color)} />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white/90 mb-1">
                      {generator.name}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {generator.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}