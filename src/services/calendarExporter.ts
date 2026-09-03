import { ActionItem } from '../types/meeting';

/**
 * Escapes characters according to RFC 5545 §3.3.11 (Text Value)
 * Backslash, semicolon, and comma must be escaped, and newlines must be converted to \n
 */
function escapeICSValue(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function exportToCalendarICS(meetingTitle: string, actionItems: ActionItem[]): void {
  const pendingActions = actionItems.filter(a => !a.completed);
  if (pendingActions.length === 0) {
    alert('No pending action items to export.');
    return;
  }

  const now = new Date();
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const createdStamp = formatICSDate(now);
  
  // Schedule commitment reminder for tomorrow 9 AM
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(9, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(10, 0, 0, 0);

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meeting Ghost//Action Items//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  pendingActions.forEach((action, idx) => {
    const uid = `ghost-${Date.now()}-${idx}@meetingghost.local`;
    const cleanSummary = escapeICSValue(`[Action Item] ${action.owner}: ${action.task}`);
    const cleanDesc = escapeICSValue(
      `Meeting: ${meetingTitle}\nAssignee: ${action.owner}\nTask: ${action.task}\nDue: ${action.due || 'Not specified'}`
    );

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${createdStamp}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${cleanSummary}`,
      `DESCRIPTION:${cleanDesc}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${meetingTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-actions.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
