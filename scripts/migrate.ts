import { createDatabase } from "@/lib/database";
import { config } from "@/lib/config";

const database = createDatabase(config.databasePath, { seed: false });
database.close();
console.log(`Migrated ${config.databasePath}`);
