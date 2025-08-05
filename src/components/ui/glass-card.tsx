'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  hover?: boolean;
  onClick?: () => void;
}

const variants = {
  default: 'backdrop-blur-md bg-white/10 border border-white/20',
  elevated: 'backdrop-blur-lg bg-white/15 border border-white/30 shadow-xl',
  subtle: 'backdrop-blur-sm bg-white/5 border border-white/10'
};

const hoverVariants = {
  default: { scale: 1.02, y: -2 },
  elevated: { scale: 1.03, y: -4 },
  subtle: { scale: 1.01, y: -1 }
};

export function GlassCard({ 
  children, 
  className, 
  variant = 'default', 
  hover = true,
  onClick 
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl p-6 transition-all duration-300',
        variants[variant],
        onClick && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? hoverVariants[variant] : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      {children}
    </motion.div>
  );
}