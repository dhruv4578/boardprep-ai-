import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles, Bot } from 'lucide-react';

export default function ChatMessage({ message, isAI = false, animate = true }) {
  const [displayedText, setDisplayedText] = useState(animate && isAI ? '' : message);
  const [isTyping, setIsTyping] = useState(animate && isAI);

  useEffect(() => {
    if (!animate || !isAI) {
      setDisplayedText(message);
      setIsTyping(false);
      return;
    }

    let i = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText((prev) => prev + message.charAt(i));
      i++;
      if (i >= message.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15); // ms per character

    return () => clearInterval(typingInterval);
  }, [message, animate, isAI]);

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'} animate-slide-up`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 items-start ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 
          ${isAI ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20' 
                 : 'bg-white/10 border border-white/20 text-slate-300'}`}
        >
          {isAI ? <Sparkles size={16} className={isTyping ? 'animate-pulse' : ''} /> : <User size={16} />}
        </div>

        {/* Message Bubble */}
        <div className={`relative px-5 py-3 rounded-2xl
          ${isAI 
            ? 'glass-card bg-white/5 border-white/10 rounded-tl-sm text-slate-200' 
            : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-md'}`}
        >
          {isAI && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">AI Tutor</span>
              {isTyping && <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
              </span>}
            </div>
          )}
          
          <div className={`${isAI ? 'prose-dark' : 'text-base font-medium'}`}>
            {isAI ? (
              <ReactMarkdown>{displayedText}</ReactMarkdown>
            ) : (
              <p>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
