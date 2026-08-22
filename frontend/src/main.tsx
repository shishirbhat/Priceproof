import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { PerfBadge } from "@/components/domain/PerfBadge";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* The page plane: one fixed, static, composited layer carrying the
        ambient glow and grain. Sits below #root so nothing above it ever
        forces it to repaint. */}
    <div className="page-plane" aria-hidden="true" />
    {import.meta.env.DEV && <PerfBadge />}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
