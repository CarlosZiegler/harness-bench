import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** packages/bench */
export const BENCH_PKG_ROOT = path.resolve(here, "../..");
/** monorepo root harness-bench */
export const REPO_ROOT = path.resolve(BENCH_PKG_ROOT, "../..");
export const APPS_DIR = path.join(REPO_ROOT, "apps");
export const RESULTS_DIR = path.join(REPO_ROOT, "results");
export const DOCS_DIR = path.join(REPO_ROOT, "docs");
export const CONFIG_DIR = path.join(BENCH_PKG_ROOT, "config");
export const PROMPTS_DIR = path.join(BENCH_PKG_ROOT, "prompts");
export const RUBRICS_DIR = path.join(BENCH_PKG_ROOT, "rubrics");
export const TEMPLATES_DIR = path.join(BENCH_PKG_ROOT, "templates");

export function appDir(appName: string) {
  return path.join(APPS_DIR, appName);
}

export function resultDir(slug: string) {
  return path.join(RESULTS_DIR, slug);
}
