import React from 'react';
import { ShieldCheck, Settings, Cpu, Mic, CheckSquare, Lock, Home, User } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onNewRecording: () => void;
  onOpenGlobalTasks: () => void;
  onLockScreen: () => void;
  onNavigateLanding: () => void;
  userName?: string;
  hasWebGPU: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenProfile,
  onNewRecording,
  onOpenGlobalTasks,
  onLockScreen,
  onNavigateLanding,
  userName = 'Vault Owner',
  hasWebGPU,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateLanding}>
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
            <p className="text-xs text-zinc-500 font-medium">On-Device Meeting Recorder & Action Drafter</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Monochromatic Trust Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>100% On-Device</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-600 flex items-center gap-1 font-mono text-[11px]">
              <Cpu className="w-3 h-3 text-zinc-700" />
              {hasWebGPU ? 'WebGPU' : 'WASM CPU'}
            </span>
          </div>

          <button
            onClick={onNavigateLanding}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Return to Landing Page"
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGlobalTasks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            title="View all action items across all meetings"
          >
            <CheckSquare className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">All Tasks</span>
          </button>

          <button
            onClick={onNewRecording}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            New Recording
          </button>

          <button
            onClick={onLockScreen}
            className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            title={`Lock vault for ${userName}`}
          >
            <Lock className="w-4 h-4 text-zinc-900" />
            <span className="hidden sm:inline">Lock Vault</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            title={`Account Profile: ${userName}`}
          >
            <User className="w-3.5 h-3.5 text-zinc-900" />
            <span className="max-w-[100px] truncate">{userName}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Settings & Model Info"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
