import { ParallaxComponent } from '@/components/ui/parallax-scrolling';

export default function ParallaxDemo() {
  return (
    <div className="w-full min-h-screen bg-[#050505]">
      <ParallaxComponent />
      <div className="py-8 text-center text-xs text-zinc-500 border-t border-white/10">
        <p>Resource powered by Lenis Smooth Scrolling & GSAP ScrollTrigger</p>
      </div>
    </div>
  );
}
