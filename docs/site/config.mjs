export const repositoryUrl = 'https://github.com/mehdihadeli/PromptPack';

export const pages = [
  { source: 'index.md', route: '/', title: 'Overview', group: 'Start here', summary: 'What PromptPack does, how it works, and where to begin.' },
  { source: 'guide/quickstart.md', route: '/guide/quickstart/', title: 'Quickstart', group: 'Guide', summary: 'Install PromptPack and create your first package.' },
  { source: 'guide/workflow.md', route: '/guide/workflow/', title: 'Workflow', group: 'Guide', summary: 'A repeatable loop from repository selection to a reviewed handoff.' },
  { source: 'guide/architecture.md', route: '/guide/architecture/', title: 'Architecture', group: 'Guide', summary: 'Collection, processing, scanning, and output boundaries.' },
  { source: 'reference/cli.md', route: '/reference/cli/', title: 'CLI reference', group: 'Reference', summary: 'Every option, configuration property, format, and exit code.' }
];

export const groups = [...new Set(pages.map(page => page.group))];

export function getBasePath(value = process.env.DOCS_BASE_PATH ?? '') {
  if (!value || value === '/') return '';
  if (!/^\/[a-z\d_/-]+$/i.test(value) || value.includes('//')) {
    throw new Error('DOCS_BASE_PATH must be a URL path such as /PromptPack.');
  }
  return value.replace(/\/$/, '');
}