import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import process from "node:process";

const repoRoot = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.split("=");
  return [k.replace(/^--?/, ""), v ?? true];
}));

const expectedSha = args.expectedSha || args.ExpectedSha || "4d450f668c5b63f9d2270968abbafc353b460c47";
const runChecks = Boolean(args.runChecks || args.RunChecks);

function log(msg) { console.log(`[apply] {}`.replace("{}", msg)); }

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8", ...opts }).trim();
}

function ensureGitHeadMatches() {
  try {
    const head = sh("git rev-parse HEAD");
    if (head !== expectedSha) {
      console.error(`\n[apply] ОШИБКА: локальный HEAD = ${head}, ожидался = ${expectedSha}.`);
      console.error("[apply] Обновите expectedSha или переключитесь на верный коммит, затем повторите.");
      process.exit(2);
    }
    log(`HEAD OK: ${head}`);
  } catch (e) {
    console.error("[apply] Не удалось определить git HEAD. Убедитесь, что запускаете в корне репозитория.");
    process.exit(2);
  }
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function backupAndCopy(manifestPath) {
  const manifest = readJSON(manifestPath);
  const stamp = new Date().toISOString().replace(/[:.]/g, "").replace("T","_").slice(0,15);
  const backupRoot = path.join(repoRoot, ".backup", stamp);
  fs.mkdirSync(backupRoot, { recursive: true });
  log(`Бэкап папка: .backup/${stamp}`);

  for (const entry of manifest.files) {
    const src = path.join(repoRoot, entry.source);
    const dst = path.join(repoRoot, entry.target);
    if (!fs.existsSync(src)) {
      console.warn(`[apply] Пропуск: нет файла источника ${entry.source}`);
      continue;
    }
    // backup
    if (fs.existsSync(dst)) {
      const backupTarget = path.join(backupRoot, entry.target);
      fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
      fs.copyFileSync(dst, backupTarget);
    }
    // copy
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    log(`Разложен: ${entry.target}`);
  }
  return true;
}

function ensurePnpm() {
  try {
    const v = sh("pnpm -v");
    log(`pnpm: ${v}`);
  } catch (e) {
    console.error("[apply] pnpm не найден. Установите pnpm 9.x и повторите.");
    process.exit(2);
  }
}

function updatePackageJson() {
  const script = path.join(repoRoot, "scripts", "applyHelpers", "updatePackageJson.mjs");
  const r = spawnSync("node", [script], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error("[apply] Не удалось обновить package.json");
    process.exit(2);
  }
}

function runInstall() {
  const r = spawnSync("pnpm", ["install"], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 2);
}

function runChecksIfNeeded() {
  if (!runChecks) return;
  const cmds = [
    ["pnpm", ["test"]],
  ];
  for (const [cmd, args] of cmds) {
    const r = spawnSync(cmd, args, { stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status ?? 2);
  }
}

function main() {
  ensureGitHeadMatches();
  const manifestPath = path.join(repoRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("[apply] Не найден manifest.json рядом со скриптом. Убедитесь, что распаковали ZIP в корень.");
    process.exit(2);
  }
  backupAndCopy(manifestPath);
  ensurePnpm();
  updatePackageJson();
  runInstall();
  runChecksIfNeeded();
  log("Готово ✅");
}

main();
