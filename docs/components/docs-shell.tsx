'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CodeXml, List, Menu, Moon, Package, SquareTerminal, Sun, X } from 'lucide-react';
import { groups, pages, repositoryUrl } from '../site/config.mjs';
import { DocsSearch } from './docs-search';

const navigation = groups.map(label => ({ label, pages: pages.filter(page => page.group === label) }));

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, '') || '/';
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; title: string; nested: boolean }[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const menu = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const index = pages.findIndex(page => (page.route.replace(/\/$/, '') || '/') === pathname);
  const previous = pages[index - 1];
  const next = index >= 0 ? pages[index + 1] : undefined;
  const current = pages[index];
  const close = () => setOpen(false);

  function closeNavigation() {
    setOpen(false);
    menu.current?.focus();
  }

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme;
    const theme = currentTheme
      ? currentTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(theme);
    document.documentElement.dataset.theme = theme ? 'dark' : 'light';
  }, []);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const update = () => document.documentElement.style.setProperty('--header-height', `${element.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  function toggleTheme() {
    const theme = dark ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.add('theme-transition-off');
    root.dataset.theme = theme;
    void root.offsetHeight;
    requestAnimationFrame(() => root.classList.remove('theme-transition-off'));
    setDark(!dark);
    try { localStorage.setItem('promptpack-theme', theme); } catch {}
  }

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]')];
    setHeadings(elements.map(element => ({ id: element.id, title: element.textContent ?? '', nested: element.tagName === 'H3' })));
    setActiveHeading(elements[0]?.id ?? '');
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) setActiveHeading(visible.target.id);
    }, { rootMargin: '-160px 0px -55% 0px' });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const drawer = sidebar.current;
    (drawer?.querySelector<HTMLElement>('[aria-current="page"]') ?? drawer?.querySelector<HTMLElement>('a[href], button'))?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNavigation();
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;
      const focusable = [...drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 861px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, []);

  return <>
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="site-header" ref={header}>
      <div className="header-main">
        <Link href="/" className="wordmark" onClick={close}><Package size={28} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" /><span>Prompt<span className="wordmark-light">Pack</span></span></Link>
        <DocsSearch onNavigate={close} />
        <a className="icon-button github-link" href={repositoryUrl} aria-label="PromptPack on GitHub" title="PromptPack on GitHub"><CodeXml size={19} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /></a>
        <button className="icon-button theme-button" type="button" onClick={toggleTheme} title={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? <Sun size={19} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /> : <Moon size={19} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />}</button>
        <Link className="header-quick-start" href="/guide/quickstart/" onClick={close}>Quickstart <ArrowRight size={15} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" /></Link>
        <button ref={menu} className="icon-button menu-button" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="docs-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} title={open ? 'Close navigation' : 'Open navigation'}>{open ? <X size={22} strokeWidth={1.5} absoluteStrokeWidth /> : <Menu size={22} strokeWidth={1.5} absoluteStrokeWidth />}</button>
      </div>
      <nav className="header-tabs" aria-label="Top navigation">
        <Link href="/" onClick={close} aria-current={current && ['Start here', 'Guide'].includes(current.group) ? 'true' : undefined}><BookOpen size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />Documentation</Link>
        <Link href="/reference/cli/" onClick={close} aria-current={current?.group === 'Reference' ? 'true' : undefined}><SquareTerminal size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />CLI reference</Link>
      </nav>
    </header>
    <div className="docs-layout">
      {open && <button className="navigation-backdrop" type="button" onClick={closeNavigation} aria-label="Close navigation" />}
      <aside ref={sidebar} id="docs-navigation" className={`sidebar${open ? ' is-open' : ''}`} aria-label="Documentation navigation" role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined}>
        <div className="mobile-nav-header"><p>Documentation</p><button className="icon-button sidebar-close" type="button" onClick={closeNavigation} aria-label="Close navigation"><X size={20} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /></button></div>
        <div className="navigation-groups">{navigation.map(group => <section key={group.label}><h2>{group.label}</h2><nav aria-label={group.label}>{group.pages.map(page => <Link key={page.route} href={page.route} onClick={close} aria-current={page === current ? 'page' : undefined}>{page.title}</Link>)}</nav></section>)}</div>
        <div className="sidebar-note"><span className="status-dot" />Local .NET CLI</div>
      </aside>
      <main id="content" tabIndex={-1} className="docs-main" inert={open ? true : undefined}>
        <div className="page-context">{current?.group ?? 'Documentation'}</div>
        <article className="prose" data-pagefind-body={current ? '' : undefined}>{children}</article>
        <nav className="page-pagination" aria-label="Page navigation">
          {previous ? <Link href={previous.route}><ArrowLeft size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /><span><small>Previous</small>{previous.title}</span></Link> : <span />}
          {next && <Link href={next.route}><span><small>Next</small>{next.title}</span><ArrowRight size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /></Link>}
        </nav>
        <footer className="page-footer">PromptPack <span>Collect. Shape. Review. Hand off.</span></footer>
      </main>
      {headings.length > 0 && <aside className="page-outline" aria-label="On this page"><h2><List size={15} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />On this page</h2><nav>{headings.map(heading => <a key={heading.id} className={heading.nested ? 'is-nested' : undefined} href={`#${heading.id}`} aria-current={activeHeading === heading.id ? 'location' : undefined} onClick={() => setActiveHeading(heading.id)}>{heading.title}</a>)}</nav></aside>}
    </div>
  </>;
}
