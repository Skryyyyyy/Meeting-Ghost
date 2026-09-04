import React, { useState } from 'react';
import {
  X,
  FileDown,
  FileText,
  Copy,
  Calendar,
  Printer,
  Code2,
  Check,
  Share2,
} from 'lucide-react';
import { MeetingData } from '../types/meeting';
import {
  exportMeetingMarkdown,
  exportMeetingText,
  downloadFile,
  copyMeetingToClipboard,
  printMeeting,
} from '../services/exporter';
import { exportToCalendarICS } from '../services/calendarExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, meeting }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyMeetingToClipboard(meeting);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = exportMeetingMarkdown(meeting);
    const safeTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    downloadFile(md, `${safeTitle}-notes.md`, 'text/markdown');
  };

  const handleDownloadText = () => {
    const txt = exportMeetingText(meeting);
    const safeTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    downloadFile(txt, `${safeTitle}-notes.txt`, 'text/plain');
  };

  const handleDownloadJson = () => {
    // Export clean JSON excluding heavy binary blobs if present
    const cleanMeeting = {
      ...meeting,
      audioBlob: undefined,
    };
    const jsonStr = JSON.stringify(cleanMeeting, null, 2);
    const safeTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    downloadFile(jsonStr, `${safeTitle}-data.json`, 'application/json');
  };

  const handleExportICS = () => {
    exportToCalendarICS(meeting.title, meeting.actionItems);
  };

  const handlePrint = () => {
    printMeeting(meeting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-white shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Export Meeting Notes</h3>
              <p className="text-xs text-zinc-500">Choose your preferred format or share directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          {/* Markdown Button */}
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">Markdown (.md)</span>
              <span className="block text-[11px] text-zinc-500">Notion, Obsidian, GitHub</span>
            </div>
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </span>
              <span className="block text-[11px] text-zinc-500">Rich formatted markdown</span>
            </div>
          </button>

          {/* Calendar Export */}
          <button
            onClick={handleExportICS}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">Calendar (.ics)</span>
              <span className="block text-[11px] text-zinc-500">Export action item events</span>
            </div>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">Print / PDF</span>
              <span className="block text-[11px] text-zinc-500">Save as formatted PDF</span>
            </div>
          </button>

          {/* Plain Text */}
          <button
            onClick={handleDownloadText}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">Plain Text (.txt)</span>
              <span className="block text-[11px] text-zinc-500">Raw unformatted text</span>
            </div>
          </button>

          {/* Raw JSON */}
          <button
            onClick={handleDownloadJson}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-800">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-900">Structured Data (.json)</span>
              <span className="block text-[11px] text-zinc-500">Full schema & metadata</span>
            </div>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
          <p className="text-[11px] text-zinc-500">
            Exported directly from your browser memory. <strong>0% cloud transmission</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
