import { pipeline, env } from '@huggingface/transformers';
import { parseLLMMeetingOutput, ParsedLLMResponse } from './jsonParser';
import { MeetingTemplate } from '../types/meeting';

// Configure transformers.js for in-browser on-device inference
env.allowLocalModels = false;
if (env.backends?.onnx) {
  // Prefer WebGPU if available, fallback gracefully
  (env.backends.onnx as any).wasm = {
    proxy: false,
    numThreads: 2
  };
}

let transcriberInstance: any = null;

export async function getTranscriber(onProgress?: (msg: string, progress?: number) => void): Promise<any> {
  if (transcriberInstance) return transcriberInstance;

  onProgress?.('Loading on-device Whisper model...', 10);
  try {
    const hasGPU = typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu;
    transcriberInstance = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny.en', {
      device: hasGPU ? 'webgpu' : 'wasm',
      progress_callback: (p: any) => {
        if (p.status === 'progress' && typeof p.progress === 'number') {
          onProgress?.(`Downloading Whisper model: ${Math.round(p.progress)}%`, p.progress);
        } else if (p.status === 'ready') {
          onProgress?.('Whisper model ready.', 100);
        }
      },
    });
    return transcriberInstance;
  } catch (err) {
    console.warn('WebGPU Whisper load failed, attempting WASM fallback...', err);
    transcriberInstance = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny.en', {
      device: 'wasm',
      progress_callback: (p: any) => {
        if (p.status === 'progress' && typeof p.progress === 'number') {
          onProgress?.(`Downloading Whisper model (WASM): ${Math.round(p.progress)}%`, p.progress);
        }
      },
    });
    return transcriberInstance;
  }
}

export async function transcribeAudio(
  audioData: Float32Array,
  onProgress?: (msg: string, progress?: number) => void
): Promise<{ text: string; chunks: Array<{ timestamp: [number, number]; text: string }> }> {
  // If audio is practically silent or empty, return default placeholder
  if (audioData.length < 1600) {
    return {
      text: 'No speech detected in the audio recording.',
      chunks: [{ timestamp: [0, 1], text: 'No speech detected.' }],
    };
  }

  const transcriber = await getTranscriber(onProgress);
  onProgress?.('Transcribing speech on-device...', 60);

  const output = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
  });

  const text = typeof output.text === 'string' ? output.text.trim() : '';
  const chunks = Array.isArray(output.chunks)
    ? output.chunks.map((c: any) => ({
        timestamp: c.timestamp as [number, number],
        text: c.text,
      }))
    : [{ timestamp: [0, Math.round(audioData.length / 16000)] as [number, number], text }];

  onProgress?.('Transcription complete.', 100);
  return { text, chunks };
}

/**
 * Summarizes the transcript using on-device extraction rules and prompt logic, tailored by template
 */
export async function summarizeTranscript(
  transcriptText: string,
  template: MeetingTemplate = 'general',
  onProgress?: (msg: string) => void
): Promise<ParsedLLMResponse> {
  onProgress?.(`Analyzing transcript with template: ${template}...`);

  const templateInstructions: Record<MeetingTemplate, string> = {
    general: 'Extract overview, key discussion points, decisions, action items with owner and due date, and follow-up draft.',
    one_on_one: 'Focus on personal growth, feedback given, career goals, blockers discussed, and agreed 1:1 next steps.',
    tech_architecture: 'Focus on architectural decisions, trade-offs, tech debt items, SLA/performance targets, and technical action items.',
    sales_call: 'Focus on client pain points, budget/timeline signals, decision maker needs, pricing discussed, and deal next steps.',
    incident_postmortem: 'Focus on root cause analysis, outage timeline, mitigation steps taken, and preventative action items with owners.'
  };

  const instruction = templateInstructions[template] || templateInstructions.general;

  // Strict structured prompt template with XML delimiters to protect against prompt injection
  const prompt = `You are Meeting Ghost, a confidential meeting assistant.
Template Goal: ${instruction}

Analyze the enclosed meeting transcript and return a structured JSON object:
- "title": A concise meeting title (max 6 words).
- "overview": A clear 2-3 sentence executive summary.
- "key_points": Array of 3-5 key discussion bullets.
- "decisions": Array of clear decisions agreed upon.
- "action_items": Array of objects {"owner": "Name", "task": "Description", "due": "Optional Deadline"}.
- "follow_up_draft": A polite, professional email recap ready to send.
- "participants": Array of distinct participant names detected.

<transcript>
${transcriptText}
</transcript>

Output valid JSON only:`;

  try {
    const response = await runOnDeviceLLM(prompt, onProgress);
    return parseLLMMeetingOutput(response, getTemplateFallbackTitle(template));
  } catch (err) {
    console.warn('On-device LLM step encountered an error, using intelligent parser fallback:', err);
    return generateSmartSummaryFallback(transcriptText, template);
  }
}

