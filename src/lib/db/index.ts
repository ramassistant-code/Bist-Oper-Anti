import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// Support both file: protocol and fallback to local file in project root
const rawUrl = process.env.LOCAL_DATABASE_URL;
const dbUrl = rawUrl && rawUrl.startsWith("file:")
  ? rawUrl
  : `file:${path.resolve(process.cwd(), "bist_operations_local.db")}`;

const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });
export * from "./schema";
