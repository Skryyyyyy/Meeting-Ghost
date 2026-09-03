import React from 'react';
import { ShieldCheck, Mic, FileText, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { ProcessingStage } from '../types/meeting';

interface ProcessingModalProps {
  stage: ProcessingStage;
  statusMessage: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  stage,
  statusMessage,
}) => {
  const steps = [
    { key: 'audio_prep', label: 'Audio Normalization (16kHz PCM)', icon: Mic },
    { key: 'transcribing', label: 'On-Device ASR (Whisper-tiny.en)', icon: FileText },
    { key: 'summarizing', label: 'Structured LLM Action Item Extraction', icon: Sparkles },
    { key: 'drafting', label: 'Follow-up Email Composition', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['idle', 'audio_prep', 'transcribing', 'summarizing', 'drafting', 'complete'];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepKey);

    if (stage === 'complete' || currentIndex > stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 text-zinc-900">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Processing Meeting On-Device
          </h2>
          <p className="text-xs text-zinc-600 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            Zero Network Activity • 100% Offline
          </p>
        </div>

        {/* Steps Pipeline */}
        <div className="space-y-3 mb-6">
          {steps.map((step) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                  status === 'active'
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-semibold shadow-xs'
                    : status === 'done'
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-700'
                    : 'bg-white border-zinc-100 text-zinc-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    status === 'active'
                      ? 'bg-zinc-900 text-white animate-pulse'
                      : status === 'done'
                      ? 'bg-zinc-200 text-zinc-900'
                      : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium flex-1">{step.label}</span>
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-zinc-900" />}
                {status === 'active' && <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />}
              </div>
            );
          })}
        </div>

        {/* Dynamic Status Log */}
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 text-center">
          <p className="text-xs font-mono text-zinc-600 truncate">
            {statusMessage || 'Running client-side tensor inference...'}
          </p>
        </div>
      </div>
    </div>
  );
};
