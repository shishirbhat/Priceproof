import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CommandCenter } from "@/pages/CommandCenter";
import { PriceIntegrity } from "@/pages/PriceIntegrity";
import { CompetitiveLandscape } from "@/pages/CompetitiveLandscape";
import { Availability } from "@/pages/Availability";
import { MapViolations } from "@/pages/MapViolations";
import { Alerts } from "@/pages/Alerts";
import { ScraperHealth } from "@/pages/ScraperHealth";
import { CatalogManagement } from "@/pages/CatalogManagement";
import { ProductDetail } from "@/pages/ProductDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
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
    </Layout>
  );
}
