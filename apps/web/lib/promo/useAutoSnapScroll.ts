import { type RefObject, useEffect, useRef } from 'react';

type UseAutoSnapScrollOptions = {
  enabled?: boolean;
  /** How often to advance to the next snap item */
  intervalMs?: number;
  /** Pause auto-advance after user interaction */
  pauseAfterInteractionMs?: number;
  /** Additional pause on hover (desktop) */
  pauseOnHover?: boolean;
};

export function useAutoSnapScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    enabled = true,
    intervalMs = 3800,
    pauseAfterInteractionMs = 8000,
    pauseOnHover = true,
  }: UseAutoSnapScrollOptions = {}
) {
  const pauseUntilRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (reducedMotion) return;

    const pause = () => {
      pauseUntilRef.current = Date.now() + pauseAfterInteractionMs;
    };

    const onPointerDown = () => pause();
    const onTouchStart = () => pause();
    const onWheel = () => pause();
    const onMouseEnter = () => pause();
    const onMouseLeave = () => pause();

    el.addEventListener('pointerdown', onPointerDown, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });
    if (pauseOnHover) {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    }

    const tick = () => {
      if (Date.now() < pauseUntilRef.current) return;
      if (el.scrollWidth <= el.clientWidth + 8) return;

      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;

      const currentLeft = el.scrollLeft;
      const nextChild = children.find(child => child.offsetLeft > currentLeft + 20);
      const targetLeft = nextChild ? nextChild.offsetLeft : 0;
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    };

    const interval = window.setInterval(tick, intervalMs);

    return () => {
      window.clearInterval(interval);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('wheel', onWheel);
      if (pauseOnHover) {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, [enabled, intervalMs, pauseAfterInteractionMs, pauseOnHover, ref]);
}
