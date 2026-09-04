// src/components/ui/parallax-scrolling.tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Mic, Lock, Zap } from 'lucide-react';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      const layers = [
        { layer: "1", yPercent: 60 },
        { layer: "2", yPercent: 45 },
        { layer: "3", yPercent: 25 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (triggerElement) {
        gsap.killTweensOf(triggerElement);
      }
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax w-full overflow-hidden bg-[#050505] text-white" ref={parallaxRef}>
      <section className="parallax__header relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="parallax__visuals absolute inset-0 w-full h-full">
          <div data-parallax-layers className="parallax__layers relative w-full h-full flex items-center justify-center">
            {/* Layer 1: Background Atmospheric Stars & Nebula */}
            <div
              data-parallax-layer="1"
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-screen scale-110"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80")',
              }}
            />

            {/* Layer 2: Cosmic Dust & Silhouettes */}
            <div
              data-parallax-layer="2"
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-50 scale-105"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80")',
              }}
            />

            {/* Layer 3: Title & Value Proposition */}
            <div data-parallax-layer="3" className="relative z-20 max-w-3xl mx-auto px-4 text-center space-y-4">
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Deep Focus. <br />
                <span className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                  Zero Distractions.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Experience seamless multi-layered transcription and commitment tracking engineered entirely for your browser.
              </p>
            </div>

            {/* Layer 4: Foreground Horizon Overlay */}
            <div
              data-parallax-layer="4"
              className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent z-10"
            />
          </div>
          <div className="parallax__fade absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Content Section following parallax */}
      <section className="parallax__content py-20 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Continuous Acoustic Capture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Resamples audio at 16kHz with an active 80Hz biquad highpass filter to strip room echo and ambient noise.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Encrypted IndexedDB Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every sentence and recording is encrypted with AES-GCM-256 before writing to on-device storage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automatic Action Item Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Extracts commitments, owners, and due dates automatically into calendar-ready formats.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ParallaxComponent;
