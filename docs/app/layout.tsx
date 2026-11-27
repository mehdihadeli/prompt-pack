import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DocsShell } from '../components/docs-shell';
import '@fontsource-variable/geist';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PromptPack', template: '%s | PromptPack' },
  description: 'Prepare focused, reviewable repository context for AI tools with PromptPack, a local .NET CLI.'
};

const themeScript = `(function(){try{var saved=localStorage.getItem('promptpack-theme');var dark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body><DocsShell>{children}</DocsShell></body>
  </html>;
}
