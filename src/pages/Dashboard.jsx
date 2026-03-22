import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BrainCircuit, Target, Trophy, Flame, ChevronRight, AlertCircle, Quote, Layers, CheckCircle2, Circle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useLocalStorage, storageKeys } from '../hooks/useLocalStorage';

const MOTIVATION_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don't stop until you're proud.",
  "The secret of your future is hidden in your daily routine.",
  "It always seems impossible until it's done.",
  "Focus on the step in front of you, not the whole staircase."
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [scores] = useLocalStorage(storageKeys.SCORES, []);
  const [plans, setPlans] = useLocalStorage(storageKeys.PLANNER, null);
  
  // Calculate stats
  const totalQuizzes = scores.length;
  const avgScore = totalQuizzes > 0 
    ? Math.round(scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / totalQuizzes * 100) 
    : 0;
  
  // Get weak areas (topics with score < 60%)
  const weakAreas = scores
    .filter(s => (s.score / s.total) < 0.6)
    .slice(0, 3); // Get up to 3

  const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];

  // Calculate Exam Countdown
  let daysLeftText = "Set Exam Date";
  let isClose = false;

  if (plans && plans.examDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(plans.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)); 
    
    if (diffTime < 0) {
      daysLeftText = "Exam Completed! 🎉";
    } else if (diffTime === 0) {
      daysLeftText = "Exam is Today! 🚀";
      isClose = true;
    } else {
      daysLeftText = `${diffTime} Day${diffTime > 1 ? 's' : ''} until Exam`;
      isClose = diffTime <= 7;
    }
  }

  // Get current day's plan
  let currentDayPlan = null;
  let currentDayIndex = -1;
  if (plans && plans.schedule) {
    // Determine which day we are on based on creation date
    const createdDate = new Date(plans.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    currentDayIndex = Math.min(dayDiff, plans.schedule.length - 1);
    if (currentDayIndex >= 0) {
      currentDayPlan = plans.schedule[currentDayIndex];
    }
  }

  const toggleTask = (tIdx) => {
    if (!plans || currentDayIndex === -1) return;
    const updatedPlans = { ...plans };
    const day = updatedPlans.schedule[currentDayIndex];
    if (!day.completed) day.completed = [];
    day.completed[tIdx] = !day.completed[tIdx];
    setPlans(updatedPlans);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back! <span className="hello-wave">👋</span></h1>
          <p className="text-slate-400">Ready to crush your board exams today?</p>
        </div>
        <div 
          onClick={() => !plans && navigate('/planner')}
          className={`glass-panel px-4 py-2 rounded-full flex items-center gap-2 transition-all ${!plans && 'cursor-pointer hover:scale-105'} ${
            plans 
              ? (isClose ? 'text-rose-400 border-rose-400/30 bg-rose-500/10' : 'text-blue-400 border-blue-400/30 bg-blue-500/10')
              : 'text-amber-400 border-amber-400/20 hover:bg-amber-500/10'
          }`}
          title={!plans ? "Click to set up your study planner" : "Your target exam date"}
        >
          {plans ? (isClose ? <AlertCircle size={18} /> : <Target size={18} />) : <Flame size={18} />}
          <span className="font-semibold text-sm">{daysLeftText}</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <GlassCard className="border-l-4 border-l-blue-500 py-4" glowColor="blue">
        <div className="flex gap-4 items-center">
          <Quote className="text-blue-500/50 shrink-0" size={32} />
          <p className="text-lg font-medium text-blue-100 italic">{randomQuote}</p>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <GlassCard 
          interactive 
          onClick={() => navigate('/study')}
          glowColor="emerald"
          className="cursor-pointer group !p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen size={20} />
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={18} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Smart Study</h3>
          <p className="text-xs text-slate-400">AI-generated notes instantly</p>
        </GlassCard>

        <GlassCard 
          interactive 
          onClick={() => navigate('/quiz')}
          glowColor="violet"
          className="cursor-pointer group animation-delay-100 !p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
              <BrainCircuit size={20} />
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-violet-400 transition-colors" size={18} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">AI Quiz</h3>
          <p className="text-xs text-slate-400">AI questions & explanations</p>
        </GlassCard>

        <GlassCard 
          interactive 
          onClick={() => navigate('/flashcards')}
          glowColor="blue"
          className="cursor-pointer group animation-delay-200 !p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers size={20} />
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-blue-400 transition-colors" size={18} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Flashcards</h3>
          <p className="text-xs text-slate-400">Master concepts with recall</p>
        </GlassCard>

        <GlassCard 
          interactive 
          onClick={() => navigate('/revision')}
          glowColor="amber"
          className="cursor-pointer group animation-delay-300 !p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame size={20} />
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-amber-400 transition-colors" size={18} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">1-Day Prep</h3>
          <p className="text-xs text-slate-400">Last-minute exam power-ups</p>
        </GlassCard>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Plan */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glowColor="amber" className="h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="text-amber-400" size={20} />
                Today's Study Plan
              </h3>
              {plans && (
                <button 
                  onClick={() => navigate('/planner')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View Full Schedule
                </button>
              )}
            </div>

            {currentDayPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div>
                    <h4 className="font-bold text-white">Day {currentDayPlan.day}: {currentDayPlan.focus}</h4>
                    <p className="text-xs text-slate-400">Keep sticking to your schedule!</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-500">
                    DAY {currentDayPlan.day}
                  </div>
                </div>

                <div className="space-y-2">
                  {currentDayPlan.tasks.map((task, tIdx) => {
                    const isDone = currentDayPlan.completed && currentDayPlan.completed[tIdx];
                    return (
                      <div 
                        key={tIdx}
                        onClick={() => toggleTask(tIdx)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group border border-transparent hover:border-white/5"
                      >
                        <div className="shrink-0">
                          {isDone ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-500 group-hover:text-amber-400" />}
                        </div>
                        <span className={`text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Target size={32} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">No plan generated yet</h4>
                  <p className="text-sm text-slate-500 max-w-xs">Create an AI-powered study schedule to track your daily goals.</p>
                </div>
                <button 
                  onClick={() => navigate('/planner')}
                  className="glass-button-primary !py-2.5 !px-6"
                >
                  Create Schedule
                </button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Performance Sidebar */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-slate-400">Quizzes Taken</span>
                <span className="text-xl font-bold text-white">{totalQuizzes}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-slate-400">Avg Accuracy</span>
                <span className="text-xl font-bold text-emerald-400">{avgScore}%</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-rose-400" size={20} />
              Needs Review
            </h3>
            
            {weakAreas.length > 0 ? (
              <div className="space-y-2">
                {weakAreas.map((area, i) => (
                  <div key={i} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <h4 className="text-sm font-medium text-rose-100 truncate">{area.topic}</h4>
                    <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">{Math.round((area.score / area.total) * 100)}% Accuracy</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-emerald-400/60 flex flex-col items-center">
                <Trophy size={32} className="mb-2 opacity-50" />
                <p className="text-xs">All clear!</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
