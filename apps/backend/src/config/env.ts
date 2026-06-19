import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const candidates = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "../../.env")
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: false });
  }
}
