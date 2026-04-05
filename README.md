# ☁ Claude98

A Windows 98-inspired AI desktop powered by Claude.

![Claude98](https://img.shields.io/badge/Claude98-v0.1.0-blue)

## What is this?

Claude98 is a nostalgic desktop environment that runs as a native app. It wraps the Claude API in a Windows 98 aesthetic — complete with boot screen, draggable windows, taskbar, Start menu, and a full chat interface.

**Features (v1):**
- 🖥️ Boot screen with retro loading sequence
- 💬 Claude Chat with streaming responses and markdown rendering
- 📁 My Documents — file explorer for your chat history
- 🗑️ Recycle Bin — soft-delete and restore conversations
- ⚙️ Control Panel — API key management (encrypted), model selection
- 🪟 Window manager — drag, resize, minimize, maximize, z-index stacking
- 📌 Taskbar with Start menu and system clock

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Install

```bash
git clone https://github.com/YOUR_USERNAME/claude98.git
cd claude98
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
npm run package
```

## First Launch

1. The boot screen plays on first launch
2. Open **Control Panel** (⚙️ icon on desktop or via Start menu)
3. Enter your Anthropic API key
4. Select your preferred model
5. Click **Apply**
6. Open **Claude Chat** and start talking!

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Electron |
| Frontend | React + TypeScript |
| Styling | CSS Modules |
| State | Zustand |
| AI | Anthropic SDK (streaming) |
| Database | SQLite (better-sqlite3) |
| Build | electron-vite + electron-builder |

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── ipc/        # IPC handlers (bridge)
│   ├── database/   # SQLite + migrations
│   └── services/   # Claude API wrapper
├── preload/        # Secure context bridge
└── renderer/       # React app
    ├── components/ # UI components
    ├── stores/     # Zustand state
    └── styles/     # Win98 design system
```

## Security

- API key encrypted via Electron's `safeStorage` (OS keychain)
- `contextIsolation: true`, `nodeIntegration: false`
- All IPC communication is typed and explicit
- Virtual filesystem — never touches your real files

## Roadmap

- [ ] Code editor (Monaco) with Win98 theme
- [ ] Notepad98 — simple text editor
- [ ] Custom themes and wallpapers
- [ ] System sounds (startup, error, notification)
- [ ] Chat export (txt, md, pdf)
- [ ] Minesweeper (because why not)
- [ ] Clippy-style assistant (Easter egg)

## License

MIT
