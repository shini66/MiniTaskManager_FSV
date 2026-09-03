import express from "express";
import cors from "cors";
import {env} from "./config/env.js";
import routers from "./routes/index.js";

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://minitaskback-one.vercel.app',
  'https://minitask-manager-fsv.vercel.app',
  env.FRONTEND_URL
];

const isAllowedOrigin = (origin) =>
  !origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => res.json({status: "API funcionando ✅"}));
app.use("/api", routers);

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
});

export default app;