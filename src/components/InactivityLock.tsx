import React from 'react';
import { Lock, ShieldCheck, Unlock } from 'lucide-react';

interface InactivityLockProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const InactivityLock: React.FC<InactivityLockProps> = ({ isLocked, onUnlock }) => {
  if (!isLocked) return null;

  const handleUnlockClick = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 border border-zinc-200">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Meeting Ghost Locked</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6">
          App automatically locked due to inactivity to protect sensitive notes & transcripts.
        </p>

        <form onSubmit={handleUnlockClick} className="space-y-4">
          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Click to Unlock Vault
          </button>
        </form>

        <p className="text-[11px] text-zinc-400 mt-6 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
          100% On-Device Vault
        </p>
      </div>
    </div>
  );
};
