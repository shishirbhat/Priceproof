import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Welcome } from "@/pages/Welcome";
import "./index.css";

/**
 * Standalone entry for the hosted preview.
 *
 * The real app is a routed SPA that talks to a local API. This build exists
 * so the front door can be opened from a URL with nothing installed, so it
 * mounts a single page inside a memory router: in-app links resolve back to
 * this page instead of dead-ending, and nothing tries to reach the network.
 */
function PreviewNote() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 px-4">
      <p
        className="rounded-full bg-[rgba(14,14,16,0.9)] px-4 py-2 text-center text-[11px] text-white/60 backdrop-blur-xl"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
      >
        Static preview of the front door — the dashboard needs the local API.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MemoryRouter>
      <Routes>
        {/* Every path renders the front door, so a stray link never blanks
            the page in a build that has no other routes. */}
        <Route path="*" element={<Welcome />} />
      </Routes>
      <PreviewNote />
    </MemoryRouter>
  </StrictMode>,
);
