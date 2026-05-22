# tvml-obsidian

Portable Obsidian setup for the **the-vibe-marketing-lab** vault. Clone this on any device and run one command to get the exact same Obsidian config — plugins, themes, snippets, hotkeys, and settings.

This repo stores **config only** (`.obsidian`), never your notes. Your notes live in the `the-vibe-marketing-lab` repo itself (the one you open in VS Code).

## What's captured

- **Community plugins** (with their files, so installs are offline + deterministic): `terminal`, `obsidian-icon-folder`, `hot-reload`, `git-file-explorer-colors`
- **Themes**: Minimal, Obsidianite (active), Things, Tokyo Night, Typewriter, Wasp
- **Snippets**: `hide-claude-code-items.css`
- **Settings**: appearance, core plugins, hotkeys, graph, webviewer, app
- Folder icon mappings (icon-folder plugin)

> `workspace.json` (window/pane layout) is intentionally **excluded** — it's per-device and noisy. Obsidian regenerates it.

## Setup on a new device

```bash
# 1. Clone next to your vault (both on Desktop is easiest)
cd ~/Desktop
git clone https://github.com/reapzyau/tvml-obsidian.git
# (the-vibe-marketing-lab should also be cloned here)

# 2. Install the config into the vault
cd tvml-obsidian
bun install.ts
```

The installer finds the vault automatically. If needed, point it explicitly:

```bash
bun install.ts --vault=/full/path/to/the-vibe-marketing-lab
```

Then open the vault in Obsidian (**Open folder as vault**) and reload: Command Palette → **Reload app without saving**.

Preview without writing anything:

```bash
bun install.ts --dry-run
```

## Updating the snapshot

Changed a plugin/theme/hotkey in Obsidian and want it on your other devices?

```bash
bun sync.ts                       # pulls live .obsidian back into this repo
git add -A && git commit -m "sync obsidian config" && git push
```

On the other device: `git pull && bun install.ts`, then reload Obsidian.

## Requirements

- [bun](https://bun.sh) (scripts are dependency-free TypeScript)
- The `the-vibe-marketing-lab` vault cloned somewhere on the device
