import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const pkgPath = path.join(repoRoot, "package.json");

function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }
function writeJSON(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n"); }

const devDeps = {
  "typescript": "^5.6.2",
  "vitest": "^2.1.2",
  "@types/node": "^22.7.4",
  "jsdom": "^25.0.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/jest-dom": "^6.5.0",
  "@playwright/test": "^1.48.0",
  "playwright": "^1.48.0",
  "eslint": "^9.9.0",
  "@typescript-eslint/parser": "^8.8.0",
  "@typescript-eslint/eslint-plugin": "^8.8.0",
  "eslint-config-prettier": "^9.1.0",
  "prettier": "^3.3.3",
  "cross-env": "^7.0.3"
};

const addScripts = {
  "typecheck": "tsc --noEmit",
  "test": "vitest run --reporter=dot",
  "test:watch": "vitest",
  "e2e:headless": "cross-env E2E=1 playwright test --reporter=line",
  "lint": "eslint ."
};

function merge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (out[k] === undefined) out[k] = v;
  }
  return out;
}

function main() {
  if (!fs.existsSync(pkgPath)) {
    console.error("[updatePackageJson] package.json не найден.");
    process.exit(2);
  }
  const pkg = readJSON(pkgPath);

  pkg.engines = pkg.engines || {};
  if (!pkg.engines.node) pkg.engines.node = ">=22.18.0";

  pkg.scripts = merge(pkg.scripts || {}, addScripts);
  pkg.devDependencies = merge(pkg.devDependencies || {}, devDeps);

  writeJSON(pkgPath, pkg);
  console.log("[updatePackageJson] Обновлён package.json (scripts/devDependencies/engines).");
}

main();
