import "dotenv/config";
import express from "express";
import cors from "cors";
import { kpisRouter } from "./routes/kpis.js";
import { productsRouter } from "./routes/products.js";
import { priceIntegrityRouter } from "./routes/price-integrity.js";
import { availabilityRouter } from "./routes/availability.js";
import { mapViolationsRouter } from "./routes/map-violations.js";
import { scraperHealthRouter } from "./routes/scraper-health.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/kpis", kpisRouter);
app.use("/api/products", productsRouter);
app.use("/api/price-integrity", priceIntegrityRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/map-violations", mapViolationsRouter);
app.use("/api/scraper-health", scraperHealthRouter);

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
