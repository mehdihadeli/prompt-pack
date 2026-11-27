'use client';

import { useRef, useState, type ComponentProps } from 'react';
import { Check, Copy } from 'lucide-react';
import { useScrollEnd } from './scroll-edges';

export function CodeBlock(props: ComponentProps<'pre'>) {
  const content = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const scrollEnd = useScrollEnd(content);
  const label = status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed; select code manually' : 'Copy code';

  async function copy() {
    try {
      await navigator.clipboard.writeText(content.current?.innerText ?? '');
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  return <div className="code-block" data-scroll-end={scrollEnd || undefined}>
    <pre {...props} tabIndex={props.tabIndex ?? 0} ref={content} />
    <button className="copy-button" type="button" onClick={copy} title={label} aria-label={label}>
      {status === 'copied' ? <Check size={15} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /> : <Copy size={15} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />}
    </button>
    <span className="sr-only" role="status">{status === 'idle' ? '' : label}</span>
  </div>;
}