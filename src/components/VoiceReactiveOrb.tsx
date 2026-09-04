import React, { useEffect, useRef } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

interface VoiceReactiveOrbProps {
  getWaveformData: (dataArray: Uint8Array) => void;
  isRecording: boolean;
  isPaused: boolean;
  size?: number;
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;
void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv * 2.0 - 1.0) * uResolution.xy / mr;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const VoiceReactiveOrb: React.FC<VoiceReactiveOrbProps> = ({
  getWaveformData,
  isRecording,
  isPaused,
  size = 220,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(128));
  const smoothLevelRef = useRef<number>(0);
  const orbScaleRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const { gl } = renderer;
    rendererRef.current = renderer;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0.12, 0.12, 0.15) }, // Elegant monochromatic / zinc shade
        uResolution: {
          value: new Color(size, size, 1),
        },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uAmplitude: { value: 0.2 },
        uSpeed: { value: 0.8 },
      },
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    renderer.setSize(size, size);
    gl.clearColor(0, 0, 0, 0);

    // Append canvas
    containerRef.current.innerHTML = '';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.borderRadius = '50%';
    containerRef.current.appendChild(gl.canvas);

    let animationFrameId: number;
    let startTime = performance.now();

    const renderLoop = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Audio analysis
      let normLevel = 0;
      if (isRecording && !isPaused) {
        getWaveformData(audioDataRef.current);
        let sum = 0;
        const len = audioDataRef.current.length;
        for (let i = 0; i < len; i++) {
          sum += audioDataRef.current[i];
        }
        const avg = sum / len;
        // Normalize 0..1 with noise gate
        normLevel = Math.min(1, Math.max(0, (avg - 12) / 85));
      }

      // Smooth volume transitions
      smoothLevelRef.current += (normLevel - smoothLevelRef.current) * 0.18;
      const level = smoothLevelRef.current;

      // Dynamic reactive parameters
      const amplitude = 0.2 + level * 1.8;
      const speed = 0.6 + level * 1.5;
      const scale = 1 + level * 0.22;
      const glowOpacity = 0.15 + level * 0.65;

      if (programRef.current) {
        programRef.current.uniforms.uTime.value = elapsed;
        programRef.current.uniforms.uAmplitude.value = amplitude;
        programRef.current.uniforms.uSpeed.value = speed;
        // Invert luminance slightly on voice peaks for rich fluid dynamics
        const baseColor = 0.1 + level * 0.4;
        (programRef.current.uniforms.uColor.value as Color).set(baseColor, baseColor, baseColor + 0.05);
      }

      renderer.render({ scene: mesh });

      // Apply dynamic transform & glow
      if (orbScaleRef.current) {
        orbScaleRef.current.style.transform = `scale(${scale})`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = `${glowOpacity}`;
        glowRef.current.style.transform = `scale(${1 + level * 0.4})`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {}
    };
  }, [getWaveformData, isRecording, isPaused, size]);

  return (
    <div className="relative flex items-center justify-center my-4 select-none">
      {/* Dynamic Ambient Voice Glow */}
      <div
        ref={glowRef}
        className="absolute rounded-full bg-zinc-400 blur-3xl pointer-events-none transition-all duration-75"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          opacity: 0.15,
        }}
      />

      {/* Voice Reactive Spherical Container */}
      <div
        ref={orbScaleRef}
        className="relative rounded-full overflow-hidden border border-zinc-200 shadow-2xl transition-transform duration-100 ease-out"
        style={{
          width: size,
          height: size,
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.25), inset 0 0 20px rgba(255,255,255,0.2)',
        }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
