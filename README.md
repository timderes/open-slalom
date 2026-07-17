# openSlalom

Open-source timing and results management software for Kartslalom (JKS/SKS) competitions and training.

Built with **Electron** + **Next.js** (via [nextron](https://github.com/saltyshiomix/nextron)).

## Features

- **Driver Management** — Create and manage driver profiles
- **Kart Management** — Track kart assignments and history
- **Training Sessions** — Start, stop, and restore training sessions
- **Precision Lap Timing** — Record lap times with accuracy down to the millisecond
- **Statistics** — View aggregated stats from past trainings
- **Championships** _(upcoming in v1.4.0)_ — Organize series of trainings with standings

## Tech Stack

| Layer     | Technology                                                                                   |
| --------- | -------------------------------------------------------------------------------------------- |
| Framework | [Electron](https://www.electronjs.org/) / [nextron](https://github.com/saltyshiomix/nextron) |
| UI        | [React 19](https://react.dev/) / [Next.js 16](https://nextjs.org/)                           |
| Styling   | [@mantine/core](https://mantine.dev/)                                                        |
| Database  | [Dexie.js](https://dexie.org/) (IndexedDB wrapper)                                           |
| Storage   | [electron-store](https://github.com/sindresorhus/electron-store)                             |
| Logging   | [electron-log](https://github.com/megahertz/electron-log)                                    |
| Testing   | [Vitest](https://vitest.dev/)                                                                |

## Prerequisites

- Node.js (v20+)
- npm, yarn, or pnpm

## Getting Started

```bash
# Install dependencies
npm install # or yarn / pnpm

# Start development server
npm run dev

# Build for production
npm run build
```

## Scripts

| Script                       | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `npm run dev`                | Start development mode (Hot reload enabled) |
| `npm run build`              | Build for all platforms                     |
| `npm run format`             | Format code with Prettier                   |
| `npm run test`               | Run tests with Vitest                       |
| `npm run typecheck:renderer` | Type-check the renderer process             |

## Project Structure

```
openSlalom/
├── app/                  # Production files (generated)
├── main/                 # Electron main process
│   ├── ipc/              # IPC handlers (file open, save)
│   └── helpers/          # Window creation utilities
├── renderer/             # Next.js renderer process
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Database, utilities
│   └── pages/            # App routes
├── resources/            # Platform assets (icons, etc.)
├── electron-builder.yml  # Build configuration
└── NOTES.md              # Dev notes
```

## Architecture

This is the code block that represents the suggested code change:

```markdown
Electron Main Process (main/)
├── Creates browser windows
└── IPC endpoints (save-file, open-file, etc.)

        ↓ IPC bridge

Next.js Renderer Process (renderer/)
├── React UI components
├── Dexie DB service (IndexedDB)
└── Training state management
```

## License

MIT
