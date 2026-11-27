import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { pages, repositoryUrl } from './config.mjs';

const docsDirectory = fileURLToPath(new URL('../', import.meta.url));
const repositoryDirectory = path.dirname(docsDirectory);
const routes = new Map(pages.map(page => [path.resolve(docsDirectory, page.source), page.route]));
const publicRoutes = new Map(pages.flatMap(page => [
  [page.route.replace(/\/$/, '') || '/', page.route],
  [`/${page.source.replace(/\.md$/, '')}`, page.route]
]));

export function rewriteMarkdown(markdown, source) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, { fences: true });
  const tree = processor.parse(markdown);
  visit(tree, node => {
    if (node.type === 'html') node.value = node.value.replace(/<!--[\s\S]*?-->/g, '');
    if (node.type !== 'link' && node.type !== 'definition') return;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(node.url)) return;
    if (node.url.startsWith('/')) {
      const target = new URL(node.url, 'https://docs.example');
      const route = publicRoutes.get(target.pathname.replace(/\/$/, '').replace(/\.md$/, '') || '/');
      if (!route) throw new Error(`Unmapped local link '${node.url}' in '${source}'.`);
      node.url = `${route}${target.search}${target.hash}`;
      return;
    }
    const target = new URL(node.url, pathToFileURL(path.resolve(docsDirectory, source)));
    const destination = fileURLToPath(target);
    const route = routes.get(destination);
    if (route) {
      node.url = `${route}${target.search}${target.hash}`;
      return;
    }
    const repositoryPath = path.relative(repositoryDirectory, destination);
    if (!destination.startsWith(`${docsDirectory}${path.sep}`) && !repositoryPath.startsWith('..') && existsSync(destination)) {
      node.url = `${repositoryUrl}/blob/main/${repositoryPath.split(path.sep).map(encodeURIComponent).join('/')}${target.hash}`;
      return;
    }
    throw new Error(`Unmapped local link '${node.url}' in '${source}'.`);
  });
  return processor.stringify(tree);
}

export async function generateContent() {
  const contentDirectory = path.join(docsDirectory, 'content');
  await rm(contentDirectory, { recursive: true, force: true });
  for (const page of pages) {
    const markdown = await readFile(path.resolve(docsDirectory, page.source), 'utf8');
    const destination = path.join(contentDirectory, page.route === '/' ? 'index.mdx' : `${page.route.slice(1, -1)}.mdx`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, `---\ntitle: ${JSON.stringify(page.title)}\n---\n\n${rewriteMarkdown(markdown, page.source)}`);
  }
  const directories = ['', ...new Set(pages.map(page => path.posix.dirname(page.source)).filter(directory => directory !== '.'))];
  for (const directory of directories) {
    const metadata = directory
      ? Object.fromEntries(pages.filter(page => path.posix.dirname(page.source) === directory).map(page => [path.posix.basename(page.source, '.md'), page.title]))
      : { index: 'Overview', guide: 'Guide', reference: 'Reference' };
    await writeFile(path.join(contentDirectory, directory, '_meta.js'), `export default ${JSON.stringify(metadata, null, 2)};\n`);
  }
  console.log(`Generated ${pages.length} documentation pages from canonical Markdown.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await generateContent();
}