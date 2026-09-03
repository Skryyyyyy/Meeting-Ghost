import React, { useEffect, useRef } from 'react';

interface LiveWaveformProps {
  getWaveformData: (dataArray: Uint8Array) => void;
  isRecording: boolean;
  isPaused: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  getWaveformData,
  isRecording,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      if (isRecording && !isPaused) {
        getWaveformData(dataArray);
      } else {
        // Idle subtle animation
        dataArray.fill(6);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * height * 0.85);

        // Monochromatic grayscale gradient for bars
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        if (isPaused) {
          gradient.addColorStop(0, '#a1a1aa');
          gradient.addColorStop(1, '#71717a');
        } else {
          gradient.addColorStop(0, '#18181b');
          gradient.addColorStop(0.5, '#27272a');
          gradient.addColorStop(1, '#52525b');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, (height - barHeight) / 2, barWidth - 2, barHeight, 4);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getWaveformData, isRecording, isPaused]);

  return (
    <div className="w-full h-36 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        className="w-full h-full max-w-lg"
      />
    </div>
  );
};
