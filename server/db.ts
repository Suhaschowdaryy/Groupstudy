import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

// Check if we're using Neon or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('neon.database');

let db: any;
let pool: any;

if (!process.env.DATABASE_URL) {
  // Fallback to local PostgreSQL for development
  const fallbackUrl = process.env.NODE_ENV === 'production' 
    ? undefined 
    : 'postgresql://postgres:password@localhost:5432/studypod';
  
  if (!fallbackUrl) {
    throw new Error(
      "DATABASE_URL must be set. For local development, you can use: postgresql://postgres:password@localhost:5432/studypod"
    );
  }
  
  console.log('Using fallback local PostgreSQL database');
  pool = new NodePool({ connectionString: fallbackUrl });
  db = drizzleNode(pool, { schema });
} else if (isNeonDatabase) {
  // Use Neon serverless configuration
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('Using Neon serverless database');
} else {
  // Use regular PostgreSQL configuration
  pool = new NodePool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNode(pool, { schema });
  console.log('Using regular PostgreSQL database');
}

export { pool, db };