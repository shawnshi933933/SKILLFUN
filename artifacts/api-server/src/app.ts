import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import pinoHttp from "pino-http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import router from "./routes/index.js";
import mcpHandlerRouter from "./routes/mcp-handler.js";
import { logger } from "./lib/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware (signed cookie, SESSION_SECRET from Replit Secrets)
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Serve static public assets (e.g. NFT logo image)
app.use("/api/static", express.static(join(__dirname, "../public")));

app.use("/api", router);

// MCP JSON-RPC 2.0 gateway — path-based multi-tenant, no session required
app.use("/mcp", mcpHandlerRouter);

export default app;
