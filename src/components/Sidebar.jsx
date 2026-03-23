import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  BrainCircuit, 
  MessageSquareQuote, 
  CalendarDays, 
  Zap, 
  ChevronRight,
  Menu,
  X,
  LogOut,
  Layers,
  Book
} from 'lucide-react';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home, color: 'text-blue-400' },
  { name: 'Smart Study', path: '/study', icon: BookOpen, color: 'text-emerald-400' },
  { name: 'Quiz Gen', path: '/quiz', icon: BrainCircuit, color: 'text-violet-400' },
  { name: 'AI Doubts', path: '/doubts', icon: MessageSquareQuote, color: 'text-rose-400' },
  { name: 'Planner', path: '/planner', icon: CalendarDays, color: 'text-amber-400' },
  { name: 'Flashcards', path: '/flashcards', icon: Layers, color: 'text-violet-400' },
  { name: '1-Day Revision', path: '/revision', icon: Zap, color: 'text-yellow-400' },
];

export default function Sidebar({ focusMode = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // In focus mode, hidden completely
  if (focusMode) return null;


  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 glass-panel rounded-lg text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        glass-panel border-y-0 border-l-0 rounded-none bg-[#0f172a]/95 backdrop-blur-2xl
        flex flex-col h-screen
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="text-white relative top-[-1px]" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">BoardPrep <span className="text-blue-400">AI</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Your Smart Tutor</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white font-medium' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={item.color} />
                    <span>{item.name}</span>
                  </div>
                  
                  {/* Active Indicator Arrow */}
                  <ChevronRight 
                    size={16} 
                    className={`transition-all duration-300
                      ${isActive 
                        ? 'opacity-100 transform translate-x-0 text-white/50' 
                        : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                    `} 
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section - User Profile */}
        <div className="p-6 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/5 border border-white/10 shadow-sm transition-all hover:bg-white/10">
            <UserButton 
              showName 
              appearance={{
                elements: {
                  userButtonBox: "flex-row-reverse",
                  userButtonOuterIdentifier: "text-white font-semibold text-sm",
                }
              }}
            />
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center mb-4 border-white/5 bg-white/[0.02]">
             <div className="flex justify-between items-center mb-1.5">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target</p>
               <p className="text-[10px] font-bold text-blue-400">90%+</p>
             </div>
             <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full animate-pulse-glow" />
             </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Built with ❤️ by</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Dhruv Choudhary</p>
          </div>
        </div>
      </aside>
    </>
  );
}
