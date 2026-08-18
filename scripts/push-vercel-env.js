const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(".env.local", "utf8");
const env = {};

for (const line of src.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index < 0) continue;
  const key = trimmed.slice(0, index);
  let value = trimmed.slice(index + 1);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

env.LLM_PROVIDER = "test";

const sensitive = new Set([
  "UAU_SENHA",
  "UAU_INTEGRATION_TOKEN",
  "AUTH_ADMIN_PASSWORD",
  "AUTH_SECRET",
]);

const keys = [
  "UAU_BASE_URL",
  "UAU_API_VERSION",
  "UAU_USUARIO",
  "UAU_SENHA",
  "UAU_INTEGRATION_TOKEN",
  "UAU_EMPRESA",
  "UAU_ORCAMENTO",
  "UAU_MOCK",
  "LLM_PROVIDER",
  "TEST_LLM_FLAGGED_CATEGORY",
  "AUTH_ADMIN_USER",
  "AUTH_ADMIN_PASSWORD",
  "AUTH_SECRET",
];

const vercel = process.execPath;
const vercelScript = path.join("node_modules", "vercel", "dist", "vc.js");

for (const key of keys) {
  const value = env[key];
  if (value === undefined) {
    console.log("skip missing", key);
    continue;
  }
  const environments = sensitive.has(key)
    ? "production,preview"
    : "production,preview,development";
  const args = [
    vercelScript,
    "env",
    "add",
    key,
    environments,
    "--yes",
    "--force",
    sensitive.has(key) ? "--sensitive" : "--no-sensitive",
    "--value",
    value,
  ];
  console.log("adding", key, "->", environments);
  execFileSync(vercel, args, { stdio: "inherit" });

  if (sensitive.has(key)) {
    const devArgs = [
      vercelScript,
      "env",
      "add",
      key,
      "development",
      "--yes",
      "--force",
      "--no-sensitive",
      "--value",
      value,
    ];
    console.log("adding", key, "-> development");
    execFileSync(vercel, devArgs, { stdio: "inherit" });
  }
}
