'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { pages } from '../site/config.mjs';

type Result = { url: string; title: string; excerpt?: string };
type Pagefind = { search: (query: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }> }[] }> };
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function DocsSearch({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const term = query.trim();

  useEffect(() => setQuery(''), [pathname]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setQuery('');
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!term) { setResults([]); setLoading(false); return; }
    setResults([]);
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const modulePath = `${basePath}/_pagefind/pagefind.js`;
        const pagefind: Pagefind = await import(/* webpackIgnore: true */ modulePath);
        const search = await pagefind.search(term);
        const found = await Promise.all(search.results.slice(0, 8).map(async result => {
          const data = await result.data();
          const url = new URL(data.url, window.location.origin);
          const route = basePath && url.pathname.startsWith(`${basePath}/`) ? url.pathname.slice(basePath.length) : url.pathname;
          return { url: `${route}${url.hash}`, title: data.meta.title, excerpt: new DOMParser().parseFromString(data.excerpt, 'text/html').body.textContent ?? '' };
        }));
        if (!cancelled) setResults(found);
      } catch {
        if (!cancelled) setResults(pages.filter(page => page.title.toLowerCase().includes(term.toLowerCase())).map(page => ({ url: page.route, title: page.title, excerpt: page.summary })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [term]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const links = [...(container.current?.querySelectorAll<HTMLAnchorElement>('.search-results a') ?? [])];
    if (event.key === 'Escape') {
      setQuery('');
      input.current?.focus();
      return;
    }
    if (!term) return;
    if (event.target === input.current) {
      if (event.key === 'ArrowDown' && links[0]) {
        event.preventDefault();
        links[0].focus();
      } else if (event.key === 'Enter' && links[0]) {
        event.preventDefault();
        links[0].click();
      }
      return;
    }
    const current = links.indexOf(event.target as HTMLAnchorElement);
    if (current < 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      (links[current + 1] ?? links[0]).focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (current === 0) input.current?.focus();
      else links[current - 1].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      input.current?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      links[links.length - 1].focus();
    }
  }

  const status = loading
    ? 'Searching documentation…'
    : !term
      ? ''
      : results.length
        ? `${results.length} result${results.length === 1 ? '' : 's'} available. Use the arrow keys to move through them.`
        : `No results for ${term}.`;

  return <div className="header-search" ref={container} role="search" aria-label="Documentation search" onKeyDown={handleKeyDown}>
    <label className="search-field">
      <Search size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
      <input ref={input} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search documentation…" aria-label="Search documentation" aria-controls={term ? 'search-results' : undefined} autoComplete="off" spellCheck={false} type="search" />
    </label>
    <span className="sr-only" role="status" aria-live="polite">{status}</span>
    {term && <nav id="search-results" className="search-results" aria-label="Search results" aria-busy={loading}>
      {results.map(result => <Link key={result.url} href={result.url} onClick={() => { setQuery(''); onNavigate(); }}><span>{result.title}</span>{result.excerpt && <small>{result.excerpt}</small>}</Link>)}
      {loading && <p className="search-status">Searching…</p>}
      {!loading && !results.length && <p className="no-results">No pages found for “{term}”. Check the spelling or browse the navigation.</p>}
    </nav>}
  </div>;
}
