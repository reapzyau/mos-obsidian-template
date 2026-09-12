# mos-obsidian-template

Portable snapshot of my Obsidian setup (formerly `tvml-obsidian`), published so MarketingOS users can install it into their own vault. Notes are NOT stored here — only the `.obsidian` config (theme, plugins, snippets, hotkeys, settings).

## When asked to "install the Obsidian setup"

The installer writes `obsidian-config/` into a vault's `.obsidian/` folder.

```bash
bun install.ts --vault=/full/path/to/vault --dry-run   # show the plan
bun install.ts --vault=/full/path/to/vault             # do it
```

Always run `--dry-run` first and show the user the plan.

If `--vault=` is omitted the script checks `$MOS_VAULT`, `$TVML_VAULT`, a sibling `../the-vibe-marketing-lab`, `~/Desktop/the-vibe-marketing-lab`, then any `/mnt/c/Users/*/Desktop/the-vibe-marketing-lab` on WSL. For anyone who is not me, pass `--vault=` explicitly.

After installing, tell the user to reload Obsidian: Command Palette → **Reload app without saving**. It only takes effect once the vault is open in Obsidian. Also point them at the backup folder the installer created.

The README carries a copy-paste prompt for agents doing this install. If the install flow changes, update that prompt too.

## Merge is the default, and it must stay that way

The installer never destroys a user's config. Merge rules, all implemented in `install.ts`:

- The whole `.obsidian` folder is copied to `.obsidian.backup-<timestamp>` before anything is written.
- `appearance.json` — the template sets `theme` and `cssTheme` (that is the point of installing it). `enabledCssSnippets` is a union. Every other key of theirs survives.
- `community-plugins.json` — union. Never disables a plugin the user had enabled.
- Every other JSON file — the user's value wins for keys they already have; the template only fills gaps. A hotkey they have bound is never reassigned.
- `plugins/`, `themes/`, `snippets/` — additive. Nothing is deleted.
- A plugin's `data.json` is kept when the user already had that plugin. It holds their settings for it.
- `workspace.json` / `workspace-mobile.json` — never read, never written.

`--replace` restores the old overwrite-everything behaviour, and `--no-backup` skips the backup. Only use either when the user explicitly asks.

## When asked to "update / sync the Obsidian setup"

I changed something in Obsidian and want it captured back into this repo:

```bash
bun sync.ts --vault=/full/path/to/vault
git add -A && git commit -m "sync obsidian config" && git push
```

## Rules

- bun always (never npm/npx/node). Scripts are dependency-free TypeScript run via `bun`.
- Never commit `workspace.json` / `workspace-mobile.json` — per-device window layout, excluded by both scripts.
- Never put vault notes in this repo. Config only.
- Plugin binaries (`main.js`) are committed on purpose so installs are deterministic and offline.
- Theme files are vendored at a pinned upstream version for the same reason.
