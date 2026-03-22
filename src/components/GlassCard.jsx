import { LucideQuote } from 'lucide-react';

export default function GlassCard({ children, className = '', glowColor = 'blue', interactive = false, ...props }) {
  const baseClasses = interactive ? 'glass-card' : 'glass-panel';
  
  // Optional hover glow
  const glowClasses = {
    blue: 'hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)]',
    violet: 'hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.5)]',
    emerald: 'hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]',
    rose: 'hover:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.5)]',
    amber: 'hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)]'
  };

  const interactiveGlow = interactive ? glowClasses[glowColor] : '';

  return (
    <div 
      className={`${baseClasses} ${interactiveGlow} p-6 ${className}`}
      {...props}
    >
      {/* Subtle top border highlight for 3D effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
