#!/usr/bin/env bun
// Installs the captured Obsidian config into the the-vibe-marketing-lab vault.
// Usage:  bun install.ts [--vault=/path/to/the-vibe-marketing-lab] [--dry-run]
// Resolution order for the vault: --vault arg > $TVML_VAULT > sibling ../the-vibe-marketing-lab
// > ~/Desktop/the-vibe-marketing-lab > /mnt/c/Users/*/Desktop/the-vibe-marketing-lab (WSL).

import { existsSync, cpSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const CONFIG_SRC = join(REPO_ROOT, "obsidian-config");
const VAULT_NAME = "the-vibe-marketing-lab";

// Files we never overwrite on the target — they are per-device, not part of "the setup".
const PRESERVE = new Set(["workspace.json", "workspace-mobile.json"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

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
    process.env.TVML_VAULT,
    resolve(REPO_ROOT, "..", VAULT_NAME),
    join(homedir(), "Desktop", VAULT_NAME),
    ...wslDesktopCandidates(),
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (existsSync(c)) return resolve(c);
  }
  throw new Error(
    `Could not locate the "${VAULT_NAME}" vault.\n` +
      `Pass it explicitly:  bun install.ts --vault=/full/path/to/${VAULT_NAME}`,
  );
}

function main() {
  if (!existsSync(CONFIG_SRC)) {
    throw new Error(`Missing snapshot folder: ${CONFIG_SRC}`);
  }

  const vault = findVault();
  const dest = join(vault, ".obsidian");
  console.log(`Vault:   ${vault}`);
  console.log(`Target:  ${dest}`);
  if (dryRun) console.log("(dry run — no files will be written)\n");

  if (!dryRun) mkdirSync(dest, { recursive: true });

  for (const name of readdirSync(CONFIG_SRC)) {
    if (PRESERVE.has(name)) {
      console.log(`  preserve  ${name} (left as-is on this device)`);
      continue;
    }
    const from = join(CONFIG_SRC, name);
    const to = join(dest, name);
    console.log(`  install   ${name}`);
    if (!dryRun) cpSync(from, to, { recursive: true, force: true });
  }

  console.log("\nDone. Now reload Obsidian to load the plugins:");
  console.log("  Command Palette (Ctrl/Cmd+P) -> \"Reload app without saving\"");
  console.log(`If the vault isn't open yet: Obsidian -> Open folder as vault -> ${vault}`);
}

main();
