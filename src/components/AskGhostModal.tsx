import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { MeetingData } from '../types/meeting';
import { queryGhostVault, AskGhostAnswer } from '../services/askGhost';

interface AskGhostModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingData[];
  onSelectMeeting: (meeting: MeetingData) => void;
}

export const AskGhostModal: React.FC<AskGhostModalProps> = ({
  isOpen,
  onClose,
  meetings,
  onSelectMeeting,
}) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AskGhostAnswer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const ans = queryGhostVault(query, meetings);
      setResult(ans);
      setIsSearching(false);
    }, 150);
  };

  const handleQuickPrompt = (promptText: string) => {
    setQuery(promptText);
    setIsSearching(true);
    setTimeout(() => {
      const ans = queryGhostVault(promptText, meetings);
      setResult(ans);
      setIsSearching(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Ask Ghost AI Assistant</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 font-bold text-zinc-800">
                  On-Device
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Ask questions across all {meetings.length} encrypted meetings in your vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What were the key decisions on the architecture? Who is assigned to the PR?"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-10 pr-24 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-medium"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>{isSearching ? 'Searching...' : 'Ask'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        {!result && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Suggested queries:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'What are my pending action items?',
                'Summarize architectural decisions',
                'Roadmap & timeline milestones',
                'Security and encryption compliance',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(suggestion)}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs rounded-xl transition-colors cursor-pointer font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {result && (
            <div className="space-y-4">
              {/* Synthesized Response */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Vault Intelligence Answer</span>
                </div>
                <div className="text-xs text-zinc-800 whitespace-pre-line leading-relaxed font-normal">
                  {result.answer}
                </div>
              </div>

              {/* Related Action Items if any */}
              {result.relatedActionItems.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Matched Action Items</span>
                  </div>
                  <div className="space-y-2">
                    {result.relatedActionItems.map((act, idx) => (
                      <div key={idx} className="text-xs p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-zinc-900">@{act.owner}: </span>
                          <span className="text-zinc-700">{act.task}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{act.meetingTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations / Jump Links */}
              {result.citations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Referenced Meetings ({result.citations.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.citations.map((cit) => {
                      const matchedMeeting = meetings.find(m => m.id === cit.meetingId);
                      if (!matchedMeeting) return null;
                      return (
                        <div
                          key={cit.meetingId}
                          onClick={() => {
                            onSelectMeeting(matchedMeeting);
                            onClose();
                          }}
                          className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-900 rounded-xl cursor-pointer transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                              {cit.meetingTitle}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                              {cit.matchType}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 font-normal">
                            {cit.snippet}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>100% On-Device Neural Search</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
