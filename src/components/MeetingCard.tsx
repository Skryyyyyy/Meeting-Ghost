import React from 'react';
import { Clock, CheckSquare, Calendar, Trash2, ArrowRight, Shield } from 'lucide-react';
import { MeetingData } from '../types/meeting';

interface MeetingCardProps {
  meeting: MeetingData;
  onSelect: (meeting: MeetingData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onSelect,
  onDelete,
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(meeting.createdAt));

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}m ${remainingSecs}s`;
  };

  const completedActions = meeting.actionItems.filter(a => a.completed).length;
  const totalActions = meeting.actionItems.length;

  return (
    <div
      onClick={() => onSelect(meeting)}
      className="group relative bg-white hover:bg-zinc-50/80 border border-zinc-200 hover:border-zinc-400 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
              <Shield className="w-3 h-3 text-zinc-900" />
              On-Device
            </span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(meeting.durationSeconds)}
            </span>
          </div>

          <h3 className="text-base font-bold text-zinc-900 group-hover:text-black transition-colors truncate">
            {meeting.title}
          </h3>

          <p className="text-sm text-zinc-600 line-clamp-2 mt-1.5 leading-relaxed">
            {meeting.summary.overview}
          </p>

          <div className="mt-4 flex items-center gap-3">
            {totalActions > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                <CheckSquare className="w-3.5 h-3.5 text-zinc-900" />
                <span>{completedActions}/{totalActions} Tasks</span>
              </span>
            )}

            {meeting.participants.length > 0 && (
              <div className="flex items-center gap-1">
                {meeting.participants.slice(0, 3).map((p, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200"
                  >
                    {p}
                  </span>
                ))}
                {meeting.participants.length > 3 && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    +{meeting.participants.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full space-y-4">
          <button
            onClick={(e) => onDelete(meeting.id, e)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors"
            title="Delete Recording & Data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-zinc-900 text-zinc-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
