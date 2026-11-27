'use client';

import Link from 'next/link';
import { Children, isValidElement, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useScrollEnd } from './scroll-edges';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Info,
  Layers,
  Lightbulb,
  Package,
  ShieldCheck,
  Terminal as TerminalIcon,
  TriangleAlert,
  Workflow
} from 'lucide-react';

type ContentProps = { children: ReactNode };

const cardIcons = {
  book: BookOpen,
  code: Code2,
  layers: Layers,
  package: Package,
  shield: ShieldCheck,
  terminal: TerminalIcon,
  workflow: Workflow
};

export function Card({ title, href, icon = 'book', children }: ContentProps & { title: string; href: string; icon?: keyof typeof cardIcons }) {
  const Icon = cardIcons[icon];
  return <Link className="doc-card" href={href}>
    <Icon className="doc-card-icon" size={22} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
    <ArrowUpRight className="doc-card-arrow" size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
    <strong>{title}</strong>
    <span className="doc-card-copy">{children}</span>
  </Link>;
}

export function CardGroup({ children }: ContentProps) {
  return <div className="doc-card-group">{children}</div>;
}

export function Steps({ children }: ContentProps) {
  return <ol className="doc-steps">{children}</ol>;
}

export function Step({ title, children }: ContentProps & { title: string }) {
  return <li className="doc-step"><div className="doc-step-content"><strong className="doc-step-title">{title}</strong>{children}</div></li>;
}

const calloutIcons = { info: Info, tip: Lightbulb, warning: TriangleAlert, success: CheckCircle2 };

export function Callout({ children, title, type = 'info' }: ContentProps & { title?: string; type?: keyof typeof calloutIcons }) {
  const Icon = calloutIcons[type];
  return <div className={`doc-callout doc-callout-${type}`} role="note">
    <Icon size={19} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
    <div>{title && <strong>{title}</strong>}{children}</div>
  </div>;
}

export function Note(props: ContentProps & { title?: string }) { return <Callout {...props} />; }
export function Tip(props: ContentProps & { title?: string }) { return <Callout {...props} type="tip" />; }
export function Warning(props: ContentProps & { title?: string }) { return <Callout {...props} type="warning" />; }
export function Check(props: ContentProps & { title?: string }) { return <Callout {...props} type="success" />; }

export function Accordion({ title, children, defaultOpen = false }: ContentProps & { title: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <details className="doc-accordion" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><ChevronRight size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" /><span>{title}</span></summary>
    <div className="doc-accordion-content">{children}</div>
  </details>;
}

export function AccordionGroup({ children }: ContentProps) {
  return <div className="doc-accordion-group">{children}</div>;
}

type TabProps = ContentProps & { title: string };

export function Tab({ children }: TabProps) { return <>{children}</>; }

export function Tabs({ children, label = 'Options' }: ContentProps & { label?: string }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabs = Children.toArray(children).filter(isValidElement<TabProps>);

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const current = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')].indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    const target = event.key === 'ArrowRight' ? (current + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (current - 1 + tabs.length) % tabs.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? tabs.length - 1
            : -1;
    if (target < 0) return;
    event.preventDefault();
    setActive(target);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus();
  }

  return <div className="doc-tabs">
    <div className="doc-tab-list" role="tablist" aria-label={label} onKeyDown={move}>
      {tabs.map((tab, index) => <button key={index} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>{tab.props.title}</button>)}
    </div>
    {tabs.map((tab, index) => <div key={index} className="doc-tab-panel" role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active !== index} tabIndex={0}>{tab.props.children}</div>)}
  </div>;
}

export function Frame({ children, caption }: ContentProps & { caption?: string }) {
  return <figure className="doc-frame"><div>{children}</div>{caption && <figcaption>{caption}</figcaption>}</figure>;
}

export function Badge({ children }: ContentProps) { return <span className="doc-badge">{children}</span>; }

export function Kbd({ children }: ContentProps) { return <kbd>{children}</kbd>; }

export function Terminal({ title = 'pp', label = 'example output', lines, output }: { title?: string; label?: string; lines?: string[]; output?: string }) {
  const content = lines ?? output?.split('|') ?? [];
  const scroller = useRef<HTMLPreElement>(null);
  const scrollEnd = useScrollEnd(scroller);
  return <figure className="doc-terminal">
    <figcaption><TerminalIcon size={14} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" /><span>{title}</span><small>{label}</small></figcaption>
    <div className="doc-terminal-body" data-scroll-end={scrollEnd || undefined}>
      <pre ref={scroller} tabIndex={0} aria-label={`${label} for ${title}`}>{content.join('\n')}</pre>
    </div>
  </figure>;
}
