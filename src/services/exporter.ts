import { MeetingData } from '../types/meeting';

/**
 * Generates a clean, structured Markdown document from MeetingData
 */
export function exportMeetingMarkdown(meeting: MeetingData): string {
  const dateStr = new Date(meeting.createdAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const durationMins = Math.floor(meeting.durationSeconds / 60);
  const durationSecs = Math.floor(meeting.durationSeconds % 60);

  let md = `# ${meeting.title}\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Duration:** ${durationMins}m ${durationSecs}s  \n`;
  if (meeting.participants && meeting.participants.length > 0) {
    md += `**Participants:** ${meeting.participants.join(', ')}  \n`;
  }
  md += `**Privacy:** 100% On-Device Verified (Zero Cloud Telemetry)\n\n`;
  md += `---\n\n`;

  // Executive Overview
  md += `## Executive Overview\n\n`;
  md += `${meeting.summary?.overview || 'No overview generated.'}\n\n`;

  // Key Discussion Points
  if (meeting.summary?.keyPoints && meeting.summary.keyPoints.length > 0) {
    md += `## Key Discussion Points\n\n`;
    meeting.summary.keyPoints.forEach((point) => {
      md += `- ${point}\n`;
    });
    md += `\n`;
  }

  // Action Items
  if (meeting.actionItems && meeting.actionItems.length > 0) {
    md += `## Action Items\n\n`;
    meeting.actionItems.forEach((item) => {
      const checkbox = item.completed ? '[x]' : '[ ]';
      const owner = item.owner ? `**@${item.owner}**` : '**Unassigned**';
      const due = item.due ? ` *(Due: ${item.due})*` : '';
      md += `- ${checkbox} ${owner}: ${item.task}${due}\n`;
    });
    md += `\n`;
  }

  // Follow-Up Message Draft
  if (meeting.followUpDraft) {
    md += `## Follow-Up Message Draft\n\n`;
    md += `\`\`\`text\n${meeting.followUpDraft}\n\`\`\`\n\n`;
  }

  // Full Transcript
  if (meeting.transcript?.chunks && meeting.transcript.chunks.length > 0) {
    md += `## Full Transcript\n\n`;
    meeting.transcript.chunks.forEach((t) => {
      const startTime = t.timestamp[0];
      const startMin = Math.floor(startTime / 60);
      const startSec = Math.floor(startTime % 60).toString().padStart(2, '0');
      const speaker = t.speaker || 'Speaker';
      md += `**[${startMin}:${startSec}] ${speaker}:** ${t.text}\n\n`;
    });
  } else if (meeting.transcript?.text) {
    md += `## Full Transcript\n\n`;
    md += `${meeting.transcript.text}\n\n`;
  }

  return md;
}

/**
 * Generates plain text meeting notes
 */
export function exportMeetingText(meeting: MeetingData): string {
  const dateStr = new Date(meeting.createdAt).toLocaleString();
  let txt = `${meeting.title.toUpperCase()}\n`;
  txt += `Date: ${dateStr}\n`;
  txt += `Duration: ${Math.floor(meeting.durationSeconds / 60)}m ${Math.floor(meeting.durationSeconds % 60)}s\n`;
  if (meeting.participants?.length) {
    txt += `Participants: ${meeting.participants.join(', ')}\n`;
  }
  txt += `\n========================================\n`;
  txt += `EXECUTIVE SUMMARY:\n${meeting.summary?.overview || ''}\n\n`;

  if (meeting.summary?.keyPoints?.length) {
    txt += `KEY DISCUSSION POINTS:\n`;
    meeting.summary.keyPoints.forEach((kp) => {
      txt += `• ${kp}\n`;
    });
    txt += `\n`;
  }

  if (meeting.actionItems?.length) {
    txt += `ACTION ITEMS:\n`;
    meeting.actionItems.forEach((ai) => {
      const status = ai.completed ? '[DONE]' : '[TODO]';
      txt += `${status} ${ai.owner}: ${ai.task} (Due: ${ai.due || 'TBD'})\n`;
    });
    txt += `\n`;
  }

  return txt;
}

/**
 * Downloads arbitrary string content to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies formatted meeting notes to clipboard
 */
export async function copyMeetingToClipboard(meeting: MeetingData): Promise<boolean> {
  try {
    const md = exportMeetingMarkdown(meeting);
    await navigator.clipboard.writeText(md);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Triggers a clean print dialog for browser Save-as-PDF
 */
export function printMeeting(meeting: MeetingData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF.');
    return;
  }

  const dateStr = new Date(meeting.createdAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meeting.title} - Meeting Ghost</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #18181b;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
          .meta { color: #71717a; font-size: 13px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e4e4e7; }
          h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #52525b; margin-top: 24px; border-bottom: 1px solid #f4f4f5; padding-bottom: 4px; }
          p { font-size: 14px; margin: 8px 0; }
          ul { padding-left: 20px; font-size: 14px; }
          li { margin-bottom: 6px; }
          .badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; background: #f4f4f5; border: 1px solid #e4e4e7; }
          .action-item { padding: 6px 0; font-size: 14px; }
          .tag { font-weight: bold; color: #18181b; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${meeting.title}</h1>
        <div class="meta">
          <strong>Date:</strong> ${dateStr} &bull; 
          <strong>Duration:</strong> ${Math.floor(meeting.durationSeconds / 60)}m ${Math.floor(meeting.durationSeconds % 60)}s &bull;
          <span class="badge">100% On-Device Private</span>
        </div>

        <h2>Executive Overview</h2>
        <p>${meeting.summary?.overview || 'No overview available.'}</p>

        ${meeting.summary?.keyPoints?.length ? `
          <h2>Key Discussion Points</h2>
          <ul>
            ${meeting.summary.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        ` : ''}

        ${meeting.actionItems?.length ? `
          <h2>Action Items</h2>
          <ul>
            ${meeting.actionItems.map(ai => `
              <li class="action-item">
                <span class="tag">[${ai.completed ? 'COMPLETED' : 'TODO'}] ${ai.owner}:</span> ${ai.task} 
                ${ai.due ? `<em>(Due: ${ai.due})</em>` : ''}
              </li>
            `).join('')}
          </ul>
        ` : ''}

        ${meeting.transcript?.chunks?.length ? `
          <h2>Transcript</h2>
          <div>
            ${meeting.transcript.chunks.map(t => `
              <p><strong>[${Math.floor(t.timestamp[0] / 60)}:${Math.floor(t.timestamp[0] % 60).toString().padStart(2, '0')}] ${t.speaker || 'Speaker'}:</strong> ${t.text}</p>
            `).join('')}
          </div>
        ` : meeting.transcript?.text ? `
          <h2>Transcript</h2>
          <p>${meeting.transcript.text}</p>
        ` : ''}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
