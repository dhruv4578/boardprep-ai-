import { useState, useEffect } from 'react';
import { X, Calendar, Rocket, Sparkles, Trophy } from 'lucide-react';
import GlassCard from './GlassCard';
import { useLocalStorage, storageKeys } from '../hooks/useLocalStorage';
import { getCurrentUser } from '../utils/auth';

export default function WelcomeModal() {
  const user = getCurrentUser();
  const [plannerData] = useLocalStorage(storageKeys.PLANNER, null);
  const [lastWelcome, setLastWelcome] = useLocalStorage('last_welcome_date', '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toDateString();
    if (lastWelcome !== today) {
      // First visit today!
      setIsOpen(true);
    }
  }, [user, lastWelcome]);

  const handleClose = () => {
    setIsOpen(false);
    setLastWelcome(new Date().toDateString());
  };

  if (!isOpen || !user) return null;

  // Calculate days left
  let daysLeft = null;
  if (plannerData && plannerData.examDate) {
    const examDate = new Date(plannerData.examDate);
    const today = new Date();
    const diffTime = examDate - today;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <GlassCard className="max-w-lg w-full relative overflow-visible border-blue-500/20" glowColor="blue">
        <button 
          onClick={handleClose}
          className="absolute -top-12 -right-0 md:-right-12 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={28} />
        </button>

        <div className="text-center space-y-6 pt-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 rotate-3 animate-pulse">
              <Rocket size={40} className="text-white -rotate-12" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={24} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back, {user.name}!</h2>
            <p className="text-slate-400 text-lg">Ready to make progress today?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 bg-blue-500/10 border-blue-500/20 text-center">
              <Calendar className="mx-auto text-blue-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">
                {daysLeft !== null ? daysLeft : '--'}
              </div>
              <div className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Days to Exam</div>
            </div>
            <div className="glass-panel p-6 bg-emerald-500/10 border-emerald-500/20 text-center">
              <Trophy className="mx-auto text-emerald-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">Focus</div>
              <div className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold">Keep it up!</div>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl italic text-slate-300 text-sm">
            "Success is the sum of small efforts, repeated day in and day out."
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            Let's Study!
            <Rocket size={20} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
