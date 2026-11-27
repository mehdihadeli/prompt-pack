import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { compileMdx } from 'nextra/compile';
import { getBasePath, pages } from './config.mjs';
import { rewriteMarkdown } from './generate-content.mjs';

test('every page has a unique route and an existing Markdown source', async () => {
  assert.equal(new Set(pages.map(page => page.route)).size, pages.length);
  assert.equal(new Set(pages.map(page => page.source)).size, pages.length);
  for (const page of pages) {
    assert.match(page.route, /^\/(?:[a-z-]+\/)*$/);
    await access(new URL(`../${page.source}`, import.meta.url));
  }
});

test('base paths support root and GitHub project sites', () => {
  assert.equal(getBasePath(''), '');
  assert.equal(getBasePath('/'), '');
  assert.equal(getBasePath('/PromptPack/'), '/PromptPack');
  assert.equal(getBasePath('/preview/docs'), '/preview/docs');
  for (const value of ['PromptPack', 'https://example.com', '/../../docs', '//docs']) {
    assert.throws(() => getBasePath(value), /DOCS_BASE_PATH/);
  }
});

test('rewrites relative, absolute, and reference links without losing fragments', () => {
  const markdown = '[Quickstart](./quickstart.md#install) [CLI](/reference/cli) [Workflow][workflow]\n\n[workflow]: workflow.md';
  const result = rewriteMarkdown(markdown, 'guide/architecture.md');
  assert.match(result, /\(\/guide\/quickstart\/#install\)/);
  assert.match(result, /\(\/reference\/cli\/\)/);
  assert.match(result, /\[workflow\]: \/guide\/workflow\//);
});

test('repository files link to GitHub while external URLs and anchors stay unchanged', () => {
  const markdown = '[CI](../../.github/workflows/build-and-publish.yml) [External](https://example.com) [Here](#here)';
  const result = rewriteMarkdown(markdown, 'guide/architecture.md');
  assert.match(result, /https:\/\/github.com\/mehdihadeli\/PromptPack\/blob\/main\/\.github\/workflows\/build-and-publish.yml/);
  assert.match(result, /\(https:\/\/example.com\)/);
  assert.match(result, /\(#here\)/);
});

test('preserves code, Mermaid, and HTML tables while removing Markdown-only comments', () => {
  const markdown = '<!-- markdownlint-disable MD033 -->\n\n<details open>\n<summary>Options</summary>\n<table><tbody><tr><td>--output</td></tr></tbody></table>\n</details>\n\n```mermaid\nflowchart LR\n  Input --> Output\n```\n\n```text\n[Example](missing.md)\n```';
  const result = rewriteMarkdown(markdown, 'reference/cli.md');
  assert.match(result, /<details open>/);
  assert.match(result, /<table>/);
  assert.match(result, /```mermaid/);
  assert.match(result, /\[Example\]\(missing.md\)/);
  assert.doesNotMatch(result, /<!--/);
});

test('rejects broken local documentation links', () => {
  for (const link of ['missing.md', '/guide/missing', '../../missing.txt']) {
    assert.throws(() => rewriteMarkdown(`[Missing](${link})`, 'guide/quickstart.md'), /Unmapped local link/);
  }
});

test('every canonical page converts with valid local links', async () => {
  for (const page of pages) {
    const markdown = await readFile(new URL(`../${page.source}`, import.meta.url), 'utf8');
    assert.doesNotThrow(() => rewriteMarkdown(markdown, page.source), page.source);
  }
});

test('Nextra compiles the documentation pages as MDX', async () => {
  for (const page of pages) {
    const markdown = await readFile(new URL(`../${page.source}`, import.meta.url), 'utf8');
    await assert.doesNotReject(() => compileMdx(rewriteMarkdown(markdown, page.source), { mdxOptions: { format: 'mdx' }, codeHighlight: false }), page.source);
  }
});