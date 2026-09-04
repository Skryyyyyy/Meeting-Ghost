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
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');

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

  const handleDateChange = (id: string, newDate: string) => {
    if (onUpdateAction) {
      onUpdateAction(
        actionItems.map((item) => (item.id === id ? { ...item, due: newDate } : item))
      );
    }
  };

  const handleExportCalendar = () => {
    exportToCalendarICS(meetingTitle, actionItems);
  };

  const filteredItems = actionItems.filter((item) => {
    if (filterTab === 'pending') return !item.completed;
    if (filterTab === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
          <h3 className="text-base font-bold text-zinc-900">Action Items & Commitments</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            {actionItems.filter((a) => a.completed).length}/{actionItems.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Tab Chips */}
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-xl text-[11px] font-bold border border-zinc-200">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              All ({actionItems.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === 'pending' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Pending ({actionItems.filter((a) => !a.completed).length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === 'completed' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Done
            </button>
          </div>

          {actionItems.length > 0 && (
            <button
              onClick={handleExportCalendar}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 transition-colors cursor-pointer"
              title="Export all action items to Apple/Google/Outlook Calendar (.ics)"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-zinc-900" />
              .ics
            </button>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 && !isAdding ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <p className="text-xs text-zinc-500">No action items in this category.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-zinc-50/50 border-zinc-200 opacity-60'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className="mt-0.5 text-zinc-900 hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-zinc-900 fill-zinc-900 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                  )}
                </button>
                <div className="space-y-1 flex-1">
                  <p
                    className={`text-xs sm:text-sm font-medium leading-relaxed ${
                      item.completed ? 'line-through text-zinc-400' : 'text-zinc-800'
                    }`}
                  >
                    {item.task}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-medium">
                    <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                      <User className="w-3 h-3 text-zinc-700" />
                      {item.owner}
                    </span>

                    {/* Inline Due Date Picker */}
                    <label className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded-md border border-zinc-200 cursor-pointer transition-colors">
                      <Calendar className="w-3 h-3 text-zinc-700" />
                      <input
                        type="date"
                        value={item.due ? item.due.split('T')[0] : ''}
                        onChange={(e) => handleDateChange(item.id, e.target.value)}
                        className="bg-transparent border-none text-[11px] text-zinc-700 focus:outline-none cursor-pointer font-sans"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {onUpdateAction && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                  title="Delete Action"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Action Item Form */}
      {isAdding && (
        <form onSubmit={handleAddNew} className="mt-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50 space-y-3">
          <h4 className="text-xs font-bold text-zinc-900">Add New Action Item</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Assignee / Owner (e.g. Alex)"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>
          <input
            type="text"
            placeholder="Describe commitment or action task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Save Commitment
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
