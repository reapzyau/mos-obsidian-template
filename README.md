# mos-obsidian-template

My Obsidian setup, packaged so you can install it into your own vault in one command. Theme, plugins, hotkeys, folder icons, CSS snippets, and settings, exactly as I run them.

Part of the [MarketingOS](https://github.com/the-vibe-marketing-lab/marketing-os) setup. Every brain that `mos onboard` creates already opens as a basic Obsidian vault. This template is the full version: install it when you want the vault to look and behave like mine.

**It never deletes your stuff.** The installer merges by default: your existing settings win on every conflict, your plugins stay enabled, and your whole `.obsidian` folder is backed up first. The only thing it changes outright is the theme, because that is what you came for.

> Formerly `tvml-obsidian`. Old clone URLs redirect, but update your remote (see the bottom of this file).

## Install it with your AI agent

Paste this into Claude Code, Codex, Cursor, or any agent with shell access. It will ask you one question, then do the rest.

```text
Install the Obsidian template at https://github.com/reapzyau/mos-obsidian-template into my Obsidian vault. Follow these steps exactly. Do not add steps, and do not change my notes.

1. Work out which vaults I have, then ASK ME which one to install into. Stop and wait for my answer.
   - If the `obsidian` CLI is available, run `obsidian vaults` to list them by name.
   - To turn a vault name into a path, read Obsidian's own registry and match the folder name:
     macOS   ~/Library/Application Support/obsidian/obsidian.json
     Windows %APPDATA%\obsidian\obsidian.json
     Linux   ~/.config/obsidian/obsidian.json
   - If none of that works, just ask me for the full path to the vault folder.

2. Check that `bun` is installed (`bun --version`). If it is missing, install it from https://bun.sh and then continue.

3. Clone the template somewhere temporary and enter it:
   git clone https://github.com/reapzyau/mos-obsidian-template.git
   cd mos-obsidian-template

4. Show me the plan first, and do not write anything yet:
   bun install.ts --vault="<the path from step 1>" --dry-run

5. Once I have seen the plan, run it for real:
   bun install.ts --vault="<the path from step 1>"

   This merges. My existing settings win on every conflict, my enabled plugins stay enabled, and my `.obsidian` folder is copied to a timestamped backup first. Never pass --replace or --no-backup unless I explicitly ask for them.

6. Tell me to reload Obsidian so the plugins and theme load: Command Palette (Ctrl/Cmd+P) -> "Reload app without saving". Also tell me where the backup folder is, and that I can delete it once I am happy.

Report what changed, and stop. Do not edit any of my notes or any file outside the vault's .obsidian folder.
```

Agents sometimes want to be helpful and "clean up" the vault. The prompt above is worded to stop that. If yours goes off-script, the backup from step 5 is a complete copy of your previous config.

## What you get

- **Theme**: [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino) in dark mode, set as the active theme. Needs Obsidian 1.13.4 or newer. Obsidianite, Minimal, Things, Tokyo Night, Typewriter and Wasp ship alongside it so you can switch.
- **Community plugins**, with their files committed so installs are offline and deterministic:

  | Plugin | What it does |
  |---|---|
  | Excalidraw | Sketching and diagrams inside the vault |
  | Git File Explorer Colors | Colours files by git status |
  | Hide Empty Folders | Hides folders with nothing visible in them |
  | Hot Reload | Reloads plugins you are developing |
  | HTML Reader | Opens `.html` files as documents |
  | Iconize | Icons on folders and files |

- **CSS snippet**: `hide-claude-code-items.css`, which hides agent machinery from the file explorer
- **Settings**: appearance, core plugins, hotkeys, graph view, web viewer, app config
- **Folder icon mappings** for Iconize

This repo is **config only**. It writes to `<your vault>/.obsidian/` and never touches your notes.

`workspace.json` (window and pane layout) is deliberately excluded. It is per-device and noisy; Obsidian regenerates it.

## Install it yourself

Requirements: [bun](https://bun.sh) and the path to your vault.

```bash
git clone https://github.com/reapzyau/mos-obsidian-template.git
cd mos-obsidian-template

# See what would change. Writes nothing.
bun install.ts --vault=/full/path/to/your-vault --dry-run

# Do it.
bun install.ts --vault=/full/path/to/your-vault
```

Then reload Obsidian: Command Palette → **Reload app without saving**.

If you omit `--vault=`, the installer checks `$MOS_VAULT`, then `$TVML_VAULT`, then looks for a folder named `the-vibe-marketing-lab` beside the repo, on your Desktop, or under any Windows user's Desktop from WSL. That last one is my own vault name, so you will almost always want to pass `--vault=` explicitly.

### What merging actually does

| File | Rule |
|---|---|
| `appearance.json` | Theme and dark mode are **set by the template**. Your enabled CSS snippets are kept and the template's are added. Other keys of yours are untouched. |
| `community-plugins.json` | Union. The template's plugins are enabled; **none of yours are ever disabled**. |
| `core-plugins.json`, `hotkeys.json`, `graph.json`, `app.json`, `webviewer.json` | Your value wins for every key you already have. The template only adds keys you are missing. A hotkey you have bound is never reassigned. |
| `plugins/`, `themes/`, `snippets/` | Files are added. Nothing of yours is deleted. |
| A plugin's `data.json` | **Kept**, if you already had that plugin. Those are your settings for it, like your Iconize folder icons. |
| `workspace.json` | Never touched. |

Before any of that, the whole `.obsidian` folder is copied to `.obsidian.backup-<timestamp>`.

### Flags

| Flag | Effect |
|---|---|
| `--vault=<path>` | The vault to install into |
| `--dry-run` | Print the plan, write nothing |
| `--replace` | Overwrite config files wholesale, for an exact copy of my setup. Skips the merge rules above. |
| `--no-backup` | Skip the backup. Not recommended. |

## Keeping your own changes

Once installed, the config lives in your vault and is yours. Change plugins, themes, or hotkeys in Obsidian as normal.

Re-running the installer later is safe: merge mode keeps whatever you have changed, and only fills in anything new the template has added since.

## Updating the template (maintainer workflow)

`sync.ts` pulls the live `.obsidian/` from my vault back into `obsidian-config/`:

```bash
bun sync.ts --vault=/full/path/to/vault
git add -A && git commit -m "sync obsidian config" && git push
```

On another device: `git pull && bun install.ts --vault=...`, then reload Obsidian.

## Migrating from `tvml-obsidian`

If you cloned this repo under its old name:

```bash
git remote set-url origin https://github.com/reapzyau/mos-obsidian-template.git
```

Nothing else changes. The scripts and config layout are the same.
