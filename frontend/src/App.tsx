import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/domain/ErrorBoundary";
import { LoadingState } from "@/components/domain/QueryState";

// Route-level code splitting — the chart stack (bklit/visx) and the
// landing page's canvas/anime.js hero are each only downloaded once their
// route is actually visited, instead of one monolithic bundle up front.
const CommandCenter = lazy(() => import("@/pages/CommandCenter").then((m) => ({ default: m.CommandCenter })));
const PriceIntegrity = lazy(() => import("@/pages/PriceIntegrity").then((m) => ({ default: m.PriceIntegrity })));
const CompetitiveLandscape = lazy(() =>
  import("@/pages/CompetitiveLandscape").then((m) => ({ default: m.CompetitiveLandscape })),
);
const Availability = lazy(() => import("@/pages/Availability").then((m) => ({ default: m.Availability })));
const MapViolations = lazy(() => import("@/pages/MapViolations").then((m) => ({ default: m.MapViolations })));
const Alerts = lazy(() => import("@/pages/Alerts").then((m) => ({ default: m.Alerts })));
const ScraperHealth = lazy(() => import("@/pages/ScraperHealth").then((m) => ({ default: m.ScraperHealth })));
const CatalogManagement = lazy(() =>
  import("@/pages/CatalogManagement").then((m) => ({ default: m.CatalogManagement })),
);
const ProductDetail = lazy(() => import("@/pages/ProductDetail").then((m) => ({ default: m.ProductDetail })));
const Landing = lazy(() => import("@/pages/Landing").then((m) => ({ default: m.Landing })));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingState label="Loading page" />
    </div>
  );
}

function DashboardRoutes() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes location={location}>
                <Route path="/" element={<CommandCenter />} />
                <Route path="/price-integrity" element={<PriceIntegrity />} />
                <Route path="/competitive-landscape" element={<CompetitiveLandscape />} />
                <Route path="/availability" element={<Availability />} />
                <Route path="/map-violations" element={<MapViolations />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/scraper-health" element={<ScraperHealth />} />
                <Route path="/catalog" element={<CatalogManagement />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/*" element={<DashboardRoutes />} />
      </Routes>
    </Suspense>
  );
}
