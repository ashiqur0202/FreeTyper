<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FreeTyper — working agreements

Everything below is short on purpose. The full detail is in **`freetyper.md`** — read it first (product rules, content standards, release routine, current status). Keep it under about 250 lines and update it with each release.

## Workflow
- Work on a branch. Never commit to `master` directly; a push to `master` deploys the live site.
- Before merging: `npx tsc --noEmit`, `npm run build`, then test the built site (`next start`) in a browser.
- Merge by fast-forward, push, then check the live site.
- The repo has older lint errors. Do not add new ones: compare lint on the files you touch before and after.

## Content
- Guides and blog posts must describe what the code actually does and cite only sources that were opened and checked.
- No invented statistics, no made-up first-hand stories. State limits, and label our own suggestions as suggestions.
- When a tool changes, update its guide in the same commit and bump the visible date. Never backdate or auto-update dates.

## Keep in mind
- Anything read from `localStorage` must render only after hydration.
- Both sidebars stay `md:sticky md:top-0 md:h-screen md:self-start`.
- `ads.txt` lives in `public/`, never inside `robots.txt`.
- No secrets, keys or passwords in this file or anywhere else in the repo.
