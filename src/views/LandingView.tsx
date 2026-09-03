import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Mic,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Share2,
  FileText,
  Volume2,
  Zap,
  KeyRound,
  Sliders,
} from 'lucide-react';

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
  const handleProtectedClick = () => {
    onLaunchApp();
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md shadow-zinc-200">
              <span className="text-xl select-none">👻</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-zinc-900 tracking-tight">Meeting Ghost</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
              <span>100% On-Device WebGPU</span>
            </div>

            {onOpenPrivacyModal && (
              <button
                onClick={onOpenPrivacyModal}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                title="Privacy & Cookie Options"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {isVaultConfigured ? (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Unlock Vault
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Set Master PIN
              </button>
            )}

            <button
              onClick={handleProtectedClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 max-w-5xl mx-auto text-center">
        <div
          onClick={handleProtectedClick}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 mb-6 shadow-xs cursor-pointer hover:bg-zinc-200 transition-colors"
        >
          <Lock className="w-3.5 h-3.5 text-zinc-900" />
          Zero Cloud Uploads • AES-GCM-256 Encrypted Vault • Click to Sign In
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Meeting notes, action items & email follow-ups —{' '}
          <span className="text-zinc-500">
            without your voice ever leaving your device.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 mt-6 max-w-2xl mx-auto leading-relaxed">
          Cloud meeting notetakers upload your confidential audio to 3rd-party servers.
          Meeting Ghost runs Whisper ASR and language models directly inside your browser sandbox.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={handleProtectedClick}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-xl transition-all transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            Start Recording Now
          </button>

          {!isVaultConfigured ? (
            <button
              onClick={() => onOpenAuth('signup')}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm border border-zinc-200 transition-colors shadow-xs cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Setup Encrypted Vault
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm border border-zinc-200 transition-colors shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Enter Vault PIN
            </button>
          )}
        </div>

        {/* Live Feature Showcase Card (Clickable to trigger login) */}
        <div
          onClick={handleProtectedClick}
          className="mt-14 p-6 sm:p-8 bg-zinc-50 hover:bg-zinc-100/80 transition-all border border-zinc-200 rounded-3xl shadow-sm max-w-4xl mx-auto text-left cursor-pointer group"
          title="Click to authenticate & open"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-zinc-900 animate-pulse" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Live On-Device Pipeline Execution
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
              <Cpu className="w-3.5 h-3.5 text-zinc-900" />
              <span>WebGPU Hardware Accelerated</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-2 group-hover:border-zinc-300 transition-colors">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Mic className="w-4 h-4" />
                <span>1. Capture & Noise Filter</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                80Hz–7.5kHz Biquad bandpass filter strips background HVAC and desk vibrations before 16kHz resampling.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-2 group-hover:border-zinc-300 transition-colors">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Volume2 className="w-4 h-4" />
                <span>2. Whisper ASR Inference</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Client-side Whisper generates streaming timestamped transcripts with zero audio leaving browser memory.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-2 group-hover:border-zinc-300 transition-colors">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>3. Structured Extraction</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                On-device LLM extracts key points, decisions, action items, and drafts follow-up emails in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="py-16 px-4 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Why Privacy-by-Architecture Wins
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Comparing traditional cloud notetakers with Meeting Ghost
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="overflow-x-auto bg-white rounded-3xl border border-zinc-200 shadow-sm cursor-pointer hover:border-zinc-300 transition-all"
          >
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100/60 text-zinc-700">
                  <th className="py-4 px-6 font-bold">Feature</th>
                  <th className="py-4 px-6 font-bold text-zinc-500">Cloud Notetakers</th>
                  <th className="py-4 px-6 font-bold text-zinc-900">👻 Meeting Ghost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900">Audio Processing</td>
                  <td className="py-4 px-6 text-zinc-500">Uploads audio to remote servers</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    100% In-Browser CPU / WebGPU
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900">Storage Security</td>
                  <td className="py-4 px-6 text-zinc-500">Plaintext / Vendor managed DB</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    AES-GCM-256 Local Encrypted Vault
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900">Offline Operation</td>
                  <td className="py-4 px-6 text-zinc-500">Fails without internet</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    100% Offline in Airplane Mode
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900">Marginal API Costs</td>
                  <td className="py-4 px-6 text-zinc-500">$10–$30 / month SaaS subscription</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    $0.00 Forever (Zero token costs)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900">Confidential HR & Legal</td>
                  <td className="py-4 px-6 text-zinc-500">Banned by compliance policies</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    Fully Compliant by Physics
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Built for High-Stakes Productivity
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2">
            Click any feature to sign in and launch your encrypted meeting assistant
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Live Speech Stream</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Watch your speech transcribe live in real-time on-device with rolling chunked Whisper inference.
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Calendar .ICS Export</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Export commitments with reminder alarms directly into Apple, Google, or Outlook Calendar.
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Audio Sync Scrubbing</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Click any timestamp in the full transcript to jump to that exact second in the audio recording.
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Instant Follow-up Drafter</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Drafts professional recap emails. Send with one click via Mail, copy to clipboard, or export to Markdown.
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">5 Meeting Templates</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Tailor extraction for 1:1 Growth, Tech Architecture, Sales Discovery, and Incident Postmortems.
            </p>
          </div>

          <div
            onClick={handleProtectedClick}
            className="p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-all rounded-3xl shadow-sm space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Inactivity Auto-Lock</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              5-minute idle detection blurs and locks the screen, requiring PIN verification to unlock.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 py-10 px-4 bg-white text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-base">👻</span>
            <span className="font-bold text-zinc-900">Meeting Ghost</span>
            <span>• 100% On-Device Meeting AI</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={handleProtectedClick} className="hover:text-zinc-900 cursor-pointer">
              Launch App
            </button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-zinc-900 cursor-pointer">
              Vault Access
            </button>
            {onOpenPrivacyModal && (
              <button onClick={onOpenPrivacyModal} className="hover:text-zinc-900 cursor-pointer">
                Privacy Center
              </button>
            )}
            <a
              href="https://github.com/Skryyyyyy/Meeting-Ghost"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 font-semibold"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
