import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { setupVault, verifyVaultPin, isVaultSetup } from '../services/auth';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  onAuthenticated: () => void;
  onCancel: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode,
  onAuthenticated,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(
    isVaultSetup() ? initialMode : 'signup'
  );
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'signup') {
      if (!pin || pin.length < 4) {
        setErrorMsg('Master PIN must be at least 4 digits/characters.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg('PIN confirmation does not match.');
        return;
      }

      setIsProcessing(true);
      try {
        await setupVault(username || 'Vault Owner', pin);
        onAuthenticated();
      } catch (err) {
        setErrorMsg('Could not initialize vault: ' + err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!pin) {
        setErrorMsg('Please enter your Vault PIN.');
        return;
      }

      setIsProcessing(true);
      try {
        const result = await verifyVaultPin(pin);
        if (result.success) {
          onAuthenticated();
        } else {
          setErrorMsg(result.error || 'Invalid PIN.');
        }
      } catch (err) {
        setErrorMsg('Verification error: ' + err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-4 selection:bg-zinc-900 selection:text-white">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 mb-6 p-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Auth Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 border border-zinc-200">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              {mode === 'signup' ? 'Set Master Vault PIN' : 'Unlock Meeting Ghost Vault'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Create a secure on-device PIN to encrypt notes with AES-GCM-256.'
                : 'Enter your Master PIN to decrypt your local meeting vault.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Your Name / Identity (Stored Locally)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                {mode === 'signup' ? 'Master PIN (min 4 characters)' : 'Vault PIN (Default: 0000)'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 tracking-widest font-mono"
                  autoFocus
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Confirm Master PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 tracking-widest font-mono"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isProcessing ? 'Verifying...' : mode === 'signup' ? 'Create Secure Vault' : 'Unlock & Access App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs">
            {mode === 'signup' ? (
              <p className="text-zinc-500">
                Already have a vault setup?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Enter PIN
                </button>
              </p>
            ) : (
              <p className="text-zinc-500">
                Want to reset or set a new Master PIN?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Set Master PIN
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>100% On-Device Auth • Never leaves this browser</span>
          </div>
        </div>
      </div>
    </div>
  );
};
