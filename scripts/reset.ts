import fs from "node:fs";
import { config } from "@/lib/config";
import { createDatabase } from "@/lib/database";

for (const suffix of ["", "-shm", "-wal"]) {
  fs.rmSync(`${config.databasePath}${suffix}`, { force: true });
}
const database = createDatabase(config.databasePath);
database.close();
console.log(`Reset and seeded ${config.databasePath}`);
