import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { HomeView } from './views/HomeView';
import { RecordingView } from './views/RecordingView';
import { SummaryView } from './views/SummaryView';
import { NotFoundView } from './views/NotFoundView';
import { ProcessingModal } from './components/ProcessingModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { GlobalTasksModal } from './components/GlobalTasksModal';
import { CommandPalette } from './components/CommandPalette';
import { ProfileModal } from './components/ProfileModal';
import { InactivityLock } from './components/InactivityLock';
import { CookieBanner } from './components/CookieBanner';
import { MeetingData, MeetingTemplate, ProcessingStage, TranscriptionLanguage, MeetingBookmark } from './types/meeting';
import { AudioRecorder, resampleAudioBlobTo16kHz } from './services/audio';
import { transcribeAudio, summarizeTranscript } from './services/aiPipeline';
import { auth, onAuthStateChanged } from './services/firebase';
import {
  isVaultSetup,
  isVaultUnlocked,
  lockVault,
  getVaultUsername,
  verifyVaultPin,
  getCurrentUser,
} from './services/auth';
import {
  getMeetings,
  saveMeeting,
  deleteMeeting as deleteMeetingFromDB,
  updateMeeting as updateMeetingInDB,
  updateActionItemStatus as updateActionStatusInDB,
} from './services/storage';
import { SAMPLE_MEETINGS } from './services/mockMeetings';

