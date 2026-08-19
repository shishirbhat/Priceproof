import "dotenv/config";
import express from "express";
import cors from "cors";
import { kpisRouter } from "./routes/kpis.js";
import { listingsRouter } from "./routes/listings.js";
import { marketValueRouter } from "./routes/market-value.js";
import { marketActivityRouter } from "./routes/market-activity.js";
import { crossPortalRouter } from "./routes/cross-portal.js";
import { scraperHealthRouter } from "./routes/scraper-health.js";
import { catalogRouter } from "./routes/catalog.js";
import { alertsRouter } from "./routes/alerts.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/kpis", kpisRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/market-value", marketValueRouter);
app.use("/api/market-activity", marketActivityRouter);
app.use("/api/cross-portal", crossPortalRouter);
app.use("/api/scraper-health", scraperHealthRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/alerts", alertsRouter);

// Centralized error handler so a query failure returns JSON, not an HTML
// stack trace, and doesn't crash the process — every route above is async
// and can throw.
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  },
);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`PriceProof API listening on http://localhost:${port}`);
});
