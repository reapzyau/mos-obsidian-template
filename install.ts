#!/usr/bin/env bun
// Installs this Obsidian template into a vault.
//
// Usage:
//   bun install.ts --vault=/path/to/vault [--dry-run] [--replace] [--no-backup]
//
// Default mode is MERGE: your existing settings win on every conflict, and this
// template only fills in what you do not already have. The one deliberate
// exception is the theme (appearance.json theme + cssTheme), because installing
// this template is a request for its look.
//
// --replace   overwrite config files wholesale (an exact copy of the author's setup)
// --no-backup skip the timestamped .obsidian backup (not recommended)
// --dry-run   print what would happen, write nothing
//
// Vault resolution: --vault arg > $MOS_VAULT > $TVML_VAULT > sibling
// ../the-vibe-marketing-lab > ~/Desktop/the-vibe-marketing-lab >
// /mnt/c/Users/*/Desktop/the-vibe-marketing-lab (WSL).

import {
  existsSync,
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const CONFIG_SRC = join(REPO_ROOT, "obsidian-config");
const VAULT_NAME = "the-vibe-marketing-lab";

// Per-device files. Never written, never captured.
const PRESERVE = new Set(["workspace.json", "workspace-mobile.json"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const replace = args.includes("--replace");
const noBackup = args.includes("--no-backup");

function argVault(): string | undefined {
  for (const a of args) {
    if (a.startsWith("--vault=")) return a.slice("--vault=".length);
    if (!a.startsWith("--")) return a;
  }
  return undefined;
}

function wslDesktopCandidates(): string[] {
  const base = "/mnt/c/Users";
  if (!existsSync(base)) return [];
  try {
    return readdirSync(base)
      .map((u) => join(base, u, "Desktop", VAULT_NAME))
      .filter((p) => existsSync(p));
  } catch {
    return [];
  }
}

function findVault(): string {
  const candidates = [
    argVault(),
    process.env.MOS_VAULT,
    process.env.TVML_VAULT,
    resolve(REPO_ROOT, "..", VAULT_NAME),
    join(homedir(), "Desktop", VAULT_NAME),
    ...wslDesktopCandidates(),
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (existsSync(c)) return resolve(c);
  }
  throw new Error(
    `Could not locate a vault.\n` +
      `Pass one explicitly:  bun install.ts --vault=/full/path/to/your-vault`,
  );
}

function readJson(path: string): Record<string, unknown> | unknown[] | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    console.log(`  warn      ${path} is not valid JSON — leaving it untouched`);
    return undefined as never;
  }
}

function writeJson(path: string, value: unknown) {
  if (dryRun) return;
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

/** Existing keys always win; the template only fills gaps. */
function gapFill(
  mine: Record<string, unknown>,
  theirs: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!theirs) return { ...mine };
  const out = { ...theirs };
  for (const [k, v] of Object.entries(mine)) {
    if (!(k in out)) out[k] = v;
  }
  return out;
}

function mergeAppearance(
  mine: Record<string, unknown>,
  theirs: Record<string, unknown> | null,
): Record<string, unknown> {
  const out = gapFill(mine, theirs);
  // The theme is the point of this template, so it wins.
  if ("theme" in mine) out.theme = mine.theme;
  if ("cssTheme" in mine) out.cssTheme = mine.cssTheme;
  // Snippets are additive — never drop one the user enabled.
  const a = Array.isArray(theirs?.enabledCssSnippets) ? (theirs!.enabledCssSnippets as string[]) : [];
  const b = Array.isArray(mine.enabledCssSnippets) ? (mine.enabledCssSnippets as string[]) : [];
  out.enabledCssSnippets = [...new Set([...a, ...b])];
  return out;
}

function mergeCommunityPlugins(mine: unknown, theirs: unknown): string[] {
  const a = Array.isArray(theirs) ? (theirs as string[]) : [];
  const b = Array.isArray(mine) ? (mine as string[]) : [];
  return [...new Set([...a, ...b])];
}

/** Copy a directory in without deleting anything already there. */
function mergeDir(from: string, to: string, opts: { keepDataJson: boolean }) {
  if (!dryRun) mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = join(from, entry);
    const dest = join(to, entry);
    if (statSync(src).isDirectory()) {
      const existed = existsSync(dest);
      if (!dryRun) mkdirSync(dest, { recursive: true });
      for (const file of readdirSync(src)) {
        const f = join(src, file);
        const d = join(dest, file);
        // A plugin's data.json is the user's own settings for that plugin.
        if (opts.keepDataJson && file === "data.json" && existed && existsSync(d)) {
          console.log(`      keep    ${entry}/data.json (your plugin settings)`);
          continue;
        }
        if (!dryRun) cpSync(f, d, { recursive: true, force: true });
      }
      console.log(`      ${existed ? "update" : "add   "}  ${entry}`);
    } else {
      if (!dryRun) cpSync(src, dest, { force: true });
      console.log(`      add     ${entry}`);
    }
  }
}

