#!/usr/bin/env bun
// Refreshes the captured snapshot FROM the live the-vibe-marketing-lab vault.
// Run this after you change plugins/themes/hotkeys in Obsidian, then commit + push.
// Usage:  bun sync.ts [--vault=/path/to/the-vibe-marketing-lab] [--dry-run]

import { existsSync, cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const CONFIG_DEST = join(REPO_ROOT, "obsidian-config");
const VAULT_NAME = "the-vibe-marketing-lab";

// Per-device files we never capture into the repo.
const EXCLUDE = new Set(["workspace.json", "workspace-mobile.json", "workspace"]);

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
    `Could not locate the "${VAULT_NAME}" vault. Pass --vault=/full/path/to/${VAULT_NAME}`,
  );
}

function main() {
  const vault = findVault();
  const src = join(vault, ".obsidian");
  if (!existsSync(src)) throw new Error(`No .obsidian folder in ${vault}`);

  console.log(`Vault:    ${vault}`);
  console.log(`Snapshot: ${CONFIG_DEST}`);
  if (dryRun) console.log("(dry run — no files will be written)\n");

  // Rebuild the snapshot from scratch so deletions in the vault propagate.
  if (!dryRun && existsSync(CONFIG_DEST)) rmSync(CONFIG_DEST, { recursive: true, force: true });
  if (!dryRun) mkdirSync(CONFIG_DEST, { recursive: true });

  for (const name of readdirSync(src)) {
    if (EXCLUDE.has(name)) {
      console.log(`  exclude   ${name}`);
      continue;
    }
    console.log(`  capture   ${name}`);
    if (!dryRun) cpSync(join(src, name), join(CONFIG_DEST, name), { recursive: true, force: true });
  }

  console.log("\nSnapshot refreshed. Commit + push to share across devices:");
  console.log("  git add -A && git commit -m \"sync obsidian config\" && git push");
}

main();
