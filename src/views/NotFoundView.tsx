import React from 'react';
import { Ghost, Home, RefreshCw, ShieldCheck } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  errorMessage?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  errorMessage = 'The requested meeting note, session, or route could not be located in your encrypted vault.',
}) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center max-w-lg mx-auto select-none">
      {/* 404 Monochromatic Badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-lg mx-auto">
          <Ghost className="w-12 h-12 text-zinc-900 animate-pulse" />
        </div>
        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-xs font-mono font-bold border-2 border-white shadow-xs">
          404
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
        Meeting Note Not Found
      </h1>
      
      <p className="text-sm text-zinc-600 leading-relaxed mb-6 font-normal">
        {errorMessage}
      </p>

      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 w-full mb-8 text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
          <ShieldCheck className="w-4 h-4 text-zinc-900" />
          <span>Vault Integrity Status: Normal</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Your local IndexedDB encryption keys and session credentials remain completely safe and untouched.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs border border-zinc-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload Vault
        </button>
      </div>
    </div>
  );
};
