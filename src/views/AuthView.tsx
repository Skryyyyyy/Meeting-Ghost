import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  setupVault,
  verifyVaultPin,
  isVaultSetup,
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetMasterPin,
} from '../services/auth';
import { sanitizeAndCheckSql } from '../services/security';

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
  const [mode, setMode] = useState<'login' | 'signup' | 'reset_pin'>(
    isVaultSetup() ? initialMode : 'signup'
  );
  const [authMethod, setAuthMethod] = useState<'pin' | 'email'>('pin');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsProcessing(true);
    try {
      await signInWithGoogle(pin || '0000');
      onAuthenticated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // SQL Injection / Threat scan
    const checkUser = sanitizeAndCheckSql(username + email + pin);
    if (!checkUser.isSafe) {
      setErrorMsg('Input blocked: ' + checkUser.detectedThreat);
      return;
    }

    if (mode === 'reset_pin') {
      if (pin.length < 4) {
        setErrorMsg('PIN must be at least 4 characters.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg('PIN confirmation does not match.');
        return;
      }
      setIsProcessing(true);
      try {
        await resetMasterPin(pin);
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          setMode('login');
        }, 1500);
      } catch (err: any) {
        setErrorMsg('PIN reset failed: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

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
        if (authMethod === 'email') {
          if (!email || !password) {
            setErrorMsg('Please enter an email and password.');
            setIsProcessing(false);
            return;
          }
          await registerWithEmail(email, password, username || 'Vault Owner', pin);
        } else {
          await setupVault(username || 'Vault Owner', pin, email);
        }
        onAuthenticated();
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not initialize vault.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Login mode
      if (!pin) {
        setErrorMsg('Please enter your Vault PIN.');
        return;
      }

      setIsProcessing(true);
      try {
        if (authMethod === 'email') {
          await loginWithEmail(email, password, pin);
          onAuthenticated();
        } else {
          const result = await verifyVaultPin(pin);
          if (result.success) {
            onAuthenticated();
          } else {
            setErrorMsg(result.error || 'Invalid PIN.');
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed.');
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
              {mode === 'signup'
                ? 'Create Encrypted Vault'
                : mode === 'reset_pin'
                ? 'Reset Master Vault PIN'
                : 'Unlock Meeting Ghost'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Configure your on-device encryption key with Firebase & Google sync.'
                : mode === 'reset_pin'
                ? 'Enter a new 4+ character PIN to re-encrypt your local vault.'
                : 'Authenticate with Google, Email, or Master PIN.'}
            </p>
          </div>

          {/* Google Sign In Button */}
          {mode !== 'reset_pin' && (
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-3 text-xs font-bold text-zinc-800 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-[10px] uppercase font-bold text-zinc-400">or with PIN / Email</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              {/* Method Switcher */}
              <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('pin')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'pin' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  Master PIN
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'email' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  Email + Password
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Your Full Name / Identity
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            {authMethod === 'email' && mode !== 'reset_pin' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Account Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              </>
            )}

            {/* PIN Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  {mode === 'signup'
                    ? 'Master PIN (AES-GCM Key Seed)'
                    : mode === 'reset_pin'
                    ? 'New Master PIN'
                    : 'Master Vault PIN (Default: 0000)'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset_pin');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
                  >
                    Forgot PIN?
                  </button>
                )}
              </div>
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

            {(mode === 'signup' || mode === 'reset_pin') && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Confirm Master PIN</label>
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

            {resetSuccess && (
              <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-xl flex items-center gap-2 text-xs text-zinc-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>PIN reset successfully! Loading vault...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>
                {isProcessing
                  ? 'Verifying...'
                  : mode === 'signup'
                  ? 'Create Encrypted Vault'
                  : mode === 'reset_pin'
                  ? 'Save & Reset PIN'
                  : 'Unlock & Enter Vault'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login, Signup, Reset */}
          <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs space-y-1">
            {mode === 'signup' ? (
              <p className="text-zinc-500">
                Already have a vault?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Enter PIN / Log In
                </button>
              </p>
            ) : mode === 'reset_pin' ? (
              <p className="text-zinc-500">
                Remember your PIN?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </p>
            ) : (
              <p className="text-zinc-500">
                New to Meeting Ghost?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Create Master PIN & Vault
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>PBKDF2 SHA-256 Key Derivation • SQLi Shielded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
