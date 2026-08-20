import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { GlassNav } from "@/components/racing/GlassNav";
import { Turntable } from "@/components/racing/Turntable";
import { ModelSwitcher } from "@/components/racing/ModelSwitcher";
import { DetailOverlay } from "@/components/racing/DetailOverlay";
import { SeriesStrip } from "@/components/racing/SeriesStrip";
import { PitHero } from "@/components/racing/PitHero";
import { JournalGrid } from "@/components/racing/JournalGrid";
import { Footer } from "@/components/racing/Footer";
import { MODELS } from "@/components/racing/data";
import { DUR, EASE_EXPO } from "@/lib/motion";

/**
 * The motorsport experience.
 *
 * An independent reference implementation of a racing marque front end.
 * Car names and technical figures are factual references; all prose,
 * artwork and geometry in this build are generated for the project.
 *
 * The page is a single scroll: a full-viewport turntable hero that owns
 * the first screen, then the championship strip, the pit statement
 * section, the journal grid and the footer. The detail overlay renders
 * above all of it and pauses the hero while it is open.
 */
export function RacingHome() {
  const [activeId, setActiveId] = useState(MODELS[2].id);
  const [detailOpen, setDetailOpen] = useState(false);

  const model = useMemo(
    () => MODELS.find((m) => m.id === activeId) ?? MODELS[0],
    [activeId],
  );

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  // The switcher is hero furniture — retire it once the hero is gone.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="top" className="min-h-screen bg-[#050506] text-white antialiased">
      <GlassNav hidden={detailOpen} />

      {/* Hero. The turntable fills the viewport behind the chrome. */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        <Turntable paint={model.paint} label={model.title} paused={detailOpen} />

        {/* Model name and class, keyed so they cross-fade on switch. */}
        <motion.div
          key={model.id}
          className="pointer-events-none absolute inset-x-0 top-[22%] flex flex-col items-center px-6 text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: detailOpen ? 0 : 1, y: 0 }}
          transition={{ duration: DUR.panel, ease: EASE_EXPO }}
        >
          <span className="text-[10px] tracking-[0.3em] text-white/45 uppercase">
            {model.klass}
          </span>
          <h1 className="mt-3 text-[42px] leading-none font-light tracking-tight text-white sm:text-[60px]">
            {model.title}
          </h1>
        </motion.div>

        {/* Drag affordance, faded out once the overlay takes over. */}
        <motion.span
          className="pointer-events-none absolute inset-x-0 bottom-[15%] text-center text-[10px] tracking-[0.24em] text-white/30 uppercase"
          animate={{ opacity: detailOpen ? 0 : 1 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
        >
          Drag to rotate
        </motion.span>
      </section>

      <ModelSwitcher
        activeId={activeId}
        onSelect={setActiveId}
        onExplore={() => setDetailOpen(true)}
        hidden={detailOpen || pastHero}
      />

      <SeriesStrip />
      <PitHero />
      <JournalGrid />
      <Footer />

      <DetailOverlay model={model} open={detailOpen} onClose={closeDetail} />
    </div>
  );
}

export default RacingHome;
