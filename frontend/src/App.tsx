import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/domain/ErrorBoundary";
import { CommandCenter } from "@/pages/CommandCenter";
import { PriceIntegrity } from "@/pages/PriceIntegrity";
import { CompetitiveLandscape } from "@/pages/CompetitiveLandscape";
import { Availability } from "@/pages/Availability";
import { MapViolations } from "@/pages/MapViolations";
import { Alerts } from "@/pages/Alerts";
import { ScraperHealth } from "@/pages/ScraperHealth";
import { CatalogManagement } from "@/pages/CatalogManagement";
import { ProductDetail } from "@/pages/ProductDetail";
import { Landing } from "@/pages/Landing";

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
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/*" element={<DashboardRoutes />} />
    </Routes>
  );
}
