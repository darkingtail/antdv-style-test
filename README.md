# antdv-style-test

Consumer demos and regression tests for [antdv-style](https://github.com/antdv-next/antdv-style),
using Vue 3, antdv-next, Vite, and Playwright.

This is a local integration project, not a published npm package or a standalone
copy of the library. It links the library and both tooling packages from a sibling
checkout. Regression demos also import components from that checkout's docs.

## Setup

Requirements: Node.js 22.12 or newer and pnpm 10.29.3.

Keep the two repositories side by side:

```text
workspace/
  antdv-style/
  antdv-style-test/
```

From an empty workspace directory:

```sh
git clone https://github.com/antdv-next/antdv-style.git
git -C antdv-style checkout 3b5ff675e23da8845441f8985368cb914682c2a3
git clone https://github.com/darkingtail/antdv-style-test.git
pnpm --dir antdv-style install --frozen-lockfile
pnpm --dir antdv-style build
pnpm --dir antdv-style-test install --frozen-lockfile
cd antdv-style-test
pnpm exec playwright install chromium
pnpm dev
```

The pinned library commit is the alignment baseline used by this test suite.
To test another library revision, check it out and rebuild all three packages.
Do not replace the links with the npm release unless that release contains the
APIs under test. The lockfile pins antdv-next to 1.5.4; this does not claim to
automatically test the latest npm release.

On Linux CI, install browser system dependencies with
`pnpm exec playwright install --with-deps chromium`.

## Demo Pages

Use the URL printed by Vite:

- `/`: API demos, themes, responsive styles, global styles, and instances.
- `/?regression`: controlled themes, cache reset, ShadowRoot, and docs demos.
- `/?review-fixes`: regression cases for component tokens, prefixes, and tooling.

## Verification

Run from `antdv-style-test` after building the sibling library:

```sh
pnpm build
pnpm test:ssr
pnpm test:tooling
pnpm test:e2e
```

The tooling checks intentionally verify the three local package links, built
exports, label transforms, and safe/refused Less conversions. They are not an
isolated tarball-installation test.

For docs interactions and the full runtime/docs audit, build the docs first:

```sh
pnpm --dir ../antdv-style docs:build
pnpm test:docs
pnpm test:audit
```

`test:audit` generates its runtime observations and browser fixtures before
running Playwright. Generated fixtures are not committed. Docs tests cover both
languages and desktop/mobile viewports against the sibling checkout's preview.

Playwright starts and stops its own servers. Set `CI=true` to disallow reuse of
an existing server in the regular E2E/docs suites. Default ports:

| Suite | App Port | Docs Port | Environment Overrides |
| --- | --- | --- | --- |
| E2E | 5186 | - | `PLAYWRIGHT_PORT` |
| Docs | - | 4186 | `DOCS_PORT` |
| Audit | 5197 | 4197 | `AUDIT_APP_PORT`, `AUDIT_DOCS_PORT` |

The default browser is Playwright's installed Chromium. Set
`PLAYWRIGHT_CHANNEL=chrome` to use a locally installed Chrome instead. Ensure
local addresses bypass any HTTP proxy when running browser tests.

## Repository Scope

Source, reusable tests, configuration, and the lockfile are versioned. Local
review notes, AI conversations, upstream snapshots, archives, build output,
browser reports, traces, environment files, and credentials are excluded.
Root files and scripts use an explicit allowlist in `.gitignore`; update it when
adding a new reusable file.

Passing this suite is evidence for the tested scenarios, not a guarantee of
universal upstream parity. Library limitations and supported APIs belong in the
antdv-style documentation.
