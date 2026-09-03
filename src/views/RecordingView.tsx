import React, { useEffect, useState } from 'react';
import { Square, Pause, Play, X, Shield, Activity } from 'lucide-react';
import { LiveWaveform } from '../components/LiveWaveform';

interface RecordingViewProps {
  onStopAndProcess: () => void;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  getWaveformData: (dataArray: Uint8Array) => void;
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  onStopAndProcess,
  onCancel,
  onPause,
  onResume,
  isPaused,
  getWaveformData,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 mb-8 shadow-xs">
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
      <div className="text-6xl sm:text-7xl font-extrabold font-mono text-zinc-900 tracking-tight mb-8 select-none">
        {formatTime(seconds)}
      </div>

      {/* Real-time Waveform Canvas */}
      <div className="w-full mb-10">
        <LiveWaveform
          getWaveformData={getWaveformData}
          isRecording={true}
          isPaused={isPaused}
        />
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
        Audio is buffered in-memory only. Transcription starts automatically upon stopping.
      </p>
    </div>
  );
};
