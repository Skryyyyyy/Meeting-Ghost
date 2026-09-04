import React, { useState } from 'react';
import { Mic, Search, Sparkles, Shield, Upload, FileAudio, BarChart3, Clock, CheckCircle2, Layers } from 'lucide-react';
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
  onOpenAskGhost?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  meetings,
  onStartRecording,
  onSelectMeeting,
  onDeleteMeeting,
  onLoadSample,
  onUploadAudioFile,
  onOpenAskGhost,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.participants.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return m.template === selectedCategory;
  });

  // Compute live analytics
  const totalSeconds = meetings.reduce((acc, m) => acc + (m.durationSeconds || 60), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const allActionItems = meetings.flatMap((m) => m.actionItems || []);
  const completedActions = allActionItems.filter((a) => a.completed).length;
  const actionCompletionRate = allActionItems.length > 0 ? Math.round((completedActions / allActionItems.length) * 100) : 100;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 50MB limit.`);
          continue;
        }
        onUploadAudioFile(file);
      }
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
              <span>Import Audio / Batch Queue</span>
              <input
                type="file"
                multiple
                accept="audio/*,video/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-sm font-semibold border border-zinc-200 transition-colors cursor-pointer shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-zinc-700" />
              <span>{showAnalytics ? 'Hide Analytics' : 'Analytics Overview'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Overview Card */}
      {showAnalytics && (
        <div className="mb-8 p-6 rounded-3xl bg-zinc-900 text-white shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold tracking-tight">Vault Productivity Metrics</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">On-Device Telemetry</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700">
              <div className="text-zinc-400 text-xs flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-zinc-300" /> Meetings
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">{meetings.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700">
              <div className="text-zinc-400 text-xs flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-300" /> Recorded Time
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">{totalHours}h</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700">
              <div className="text-zinc-400 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" /> Action Items
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">{allActionItems.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700">
              <div className="text-zinc-400 text-xs flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" /> Completion Rate
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">{actionCompletionRate}%</div>
            </div>
          </div>
        </div>
      )}

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

      {/* Search and Meeting List Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Encrypted Meeting Records</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {meetings.length} meeting{meetings.length === 1 ? '' : 's'} stored in local PBKDF2/AES-GCM-256 vault
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenAskGhost && (
            <button
              onClick={onOpenAskGhost}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-200" />
              <span>Ask Ghost AI</span>
            </button>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search meetings or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'general', label: 'General' },
          { id: 'tech_architecture', label: 'Tech Architecture' },
          { id: 'one_on_one', label: '1:1 Growth' },
          { id: 'sales_call', label: 'Sales & Client' },
          { id: 'incident_postmortem', label: 'Postmortem' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Meeting Cards Grid */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <Mic className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 mb-1">No meeting records found</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            {searchTerm
              ? `No meetings match "${searchTerm}". Try a different keyword.`
              : 'Your encrypted vault is currently empty. Start your first on-device recording above.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onStartRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              Start Recording
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onSelect={onSelectMeeting}
              onDelete={(id, e) => onDeleteMeeting(id, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
