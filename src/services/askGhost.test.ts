import { describe, it, expect } from 'vitest';
import { queryGhostVault } from './askGhost';
import { MeetingData } from '../types/meeting';

describe('AskGhost Semantic Search Service', () => {
  const sampleMeetings: MeetingData[] = [
    {
      id: 'm1',
      title: 'Database & Infrastructure Sync',
      createdAt: 1700000000000,
      durationSeconds: 120,
      participants: ['David', 'Sarah'],
      template: 'tech_architecture',
      summary: {
        overview: 'We discussed migrating to PostgreSQL and Redis caching.',
        keyPoints: ['PostgreSQL provides ACID guarantees', 'Redis will reduce API latency by 80%'],
        decisions: ['Adopt PostgreSQL for metadata storage', 'Deploy Redis cluster next month'],
      },
      actionItems: [
        { id: 'a1', owner: 'David', task: 'Benchmarking PostgreSQL cluster', completed: false },
        { id: 'a2', owner: 'Sarah', task: 'Configure Redis connection pool', completed: true },
      ],
      transcript: {
        text: 'Let us migrate to postgresql as agreed.',
        chunks: [{ timestamp: [0, 5], text: 'Let us migrate to postgresql as agreed.', speaker: 'David' }],
      },
      followUpDraft: 'Summary of Postgres and Redis decisions.',
    },
    {
      id: 'm2',
      title: '1:1 Growth & Career Roadmap',
      createdAt: 1700100000000,
      durationSeconds: 90,
      participants: ['Elena', 'Alex'],
      template: 'one_on_one',
      summary: {
        overview: 'Reviewed Elena quarterly performance and leadership goals.',
        keyPoints: ['Elena demonstrated great ownership on the security audit'],
        decisions: ['Promote Elena to Senior Security Engineer'],
      },
      actionItems: [
        { id: 'a3', owner: 'Alex', task: 'Submit promotion paperwork for Elena', completed: false },
      ],
      transcript: {
        text: 'Congratulations on leading the security audit.',
        chunks: [{ timestamp: [0, 5], text: 'Congratulations on leading the security audit.', speaker: 'Alex' }],
      },
      followUpDraft: 'Elena promotion submitted.',
    },
  ];

  it('accurately finds and synthesizes results for database queries', () => {
    const res = queryGhostVault('PostgreSQL Redis database', sampleMeetings);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0].meetingTitle).toBe('Database & Infrastructure Sync');
    expect(res.answer).toContain('Database & Infrastructure Sync');
    expect(res.relatedActionItems.length).toBeGreaterThan(0);
    expect(res.relatedActionItems[0].owner).toBe('David');
  });

  it('accurately finds career/promotion decisions', () => {
    const res = queryGhostVault('Elena promotion security', sampleMeetings);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0].meetingTitle).toBe('1:1 Growth & Career Roadmap');
    expect(res.answer).toContain('Elena');
  });

  it('handles unmatched queries gracefully without error', () => {
    const res = queryGhostVault('cryptocurrency bitcoin mining', sampleMeetings);
    expect(res.citations.length).toBe(0);
    expect(res.answer).toContain('could not find specific mentions');
  });
});
