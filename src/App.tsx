import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { RecordingView } from './views/RecordingView';
import { SummaryView } from './views/SummaryView';
import { ProcessingModal } from './components/ProcessingModal';
import { SettingsModal } from './components/SettingsModal';
import { MeetingData, MeetingTemplate, ProcessingStage } from './types/meeting';
import { AudioRecorder, resampleAudioBlobTo16kHz } from './services/audio';
import { transcribeAudio, summarizeTranscript } from './services/aiPipeline';
import {
  getMeetings,
  saveMeeting,
  deleteMeeting as deleteMeetingFromDB,
  updateMeeting as updateMeetingInDB,
} from './services/storage';
import { SAMPLE_MEETINGS } from './services/mockMeetings';

export function App() {
  const [view, setView] = useState<'home' | 'recording' | 'summary'>('home');
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<MeetingData | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [processingStatus, setProcessingStatus] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate>('general');
  const [livePartialTranscript, setLivePartialTranscript] = useState<string>('');

  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check WebGPU availability
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
      setHasWebGPU(true);
    }

    // Load initial meetings from IndexedDB
    async function loadData() {
      try {
        const stored = await getMeetings();
        if (stored && stored.length > 0) {
          setMeetings(stored);
        } else {
          // Pre-populate with sample meetings for instant demo
          for (const sample of SAMPLE_MEETINGS) {
            await saveMeeting(sample);
          }
          setMeetings(SAMPLE_MEETINGS);
        }
      } catch (err) {
        console.warn('Could not initialize IndexedDB, using in-memory samples:', err);
        setMeetings(SAMPLE_MEETINGS);
      }
    }

    loadData();

    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      await recorderRef.current.start();
      setIsPaused(false);
      setLivePartialTranscript('');
      setView('recording');

      // Start periodic streaming partial transcription every 6 seconds
      streamingIntervalRef.current = setInterval(async () => {
        if (!isPaused && recorderRef.current) {
          try {
            const liveBlob = recorderRef.current.getLiveAudioBlob();
            if (liveBlob && liveBlob.size > 20000) {
              const pcm = await resampleAudioBlobTo16kHz(liveBlob);
              if (pcm.length > 16000) {
                // Quick transcription of recent audio
                const result = await transcribeAudio(pcm);
                if (result.text) {
                  setLivePartialTranscript(result.text);
                }
              }
            }
          } catch (e) {
            // Ignore background streaming hiccups
          }
        }
      }, 6000);
    } catch (err) {
      console.error('Mic access error:', err);
      alert('Microphone access is required to record audio. Please grant permission in your browser.');
    }
  };

  const handlePauseRecording = () => {
    recorderRef.current.pause();
    setIsPaused(true);
  };

  const handleResumeRecording = () => {
    recorderRef.current.resume();
    setIsPaused(false);
  };

  const handleCancelRecording = async () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    await recorderRef.current.stop();
    setIsPaused(false);
    setLivePartialTranscript('');
    setView('home');
  };

  const handleStopAndProcess = async () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsPaused(false);
    setProcessingStage('audio_prep');
    setProcessingStatus('Finalizing audio recording buffer...');

    try {
      const audioBlob = await recorderRef.current.stop();
      await processAudioBlob(audioBlob, 'Meeting on ' + new Date().toLocaleDateString(), selectedTemplate);
    } catch (err) {
      console.error('Processing error:', err);
      alert('An error occurred during on-device processing: ' + err);
      setProcessingStage('idle');
      setView('home');
    }
  };

  const handleUploadAudioFile = async (file: File) => {
    setProcessingStage('audio_prep');
    setProcessingStatus(`Loading uploaded file "${file.name}"...`);
    try {
      await processAudioBlob(file, file.name.replace(/\.[^/.]+$/, ''), selectedTemplate);
    } catch (err) {
      console.error('File processing error:', err);
      alert('Failed to process uploaded audio file: ' + err);
      setProcessingStage('idle');
    }
  };

  const processAudioBlob = async (blob: Blob, defaultTitle: string, template: MeetingTemplate = 'general') => {
    setProcessingStage('audio_prep');
    setProcessingStatus('Resampling audio to 16kHz mono Float32 tensor on-device...');
    const floatArray = await resampleAudioBlobTo16kHz(blob);

    const durationSeconds = Math.round(floatArray.length / 16000);

    // Transcription step
    setProcessingStage('transcribing');
    setProcessingStatus('Running on-device Whisper model inference...');
    const transcriptResult = await transcribeAudio(floatArray, (msg) => {
      setProcessingStatus(msg);
    });

    // LLM Summarization step with template customization
    setProcessingStage('summarizing');
    setProcessingStatus(`Extracting decisions & commitments with ${template.replace(/_/g, ' ')} template...`);
    const summaryResult = await summarizeTranscript(transcriptResult.text, template, (msg) => {
      setProcessingStatus(msg);
    });

    setProcessingStage('drafting');
    setProcessingStatus('Finalizing meeting record & follow-up draft...');

    const newMeeting: MeetingData = {
      id: `meet-${Date.now()}`,
      title: summaryResult.title || defaultTitle,
      template,
      createdAt: Date.now(),
      durationSeconds: durationSeconds || 60,
      audioBlob: blob,
      transcript: transcriptResult,
      summary: {
        overview: summaryResult.overview,
        keyPoints: summaryResult.keyPoints,
        decisions: summaryResult.decisions,
      },
      actionItems: summaryResult.actionItems,
      followUpDraft: summaryResult.followUpDraft,
      participants: summaryResult.participants,
    };

    await saveMeeting(newMeeting);
    setMeetings((prev) => [newMeeting, ...prev]);
    setActiveMeeting(newMeeting);
    setProcessingStage('complete');

    setTimeout(() => {
      setProcessingStage('idle');
      setView('summary');
    }, 600);
  };

  const handleSelectMeeting = (meeting: MeetingData) => {
    setActiveMeeting(meeting);
    setView('summary');
  };

  const handleDeleteMeeting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this meeting and all its transcript/summary data permanently from device?')) {
      await deleteMeetingFromDB(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      if (activeMeeting?.id === id) {
        setActiveMeeting(null);
        setView('home');
      }
    }
  };

  const handleUpdateMeeting = async (updated: MeetingData) => {
    setActiveMeeting(updated);
    setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    await updateMeetingInDB(updated);
  };

  const handleClearAllData = async () => {
    for (const m of meetings) {
      await deleteMeetingFromDB(m.id);
    }
    setMeetings([]);
    setActiveMeeting(null);
    setView('home');
  };

  const handleLoadSample = (sample: MeetingData) => {
    setActiveMeeting(sample);
    setView('summary');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewRecording={handleStartRecording}
        hasWebGPU={hasWebGPU}
      />

      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            meetings={meetings}
            onStartRecording={handleStartRecording}
            onSelectMeeting={handleSelectMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onLoadSample={handleLoadSample}
            onUploadAudioFile={handleUploadAudioFile}
          />
        )}

        {view === 'recording' && (
          <RecordingView
            onStopAndProcess={handleStopAndProcess}
            onCancel={handleCancelRecording}
            onPause={handlePauseRecording}
            onResume={handleResumeRecording}
            isPaused={isPaused}
            getWaveformData={(arr) => recorderRef.current.getWaveformData(arr)}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            livePartialTranscript={livePartialTranscript}
          />
        )}

        {view === 'summary' && activeMeeting && (
          <SummaryView
            meeting={activeMeeting}
            onBack={() => setView('home')}
            onUpdateMeeting={handleUpdateMeeting}
          />
        )}
      </main>

      {/* Processing Modal Overlay */}
      {processingStage !== 'idle' && (
        <ProcessingModal stage={processingStage} statusMessage={processingStatus} />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearAllData={handleClearAllData}
        hasWebGPU={hasWebGPU}
      />
    </div>
  );
}
