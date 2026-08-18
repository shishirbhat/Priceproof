import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pool } from "./client.js";

const schemaPath = fileURLToPath(new URL("../../../db/schema.sql", import.meta.url));

async function migrate() {
  const sql = readFileSync(schemaPath, "utf8");
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Schema applied from db/schema.sql");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
