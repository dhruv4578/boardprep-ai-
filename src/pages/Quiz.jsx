import { useState } from 'react';
import { BrainCircuit, AlertCircle, RotateCcw } from 'lucide-react';

import GlassCard from '../components/GlassCard';
import TopicInput from '../components/TopicInput';
import QuizQuestion from '../components/QuizQuestion';
import ScoreCard from '../components/ScoreCard';
import { callAI } from '../utils/ai';
import { generateQuizPrompt } from '../utils/prompts';
import { useLocalStorage, storageKeys } from '../hooks/useLocalStorage';

export default function Quiz() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  
  // Storage
  const [scores, setScores] = useLocalStorage(storageKeys.SCORES, []);

  const handleGenerate = async ({ subject, topic }) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic({ subject, topic });
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    
    try {
      // Generate 10 questions
      const { system, user } = generateQuizPrompt(subject, topic, 10);
      const randomQuestions = await callAI(system, user, true);
      
      if (!Array.isArray(randomQuestions) || randomQuestions.length === 0) {
        throw new Error("Invalid AI response format");
      }
      
      setQuestions(randomQuestions);
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate quiz. AI might have returned an invalid format. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (index) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(index);
    
    // Check if correct
    if (index === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Finish Quiz
      setIsFinished(true);
      
      // Save score to history
      const newScore = {
        subject: currentTopic.subject,
        topic: currentTopic.topic,
        score: score + (selectedAnswer === questions[currentIndex].correctAnswer ? 1 : 0),
        total: questions.length,
        date: new Date().toISOString()
      };
      setScores([...scores, newScore]);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setCurrentTopic(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <BrainCircuit size={32} className="text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Master</span></h1>
        <p className="text-slate-400 max-w-lg mx-auto">Test your knowledge with unique, AI-generated questions tailored to your board exam level.</p>
      </div>

      {/* State 1: Input Form */}
      {!isLoading && questions.length === 0 && (
        <GlassCard className="animate-slide-up" glowColor="violet">
          <TopicInput onSubmit={handleGenerate} isLoading={isLoading} buttonText="Generate 10 MCQs" />
          
          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>{error}</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* State 2: Loading State */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-fuchsia-500 animate-spin animation-delay-150"></div>
            <BrainCircuit className="absolute inset-0 m-auto text-violet-400 animate-pulse" size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">Crafting tricky questions...</h3>
            <p className="text-slate-400">Generating board-level MCQs for {currentTopic?.topic}</p>
          </div>
        </div>
      )}

      {/* State 3: Taking Quiz */}
      {questions.length > 0 && !isFinished && (
        <div className="space-y-6 animate-fade-in">
          {/* Progress Bar Header */}
          <div className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-emerald-400">Score: {score}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>

          <GlassCard glowColor="violet" className="mt-8">
            <QuizQuestion 
              question={questions[currentIndex].question}
              options={questions[currentIndex].options}
              correctAnswer={questions[currentIndex].correctAnswer}
              explanation={questions[currentIndex].explanation}
              selectedAnswer={selectedAnswer}
              onSelectOption={handleSelectOption}
              onNext={handleNext}
              isLast={currentIndex === questions.length - 1}
            />
          </GlassCard>
        </div>
      )}

      {/* State 4: Finished Quiz Score */}
      {isFinished && (
        <div className="space-y-6 animate-slide-up max-w-md mx-auto text-center">
          <ScoreCard 
            score={score} 
            total={questions.length} 
            title={`${currentTopic?.subject} - ${currentTopic?.topic}`} 
          />
          
          <button 
            onClick={resetQuiz}
            className="mt-6 glass-button w-full py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
