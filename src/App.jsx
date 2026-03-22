import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Maximize, Minimize, Settings, Key, Save, Check } from 'lucide-react';

import Layout from './components/Layout';
import GlassCard from './components/GlassCard';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Quiz from './pages/Quiz';
import Doubts from './pages/Doubts';
import Planner from './pages/Planner';
import Revision from './pages/Revision';
import Flashcards from './pages/Flashcards';
import NCERT from './pages/NCERT';
import Auth from './pages/Auth';
import WelcomeModal from './components/WelcomeModal';
import { useLocalStorage, storageKeys } from './hooks/useLocalStorage';
import { getCurrentUser } from './utils/auth';

function App() {
  const user = getCurrentUser();
  const [focusMode, setFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [apiKey, setApiKey] = useLocalStorage(storageKeys.API_KEY, '');
  const [provider, setProvider] = useLocalStorage(storageKeys.AI_PROVIDER, 'groq');
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedTick, setSavedTick] = useState(false);

  // Prompt for API key on first load if missing
  useEffect(() => {
    if (!apiKey) {
      setTimeout(() => setShowSettings(true), 1500);
    }
  }, [apiKey]);

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    
    // Attempt full screen
    if (!focusMode) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.warn("Fullscreen request failed", e);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  const handleSaveSettings = () => {
    setApiKey(tempKey.trim());
    setSavedTick(true);
    setTimeout(() => {
      setSavedTick(false);
      setShowSettings(false);
    }, 1000);
  };

  return (
    <BrowserRouter>
      <WelcomeModal />
      {/* Global Header / Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {/* API Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 glass-panel rounded-lg text-slate-300 hover:text-white transition-colors relative"
          title="AI Settings"
        >
          <Settings size={20} />
          {!apiKey && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
        </button>
        
        {/* Focus Mode Toggle */}
        <button 
          onClick={toggleFocusMode}
          className={`p-2 glass-panel rounded-lg transition-colors flex items-center gap-2
            ${focusMode ? 'text-amber-400 border-amber-400/30 bg-amber-500/10' : 'text-slate-300 hover:text-white'}
          `}
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {focusMode ? <Minimize size={20} /> : <Maximize size={20} />}
          <span className="hidden sm:inline text-sm font-medium pr-1">
            {focusMode ? 'Exit Focus' : 'Focus Mode'}
          </span>
        </button>
      </div>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <GlassCard className="max-w-md w-full border-blue-500/20" glowColor="blue">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Key className="text-blue-400" />
              API Configuration
            </h2>
            <p className="text-slate-400 text-sm mb-6 pb-4 border-b border-white/10">
              BoardPrep AI connects directly to standard AI models from your browser. Your key is stored securely in your browser's local storage and never sent to our servers.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">AI Provider</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full glass-input appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="groq" className="bg-slate-800">Groq (Llama 3.3 - Recommended/Free)</option>
                  <option value="openai" className="bg-slate-800">OpenAI (GPT-4o Mini)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">API Key</label>
                <input 
                  type="password" 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder={`Enter your ${provider === 'groq' ? 'Groq' : 'OpenAI'} API Key`}
                  className="w-full glass-input"
                />
                <div className="flex justify-end pt-1">
                  <a 
                    href={provider === 'groq' ? "https://console.groq.com/keys" : "https://platform.openai.com/api-keys"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    Get a free API key here
                  </a>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  {apiKey ? 'Cancel' : 'Continue Without Key'}
                </button>
                <button 
                  onClick={handleSaveSettings}
                  disabled={!tempKey.trim()}
                  className="flex-1 glass-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savedTick ? <Check size={20} /> : <Save size={20} />}
                  {savedTick ? 'Saved!' : 'Save Key'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Router */}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={user ? <Layout focusMode={focusMode} /> : <Navigate to="/auth" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study" element={<Study />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/doubts" element={<Doubts />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/ncert" element={<NCERT />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
