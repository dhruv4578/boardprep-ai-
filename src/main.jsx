import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrainCircuit, Key, ExternalLink } from 'lucide-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const isKeyInvalid = !PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('REPLACE_ME');

function ClerkSetupSplash() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-blue-500/20 shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10 mb-4 p-4">
          <img src="/logo.png" alt="BoardPrep AI" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">Setup Required</h1>
        <p className="text-slate-400">
          BoardPrep AI uses **Clerk** for secure authentication. To start studying, you need to add your Clerk Publishable Key.
        </p>

        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-left text-sm">
            <p className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Key size={16} /> Get your key:
            </p>
            <a 
              href="https://dashboard.clerk.com/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between text-slate-300 hover:text-white underline underline-offset-4"
            >
              clerk.com/dashboard <ExternalLink size={14} />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-left text-xs font-mono text-slate-400">
            <p className="mb-1 text-slate-500"># In .env.local</p>
            <p>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
          </div>
        </div>

        <div className="pt-4 text-[10px] text-slate-500 uppercase tracking-widest">
          The page will reload automatically
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isKeyInvalid ? (
      <ClerkSetupSplash />
    ) : (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20',
            card: 'glass-panel border-white/10 shadow-2xl',
          },
          layout: {
            logoImageUrl: '/logo.png',
            logoPlacement: 'inside'
          }
        }}
      >
        <App />
      </ClerkProvider>
    )}
  </StrictMode>,
)