export function App() {
  const [page, setPage] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'home' | 'recording' | 'summary'>('home');
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<MeetingData | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [processingStatus, setProcessingStatus] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlobalTasksOpen, setIsGlobalTasksOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<TranscriptionLanguage>('en');
  const [livePartialTranscript, setLivePartialTranscript] = useState<string>('');

  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingTranscribingRef = useRef<boolean>(false);

  // Inactivity auto-lock timer (5 minutes idle)
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (page === 'app') {
        setIsLocked(true);
      }
    }, 5 * 60 * 1000);
  };

  const loadStoredMeetings = async () => {
    try {
      const stored = await getMeetings();
      if (stored && stored.length > 0) {
        setMeetings(stored);
      } else {
        for (const sample of SAMPLE_MEETINGS) {
          await saveMeeting(sample);
        }
        setMeetings(SAMPLE_MEETINGS);
      }
    } catch (err) {
      console.warn('Could not load encrypted meetings, using fallback sample:', err);
      setMeetings(SAMPLE_MEETINGS);
    }
  };

  useEffect(() => {
    // Check WebGPU availability
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
      setHasWebGPU(true);
    }

    // Set up activity listeners & Cmd+K hotkey
    const handleActivity = () => resetInactivityTimer();
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      resetInactivityTimer();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleGlobalKeyDown);
    resetInactivityTimer();

    // Clean up media tracks on tab unload/close synchronously
    const handleUnload = () => {
      recorderRef.current.stopSynchronously();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Sync Firebase session revocation to vault lifecycle (only for cloud-synced accounts)
    let unsubscribeAuth: (() => void) | null = null;
    if (auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        const currentUser = getCurrentUser();
        if (
          !user &&
          page === 'app' &&
          currentUser &&
          (currentUser.authProvider === 'google' || currentUser.authProvider === 'email')
        ) {
          // If remote Firebase session was revoked for cloud account, secure the session
          handleLockVault();
        }
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      if (unsubscribeAuth) unsubscribeAuth();
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, [page]);

  const handleLaunchApp = async () => {
    if (isVaultUnlocked()) {
      await loadStoredMeetings();
      setPage('app');
      setView('home');
    } else {
      setAuthMode(isVaultSetup() ? 'login' : 'signup');
      setPage('auth');
    }
  };

  const handleAuthenticated = async () => {
    await loadStoredMeetings();
    setPage('app');
    setView('home');
    setIsLocked(false);
  };

  const handleLockVault = () => {
    lockVault();
    setMeetings([]);
    setActiveMeeting(null);
    setIsLocked(false);
    setPage('landing');
  };

  const handleStartRecording = async () => {
    try {
      await recorderRef.current.start();
      setIsPaused(false);
      setLivePartialTranscript('');
      setView('recording');

      // Periodic streaming partial transcription with concurrency mutex
      streamingIntervalRef.current = setInterval(async () => {
        if (!isPaused && recorderRef.current && !isStreamingTranscribingRef.current) {
          try {
            isStreamingTranscribingRef.current = true;
            const liveBlob = recorderRef.current.getLiveAudioBlob();
            if (liveBlob && liveBlob.size > 20000) {
              const pcm = await resampleAudioBlobTo16kHz(liveBlob);
              if (pcm.length > 16000) {
                const result = await transcribeAudio(pcm);
                if (result.text) {
                  setLivePartialTranscript(result.text);
                }
              }
            }
          } catch (e) {
            // Background preview ignore
          } finally {
            isStreamingTranscribingRef.current = false;
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

  const handleStopAndProcess = async (bookmarks?: MeetingBookmark[]) => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsPaused(false);
    setProcessingStage('audio_prep');
    setProcessingStatus('Finalizing audio recording buffer...');

    try {
      const audioBlob = await recorderRef.current.stop();
      await processAudioBlob(
        audioBlob,
        'Meeting on ' + new Date().toLocaleDateString(),
        selectedTemplate,
        selectedLanguage,
        bookmarks
      );
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
      await processAudioBlob(file, file.name.replace(/\.[^/.]+$/, ''), selectedTemplate, selectedLanguage);
    } catch (err) {
      console.error('File processing error:', err);
      alert('Failed to process uploaded audio file: ' + err);
      setProcessingStage('idle');
    }
  };

  const processAudioBlob = async (
    blob: Blob,
    defaultTitle: string,
    template: MeetingTemplate = 'general',
    language: TranscriptionLanguage = 'en',
    bookmarks?: MeetingBookmark[]
  ) => {
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
      language,
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
      bookmarks: bookmarks && bookmarks.length > 0 ? bookmarks : undefined,
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

  const handleToggleGlobalAction = async (meetingId: string, actionId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const updatedItems = m.actionItems.map((a) =>
          a.id === actionId ? { ...a, completed: !a.completed } : a
        );
        const itemCompleted = updatedItems.find((a) => a.id === actionId)?.completed ?? false;
        updateActionStatusInDB(meetingId, actionId, itemCompleted);
        return { ...m, actionItems: updatedItems };
      })
    );
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

  const handleUnlockPin = (enteredPin?: string): boolean => {
    if (!enteredPin) return false;
    verifyVaultPin(enteredPin).then((res) => {
      if (res.success) {
        setIsLocked(false);
        resetInactivityTimer();
      }
    });
    return enteredPin.length >= 4;
  };

  // 1. Landing Page View
  if (page === 'landing') {
    return (
      <>
        <LandingView
          onLaunchApp={handleLaunchApp}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setPage('auth');
          }}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          isVaultConfigured={isVaultSetup()}
        />
        <CookieBanner onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />
        <PrivacySettingsModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onClearAllData={handleClearAllData}
        />
      </>
    );
  }

  // 2. Auth / Vault PIN View
  if (page === 'auth') {
    return (
      <>
        <AuthView
          initialMode={authMode}
          onAuthenticated={handleAuthenticated}
          onCancel={() => setPage('landing')}
        />
        <CookieBanner onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />
      </>
    );
  }

  // 3. Main Dashboard App View
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onNewRecording={handleStartRecording}
        onOpenGlobalTasks={() => setIsGlobalTasksOpen(true)}
        onLockScreen={handleLockVault}
        onNavigateLanding={() => setPage('landing')}
        userName={getVaultUsername()}
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
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
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

        {view === 'summary' && !activeMeeting && (
          <NotFoundView onNavigateHome={() => setView('home')} />
        )}
      </main>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        meetings={meetings}
        onSelectMeeting={handleSelectMeeting}
        onStartRecording={handleStartRecording}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenGlobalTasks={() => setIsGlobalTasksOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Global Commitments Rollup Modal */}
      <GlobalTasksModal
        isOpen={isGlobalTasksOpen}
        onClose={() => setIsGlobalTasksOpen(false)}
        meetings={meetings}
        onToggleAction={handleToggleGlobalAction}
      />

      {/* Inactivity Privacy Lock */}
      <InactivityLock
        isLocked={isLocked}
        onUnlock={handleUnlockPin}
      />

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

      {/* Privacy & Vault Center Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={handleClearAllData}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />
    </div>
  );
}
