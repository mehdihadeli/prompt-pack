# CLI reference

## Configuration and input

PromptPack reads `promptpack.config.json`, `promptpack.config.yaml`, or `promptpack.config.yml`. Configuration merges in this order: global user config, repository and ancestor configs, then `--config` and command-line values.

<Note title="Where global settings live">
On Windows, global files live under `%APPDATA%/PromptPack`. On Linux and macOS, use `$XDG_CONFIG_HOME/PromptPack` or `~/.config/PromptPack`.
</Note>

Example config:

```json
{
  "include": "src/**,tests/**",
  "exclude": "**/*.generated.cs",
  "securityScan": true,
  "securityScanner": "built-in",
  "headerText": "Review this repository for correctness.",
  "splitOutput": "2MB"
}
```

Run commands with the published `PromptPack` .NET tool using its `pp` command.

PromptPack is a local CLI. It does not fetch remote repositories or upload generated context. Its normal interactive workflow copies Markdown to the clipboard; use `--output` for a file and `--stdout` for a pipeline.

## Usage

```text
pp [directory] [options]
```

The directory defaults to `.`.

## Positional arguments

| Argument      | Required | Default | Description        | Example          |
| ------------- | -------- | ------- | ------------------ | ---------------- |
| `[directory]` | No       | `.`     | Directory to pack. | `pp src`         |

### Output formats

| Format     | Typical use                                              | Example                                |
| ---------- | -------------------------------------------------------- | -------------------------------------- |
| `markdown` | Reviewable context and direct AI prompts; default format | `pp -y markdown -o context.md`         |
| `xml`      | Explicit sections for structured consumers               | `pp -y xml -o context.xml`             |
| `json`     | Programmatic inspection and automation                   | `pp -y json -o context.json`           |
| `plain`    | Text-only shell pipelines                                | `pp -y plain -s`                       |

When no destination is supplied, PromptPack copies the generated output to the clipboard. `--copy` is additive: it copies output even when `--output` or `--stdout` is also supplied.

## Command options

<AccordionGroup>
<Accordion title="Output">

| Option | Purpose |
| --- | --- |
| `-o, --output <path>` | Write output to a file; the clipboard is the default destination. |
| `-y, --style <format>` | Select `markdown`, `xml`, `json`, or `plain`. |
| `-s, --stdout` | Write generated content to stdout. |
| `-c, --copy` | Copy output to the clipboard in addition to another destination. |
| `-z, --split-output <size>` | Split output into numbered parts. |

</Accordion>

<Accordion title="Selection, input, and repository">

| Option | Config property | Purpose |
| --- | --- | --- |
| `-i, --include <patterns>` | `include` | Include only matching files. |
| `-e, --exclude, --ignore <patterns>` | `exclude` | Add exclusion patterns. |
| `--no-gitignore` | `useGitignore` | Disable `.gitignore` and `.ignore`. |
| `--no-default-patterns` | `useDefaultPatterns` | Disable built-in exclusions. |
| `-q, --stdin` | | Read one file path per stdin line. |
| `--init` | | Create a starter configuration file. |
| `-g, --config <path>` | | Load an explicit JSON or YAML configuration file. |
| `--remote <url>` | | Clone and pack a Git repository temporarily. |
| `--remote-branch <name>` | | Select a branch for `--remote`. |

</Accordion>

<Accordion title="Processing and context">

| Option | Config property | Purpose |
| --- | --- | --- |
| `-x, --compress` | `compress` | Reduce implementation detail while retaining structure. |
| `-r, --remove-comments` | `removeComments` | Remove supported comments. |
| `-l, --remove-empty-lines` | `removeEmptyLines` | Remove blank lines. |
| `-n, --output-show-line-numbers` | | Prefix generated source lines with line numbers. |
| `-m, --no-file-summary` | | Omit generated file metadata. |
| `-d, --no-directory-structure` | | Omit the generated directory tree. |
| `-f, --no-files` | | Omit file contents while retaining metadata and structure. |
| `-j, --header-text <text>` | `headerText` | Add custom header text. |
| `-p, --instruction-file-path <path>` | `instructionFilePath` | Include instructions read from a file. |
| `-a, --full-tree` | `includeFullDirectoryStructure` | Include a separate full tree of non-ignored paths. The older `--include-full-directory-structure` name remains supported. |

</Accordion>

<Accordion title="Analysis and general">

| Option | Config property | Purpose |
| --- | --- | --- |
| `-t, --token-count` | | Display total and largest per-file estimates. |
| `-b, --token-budget <number>` | | Return exit code `2` when output exceeds the estimate. |
| `-k, --security-scan` | `securityScan` | Report common credential and private-key patterns; enabled by default. |
| `--security-scanner <name>` | `securityScanner` | Choose `built-in` (default) or `secretlint` via Node.js/npm. |
| `-w, --verbose` | | Enable detailed processing and configuration logging. |
| `--help` | | Show command usage and option help. |
| `-v, --version` | | Show the installed version. |

</Accordion>
</AccordionGroup>

## Examples

```bash
pp -y xml -o context.xml
pp src --include "**/*.cs,**/*.csproj"
pp --remote https://github.com/org/repo.git --remote-branch main -o remote-context.md
```

<Note title="Remote packing">
`--remote` requires `git` on `PATH`. PromptPack removes the temporary clone when it finishes.
</Note>

## Exit behavior

A successful pack returns exit code `0`. A token budget overflow returns exit code `2`. Unexpected failures are reported and return a nonzero exit code.

## Recipes

### Focused code review

```bash
pp \
  -i "src/**/*.cs,tests/**/*.cs" \
  -e "**/*.generated.cs" \
  -x -r -l -t \
  -j "Review correctness and test coverage." \
  -o review.md
```

### Bounded CI handoff

```bash
pp -y json -b 50000 -k -o context.json
```

The command exits with `2` when the estimate exceeds 50,000 tokens. A regular command failure returns another nonzero code.

### Context from a tracked file list

```bash
git ls-files 'src/**/*.cs' 'tests/**/*.cs' | pp -q -y plain -s > tracked.txt
```

### Compact Markdown

```bash
pp -y markdown -x -r -l -t
```

### Metadata-only JSON

```bash
pp -y json -f -d -o metadata.json
```

### Line-numbered XML

```bash
pp src -y xml -o src-context.xml -n
```
