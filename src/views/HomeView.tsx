import React, { useState } from 'react';
import { Mic, Search, Sparkles, Shield, Upload, FileAudio } from 'lucide-react';
import { MeetingData } from '../types/meeting';
import { MeetingCard } from '../components/MeetingCard';
import { SAMPLE_MEETINGS } from '../services/mockMeetings';

interface HomeViewProps {
  meetings: MeetingData[];
  onStartRecording: () => void;
  onSelectMeeting: (meeting: MeetingData) => void;
  onDeleteMeeting: (id: string, e: React.MouseEvent) => void;
  onLoadSample: (meeting: MeetingData) => void;
  onUploadAudioFile: (file: File) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  meetings,
  onStartRecording,
  onSelectMeeting,
  onDeleteMeeting,
  onLoadSample,
  onUploadAudioFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.participants.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAudioFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Monochromatic Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-zinc-50 border border-zinc-200 shadow-sm mb-8 overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-zinc-800 text-xs font-semibold border border-zinc-200 mb-4 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-zinc-900" />
            100% Client-Side • Zero Cloud Uploads
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Record, transcribe, and draft follow-ups <br className="hidden sm:inline" />
            <span className="text-zinc-500">
              entirely on your device.
            </span>
          </h2>

          <p className="text-zinc-600 text-sm mt-3 max-w-xl leading-relaxed font-normal">
            Unlike cloud-based notetakers, Meeting Ghost runs Whisper ASR and language models directly inside your browser. No transcripts or audio ever leave your device.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onStartRecording}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-sm font-semibold border border-zinc-200 transition-colors cursor-pointer shadow-xs">
              <Upload className="w-4 h-4 text-zinc-700" />
              <span>Import Audio File</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preloaded Demo Samples */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
            <span>Instant Demo Samples (Pre-loaded)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_MEETINGS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="p-4 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                  <FileAudio className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-medium">
                    {sample.actionItems.length} action items • {sample.participants.join(', ')}
                  </p>
                </div>
              </div>
              <span className="text-xs text-zinc-900 font-semibold group-hover:translate-x-1 transition-transform">
                View →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Meeting List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Meeting History</h3>
          <span className="text-xs text-zinc-500 font-medium">{meetings.length} recordings stored locally</span>
        </div>

        {meetings.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search meetings by keyword, decision, or participant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 shadow-xs"
            />
          </div>
        )}

        {filteredMeetings.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-3xl p-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-700">No meetings recorded yet</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Tap the record button above or click an instant demo sample to see on-device summarization in action.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onSelect={onSelectMeeting}
                onDelete={onDeleteMeeting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
