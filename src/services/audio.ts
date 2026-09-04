export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private audioChunks: Blob[] = [];

  async start(): Promise<void> {
    this.audioChunks = [];
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Smart noise suppression filter chain (80Hz Highpass + 7.5kHz Lowpass)
    this.highpassFilter = this.audioContext.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 80;

    this.lowpassFilter = this.audioContext.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 7500;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.sourceNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.analyser);

    // Setup MediaRecorder
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser choose default
      }
    }

    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.mediaStream, { mimeType })
      : new MediaRecorder(this.mediaStream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Collect in 250ms chunks
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  getLiveAudioBlob(): Blob | null {
    if (this.audioChunks.length === 0) return null;
    return new Blob(this.audioChunks, {
      type: this.mediaRecorder?.mimeType || 'audio/webm',
    });
  }

  getWaveformData(dataArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray as any);
    } else {
      dataArray.fill(0);
    }
  }

  /**
   * Calculates real-time Root Mean Square (RMS) energy level (0.0 to 1.0)
   */
  getRMSLevel(): number {
    if (!this.analyser) return 0;
    const buffer = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(buffer as any);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const normalized = (buffer[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Voice Activity Detection (VAD) heuristic: returns true when human speech energy is detected
   */
  isSpeaking(threshold: number = 0.035): boolean {
    return this.getRMSLevel() > threshold;
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([], { type: 'audio/webm' }));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });

        // Secure buffer cleanup
        this.mediaStream?.getTracks().forEach((track) => track.stop());
        this.sourceNode?.disconnect();
        this.highpassFilter?.disconnect();
        this.lowpassFilter?.disconnect();
        this.analyser?.disconnect();
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }

        this.mediaStream = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.highpassFilter = null;
        this.lowpassFilter = null;
        this.audioChunks = [];

        resolve(audioBlob);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  stopSynchronously(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch {}
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
    }
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.audioChunks = [];
  }
}

/**
 * Resamples any standard browser audio blob into a 16kHz mono Float32Array
 * compatible with Whisper models, with automatic buffer memory zeroing.
 */
export async function resampleAudioBlobTo16kHz(audioBlob: Blob): Promise<Float32Array> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const offlineContext = new AudioContextClass();
  
  const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
  await offlineContext.close();

  const targetSampleRate = 16000;
  const sourceSampleRate = audioBuffer.sampleRate;
  
  // Extract mono channel data
  let monoData: Float32Array;
  if (audioBuffer.numberOfChannels === 1) {
    monoData = audioBuffer.getChannelData(0);
  } else {
    // Average stereo channels to mono
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    monoData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      monoData[i] = (left[i] + right[i]) / 2;
    }
  }

  if (sourceSampleRate === targetSampleRate) {
    return monoData;
  }

  // Linear interpolation resampling to 16kHz
  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(monoData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originPos = i * ratio;
    const originIndex = Math.floor(originPos);
    const decimal = originPos - originIndex;
    const nextIndex = Math.min(originIndex + 1, monoData.length - 1);
    result[i] = monoData[originIndex] * (1 - decimal) + monoData[nextIndex] * decimal;
  }

  return result;
}
