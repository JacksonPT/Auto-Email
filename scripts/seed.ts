import { createDatabase } from "@/lib/database";
import { config } from "@/lib/config";

const database = createDatabase(config.databasePath);
database.close();
console.log(`Seeded ${config.databasePath}`);
