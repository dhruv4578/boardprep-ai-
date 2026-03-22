import { useState } from 'react';
import { Book, Sparkles, AlertCircle, Quote, Info, ChevronRight, GraduationCap, Upload, FileText, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import TopicInput from '../components/TopicInput';
import { callAI } from '../utils/ai';
import { generateNCERTPrompt, generateNCERTPDFPrompt } from '../utils/prompts';

export default function NCERT() {
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  
  // PDF Feature States
  const [mode, setMode] = useState('search'); // 'search' or 'upload'
  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError("Please upload a valid PDF file.");
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        
        // Initialize pdf.js
        if (!window.pdfjsLib) {
          throw new Error("PDF processing library not loaded. Please refresh.");
        }
        
        // Use local worker if possible or via CDN (script tag in index.html already sets global)
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        // Extract from all pages
        const numPages = pdf.numPages;
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        setPdfText(fullText);
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError("Failed to read PDF. Try a different file.");
      setIsLoading(false);
    }
  };

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError(null);
    setSegments([]);

    try {
      let promptData;
      if (mode === 'upload') {
        if (!pdfText) throw new Error("Please upload a PDF first.");
        promptData = generateNCERTPDFPrompt(pdfText);
        setCurrentTopic({ topic: fileName, subject: 'PDF Upload', board: 'Custom', grade: 'Any' });
      } else {
        const { subject, topic, board, grade } = formData;
        promptData = generateNCERTPrompt(subject, topic, board, grade);
        setCurrentTopic({ subject, topic, board, grade });
      }

      const response = await callAI(promptData.system, promptData.user, true);
      
      if (Array.isArray(response)) {
        setSegments(response);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to generate NCERT breakdown. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 animate-slide-up">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <Book size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          NCERT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Line-by-Line</span> AI
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">
          Deep-dive into textbook content. Connect our AI to your books for precise school-level insights.
        </p>
      </div>

      {segments.length === 0 && !isLoading ? (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit mx-auto overflow-hidden">
            <button 
              onClick={() => setMode('search')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mode === 'search' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Sparkles size={16} />
              AI Search
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Upload size={16} />
              Upload PDF
            </button>
          </div>

          <GlassCard className="animate-fade-in" glowColor="emerald">
            {mode === 'search' ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="text-emerald-400" />
                  Select Your Chapter/Topic
                </h2>
                <TopicInput onSubmit={handleGenerate} isLoading={isLoading} buttonText="Start Line-by-Line Analysis" />
              </>
            ) : (
              <div className="space-y-6 text-center py-4">
                <h2 className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                  <FileText className="text-emerald-400" />
                  Analyze Your Own Book
                </h2>
                
                {!fileName ? (
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 group-hover:border-emerald-500/30 transition-all flex flex-col items-center gap-4 bg-white/5">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Click or drag your NCERT PDF here</p>
                        <p className="text-slate-500 text-xs mt-1">All pages will be analyzed for a comprehensive breakdown</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <FileText className="text-emerald-400" />
                      <span className="text-white font-medium">{fileName}</span>
                      <button 
                        onClick={() => { setFileName(''); setPdfText(''); }}
                        className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleGenerate()}
                      className="glass-button-primary w-full py-3"
                    >
                      Process & Explain Content
                    </button>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Active Topic Header */}
          {currentTopic && (
            <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Book size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{currentTopic.topic}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{currentTopic.subject} • {currentTopic.board} Class {currentTopic.grade}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSegments([]); setFileName(''); setPdfText(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse" size={24} />
              </div>
              <p className="text-emerald-300 font-medium animate-pulse">
                {pdfText && !segments.length ? "Extracting knowledge from PDF..." : "AI is deconstructing the textbook paragraphs..."}
              </p>
            </div>
          )}

          {/* Line-by-Line List */}
          <div className="space-y-6">
            {segments.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Original Text */}
                <div className="relative group">
                  <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500 z-10 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                    {idx + 1}
                  </div>
                  <GlassCard className="h-full border-l-2 border-l-slate-700 group-hover:border-l-emerald-500/50 transition-all">
                    <div className="flex gap-3">
                      <Quote size={20} className="text-slate-600 shrink-0 mt-1" />
                      <p className="text-slate-300 italic leading-relaxed text-sm md:text-base">
                        "{item.original}"
                      </p>
                    </div>
                  </GlassCard>
                </div>

                {/* AI Explanation */}
                <GlassCard className="h-full bg-emerald-500/5 border-emerald-500/20" glowColor="emerald">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                        <Sparkles size={14} />
                        AI Insight
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.importance === 'High' ? 'bg-rose-500/20 text-rose-400' : 
                        item.importance === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.importance} Importance
                      </div>
                    </div>
                    
                    <p className="text-white text-sm md:text-base leading-relaxed">
                      {item.explanation}
                    </p>

                    {item.key_term && (
                      <div className="pt-2 flex items-center gap-2">
                        <div className="p-1 px-2 rounded bg-white/5 border border-white/10 flex items-center gap-1.5 ring-1 ring-emerald-500/20">
                          <Info size={12} className="text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-300">{item.key_term}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {!isLoading && segments.length > 0 && (
            <div className="p-6 text-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
              >
                Back to top
                <ChevronRight size={16} className="-rotate-90" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 animate-fade-in max-w-xl mx-auto">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
