import React, { useState } from 'react';
import { Lock, ShieldCheck, Unlock, KeyRound, AlertCircle } from 'lucide-react';

interface InactivityLockProps {
  isLocked: boolean;
  onUnlock: (pin?: string) => boolean;
}

export const InactivityLock: React.FC<InactivityLockProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocked) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setErrorMsg('Invalid Vault PIN. Please try again.');
      setPin('');
    } else {
      setErrorMsg('');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 border border-zinc-200">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Meeting Ghost Vault Locked</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6">
          App locked to protect encrypted meeting notes & transcripts.
        </p>

        <form onSubmit={handleUnlockSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="password"
              placeholder="Enter PIN (Default: 0000)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 text-center tracking-widest font-mono"
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 flex items-center justify-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Unlock Vault
          </button>
        </form>

        <p className="text-[11px] text-zinc-400 mt-6 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
          AES-GCM-256 Protected
        </p>
      </div>
    </div>
  );
};
