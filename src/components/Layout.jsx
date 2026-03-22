import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ focusMode = false }) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <Sidebar focusMode={focusMode} />

      {/* Main Content Area */}
      <main className={`
        flex-1 relative z-10 transition-all duration-300 ease-in-out
        ${focusMode ? 'ml-0' : 'md:ml-0'} /* Sidebar is inline block on md+, flex handles it */
        h-screen overflow-y-auto overflow-x-hidden
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