function backup(dest: string): string | null {
  if (noBackup || !existsSync(dest)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const path = `${dest}.backup-${stamp}`;
  if (!dryRun) cpSync(dest, path, { recursive: true });
  return path;
}

function main() {
  if (!existsSync(CONFIG_SRC)) {
    throw new Error(`Missing snapshot folder: ${CONFIG_SRC}`);
  }

  const vault = findVault();
  const dest = join(vault, ".obsidian");
  const fresh = !existsSync(dest);

  console.log(`Vault:   ${vault}`);
  console.log(`Target:  ${dest}`);
  console.log(`Mode:    ${replace ? "replace (overwrite config)" : "merge (your settings win)"}`);
  if (dryRun) console.log("(dry run — nothing will be written)");
  console.log("");

  const backupPath = backup(dest);
  if (backupPath) console.log(`Backup:  ${backupPath}\n`);

  if (!dryRun) mkdirSync(dest, { recursive: true });

  for (const name of readdirSync(CONFIG_SRC)) {
    if (PRESERVE.has(name)) {
      console.log(`  skip      ${name} (per-device, left as-is)`);
      continue;
    }

    const from = join(CONFIG_SRC, name);
    const to = join(dest, name);

    if (statSync(from).isDirectory()) {
      console.log(`  install   ${name}/`);
      mergeDir(from, to, { keepDataJson: !replace && name === "plugins" });
      continue;
    }

    if (replace || fresh || !existsSync(to)) {
      console.log(`  install   ${name}`);
      if (!dryRun) cpSync(from, to, { force: true });
      continue;
    }

    // Merge mode, file already exists.
    const mine = readJson(from);
    const theirs = readJson(to);
    if (mine === undefined || theirs === undefined) continue;

    if (name === "community-plugins.json") {
      const merged = mergeCommunityPlugins(mine, theirs);
      const added = merged.length - (Array.isArray(theirs) ? theirs.length : 0);
      console.log(`  merge     ${name} (+${added} plugin${added === 1 ? "" : "s"} enabled, none disabled)`);
      writeJson(to, merged);
    } else if (name === "appearance.json") {
      const merged = mergeAppearance(
        mine as Record<string, unknown>,
        theirs as Record<string, unknown>,
      );
      console.log(`  merge     ${name} (theme -> ${merged.cssTheme}, snippets kept)`);
      writeJson(to, merged);
    } else {
      const before = Object.keys((theirs ?? {}) as object).length;
      const merged = gapFill(
        mine as Record<string, unknown>,
        theirs as Record<string, unknown>,
      );
      const added = Object.keys(merged).length - before;
      console.log(`  merge     ${name} (+${added} new key${added === 1 ? "" : "s"}, yours untouched)`);
      writeJson(to, merged);
    }
  }

  console.log("\nDone. Reload Obsidian so it picks up the plugins and theme:");
  console.log('  Command Palette (Ctrl/Cmd+P) -> "Reload app without saving"');
  if (backupPath) {
    console.log(`\nYour previous config is at:\n  ${backupPath}`);
    console.log("Delete it once you are happy.");
  }
  console.log(`\nIf the vault is not open yet: Obsidian -> Open folder as vault -> ${vault}`);
}

main();
