import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Bookmark, BookOpen, AlertCircle, Loader2, BrainCircuit, CheckCircle2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

import GlassCard from '../components/GlassCard';
import TopicInput from '../components/TopicInput';
import { callAI } from '../utils/ai';
import { generateStudyNotesPrompt } from '../utils/prompts';
import { useLocalStorage, storageKeys } from '../hooks/useLocalStorage';

export default function Study() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [bookmarks, setBookmarks] = useLocalStorage(storageKeys.BOOKMARKS, []);
  const [progress, setProgress] = useLocalStorage(storageKeys.PROGRESS, {});
  
  const contentRef = useRef(null);

  const handleGenerate = async ({ subject, topic, board, grade }) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic({ subject, topic });
    
    try {
      const { system, user } = generateStudyNotesPrompt(subject, topic, board, grade);
      const response = await callAI(system, user);
      setNotes(response);
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate notes. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!contentRef.current || !notes) return;
    
    // Quick clone to style specifically for PDF
    const element = contentRef.current.cloneNode(true);
    element.className = 'p-8 bg-white text-black prose prose-lg !max-w-none';
    
    // Fix text colors for PDF readability
    const allElements = element.getElementsByTagName('*');
    for (let el of allElements) {
      el.style.color = '#000000';
    }
    
    const opt = {
      margin: 0.5,
      filename: `BoardPrep_${currentTopic.subject}_${currentTopic.topic.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const isBookmarked = currentTopic && bookmarks.some(b => b.topic === currentTopic.topic && b.subject === currentTopic.subject);

  const toggleBookmark = () => {
    if (!currentTopic) return;
    
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => !(b.topic === currentTopic.topic && b.subject === currentTopic.subject)));
    } else {
      setBookmarks([...bookmarks, { ...currentTopic, date: new Date().toISOString() }]);
    }
  };

  const isCompleted = currentTopic && progress[currentTopic.subject]?.includes(currentTopic.topic);

  const toggleComplete = () => {
    if (!currentTopic) return;
    const { subject, topic } = currentTopic;
    const currentSubjectProgress = progress[subject] || [];
    
    let updatedSubjectProgress;
    if (isCompleted) {
      updatedSubjectProgress = currentSubjectProgress.filter(t => t !== topic);
    } else {
      updatedSubjectProgress = [...currentSubjectProgress, topic];
    }

    setProgress({
      ...progress,
      [subject]: updatedSubjectProgress
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <BookOpen size={32} className="text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Smart Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Generator</span></h1>
        <p className="text-slate-400 max-w-lg mx-auto">Turn any topic into hyper-focused, board-exam ready revision notes in seconds.</p>
      </div>

      {/* Input Section */}
      <GlassCard className="animate-slide-up">
        <TopicInput onSubmit={handleGenerate} isLoading={isLoading} buttonText="Generate Study Notes" />
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
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin animation-delay-100"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-violet-500 animate-spin animation-delay-200"></div>
            <BrainCircuit className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">AI is reading the syllabus...</h3>
            <p className="text-slate-400">Structuring formulas and key concepts for {currentTopic?.topic || 'your topic'}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {notes && !isLoading && (
        <div className="space-y-6 animate-slide-up">
          {/* Action Toolbar */}
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-xl font-semibold text-white">Generated Notes</h2>
              <p className="text-sm text-slate-400">{currentTopic.subject} • {currentTopic.topic}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={toggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20'
                }`}
                title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
              >
                <CheckCircle2 size={18} className={isCompleted ? 'fill-emerald-500/20' : ''} />
                <span className="text-sm font-medium">{isCompleted ? 'Completed' : 'Mark Done'}</span>
              </button>
              <button 
                onClick={toggleBookmark}
                className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                title={isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
              >
                <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl transition-all"
              >
                <Download size={18} />
                <span className="hidden lg:inline">Export PDF</span>
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <GlassCard className="relative overflow-visible">
            {/* The ref is used for PDF export styling */}
            <div ref={contentRef} className="prose-dark max-w-none">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
