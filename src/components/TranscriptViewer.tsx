import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageSquare, Play, Volume2, User } from 'lucide-react';
import { TranscriptSegment } from '../types/meeting';

interface TranscriptViewerProps {
  transcript: {
    text: string;
    chunks: TranscriptSegment[];
  };
  audioUrl?: string | null;
  onSeekAudio?: (timestampSeconds: number) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  audioUrl,
  onSeekAudio,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredChunks = transcript.chunks.filter((chunk) =>
    chunk.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chunk.speaker && chunk.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-zinc-900 text-white font-semibold rounded px-1 py-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-zinc-50/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-zinc-900" />
          <h3 className="text-base font-bold text-zinc-900">Interactive Transcript</h3>
          <span className="text-xs text-zinc-500 font-medium">
            ({transcript.chunks.length} segments)
          </span>
          {audioUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
              <Volume2 className="w-3 h-3 text-zinc-900" /> Audio Synced
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="text-xs font-semibold">{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-zinc-200">
          {/* Search bar inside transcript */}
          <div className="relative my-3">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search words, phrases, or speakers in transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 mt-3">
            {filteredChunks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No matching transcript segments found.</p>
            ) : (
              filteredChunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors text-xs border border-transparent hover:border-zinc-200"
                >
                  <button
                    onClick={() => onSeekAudio && onSeekAudio(chunk.timestamp[0])}
                    className="font-mono text-zinc-800 shrink-0 select-none bg-zinc-100 hover:bg-zinc-900 hover:text-white px-2.5 py-1 rounded-lg border border-zinc-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Jump to audio timestamp"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    {formatTimestamp(chunk.timestamp[0])}
                  </button>

                  <div className="flex-1 pt-0.5 space-y-1">
                    {chunk.speaker && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        <User className="w-2.5 h-2.5" />
                        {chunk.speaker}
                      </span>
                    )}
                    <p className="text-zinc-700 leading-relaxed font-normal">
                      {renderHighlightedText(chunk.text, searchTerm)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
