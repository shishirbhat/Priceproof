import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/domain/ErrorBoundary";
import { LoadingState } from "@/components/domain/QueryState";
import { FpsBadge } from "@/components/domain/FpsBadge";

// Route-level code splitting — the chart stack (bklit/visx) and the
// landing page's canvas/anime.js hero are each only downloaded once their
// route is actually visited, instead of one monolithic bundle up front.
const CommandCenter = lazy(() => import("@/pages/CommandCenter").then((m) => ({ default: m.CommandCenter })));
const MarketValue = lazy(() => import("@/pages/MarketValue").then((m) => ({ default: m.MarketValue })));
const CrossPortal = lazy(() => import("@/pages/CrossPortal").then((m) => ({ default: m.CrossPortal })));
const MarketActivity = lazy(() => import("@/pages/MarketActivity").then((m) => ({ default: m.MarketActivity })));
const Alerts = lazy(() => import("@/pages/Alerts").then((m) => ({ default: m.Alerts })));
const ScraperHealth = lazy(() => import("@/pages/ScraperHealth").then((m) => ({ default: m.ScraperHealth })));
const CatalogManagement = lazy(() =>
  import("@/pages/CatalogManagement").then((m) => ({ default: m.CatalogManagement })),
);
const ListingDetail = lazy(() => import("@/pages/ListingDetail").then((m) => ({ default: m.ListingDetail })));
// The front door. Shares the racing build's design language and motion
// tokens, applied to what this product actually does.
const Welcome = lazy(() => import("@/pages/Welcome").then((m) => ({ default: m.Welcome })));
// The original marketing landing, kept reachable rather than orphaned.
const Landing = lazy(() => import("@/pages/Landing").then((m) => ({ default: m.Landing })));
// The racing experience ships its own canvas renderer and full-page motion
// stack, so it stays behind its own split point rather than loading for
// every dashboard visitor.
const RacingHome = lazy(() => import("@/pages/RacingHome").then((m) => ({ default: m.RacingHome })));

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
                <Route path="/market-value" element={<MarketValue />} />
                <Route path="/cross-portal" element={<CrossPortal />} />
                <Route path="/market-activity" element={<MarketActivity />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/scraper-health" element={<ScraperHealth />} />
                <Route path="/catalog" element={<CatalogManagement />} />
                <Route path="/listings/:listingId" element={<ListingDetail />} />
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
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/welcome/classic" element={<Landing />} />
          <Route path="/racing" element={<RacingHome />} />
          <Route path="/*" element={<DashboardRoutes />} />
        </Routes>
      </Suspense>
      {/* Compiled out of production by the import.meta.env.DEV guard. */}
      <FpsBadge />
    </>
  );
}
