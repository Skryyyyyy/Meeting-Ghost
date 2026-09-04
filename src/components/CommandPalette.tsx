import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, FileText, Settings, Shield, ListTodo, X, ArrowRight } from 'lucide-react';
import { MeetingData } from '../types/meeting';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingData[];
  onSelectMeeting: (m: MeetingData) => void;
  onStartRecording: () => void;
  onOpenSettings: () => void;
  onOpenPrivacyModal: () => void;
  onOpenGlobalTasks: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  meetings,
  onSelectMeeting,
  onStartRecording,
  onOpenSettings,
  onOpenPrivacyModal,
  onOpenGlobalTasks,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.summary.overview.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Header */}
        <div className="flex items-center px-5 py-4 border-b border-zinc-200">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search meetings (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <span className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Quick Actions
            </span>
            <div className="mt-1 space-y-1">
              <button
                onClick={() => {
                  onStartRecording();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 text-left text-zinc-900 font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-white">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span>Start New On-Device Recording</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  onOpenGlobalTasks();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 text-left text-zinc-900 font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <ListTodo className="w-3.5 h-3.5" />
                  </div>
                  <span>View All Global Action Items</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  onOpenPrivacyModal();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 text-left text-zinc-900 font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span>Privacy & Security Vault Center</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 text-left text-zinc-900 font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span>Hardware & AI Model Settings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Stored Meetings List */}
          <div>
            <span className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Meetings ({filteredMeetings.length})
            </span>
            <div className="mt-1 space-y-1">
              {filteredMeetings.length === 0 ? (
                <p className="px-3 py-2 text-zinc-500 text-[11px]">No matching meetings found.</p>
              ) : (
                filteredMeetings.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMeeting(m);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-zinc-900 truncate">{m.title}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{m.summary.overview}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-2">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
