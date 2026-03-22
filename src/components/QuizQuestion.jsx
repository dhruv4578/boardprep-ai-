import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function QuizQuestion({ 
  question, 
  options, 
  correctAnswer, 
  explanation,
  selectedAnswer,
  onSelectOption,
  onNext,
  isLast 
}) {
  const isAnswered = selectedAnswer !== null;

  return (
    <div className="w-full animate-fade-in">
      <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === correctAnswer;
          
          let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group";
          
          if (!isAnswered) {
             buttonClass += " border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30";
          } else if (isCorrect) {
             buttonClass += " border-emerald-500/50 bg-emerald-500/10 text-emerald-100";
          } else if (isSelected && !isCorrect) {
             buttonClass += " border-rose-500/50 bg-rose-500/10 text-rose-100";
          } else {
             buttonClass += " border-white/5 bg-white/5 opacity-50";
          }

          return (
            <button
              key={index}
              disabled={isAnswered}
              onClick={() => onSelectOption(index)}
              className={buttonClass}
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
                  ${!isAnswered ? 'bg-white/10 text-slate-300 group-hover:bg-primary/20 group-hover:text-primary-100' : 
                    isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 
                    isSelected ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-500'}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base">{option}</span>
              </div>

              {isAnswered && isCorrect && (
                <CheckCircle2 className="text-emerald-500" size={20} />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="text-rose-500" size={20} />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswered && (
        <div className="mt-6 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-slide-up">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-300 mb-2">
            <span className="shrink-0 w-1.5 h-4 bg-blue-500 rounded-full"></span>
            Explanation
          </h4>
          <p className="text-blue-100/80 text-sm leading-relaxed">
             {explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="mt-8 flex justify-end animate-fade-in">
          <button
            onClick={onNext}
            className="glass-button-primary flex items-center gap-2 px-6 py-2.5"
          >
            {isLast ? "See Final Score" : "Next Question"}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
