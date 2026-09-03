import React, { useEffect, useState } from 'react';
import { Square, Pause, Play, X, Shield, Activity, Sparkles, MessageSquare } from 'lucide-react';
import { LiveWaveform } from '../components/LiveWaveform';
import { MeetingTemplate } from '../types/meeting';

interface RecordingViewProps {
  onStopAndProcess: () => void;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  getWaveformData: (dataArray: Uint8Array) => void;
  selectedTemplate: MeetingTemplate;
  onSelectTemplate: (t: MeetingTemplate) => void;
  livePartialTranscript?: string;
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  onStopAndProcess,
  onCancel,
  onPause,
  onResume,
  isPaused,
  getWaveformData,
  selectedTemplate,
  onSelectTemplate,
  livePartialTranscript,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const templates: { id: MeetingTemplate; label: string; desc: string }[] = [
    { id: 'general', label: 'General Sync', desc: 'Standard overview & commitments' },
    { id: 'one_on_one', label: '1:1 Growth Sync', desc: 'Feedback, goals & personal blockers' },
    { id: 'tech_architecture', label: 'Tech Architecture', desc: 'SLA, trade-offs & architecture debt' },
    { id: 'sales_call', label: 'Sales Discovery', desc: 'Budget, decision makers & deal next steps' },
    { id: 'incident_postmortem', label: 'Incident Postmortem', desc: 'Root cause, timeline & prevention' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh]">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 mb-6 shadow-xs">
        <span className="relative flex h-2.5 w-2.5">
          {!isPaused && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isPaused ? 'bg-zinc-400' : 'bg-zinc-900'
            }`}
          ></span>
        </span>
        <span className="text-xs font-bold text-zinc-900 tracking-wide uppercase">
          {isPaused ? 'Recording Paused' : 'Live On-Device Recording'}
        </span>
        <span className="text-zinc-300">•</span>
        <span className="text-xs text-zinc-600 flex items-center gap-1 font-semibold">
          <Shield className="w-3.5 h-3.5 text-zinc-900" />
          Offline
        </span>
      </div>

      {/* Timer */}
      <div className="text-6xl sm:text-7xl font-extrabold font-mono text-zinc-900 tracking-tight mb-6 select-none">
        {formatTime(seconds)}
      </div>

      {/* Real-time Waveform Canvas */}
      <div className="w-full mb-6">
        <LiveWaveform
          getWaveformData={getWaveformData}
          isRecording={true}
          isPaused={isPaused}
        />
      </div>

      {/* Live Scrolling Partial Transcript (Streaming ASR Preview) */}
      <div className="w-full mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-inner">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-900" />
          <span>Live Speech Stream (On-Device Whisper)</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-800 font-mono italic leading-relaxed min-h-[2.5rem]">
          {livePartialTranscript || (
            <span className="text-zinc-400 not-italic">
              Listening for speech... (whisper.cpp / WebGPU real-time stream)
            </span>
          )}
        </p>
      </div>

      {/* Meeting Template Selector */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" /> Meeting Template Focus
          </span>
          <span className="text-[11px] text-zinc-400">Tailors LLM structured extraction</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTemplate(t.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTemplate === t.id
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="font-bold text-xs">{t.label}</div>
              <div className={`text-[10px] truncate mt-0.5 ${selectedTemplate === t.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onCancel}
          className="p-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-red-600 border border-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Cancel & Discard"
        >
          <X className="w-6 h-6" />
        </button>

        {isPaused ? (
          <button
            onClick={onResume}
            className="p-5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 font-bold text-sm px-6"
          >
            <Play className="w-5 h-5 fill-current" />
            Resume
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 font-bold text-sm px-6"
          >
            <Pause className="w-5 h-5 fill-current" />
            Pause
          </button>
        )}

        <button
          onClick={onStopAndProcess}
          className="p-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2.5 px-8"
        >
          <Square className="w-5 h-5 fill-current" />
          Stop & Summarize
        </button>
      </div>

      <p className="text-xs text-zinc-500 mt-8 text-center flex items-center gap-1.5 font-medium">
        <Activity className="w-3.5 h-3.5 text-zinc-900" />
        Audio is buffered in-memory only. Full transcription and summary start automatically upon stopping.
      </p>
    </div>
  );
};
