# tvml-obsidian

Portable snapshot of the Obsidian setup for the **the-vibe-marketing-lab** vault, so it can be duplicated across devices. Notes are NOT stored here — only the `.obsidian` config (plugins, themes, snippets, hotkeys, settings).

## What to do when asked to "install the Obsidian setup"

Run the installer. It copies `obsidian-config/` into the the-vibe-marketing-lab vault's `.obsidian/` folder:

```bash
bun install.ts
```

The script auto-locates the vault (sibling `../the-vibe-marketing-lab`, `~/Desktop/the-vibe-marketing-lab`, or any `/mnt/c/Users/*/Desktop/the-vibe-marketing-lab` on WSL). If it can't find it, pass the path:

```bash
bun install.ts --vault=/full/path/to/the-vibe-marketing-lab
```

After install, tell the user to reload Obsidian: Command Palette → **Reload app without saving** (loads the newly enabled community plugins). It only takes effect once the vault is open in Obsidian.

## When asked to "update / sync the Obsidian setup"

The user changed something in Obsidian and wants it captured back into this repo:

```bash
bun sync.ts
git add -A && git commit -m "sync obsidian config" && git push
```

## Rules

- bun always (never npm/npx/node). Scripts are dependency-free TypeScript run via `bun`.
- Never commit `workspace.json` / `workspace-mobile.json` — they are per-device window layout and are excluded by both scripts.
- Never put vault notes in this repo. Config only.
- Plugin binaries (`main.js`) are committed on purpose so installs are deterministic and offline.
