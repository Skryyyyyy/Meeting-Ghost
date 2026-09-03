import React, { useState } from 'react';
import { CheckCircle, Circle, User, Calendar, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { ActionItem } from '../types/meeting';
import { exportToCalendarICS } from '../services/calendarExporter';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  meetingTitle?: string;
  onToggleComplete: (id: string) => void;
  onUpdateAction?: (updatedItems: ActionItem[]) => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  meetingTitle = 'Meeting',
  onToggleComplete,
  onUpdateAction,
}) => {
  const [newOwner, setNewOwner] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newDue, setNewDue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newItem: ActionItem = {
      id: `act-custom-${Date.now()}`,
      owner: newOwner.trim() || 'Unassigned',
      task: newTask.trim(),
      due: newDue.trim() || undefined,
      completed: false,
    };

    if (onUpdateAction) {
      onUpdateAction([...actionItems, newItem]);
    }

    setNewOwner('');
    setNewTask('');
    setNewDue('');
    setIsAdding(false);
  };

  const handleDeleteItem = (id: string) => {
    if (onUpdateAction) {
      onUpdateAction(actionItems.filter((item) => item.id !== id));
    }
  };

  const handleExportCalendar = () => {
    exportToCalendarICS(meetingTitle, actionItems);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
          <h3 className="text-base font-bold text-zinc-900">Action Items & Commitments</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            {actionItems.filter((a) => a.completed).length}/{actionItems.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actionItems.length > 0 && (
            <button
              onClick={handleExportCalendar}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 transition-colors cursor-pointer"
              title="Export all action items to Apple/Google/Outlook Calendar (.ics)"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-zinc-900" />
              Export .ics
            </button>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Action
            </button>
          )}
        </div>
      </div>

      {actionItems.length === 0 && !isAdding ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <p className="text-xs text-zinc-500">No action items detected in this meeting.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-zinc-50 border-zinc-200 opacity-60'
                  : 'bg-white hover:bg-zinc-50/80 border-zinc-200'
              }`}
            >
              <button
                onClick={() => onToggleComplete(item.id)}
                className="mt-0.5 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0 cursor-pointer"
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-zinc-900" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    item.completed ? 'line-through text-zinc-400' : 'text-zinc-900 font-medium'
                  }`}
                >
                  {item.task}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-medium">
                    <User className="w-3 h-3 text-zinc-500" />
                    {item.owner}
                  </span>
                  {item.due && (
                    <span className="inline-flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-medium">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {item.due}
                    </span>
                  )}
                </div>
              </div>

              {onUpdateAction && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-600 transition-opacity cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Action Form */}
      {isAdding && (
        <form onSubmit={handleAddNew} className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
          <input
            type="text"
            placeholder="Task description (e.g., Send contract draft)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Assignee (e.g. Sarah)"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="flex-1 bg-white border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
            <input
              type="text"
              placeholder="Due date (e.g. Friday)"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="flex-1 bg-white border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Save Action
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
