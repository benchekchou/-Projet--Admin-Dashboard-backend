import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import "./cron/backUpCron.js"
// import "./cron/reindexCron.js"
import { fileURLToPath } from "url";
import path from 'path';

// === Swagger ===
import { specs, swaggerUi } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import authRoutes from './router/authRoutes.js';
import marketplaceRoutes from './router/marketPlaceRoute.js';
import inventaireRoutes from "./router/inventaireRoutes.js"
import slotsRouter from "./router/slotsRouter.js";
import packsRouter from "./router/packsRouter.js"
import sanitizeInput from './middlware/sanitizeInput.js';
// import { globalRateLimit } from './middlware/globaleRateLimit.js'; 
import rewardsRouter from "./router/rewardsRouter.js"
import rateLimitRouter from './router/rateLimitRouter.js';
import mediaRouter from "./router/mediaRouter.js";
import usersRouter from "./router/usersRouter.js";
import usersAdminRouter from "./router/usersAdminRouter.js";
import statistiqueRouter from "./router/statistiqueRouter.js";

// Middleware
app.use(cors())
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(helmet());
app.use(express.json());
app.use(sanitizeInput);

// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("",authRoutes);
app.use("",marketplaceRoutes);
app.use("",inventaireRoutes);
app.use("",slotsRouter);
app.use("",packsRouter);
app.use("",rewardsRouter);
app.use("",rateLimitRouter);
app.use("",mediaRouter);
app.use("",usersRouter);
app.use("",usersAdminRouter);
app.use("",statistiqueRouter);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
