<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-black.svg)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org)

</div>

# Motion Core Documentation Template

**A reusable SvelteKit docs template for launching branded documentation fast.**

This repository provides a ready-to-use docs app with configurable SEO, navigation, interactive docs UI, OG image generation, and mdsvex content structure.

## Quick Start

```bash
bun install
bun run dev
```

App runs in `apps/web`.

## Configure For A New Project

Update these files first:

- `apps/web/src/lib/config/site.ts` - site name, description, keywords, links, package metadata, canonical URL.
- `apps/web/src/lib/config/branding.ts` - logo source and brand label used in shared UI.
- `apps/web/src/lib/config/navigation.ts` - manual sidebar structure and docs order.
- `apps/web/src/lib/config/docs-ui.ts` - search, TOC, doc actions, pagination, package manager tabs, theme defaults.

Then adjust docs content:

- `apps/web/src/routes/docs/**/*` - page content (`.svx`) and docs routes.

## Common Commands

```bash
bun run dev
bun run check
bun run lint
bun run build
bun run deploy:web
```

## License

MIT. See `LICENSE`.
