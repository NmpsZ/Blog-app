import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const commands = [
  ["run", "dev:backend"],
  ["run", "dev:frontend"]
];

const children = commands.map((args) =>
  spawn(npmCommand, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  })
);

function stopAll(signal) {
  for (const child of children) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll("SIGTERM");
      process.exit(code);
    }
  });
}
