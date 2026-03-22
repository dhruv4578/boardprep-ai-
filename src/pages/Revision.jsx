import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Target, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';

import GlassCard from '../components/GlassCard';
import TopicInput from '../components/TopicInput';
import { callAI } from '../utils/ai';
import { generateRevisionPrompt } from '../utils/prompts';

export default function Revision() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);

  const handleGenerate = async ({ subject, topic }) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic({ subject, topic });
    
    try {
      const { system, user } = generateRevisionPrompt(subject, topic);
      const response = await callAI(system, user);
      setRevisionNotes(response);
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate quick revision notes. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <Zap size={32} className="text-rose-400" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold tracking-wider uppercase mb-2">
          <Clock size={14} /> 1-Day Before Exam
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Rapid <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Revision</span></h1>
        <p className="text-slate-400 max-w-lg mx-auto">Ultra-short, straight-to-the-point notes. No fluff, just what you need to score maximum marks tomorrow.</p>
      </div>

      {/* Input Section */}
      <GlassCard className="animate-slide-up" glowColor="rose">
        <TopicInput onSubmit={handleGenerate} isLoading={isLoading} buttonText="Generate Bullet Points" />
        
        <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-4 text-sm text-slate-400">
          <Target className="shrink-0 text-amber-500 mt-0.5" size={20} />
          <p>
            <strong className="text-slate-300">Pro Tip:</strong> Use this mode only when you've already studied the chapter once and just need a quick memory refresher before the exam.
          </p>
        </div>
      </GlassCard>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-rose-500 animate-spin transition-all duration-1000"></div>
            <div className="absolute inset-2 rounded-xl border-2 border-orange-500 animate-spin animation-delay-150 [animation-direction:reverse]"></div>
            <Zap className="absolute inset-0 m-auto text-rose-400 animate-pulse" size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">Compressing knowledge...</h3>
            <p className="text-slate-400">Extracting only the 20% that yields 80% of the marks for {currentTopic?.topic}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {revisionNotes && !isLoading && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={24} />
            <h2 className="text-xl font-semibold text-white">High-Yield Points Output</h2>
          </div>

          <GlassCard className="border-l-4 border-l-rose-500">
            <div className="prose-dark max-w-none">
              <ReactMarkdown 
                components={{
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-rose-300 mt-8 mb-4 flex items-center gap-2 border-b border-rose-500/20 pb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-3" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex gap-2 text-slate-300" {...props}>
                      <span className="text-rose-500 mt-1">•</span>
                      <span>{props.children}</span>
                    </li>
                  ),
                  strong: ({node, ...props}) => <strong className="text-white font-bold bg-white/5 px-1 rounded" {...props} />
                }}
              >
                {revisionNotes}
              </ReactMarkdown>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
