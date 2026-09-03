import React, { useState } from 'react';
import { X, ShieldCheck, Cpu, HardDrive, Trash2, CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
  hasWebGPU: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
  hasWebGPU,
}) => {
  const [modelQuality, setModelQuality] = useState<'fast' | 'accurate'>('fast');
  const [autoDeleteAudio, setAutoDeleteAudio] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    if (confirm('Are you sure you want to permanently delete all local recordings and notes?')) {
      onClearAllData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-900" />
            <h2 className="text-lg font-bold text-zinc-900">Privacy & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs">
          {/* Hardware & Acceleration status */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Inference Hardware Status
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-800">
                <Cpu className="w-4 h-4 text-zinc-900" />
                <span className="font-semibold">Acceleration Backend</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-zinc-200 text-zinc-900 border border-zinc-300">
                {hasWebGPU ? 'WebGPU (Hardware Accelerated)' : 'WASM (CPU Multi-threaded)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              All models execute completely inside the browser sandbox with zero network telemetry.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Model Quality Profile
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModelQuality('fast')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  modelQuality === 'fast'
                    ? 'bg-zinc-100 border-zinc-900 text-zinc-900 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-zinc-900" /> Fast (Tiny)
                  </span>
                  {modelQuality === 'fast' && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />}
                </div>
                <p className="text-[10px] text-zinc-500">Whisper Tiny (~39MB) • Fast on-device summary</p>
              </button>

              <button
                type="button"
                onClick={() => setModelQuality('accurate')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  modelQuality === 'accurate'
                    ? 'bg-zinc-100 border-zinc-900 text-zinc-900 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-900" /> Accurate (Base)
                  </span>
                  {modelQuality === 'accurate' && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />}
                </div>
                <p className="text-[10px] text-zinc-500">Whisper Base (~74MB) • Higher fidelity transcription</p>
              </button>
            </div>
          </div>

          {/* Privacy Controls */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Privacy Toggles
            </span>
            <label className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer">
              <div className="pr-4">
                <span className="font-semibold text-zinc-900 block text-xs">Transient Audio Only</span>
                <span className="text-[11px] text-zinc-500">Auto-delete raw audio recording after transcript generation</span>
              </div>
              <input
                type="checkbox"
                checked={autoDeleteAudio}
                onChange={(e) => setAutoDeleteAudio(e.target.checked)}
                className="rounded bg-white border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Local Storage & Wipe */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <HardDrive className="w-3.5 h-3.5 text-zinc-600" />
              <span>Storage: IndexedDB Local DB</span>
            </div>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-red-50 text-red-600 border border-zinc-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearedNotice ? 'Cleared!' : 'Wipe All Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