function getTemplateFallbackTitle(template: MeetingTemplate): string {
  switch (template) {
    case 'one_on_one': return '1:1 Sync & Growth Check';
    case 'tech_architecture': return 'Architecture & Tech Review';
    case 'sales_call': return 'Client Discovery Call';
    case 'incident_postmortem': return 'Incident Postmortem Review';
    default: return 'Meeting Summary & Follow-up';
  }
}

async function runOnDeviceLLM(prompt: string, onProgress?: (msg: string) => void): Promise<string> {
  try {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
    onProgress?.('Initializing on-device LLM...');
    
    const hasGPU = typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu;
    if (hasGPU) {
      const engine = await CreateMLCEngine('SmolLM2-1.7B-Instruct-q4f16_1-MLC', {
        initProgressCallback: (report) => {
          onProgress?.(`Loading LLM: ${report.text}`);
        }
      });
      
      const reply = await engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return reply.choices[0].message.content || '';
    }
  } catch (e) {
    console.info('Direct WebLLM execution bypassed or unavailable, using heuristic extractor:', e);
  }

  throw new Error('Fallback to heuristic extractor');
}

/**
 * Intelligent client-side heuristic parser that extracts sentences, commitments,
 * questions, and names directly from transcript text without needing external network.
 */
function generateSmartSummaryFallback(transcript: string, template: MeetingTemplate = 'general'): ParsedLLMResponse {
  const sentences = transcript
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) {
    return {
      title: getTemplateFallbackTitle(template),
      overview: 'Brief audio note captured.',
      keyPoints: ['No specific topics highlighted.'],
      decisions: [],
      actionItems: [],
      followUpDraft: 'Hi,\n\nHere is the recording recap.\n\nBest,\nGhost',
      participants: []
    };
  }

  const actionItems: any[] = [];
  const decisions: string[] = [];
  const keyPoints: string[] = [];
  const detectedNames = new Set<string>();

  const nameRegex = /\b([A-Z][a-z]+)\b/g;
  const actionKeywords = /\b(will|please|action|todo|finalize|draft|send|review|prepare|schedule|test|fix|build|deploy)\b/i;
  const decisionKeywords = /\b(agreed|decided|selected|chosen|approved|consensus|let's make|resolved)\b/i;

  sentences.forEach((sentence, idx) => {
    if (decisionKeywords.test(sentence)) {
      decisions.push(sentence);
    }

    if (actionKeywords.test(sentence)) {
      const names = sentence.match(nameRegex) || [];
      const owner = names.find(n => !['I', 'We', 'The', 'Thanks', 'Let', 'Today', 'Sure', 'For'].includes(n)) || 'Team';
      if (owner !== 'Team') detectedNames.add(owner);

      const dueMatch = sentence.match(/\b(by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|eod|5pm|next\s+week))\b/i);
      const due = dueMatch ? dueMatch[1] : undefined;

      actionItems.push({
        id: `act-${Date.now()}-${idx}`,
        owner,
        task: sentence.replace(/^[A-Z][a-z]+,?\s+/, ''),
        due,
        completed: false
      });
    }

    if (idx < 4 && sentence.length > 20) {
      keyPoints.push(sentence);
    }
  });

  const baseTitle = sentences[0].length < 50 ? sentences[0].replace(/[.?!]$/, '') : getTemplateFallbackTitle(template);
  const overview = sentences.slice(0, 3).join(' ');

  let draft = `Hi Team,\n\nHere is a summary of our discussion:\n\n${overview}\n\n`;
  if (decisions.length > 0) {
    draft += `Key Decisions:\n` + decisions.map(d => `• ${d}`).join('\n') + '\n\n';
  }
  if (actionItems.length > 0) {
    draft += `Action Items:\n` + actionItems.map(a => `• ${a.owner}: ${a.task}${a.due ? ` (${a.due})` : ''}`).join('\n') + '\n\n';
  }
  draft += `All processing was completed 100% on-device.\n\nBest regards,\nGhost Notes`;

  return {
    title: baseTitle,
    overview,
    keyPoints: keyPoints.length > 0 ? keyPoints : [overview],
    decisions,
    actionItems: actionItems.slice(0, 6),
    followUpDraft: draft,
    participants: Array.from(detectedNames)
  };
}
