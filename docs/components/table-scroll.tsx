'use client';

import { useRef, type ComponentProps } from 'react';
import { useScrollEnd } from './scroll-edges';

export function TableScroll({ children, ...props }: ComponentProps<'table'>) {
  const scroller = useRef<HTMLDivElement>(null);
  const end = useScrollEnd(scroller);

  return <div className="table-frame" data-scroll-end={end || undefined}>
    <div className="table-scroll" ref={scroller} role="region" aria-label="Table" tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  </div>;
}
