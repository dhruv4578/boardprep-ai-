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

import { logout, getCurrentUser } from '../utils/auth';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home, color: 'text-blue-400' },
  { name: 'Smart Study', path: '/study', icon: BookOpen, color: 'text-emerald-400' },
  { name: 'Quiz Gen', path: '/quiz', icon: BrainCircuit, color: 'text-violet-400' },
  { name: 'AI Doubts', path: '/doubts', icon: MessageSquareQuote, color: 'text-rose-400' },
  { name: 'Planner', path: '/planner', icon: CalendarDays, color: 'text-amber-400' },
  { name: 'Flashcards', path: '/flashcards', icon: Layers, color: 'text-violet-400' },
  { name: 'NCERT AI', path: '/ncert', icon: Book, color: 'text-emerald-400' },
  { name: '1-Day Revision', path: '/revision', icon: Zap, color: 'text-yellow-400' },
];

export default function Sidebar({ focusMode = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = getCurrentUser();

  // In focus mode, hidden completely
  if (focusMode) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

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

        {/* Footer Section */}
        <div className="p-6 border-t border-white/10 shrink-0">
          {user && (
            <div className="text-center mb-4 text-sm text-slate-300">
              <span className="opacity-70">Logged in as </span>
              <span className="font-semibold text-blue-400">{user.username}</span>
            </div>
          )}
          <div className="glass-card p-4 rounded-xl text-center mb-3">
             <p className="text-xs text-slate-400 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">Target Score: 90%+</p>
             <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full animate-pulse-glow" />
             </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
