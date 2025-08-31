import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Maximum number of connections in the pool
  acquireTimeout: 20000, // Timeout for acquiring a connection (20 seconds)
});

pool
  .getConnection()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

export default pool;
