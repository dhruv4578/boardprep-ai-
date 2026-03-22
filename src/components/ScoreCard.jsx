import React from 'react';

export default function ScoreCard({ score, total, title = "Quiz Score" }) {
  const percentage = Math.round((score / total) * 100);
  
  // Determine color based on score
  let colorClass = 'text-rose-500';
  let gradientClass = 'from-rose-500 to-rose-400';
  let message = "Needs Revision!";
  
  if (percentage >= 90) {
    colorClass = 'text-emerald-500';
    gradientClass = 'from-emerald-500 to-emerald-400';
    message = "Excellent!";
  } else if (percentage >= 75) {
    colorClass = 'text-blue-500';
    gradientClass = 'from-blue-500 to-blue-400';
    message = "Good Job!";
  } else if (percentage >= 50) {
    colorClass = 'text-amber-500';
    gradientClass = 'from-amber-500 to-amber-400';
    message = "Keep Trying!";
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 animate-slide-up">
      <h3 className="text-xl font-medium text-white mb-6">{title}</h3>
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90 absolute">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-white/10"
            strokeWidth="12"
            fill="none"
          />
          {/* Foreground progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`stroke-current ${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="text-center">
          <span className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${gradientClass}`}>
            {percentage}%
          </span>
          <p className="text-sm text-slate-400 mt-1">{score} / {total}</p>
        </div>
      </div>
      
      <p className={`text-lg font-medium ${colorClass} animate-pulse`}>
        {message}
      </p>
    </div>
  );
}
