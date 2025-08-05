'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/30 text-blue-100 hover:from-blue-500/30 hover:to-indigo-500/30',
  secondary: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/30 text-gray-100 hover:from-gray-500/30 hover:to-slate-500/30',
  success: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30 text-emerald-100 hover:from-emerald-500/30 hover:to-green-500/30',
  warning: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-100 hover:from-amber-500/30 hover:to-orange-500/30'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl backdrop-blur-md border transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        animate={!isDisabled ? {
          translateX: ['0%', '200%'],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        )}
        {children}
      </div>
    </motion.button>
  );
}