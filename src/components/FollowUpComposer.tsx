import React, { useState } from 'react';
import { Mail, Copy, Check, Download } from 'lucide-react';

interface FollowUpComposerProps {
  draft: string;
  meetingTitle: string;
  onUpdateDraft: (newDraft: string) => void;
}

export const FollowUpComposer: React.FC<FollowUpComposerProps> = ({
  draft,
  meetingTitle,
  onUpdateDraft,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleOpenMail = () => {
    const subject = encodeURIComponent(`Recap & Next Steps: ${meetingTitle}`);
    const body = encodeURIComponent(draft);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([`# ${meetingTitle}\n\n${draft}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-followup.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
          <h3 className="text-base font-bold text-zinc-900">Drafted Follow-up Message</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            Ready to Send
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Export as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-900" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleOpenMail}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            Send via Mail
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-3">
        Generated entirely on-device. Review and edit before sending.
      </p>

      <div className="relative">
        <textarea
          value={draft}
          onChange={(e) => onUpdateDraft(e.target.value)}
          rows={10}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-mono text-zinc-900 leading-relaxed focus:outline-none focus:border-zinc-900 resize-y transition-colors"
          placeholder="Draft message will appear here..."
        />
      </div>
    </div>
  );
};
