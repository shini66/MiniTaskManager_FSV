import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const env = {
    PORT: process.env.PORT || 3050,
    HOST: process.env.HOST || '127.0.0.1',
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
    JWT_SECRET: process.env.JWT_SECRET || "some_secret_key",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
}