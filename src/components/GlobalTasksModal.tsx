import React, { useState } from 'react';
import { X, CheckCircle, Circle, User, Calendar, CheckSquare, Search, Filter } from 'lucide-react';
import { MeetingData } from '../types/meeting';

interface GlobalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingData[];
  onToggleAction: (meetingId: string, actionId: string) => void;
}

export const GlobalTasksModal: React.FC<GlobalTasksModalProps> = ({
  isOpen,
  onClose,
  meetings,
  onToggleAction,
}) => {
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Flatten all action items with meeting context
  const allActions = meetings.flatMap((m) =>
    m.actionItems.map((a) => ({
      ...a,
      meetingId: m.id,
      meetingTitle: m.title,
    }))
  );

  const allOwners = Array.from(new Set(allActions.map((a) => a.owner).filter(Boolean)));

  const filteredActions = allActions.filter((action) => {
    const matchesOwner = filterOwner === 'all' || action.owner.toLowerCase() === filterOwner.toLowerCase();
    const matchesSearch =
      action.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOwner && matchesSearch;
  });

  const completedCount = allActions.filter((a) => a.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-zinc-900" />
            <h2 className="text-lg font-bold text-zinc-900">Global Action Items & Tasks</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
              {completedCount}/{allActions.length} Completed
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search across all meeting tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {allOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <p className="text-xs text-zinc-500">No matching commitments found.</p>
            </div>
          ) : (
            filteredActions.map((action) => (
              <div
                key={`${action.meetingId}-${action.id}`}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  action.completed
                    ? 'bg-zinc-50 border-zinc-200 opacity-60'
                    : 'bg-white hover:bg-zinc-50/80 border-zinc-200'
                }`}
              >
                <button
                  onClick={() => onToggleAction(action.meetingId, action.id)}
                  className="mt-0.5 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0 cursor-pointer"
                >
                  {action.completed ? (
                    <CheckCircle className="w-5 h-5 text-zinc-900" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm ${
                      action.completed ? 'line-through text-zinc-400' : 'text-zinc-900 font-medium'
                    }`}
                  >
                    {action.task}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                    <span className="font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                      {action.meetingTitle}
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-medium">
                      <User className="w-3 h-3 text-zinc-500" />
                      {action.owner}
                    </span>
                    {action.due && (
                      <span className="inline-flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-medium">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {action.due}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
