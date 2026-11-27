# PromptPack

Prepare focused, reviewable repository context for AI tools, directly from your terminal.

PromptPack is a local .NET CLI. Select the files that matter, remove implementation noise, and produce one package for a code review, refactoring task, or architecture question. Output stays on your machine until you choose to share it.

<CardGroup>
  <Card title="Quickstart" href="/guide/quickstart/" icon="terminal">Install PromptPack and create your first package.</Card>
  <Card title="Build a workflow" href="/guide/workflow/" icon="workflow">Turn a one-off command into a repeatable handoff.</Card>
  <Card title="CLI reference" href="/reference/cli/" icon="code">Look up every option, format, and exit code.</Card>
  <Card title="Architecture" href="/guide/architecture/" icon="layers">See how collection, shaping, and output fit together.</Card>
</CardGroup>

## Start packing

Install the .NET global tool, then run `pp` from your repository:

```bash
dotnet tool install --global PromptPack
pp
```

By default, PromptPack creates Markdown and copies it to your clipboard. To inspect the package first, write it to a file:

```bash
pp -o context.md
```

<Terminal title="pp -y markdown -o context.md" output="$ pp -y markdown -o context.md|Selected 42 files from src/ and tests/|Estimated 38,240 tokens|Security scan: 0 findings|Wrote context.md and copied it to the clipboard" />

<Tip title="Install without .NET">
Linux and macOS releases include a standalone executable. The [quickstart](/guide/quickstart/) covers that path and the supported output destinations.
</Tip>

## From repository to context

<Steps>
  <Step title="Select">
    Choose a directory, include globs, or feed paths through stdin. Ignore rules apply before any content is read.
  </Step>
  <Step title="Shape">
    Apply optional comment removal, empty-line removal, or structural compression to reduce noise.
  </Step>
  <Step title="Review">
    Read security findings and token estimates before the package leaves your machine.
  </Step>
  <Step title="Hand off">
    Send Markdown, XML, JSON, or plain text to the tool that needs it.
  </Step>
</Steps>

The [architecture guide](/guide/architecture/) covers the pipeline and its data boundaries in detail.

## Common commands

| Goal | Command |
| --- | --- |
| Pack the current repository to the clipboard | `pp` |
| Write a package to disk | `pp -o context.md` |
| Include source and tests only | `pp -i "src/**,tests/**"` |
| Create a compact review package | `pp -x -r -l -t -o review.md` |
| Enforce a token budget | `pp -b 50000 -o context.md` |
| Write JSON to stdout | `pp -y json -s` |

See the [CLI reference](/reference/cli/) for all options and the [workflow guide](/guide/workflow/) for repeatable handoffs.

## Sharing safely

<Warning title="Review the package before you share it">
Security scanning is enabled by default, but findings are reported for review. Matching files are not redacted or removed. Inspect the generated package before sending it to another tool.
</Warning>

PromptPack writes to local files, stdout, or the system clipboard. It does not upload generated context.

## Contributing

Contributions are welcome. Open an issue to discuss a change before starting larger work, and keep the pipeline boundaries described in the [architecture guide](/guide/architecture/) intact.

