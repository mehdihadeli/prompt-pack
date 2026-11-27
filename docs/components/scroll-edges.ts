'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * True while a scroll container still holds content past its inline end, so the surface can show a
 * cue instead of letting a clipped line read as the whole value. RTL scrollLeft runs negative.
 */
export function useScrollEnd(ref: RefObject<HTMLElement | null>) {
  const [end, setEnd] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setEnd(element.scrollWidth - element.clientWidth - Math.abs(element.scrollLeft) > 4);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [ref]);

  return end;
}
