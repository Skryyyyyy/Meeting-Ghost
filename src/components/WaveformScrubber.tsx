import React, { useRef, useState, useMemo } from 'react';

interface WaveformScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  barCount?: number;
}

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  barCount = 70,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // Generate deterministic wave pattern based on bar indices for smooth natural audio visual
  const waveHeights = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const sin1 = Math.sin(i * 0.25) * 0.35 + 0.5;
      const sin2 = Math.cos(i * 0.55) * 0.25;
      const sin3 = Math.sin(i * 0.12) * 0.2;
      return Math.max(0.18, Math.min(0.95, sin1 + sin2 + sin3));
    });
  }, [barCount]);

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full py-2 select-none group">
      {/* Tooltip on hover */}
      {hoverTime !== null && (
        <div
          className="absolute -top-7 -translate-x-1/2 bg-zinc-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none z-20 transition-transform"
          style={{ left: `${hoverX}px` }}
        >
          {formatSecs(hoverTime)}
        </div>
      )}

      {/* Waveform Bar Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-[2px] h-9 w-full cursor-pointer bg-zinc-100 rounded-xl px-2 py-1 border border-zinc-200 hover:border-zinc-300 transition-colors"
      >
        {waveHeights.map((h, i) => {
          const barProgress = i / barCount;
          const isPlayed = barProgress <= progress;

          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-75"
              style={{
                height: `${h * 100}%`,
                backgroundColor: isPlayed ? '#18181b' : '#d4d4d8',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
