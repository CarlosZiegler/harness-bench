import { mkdir, readdir, readFile, stat, writeFile, cp, rm, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export async function exists(p: string) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(p: string): Promise<T> {
  return JSON.parse(await readFile(p, "utf8")) as T;
}

export async function writeJson(p: string, data: unknown) {
  await ensureDir(path.dirname(p));
  await writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function writeText(p: string, data: string) {
  await ensureDir(path.dirname(p));
  await writeFile(p, data, "utf8");
}

export async function readText(p: string) {
  return readFile(p, "utf8");
}

export async function copyDir(src: string, dest: string) {
  await cp(src, dest, { recursive: true, force: true });
}

export async function removePath(p: string) {
  await rm(p, { recursive: true, force: true });
}

export async function listFilesRecursive(
  root: string,
  opts: { ignore?: RegExp[] } = {},
): Promise<string[]> {
  const ignore = opts.ignore ?? [
    /node_modules/,
    /\.git/,
    /\.turbo/,
    /\.output/,
    /dist/,
    /\.tanstack/,
    /bun\.lock/,
    /package-lock\.json/,
  ];
  const out: string[] = [];

  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = path.relative(root, full);
      if (ignore.some((r) => r.test(rel))) continue;
      if (e.isDirectory()) await walk(full);
      else out.push(rel);
    }
  }

  if (await exists(root)) await walk(root);
  return out;
}

export async function fileStatSafe(p: string) {
  try {
    return await stat(p);
  } catch {
    return null;
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
