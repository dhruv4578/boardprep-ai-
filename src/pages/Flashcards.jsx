import { useState } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import TopicInput from '../components/TopicInput';
import { callAI } from '../utils/ai';
import { generateFlashcardsPrompt } from '../utils/prompts';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const { system, user } = generateFlashcardsPrompt(
        formData.subject, 
        formData.topic, 
        10
      );
      
      const response = await callAI(system, user, true);
      
      if (Array.isArray(response)) {
        setFlashcards(response);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate flashcards. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 animate-slide-up">
        <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-500/10">
          <Layers size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Flashcards</h1>
          <p className="text-slate-400">Master concepts with active recall.</p>
        </div>
      </div>

      {flashcards.length === 0 && !isLoading ? (
        <GlassCard className="animate-fade-in" glowColor="violet">
          <h2 className="text-xl font-semibold text-white mb-6">Choose a Topic</h2>
          <TopicInput onSubmit={handleGenerate} isLoading={isLoading} />
        </GlassCard>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Card Viewer */}
          <div className="relative perspective-1000 h-80 md:h-96 w-full">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center glass-panel rounded-3xl border-white/10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" size={24} />
                </div>
                <p className="mt-4 text-violet-300 font-medium animate-pulse">AI is crafting your flashcards...</p>
              </div>
            ) : (
              <div 
                className={`group relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden glass-panel active:scale-[0.98] transition-transform rounded-3xl border-white/20 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl">
                  <div className="absolute top-6 left-8 text-xs font-bold text-violet-400 uppercase tracking-widest opacity-70">Concept / Question</div>
                  <div className="absolute top-6 right-8 text-xs font-mono text-slate-500">{currentIndex + 1} / {flashcards.length}</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {flashcards[currentIndex]?.front}
                  </h3>
                  <p className="mt-8 text-sm text-slate-500 font-medium uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                    Click to flip
                    <RefreshCw size={14} className="animate-spin-slow" />
                  </p>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel rounded-3xl border-white/20 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 shadow-2xl overflow-y-auto custom-scrollbar">
                  <div className="absolute top-6 left-8 text-xs font-bold text-emerald-400 uppercase tracking-widest opacity-70">Explanation / Answer</div>
                  <div className="max-w-lg">
                    <p className="text-lg md:text-xl text-slate-100 font-medium leading-relaxed">
                      {flashcards[currentIndex]?.back}
                    </p>
                  </div>
                  <p className="mt-8 text-sm text-slate-500 font-medium uppercase tracking-widest">Click to flip back</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button 
                onClick={prevCard}
                disabled={currentIndex === 0 || isLoading}
                className="w-12 h-12 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1 || isLoading}
                className="w-12 h-12 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <button 
              onClick={() => {
                setFlashcards([]);
                setError(null);
              }}
              className="px-6 py-3 glass-panel rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all font-medium border-white/10"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">New Topic</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 animate-fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
