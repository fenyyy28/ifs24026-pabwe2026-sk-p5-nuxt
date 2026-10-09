import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadEnv(path = ".env") {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)?\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    env[m[1]] = (m[2] ?? "").replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const port = env.APP_PORT || "3000";
const run = (args) =>
  spawnSync("bunx", ["--bun", "nuxt", ...args], {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

if (!process.argv.includes("--no-build")) {
  const build = run(["build"]);
  if (build.status !== 0) process.exit(build.status ?? 1);
}

console.log(`Preview berjalan di http://localhost:${port}`);
const preview = run(["preview", "--port", port]);
process.exit(preview.status ?? 0);