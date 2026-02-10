# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator. Users describe components in a chat interface, Claude generates code via tool-use, and a live preview renders the result in-browser. All files exist in a virtual in-memory file system — nothing is written to disk.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (Next.js + Turbopack on localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Vitest (all tests)
npx vitest run src/lib/__tests__/file-system.test.ts  # Run a single test file
npm run db:reset       # Reset SQLite database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create/apply migrations after schema changes
```

## Architecture

### Request Flow
1. User sends message → `ChatProvider` context dispatches to `/api/chat` route
2. API route (`src/app/api/chat/route.ts`) streams response from Claude (or mock provider)
3. Claude uses tools (`str_replace_editor`, `file_manager`) to create/modify files
4. `FileSystemProvider` context processes tool calls, updating the `VirtualFileSystem`
5. `PreviewFrame` transforms files via Babel JSX transformer and renders in an iframe

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`) — In-memory file tree with create/update/delete/rename. Serializable to JSON for project persistence in the database.
- **Provider** (`src/lib/provider.ts`) — Wraps AI model access. Returns real Claude responses when `ANTHROPIC_API_KEY` is set, otherwise uses a mock provider that returns static code.
- **AI Tools** (`src/lib/tools/`) — `str-replace.ts` (find-and-replace in files) and `file-manager.ts` (create/list/delete files). These are the tools Claude calls during generation.
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — Babel-based transform that converts JSX to ES modules with import maps for browser execution. Loads React 19 + dependencies from esm.sh.
- **Contexts** (`src/lib/contexts/`) — `ChatProvider` manages chat messages/streaming state; `FileSystemProvider` manages virtual file system state and tool call processing.

### Data Model (Prisma/SQLite)

- **User** — email, bcrypt-hashed password, JWT session auth (7-day expiry)
- **Project** — name, serialized messages (JSON), serialized file system data (JSON), optional user association

### Routing

- `/` — Home page, redirects to first project or creates one
- `/[projectId]` — Main editor: chat panel + code editor + live preview
- `/api/chat` — Streaming chat endpoint (POST)

## Conventions

- **Path alias**: `@/*` maps to `src/*`
- **Package manager**: npm (not yarn/pnpm)
- **UI components**: shadcn/ui (New York style) in `src/components/ui/`, uses Radix primitives + Lucide icons
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- **Auth**: JWT via `jose` library, sessions stored in cookies, middleware-protected routes
- **Anonymous users**: tracked via SessionStorage (`src/lib/anon-work-tracker.ts`)
- **Comments**: use sparingly — only comment complex code
- **Database schema**: always reference `prisma/schema.prisma` when working with data structures
