import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, ShieldCheck, CheckCircle, ListChecks, FileText, Share2, Edit3, Check } from 'lucide-react';
import { MeetingData, ActionItem } from '../types/meeting';
import { ActionItemsList } from '../components/ActionItemsList';
import { FollowUpComposer } from '../components/FollowUpComposer';
import { TranscriptViewer } from '../components/TranscriptViewer';

interface SummaryViewProps {
  meeting: MeetingData;
  onBack: () => void;
  onUpdateMeeting: (updated: MeetingData) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  meeting,
  onBack,
  onUpdateMeeting,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'followup' | 'transcript'>('summary');

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(meeting.createdAt));

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}m ${remainingSecs}s`;
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    onUpdateMeeting({ ...meeting, title });
  };

  const handleToggleAction = (actionId: string) => {
    const updatedActions = meeting.actionItems.map((item) =>
      item.id === actionId ? { ...item, completed: !item.completed } : item
    );
    onUpdateMeeting({ ...meeting, actionItems: updatedActions });
  };

  const handleUpdateActions = (updatedActions: ActionItem[]) => {
    onUpdateMeeting({ ...meeting, actionItems: updatedActions });
  };

  const handleUpdateDraft = (newDraft: string) => {
    onUpdateMeeting({ ...meeting, followUpDraft: newDraft });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black px-3.5 py-2 rounded-xl bg-white border border-zinc-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Meetings
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            100% On-Device Verified
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-zinc-900" />
            {formattedDate}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-900" />
            {formatDuration(meeting.durationSeconds)}
          </span>
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl sm:text-2xl font-extrabold text-zinc-900 bg-zinc-50 border border-zinc-400 rounded-xl px-3 py-1 flex-1 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleTitleSave}
              className="p-2 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              {meeting.title}
            </h1>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-700 transition-opacity cursor-pointer"
              title="Edit Title"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}

        {meeting.participants.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-zinc-500 font-semibold">Participants:</span>
            {meeting.participants.map((p, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Executive Summary
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Action Items ({meeting.actionItems.length})
        </button>

        <button
          onClick={() => setActiveTab('followup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'followup'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Follow-up Message
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Executive Overview
              </h3>
              <p className="text-sm text-zinc-800 leading-relaxed font-normal">
                {meeting.summary.overview}
              </p>
            </div>

            {/* Key Discussion Points */}
            {meeting.summary.keyPoints.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Key Discussion Points
                </h3>
                <ul className="space-y-2.5">
                  {meeting.summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-2 shrink-0" />
                      <span className="leading-relaxed font-normal">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Decisions */}
            {meeting.summary.decisions.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Decisions Agreed Upon
                </h3>
                <ul className="space-y-2.5">
                  {meeting.summary.decisions.map((dec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-800">
                      <CheckCircle className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{dec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <ActionItemsList
            actionItems={meeting.actionItems}
            onToggleComplete={handleToggleAction}
            onUpdateAction={handleUpdateActions}
          />
        )}

        {activeTab === 'followup' && (
          <FollowUpComposer
            draft={meeting.followUpDraft}
            meetingTitle={meeting.title}
            onUpdateDraft={handleUpdateDraft}
          />
        )}

        {/* Collapsible Full Transcript Viewer */}
        <TranscriptViewer transcript={meeting.transcript} />
      </div>
    </div>
  );
};
