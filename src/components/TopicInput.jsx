import { useState } from 'react';
import { Search, BookOpen, GraduationCap, Building2 } from 'lucide-react';

export default function TopicInput({ onSubmit, isLoading, buttonText = "Generate" }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [grade, setGrade] = useState('12');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;
    
    onSubmit({
      subject: subject.trim(),
      topic: topic.trim(),
      board,
      grade
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subject Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            Subject
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Physics, History, Math"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
            <Search size={16} className="text-primary" />
            Topic
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Ray Optics, World War 2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Board Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-400" />
            Board
          </label>
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="CBSE" className="bg-slate-800">CBSE</option>
            <option value="ICSE" className="bg-slate-800">ICSE</option>
            <option value="State Board" className="bg-slate-800">State Board</option>
          </select>
        </div>

        {/* Class Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
            <GraduationCap size={16} className="text-violet-400" />
            Class
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none transition-all cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="10" className="bg-slate-800">Class 10</option>
            <option value="11" className="bg-slate-800">Class 11</option>
            <option value="12" className="bg-slate-800">Class 12</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 glass-button-primary py-3 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>
    </form>
  );
}
