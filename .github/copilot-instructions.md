# Copilot instructions for xeroconv

## Project setup

- Prefer Bun for package management and scripts: use `bun install`, `bun run <script>`, and `bun test` instead of npm or yarn.
- Parcel is the primary build/dev tool for this project. Use `bun run start` and `bun run build` for the normal workflow.
- Treat the custom Bun build script as experimental. It may be useful for local experiments, but Parcel is the canonical bundler for this repo.

## Repository purpose

- This project is a website for converting Garmin Xero and Garmin Shotview files into formats suitable for import into GRT and related tooling.
- The conversion tools are bundled into the site itself; the app should work as a standalone web app without requiring external runtime services or extra hosted dependencies at runtime.
- Conversion logic is fragile and format-specific. Small changes can have significant downstream effects.

## Testing expectations

- Tests are important in this repo and should be treated as a required part of validation, not as optional cleanup.
- If you change parsing, conversion, or export logic, add or update focused tests in the relevant `src/js/*.test.ts` files.
- Prefer the smallest meaningful validation command. For conversion-related changes, run the relevant Bun test(s) or `bun test`.
- Do not merge behavior changes without verifying they preserve expected conversion output.

## Working style

- Keep changes minimal and targeted.
- Preserve the existing repo conventions and scripts rather than creating new toolchains.
- Favor explicit, testable conversion logic and avoid broad refactors when a targeted fix is enough.
- Keep the generated site self-contained: prefer bundling everything needed into the app instead of introducing external runtime requirements, CDNs, or runtime fetches.
- If a change affects file compatibility or export output, document the impact in the relevant tests or code comments.

## Typical commands

- Install dependencies: `bun install`
- Start dev app: `bun run start`
- Production build: `bun run build`
- Run tests: `bun test`

## Runtime dependency rules

- Treat the generated site as a self-contained offline web app. Do not introduce runtime requirements that depend on external services, remote APIs, or fetches while the app is running.
- Do not add CDN scripts, remote JavaScript libraries, or runtime package installs that require network access after deployment.
- Prefer bundling all required code and assets into the app itself. If a dependency is needed, it must be included in the repository and bundled by Parcel for the final site.
- Any change that adds an external runtime dependency, remote fetch, or hosted service should be treated as a PR-blocking issue unless there is a clear and necessary reason.

## Important caution

- Because the main purpose of this repo is file conversion, data correctness and regression protection matter more than cosmetic cleanup or exploratory tooling.
