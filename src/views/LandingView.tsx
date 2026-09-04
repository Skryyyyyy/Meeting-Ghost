import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Mic,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  KeyRound,
  Sliders,
  Moon,
  Sun,
  Layers,
  Sparkles,
} from 'lucide-react';
import BlackHole from '@/components/ui/black-hole';
import { ParallaxComponent } from '@/components/ui/parallax-scrolling';
import Lenis from '@studio-freight/lenis';

interface LandingViewProps {
  onLaunchApp: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenPrivacyModal?: () => void;
  isVaultConfigured: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onLaunchApp,
  onOpenAuth,
  onOpenPrivacyModal,
  isVaultConfigured,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleProtectedClick = () => {
    onLaunchApp();
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-zinc-800 selection:text-white transition-colors duration-500 ${
        isDarkMode ? 'bg-[#050505] text-white dark' : 'bg-white text-zinc-900'
      }`}
    >
      {/* Grounded Clean Header */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors backdrop-blur-xl ${
          isDarkMode ? 'bg-[#050505]/85 border-white/10 text-white' : 'bg-white/85 border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/logo.png"
              alt="Meeting Ghost Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-sm ring-1 ring-zinc-700/50"
            />
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight">Meeting Ghost</span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                v1.0
              </span>
            </div>
          </div>

          {/* Actions & Theme Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
                  : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {onOpenPrivacyModal && (
              <button
                onClick={onOpenPrivacyModal}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
                    : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
                title="Privacy & Security Options"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {isVaultConfigured ? (
              <button
                onClick={() => onOpenAuth('login')}
                className={`hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900'
                }`}
              >
                Unlock Vault
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('signup')}
                className={`hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900'
                }`}
              >
                Set PIN
              </button>
            )}

            <button
              onClick={handleProtectedClick}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                isDarkMode
                  ? 'bg-white hover:bg-zinc-200 text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              }`}
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Ambient Black Hole Visualizer */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-16 pb-20 px-4 text-center overflow-hidden">
        {/* Ambient Cosmic Visualizer Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-75 dark:opacity-90">
          <BlackHole />
          {/* Natural Vignette Fade */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]'
                : 'bg-gradient-to-b from-white/60 via-transparent to-white'
            }`}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-3xl">
            Meeting notes & action items —{' '}
            <span
              className={
                isDarkMode
                  ? 'bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent'
                  : 'text-zinc-500'
              }
            >
              without your voice ever leaving your device.
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg mt-6 max-w-2xl leading-relaxed ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Whisper transcription and structured AI extraction run completely inside your browser.
            No cloud APIs, no subscription fees, and complete confidentiality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={handleProtectedClick}
              className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer ${
                isDarkMode
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20'
              }`}
            >
              <Mic className="w-4 h-4" />
              Start Recording Session
            </button>

            {!isVaultConfigured ? (
              <button
                onClick={() => onOpenAuth('signup')}
                className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                    : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Setup Master PIN
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                    : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                Enter Vault PIN
              </button>
            )}
          </div>

          {/* Social Proof with Unsplash Avatars */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Sarah L."
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Alex K."
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                alt="Elena R."
              />
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Trusted by 1,000+ privacy-conscious engineers & leaders
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section
        className={`py-12 px-4 border-y transition-colors ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-zinc-200 bg-zinc-50'
        }`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              100%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>On-Device Processing</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              0 ms
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Cloud Latency</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              256-bit
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>AES-GCM Web Crypto</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              $0.00
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Per-Minute API Cost</div>
          </div>
        </div>
      </section>

      {/* Parallax Depth Section with Smooth Lenis & GSAP Scroll */}
      <ParallaxComponent />

      {/* Bento Grid Feature Showcase */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Built for High-Stakes Confidentiality</h2>
          <p className={`text-sm mt-3 max-w-xl mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Every step of audio analysis, transcript synchronization, and action checklist stays safely inside your local sandbox.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1: Wide */}
          <div
            onClick={handleProtectedClick}
            className={`md:col-span-2 p-8 rounded-3xl border transition-all cursor-pointer group ${
              isDarkMode
                ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                <Cpu className="w-6 h-6" />
              </div>
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                isDarkMode ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                WebGPU Whisper-tiny.en
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time In-Browser Speech Recognition</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Using Transformers.js and ONNX runtime compiled to WebAssembly with WebGPU acceleration, audio chunks are transcribed continuously with timestamp precision without emitting a single HTTP request.
            </p>
          </div>

          {/* Bento Item 2 */}
          <div
            onClick={handleProtectedClick}
            className={`p-8 rounded-3xl border transition-all cursor-pointer group ${
              isDarkMode
                ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                <Lock className="w-6 h-6" />
              </div>
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                isDarkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
              }`}>
                PBKDF2 + AES-256
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Encrypted Vault Storage</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              All audio recordings and meeting minutes are encrypted in IndexedDB using your local Master PIN.
            </p>
          </div>

          {/* Bento Item 3 */}
          <div
            onClick={handleProtectedClick}
            className={`p-8 rounded-3xl border transition-all cursor-pointer group ${
              isDarkMode
                ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                <Zap className="w-6 h-6" />
              </div>
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                isDarkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
              }`}>
                Structured LLM
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Automated Commitments</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Extract tasks, assignees, deadlines, and decisions automatically into an interactive checklist.
            </p>
          </div>

          {/* Bento Item 4: Wide */}
          <div
            onClick={handleProtectedClick}
            className={`md:col-span-2 p-8 rounded-3xl border transition-all cursor-pointer group ${
              isDarkMode
                ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                isDarkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
              }`}>
                ICS • PDF • Mail • MD
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Universal 1-Click Export & Follow-Up Sync</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Compose professional recap emails, export action items to Apple/Google/Outlook calendar alarms (.ics), or download verified PDF archives with full transcript timeline auditing.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section
        className={`py-16 px-4 border-y transition-colors ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-zinc-200 bg-zinc-50'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why Privacy-by-Architecture Wins</h2>
            <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Comparing traditional cloud notetakers with Meeting Ghost
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className={`overflow-x-auto rounded-3xl border shadow-sm cursor-pointer transition-all ${
              isDarkMode
                ? 'bg-black/60 border-white/10 hover:border-white/20'
                : 'bg-white border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <table className="w-full text-xs text-left">
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-white/10 bg-white/5 text-zinc-300' : 'border-zinc-200 bg-zinc-100/60 text-zinc-700'
                  }`}
                >
                  <th className="py-4 px-6 font-bold">Feature</th>
                  <th className={`py-4 px-6 font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Cloud Notetakers
                  </th>
                  <th className="py-4 px-6 font-bold">👻 Meeting Ghost</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/10' : 'divide-zinc-200'}`}>
                <tr>
                  <td className="py-4 px-6 font-semibold">Audio Processing</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Uploads audio to remote servers
                  </td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    100% In-Browser CPU / WebGPU
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold">Storage Security</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Plaintext / Vendor managed DB
                  </td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    AES-GCM-256 Local Encrypted Vault
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold">Offline Operation</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Fails without internet
                  </td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    100% Offline in Airplane Mode
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold">Marginal API Costs</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    $10–$30 / month SaaS fees
                  </td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    $0.00 Forever (Zero token costs)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold">Confidential HR & Legal</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Banned by compliance policies
                  </td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    100% Private by Architecture
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`mt-auto border-t py-12 px-4 text-center text-xs transition-colors ${
          isDarkMode ? 'border-white/10 bg-black text-zinc-500' : 'border-zinc-200 bg-white text-zinc-500'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-5 h-5 rounded-md object-cover ring-1 ring-zinc-700/50"
            />
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Meeting Ghost</span>
            <span>• 100% On-Device Meeting AI</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleProtectedClick}
              className={`transition-colors cursor-pointer ${
                isDarkMode ? 'hover:text-white' : 'hover:text-zinc-900'
              }`}
            >
              Launch App
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className={`transition-colors cursor-pointer ${
                isDarkMode ? 'hover:text-white' : 'hover:text-zinc-900'
              }`}
            >
              Vault Access
            </button>
            {onOpenPrivacyModal && (
              <button
                onClick={onOpenPrivacyModal}
                className={`transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:text-white' : 'hover:text-zinc-900'
                }`}
              >
                Privacy Center
              </button>
            )}
            <a
              href="https://github.com/Skryyyyyy/Meeting-Ghost"
              target="_blank"
              rel="noreferrer"
              className={`font-semibold transition-colors ${
                isDarkMode ? 'hover:text-white' : 'hover:text-zinc-900'
              }`}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
