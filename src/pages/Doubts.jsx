import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, MessageSquareQuote, BookOpen, AlertCircle } from 'lucide-react';

import GlassCard from '../components/GlassCard';
import ChatMessage from '../components/ChatMessage';
import { callAI } from '../utils/ai';
import { generateDoubtPrompt } from '../utils/prompts';

export default function Doubts() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hi! I'm your AI Study Buddy. What topic are you struggling with today? I can explain complex board concepts in simple terms.",
      animate: false
    }
  ]);
  
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Physics'); // Default subject context
  const [isEli5, setIsEli5] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);
    
    // Add user message to UI
    const newUserMessage = { id: Date.now().toString(), role: 'user', content: userMsg };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Build context from last few messages
      const recentHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-4)
        .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n');
      
      const fullContext = `Previous conversation context:\n${recentHistory}\n\nStudent's new question: ${userMsg}`;
      
      const { system, user } = generateDoubtPrompt(subject, fullContext, isEli5);
      const response = await callAI(system, user);
      
      // Add AI response to UI
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: response,
        animate: true 
      }]);
      
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Please set your AI API Key in the Settings first.');
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Your API Key is invalid or expired. Please update it in Settings.');
      } else {
        setError(err.message || 'Failed to get an answer. Please try again.');
        // Remove the user message if it failed to process to allow retry
        setMessages(prev => prev.slice(0, -1));
        setInput(userMsg); // Put text back
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple voice input using Web Speech API (if supported)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Actual stopping logic requires saving the recognition instance,
      // kept simple here for UI demonstration
      return;
    }

    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-8rem)] min-h-[400px] max-w-5xl mx-auto -mt-4">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0 z-10 animate-slide-up">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30">
            <MessageSquareQuote size={20} className="text-rose-400 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">AI Doubt Solver</h1>
            <p className="hidden md:block text-sm text-slate-400">Get 24/7 instant answers to your questions.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 w-full md:w-auto">
          {/* Subject Context Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 border-r border-white/10">
            <BookOpen size={14} className="text-slate-400" />
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-transparent text-xs md:text-sm font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="Physics" className="bg-slate-800">Physics</option>
              <option value="Chemistry" className="bg-slate-800">Chemistry</option>
              <option value="Maths" className="bg-slate-800">Maths</option>
              <option value="Biology" className="bg-slate-800">Biology</option>
              <option value="Computer Science" className="bg-slate-800">Computer Science</option>
              <option value="General" className="bg-slate-800">General Topic</option>
            </select>
          </div>

          {/* ELI5 Toggle */}
          <button
            onClick={() => setIsEli5(!isEli5)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs md:text-sm font-medium transition-all ${
              isEli5 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <Sparkles size={14} className={isEli5 ? 'animate-pulse' : ''} />
            <span className="">ELI5 Mode</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="glass-panel flex-1 flex flex-col p-0 overflow-hidden min-h-0 relative rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20"></div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar min-h-0 relative z-10">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id}
              message={msg.content}
              isAI={msg.role === 'ai'}
              animate={msg.animate}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in mb-6">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div className="px-5 py-4 rounded-2xl glass-card bg-white/5 border-white/10 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center my-4 animate-fade-in">
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0f172a]/80 backdrop-blur-md border-t border-white/10 shrink-0 relative z-20">
          <form 
            onSubmit={handleSend}
            className="flex items-end gap-2 max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-xl"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`shrink-0 p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Voice Input"
            >
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask anything about ${subject}...`}
              className="flex-1 bg-transparent border-none outline-none text-white resize-none max-h-32 min-h-[44px] py-3 px-2 custom-scrollbar placeholder-slate-500"
              rows={1}
              style={{
                height: "44px",
                height: Math.min(128, Math.max(44, input.split('\n').length * 22 + 22)) + 'px'
              }}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`shrink-0 p-3 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 active:scale-95'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} className={input.trim() && !isLoading ? 'transform translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-slate-500">
            Press <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
