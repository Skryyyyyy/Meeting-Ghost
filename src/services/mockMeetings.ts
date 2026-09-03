import { MeetingData } from '../types/meeting';

export const SAMPLE_MEETINGS: MeetingData[] = [
  {
    id: 'sample-1',
    title: 'Q3 Product Architecture & On-Device AI Review',
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    durationSeconds: 245,
    transcript: {
      text: "Thanks everyone for joining. Today we are finalizing our on-device AI roadmap for Q3. Priya, can you summarize our latency benchmarks? Sure, whisper.cpp on Snapdragon 8 Gen 3 processes 5 minutes of speech in roughly 14 seconds. That's well within our 30-second target. For the LLM, we evaluated Gemma 2B and Phi-3-mini. Gemma 2B quantized to 4-bit consumes around 1.3GB RAM and achieves 18 tokens per second. That gives us instant structured summary extraction. Great. Let's make Gemma 2B our default model. Rahul, please draft the benchmark report by Thursday so we can share it with the hardware team. Also, Priya will finalize the NDK bindings by Friday. Let's make sure we test in airplane mode to guarantee zero network leakage. Agreed, meeting adjourned.",
      chunks: [
        { timestamp: [0, 8], text: "Thanks everyone for joining. Today we are finalizing our on-device AI roadmap for Q3." },
        { timestamp: [8, 19], text: "Priya, can you summarize our latency benchmarks? Sure, whisper.cpp on Snapdragon 8 Gen 3 processes 5 minutes of speech in roughly 14 seconds." },
        { timestamp: [19, 32], text: "That's well within our 30-second target. For the LLM, we evaluated Gemma 2B and Phi-3-mini." },
        { timestamp: [32, 45], text: "Gemma 2B quantized to 4-bit consumes around 1.3GB RAM and achieves 18 tokens per second. That gives us instant structured summary extraction." },
        { timestamp: [45, 58], text: "Great. Let's make Gemma 2B our default model. Rahul, please draft the benchmark report by Thursday." },
        { timestamp: [58, 70], text: "Priya will finalize the NDK bindings by Friday. Let's make sure we test in airplane mode to guarantee zero network leakage." },
        { timestamp: [70, 75], text: "Agreed, meeting adjourned." }
      ]
    },
    summary: {
      overview: 'The team reviewed on-device ASR and LLM latency benchmarks, selecting Gemma 2B int4 as the default summarizer due to its 18 tok/s speed and 1.3GB memory footprint on mobile.',
      keyPoints: [
        'Whisper.cpp transcribes 5 minutes of audio in 14 seconds on Snapdragon 8 Gen 3.',
        'Gemma 2B int4 delivers 18 tokens/sec with reliable structured JSON extraction.',
        'Zero network leakage confirmed; offline airplane mode testing is mandatory.'
      ],
      decisions: [
        'Selected Gemma 2B 4-bit quantized as the primary on-device LLM.',
        'Target processing time capped at under 30 seconds for 5-minute meetings.'
      ]
    },
    actionItems: [
      {
        id: 'act-s1-1',
        owner: 'Rahul',
        task: 'Draft the benchmark report and share with the hardware team',
        due: 'Thursday',
        completed: false
      },
      {
        id: 'act-s1-2',
        owner: 'Priya',
        task: 'Finalize native NDK bindings and verify airplane mode operation',
        due: 'Friday',
        completed: false
      }
    ],
    followUpDraft: `Hi Team,

Here is a quick recap of our Q3 On-Device AI architecture sync:

Key Decisions:
• Selected Gemma 2B (int4) as our default summarizer (18 tok/s, 1.3GB RAM).
• Verified Whisper.cpp ASR runtime latency is ~14s for 5 minutes of audio.

Action Items:
• Rahul: Draft benchmark report for hardware team (Due: Thursday)
• Priya: Finalize NDK bindings & airplane mode verification (Due: Friday)

All processing is verified 100% on-device.

Best regards,
Ghost Notes`,
    participants: ['Rahul', 'Priya']
  },
  {
    id: 'sample-2',
    title: 'Confidential HR & Team Compensation Alignment',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    durationSeconds: 180,
    transcript: {
      text: "This is a confidential HR alignment call. We need to review the retention packages for the core engineering leads before the board meeting next Tuesday. Marcus, have the revised bands been approved by finance? Yes, finance approved the 12% equity top-up band. Great. Marcus, please send the individual offer letters to legal for compliance check by Monday morning. I will prepare the board summary slide deck by Monday 3 PM. Let's keep all notes on this device.",
      chunks: [
        { timestamp: [0, 10], text: "This is a confidential HR alignment call. We need to review the retention packages for the core engineering leads." },
        { timestamp: [10, 22], text: "Marcus, have the revised bands been approved by finance? Yes, finance approved the 12% equity top-up band." },
        { timestamp: [22, 35], text: "Great. Marcus, please send the individual offer letters to legal for compliance check by Monday morning." },
        { timestamp: [35, 48], text: "I will prepare the board summary slide deck by Monday 3 PM. Let's keep all notes on this device." }
      ]
    },
    summary: {
      overview: 'Confidential compensation sync confirming finance approval for a 12% equity top-up band for core engineering leads ahead of the upcoming board meeting.',
      keyPoints: [
        'Finance approved the 12% equity top-up retention package.',
        'Strict confidentiality required — notes retained locally.'
      ],
      decisions: [
        'Proceed with sending offer letters for legal compliance review.'
      ]
    },
    actionItems: [
      {
        id: 'act-s2-1',
        owner: 'Marcus',
        task: 'Send individual offer letters to legal for compliance review',
        due: 'Monday morning',
        completed: true
      },
      {
        id: 'act-s2-2',
        owner: 'Lead',
        task: 'Prepare the board summary slide deck',
        due: 'Monday 3:00 PM',
        completed: false
      }
    ],
    followUpDraft: `Hi Marcus,

Summary of our confidential HR alignment:
• Finance has approved the 12% equity retention top-up band.

Next Steps:
• Marcus: Send offer letters to legal for compliance check by Monday morning.
• Lead: Prepare board summary slide deck by Monday 3 PM.

Notes strictly stored on-device.

Thanks,
HR Lead`,
    participants: ['Marcus', 'Lead']
  }
];
