# mos-obsidian-template

My Obsidian setup, packaged so you can install it into your own MarketingOS brain in one command. Themes, plugins, hotkeys, folder icons, CSS snippets, and settings, exactly as I run them.

Part of the [MarketingOS](https://github.com/the-vibe-marketing-lab/marketing-os) setup. Every brain that `mos onboard` creates already opens as a basic Obsidian vault (three plugins, default theme). This template is the full version: install it when you want the vault to look and behave like mine.

> Formerly `tvml-obsidian`. Old clone URLs redirect, but update your remote (see below).

## What you get

- **Community plugins**, with their files committed so installs are offline and deterministic: Excalidraw (`obsidian-excalidraw-plugin`), Git File Explorer Colors, Hide Empty Folders, Hot Reload, HTML Reader (`obsidian-html-plugin`), Iconize (`obsidian-icon-folder`)
- **Themes**: Obsidianite (active), Minimal, Things, Tokyo Night, Typewriter, Wasp
- **CSS snippets**: `hide-claude-code-items.css`, which hides agent machinery (`.claude`, workspace files) from the file explorer
- **Settings**: appearance, core plugins, hotkeys, graph view, web viewer, app config
- **Folder icon mappings** for the Iconize plugin

This repo is **config only**. It writes to `<your brain>/.obsidian/` and never touches your notes.

`workspace.json` (window and pane layout) is deliberately excluded. It is per-device and noisy; Obsidian regenerates it.

## Install into your brain

Requirements: [bun](https://bun.sh) and a MarketingOS brain folder on this machine.

```bash
# 1. Clone the template anywhere
git clone https://github.com/reapzyau/mos-obsidian-template.git
cd mos-obsidian-template

# 2. Preview what will be written (nothing is changed yet)
bun install.ts --vault=/full/path/to/your-brain --dry-run

# 3. Install
bun install.ts --vault=/full/path/to/your-brain
```

Then open the brain in Obsidian (**File → Open vault → Open folder as vault**) and reload so the community plugins load: Command Palette → **Reload app without saving**.

Run the installer again any time. It overwrites the config files it ships and leaves your `workspace.json` alone.

### Vault auto-detection

If you omit `--vault=`, the installer checks `$TVML_VAULT`, then looks for a folder named `the-vibe-marketing-lab` next to this repo, on your Desktop, or under any Windows user's Desktop from WSL. That is my own vault name, so as a MarketingOS user you will almost always pass `--vault=` explicitly.

## Keeping your own changes

Once installed, the config lives in your brain and is yours. Change plugins, themes, or hotkeys in Obsidian as normal; those edits stay in `<your brain>/.obsidian/`, which MarketingOS brains track in git.

Re-running `bun install.ts` later resets the shipped files to this template's versions. Run `--dry-run` first if you have customised things.

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
