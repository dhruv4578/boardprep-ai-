import { useState } from 'react';
import { CalendarDays, AlertCircle, Plus, X, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

import GlassCard from '../components/GlassCard';
import { callAI } from '../utils/ai';
import { generatePlannerPrompt } from '../utils/prompts';
import { useLocalStorage, storageKeys } from '../hooks/useLocalStorage';

export default function Planner() {
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState(['Physics', 'Chemistry', 'Maths']);
  const [newSubject, setNewSubject] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [savedPlans, setSavedPlans] = useLocalStorage(storageKeys.PLANNER, null);
  const [viewingPlan, setViewingPlan] = useState(savedPlans);

  // Custom progress tracking for a plan
  const toggleTask = (dayIndex, taskIndex) => {
    if (!viewingPlan) return;
    
    const updatedPlan = { ...viewingPlan };
    const day = updatedPlan.schedule[dayIndex];
    
    // Initialize completed array if it doesn't exist
    if (!day.completed) {
      day.completed = [];
    }
    
    const taskStatus = day.completed[taskIndex];
    day.completed[taskIndex] = !taskStatus;
    
    setViewingPlan(updatedPlan);
    setSavedPlans(updatedPlan);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter(s => s !== subject));
  };

  const handleGenerate = async () => {
    if (!examDate) {
      setError("Please select an exam date.");
      return;
    }

    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= 0 || diffDays > 90) {
      setError("Please select a date between tomorrow and 3 months from now.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const subjectString = subjects.join(', ');
      const { system, user } = generatePlannerPrompt(subjectString, diffDays);
      const schedule = await callAI(system, user, true);
      
      if (!Array.isArray(schedule)) throw new Error("Invalid AI format");

      const newPlan = {
        createdAt: new Date().toISOString(),
        examDate,
        totalDays: diffDays,
        subjects,
        schedule
      };

      setSavedPlans(newPlan);
      setViewingPlan(newPlan);
      
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate study plan. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!viewingPlan) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    viewingPlan.schedule.forEach(day => {
      totalTasks += day.tasks.length;
      if (day.completed) {
        completedTasks += day.completed.filter(Boolean).length;
      }
    });
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <CalendarDays size={32} className="text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Planner</span></h1>
        <p className="text-slate-400 max-w-lg mx-auto">Create a highly optimized, day-by-day revision schedule customized for your exam date.</p>
      </div>

      {!viewingPlan && !isLoading ? (
        <GlassCard className="animate-slide-up max-w-xl mx-auto" glowColor="amber">
          <div className="space-y-6">
            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">When is your first Board Exam?</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Subjects List */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Subjects to cover</label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {subjects.map(subject => (
                  <div key={subject} className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg text-sm border border-white/10">
                    <span>{subject}</span>
                    <button 
                      onClick={() => handleRemoveSubject(subject)}
                      className="p-0.5 hover:text-rose-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubject} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button 
                  type="submit"
                  disabled={!newSubject.trim()}
                  className="glass-button bg-white/10 px-4 disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl flex items-start gap-2 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="w-full mt-2 glass-button-primary bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30 text-amber-100 py-3"
            >
              Generate AI Schedule
            </button>
          </div>
        </GlassCard>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-orange-500 animate-spin animation-delay-150"></div>
            <CalendarDays className="absolute inset-0 m-auto text-amber-400 animate-pulse" size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">Analyzing timeline...</h3>
            <p className="text-slate-400">Balancing {subjects.length} subjects over the remaining days.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Dashboard Header for Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Your Master Plan</h2>
                  <p className="text-slate-400 text-sm">Target: {new Date(viewingPlan.examDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-amber-400">{calculateProgress()}%</span>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Completed</p>
                </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-center items-center text-center">
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to create a new plan? This will overwrite the current one.")) {
                    setViewingPlan(null);
                  }
                }}
                className="text-slate-400 flex items-center gap-2 hover:text-white transition-colors text-sm font-medium"
              >
                <Plus size={16} /> 
                Create New Plan
              </button>
            </GlassCard>
          </div>

          {/* Timeline View */}
          <div className="space-y-4">
            {viewingPlan.schedule.map((day, dIdx) => {
              const allTasksDone = day.completed && day.tasks.length > 0 && 
                                  day.completed.filter(Boolean).length === day.tasks.length;
              
              return (
                <div key={dIdx} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center mt-2 shrink-0">
                    <div className={`w-3 h-3 rounded-full z-10 ${allTasksDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500/50'}`} />
                    {dIdx !== viewingPlan.schedule.length - 1 && (
                      <div className={`w-0.5 h-full ${allTasksDone ? 'bg-emerald-500/30' : 'bg-white/10'} -my-1`} />
                    )}
                  </div>
                  
                  {/* Day Card */}
                  <GlassCard 
                    className={`flex-1 ${allTasksDone ? 'border-emerald-500/20 bg-emerald-500/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        Day {day.day}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-slate-300">
                        {day.focus}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {day.tasks.map((task, tIdx) => {
                        const isDone = day.completed && day.completed[tIdx];
                        return (
                          <div 
                            key={tIdx} 
                            onClick={() => toggleTask(dIdx, tIdx)}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                          >
                            <div className="mt-0.5 shrink-0 text-slate-500 group-hover:text-amber-400 transition-colors">
                              {isDone ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle size={18} />}
                            </div>
                            <span className={`text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
