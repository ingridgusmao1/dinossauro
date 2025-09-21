import { Pool, QueryResult, QueryResultRow } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "ingrid",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "jurashow_db", 
  password: process.env.DB_PASSWORD || "123",
  port: parseInt(process.env.DB_PORT || "5432"),
});

export const query = async <T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> => {
  const client = await pool.connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } catch (error) {
    console.error("Erreur de requête:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("Connecté au PostgreSQL!");
    client.release();
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    process.exit(1);
  }
};

export default pool;