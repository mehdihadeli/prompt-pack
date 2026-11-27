# Documentation Site

PromptPack uses Nextra 4 with the Next.js App Router and a custom documentation theme. The theme pairs a light and dark token system with grouped navigation, a page outline, copyable syntax-highlighted code, pagefind search, and shared MDX widgets. Typography, color, spacing, focus, and motion follow the design tokens in `app/globals.css`.

## Local Development

Use Node.js 22 or later:

```bash
cd docs
npm ci
npm run dev
```

Next.js prints the local URL and selects another port if its default port is busy.

The canonical sources are `index.md`, `guide/*.md`, and `reference/*.md`. Edit those files, not `content/`. Run `npm run content` after editing canonical Markdown while the development server is running. Generated changes are picked up by Next.js.

`site/config.mjs` defines titles, groups, route order, and source paths. Existing public URLs remain unchanged. Add new pages there before linking to them. Generation validates local Markdown links, rewrites them to site routes, and maps links to repository files outside `docs/` to GitHub.

Generated pages use Nextra's MDX mode. Canonical Markdown can therefore combine headings, tables, fenced code, Mermaid diagrams, and shared widgets such as `CardGroup`, `Steps`, `Callout`, `Tabs`, `Accordion`, and `Terminal`. Widgets are registered in `mdx-components.tsx` and implemented in `components/doc-widgets.tsx`. Keep expression props on one line and prefer plain string props inside canonical Markdown, because the link rewriter parses each source as Markdown before Nextra compiles it as MDX. The generated `content/` directory is disposable and replaced by `npm run content`.

## Design system

`app/globals.css` owns the visual contract. Primitive color values and semantic role tokens are defined for both themes under `:root` and `:root[data-theme='dark']`. Components reference semantic tokens only. The type scale, measure, spacing, radii, elevation, and motion values are declared once. Hover styles sit behind `@media (hover: hover)`, focus uses `:focus-visible`, and reduced-motion preferences disable transitions and smooth scrolling.

Two accent hues carry distinct jobs in both themes. Purple (`--color-accent`) marks everything interactive: links, the active navigation item, the outline marker, focus rings, cards, steps, and tips. Blue (`--color-info`) marks informational labels and notes: the page kicker, note callouts, and the sidebar status dot. Success stays green and warnings stay amber. Never reuse one hue for the other's job, and never carry meaning with color alone.

When adding a page component, reuse the existing token names and widget classes. Do not add a second radius, shadow, or status color without adding a role for it. Interactive widgets must keep a keyboard path, an accessible name, and a visible focus state. Scrollable regions such as code, tables, and the terminal preview receive a tab stop.

## Checks and Preview

```bash
npm test
npm run build
npm run typecheck
npm run preview
```

The build exports static files to `out/` and generates a Pagefind index in `out/_pagefind/`. Full-text search works in the production preview and deployed site. The development server falls back to matching page titles when no Pagefind index is available.

## Publishing

`.github/workflows/deploy-docs.yml` installs dependencies, tests content, builds the static site, and uploads `docs/out`. Pull requests validate the site without deploying. Pushes to `main` and manual runs can deploy to GitHub Pages.

The workflow takes `DOCS_BASE_PATH` from GitHub Pages configuration. Local development defaults to the site root. For a manual project-site build:

```bash
DOCS_BASE_PATH=/PromptPack npm run build
```

In PowerShell, set `$env:DOCS_BASE_PATH = '/PromptPack'` before building. Use an empty value for root-hosted sites or custom domains. Next.js applies this prefix to navigation and assets; search loads its index under the same prefix.
