import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EVENT_DAYS } from "./data";
import { DUR, EASE_EXPO } from "@/lib/motion";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Monday-first weekday index for the 1st of the given month. */
function leadingBlanks(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * The race calendar.
 *
 * A compact month grid with event days marked, paired with a panel for the
 * selected day. Month navigation only carries events for the seeded month;
 * every other month renders empty, which is the honest behaviour until a
 * real schedule feed is wired in.
 */
export function EventCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<number>(today.getDate());

  const blanks = leadingBlanks(cursor.year, cursor.month);
  const total = daysInMonth(cursor.year, cursor.month);
  // Events are seeded against the initial month only.
  const seededMonth = cursor.month === today.getMonth() && cursor.year === today.getFullYear();
  const events = seededMonth ? (EVENT_DAYS[selected] ?? []) : [];

  const step = (dir: number) => {
    setCursor((c) => {
      const m = c.month + dir;
      if (m < 0) return { year: c.year - 1, month: 11 };
      if (m > 11) return { year: c.year + 1, month: 0 };
      return { year: c.year, month: m };
    });
    setSelected(1);
  };

  const selectedDate = new Date(cursor.year, cursor.month, selected);

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,150px)]">
      <div
        className="rounded-2xl bg-[#0b0b0d] p-4"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between px-1 pb-3">
          <NavArrow dir="prev" onClick={() => step(-1)} />
          <span className="text-[12px] text-white/85">{MONTHS[cursor.month]}</span>
          <NavArrow dir="next" onClick={() => step(1)} />
        </div>

        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label="Race calendar">
          {WEEKDAYS.map((d) => (
            <span key={d} className="sr-only">{d}</span>
          ))}
          {Array.from({ length: blanks }).map((_, i) => (
            <span key={`b${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: total }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selected;
            const hasEvent = seededMonth && Boolean(EVENT_DAYS[day]);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                aria-label={`${MONTHS[cursor.month]} ${day}${hasEvent ? " — race event" : ""}`}
                className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-[5px] text-[10.5px] transition-colors duration-150 ${
                  isSelected
                    ? "bg-white font-medium text-black"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {day}
                {hasEvent && !isSelected && (
                  <span className="absolute -bottom-0.5 h-[3px] w-[3px] rounded-full bg-[#e6142d]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-col rounded-2xl bg-[#0b0b0d] p-4"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
      >
        <span className="text-[10px] text-white/45">
          {WEEKDAYS[(selectedDate.getDay() + 6) % 7]}
        </span>
        {/* Key on the date so the label cross-fades when the day changes. */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`${cursor.month}-${selected}`}
            className="mt-0.5 block text-[21px] leading-tight font-light text-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DUR.micro, ease: EASE_EXPO }}
          >
            {MONTHS[cursor.month].slice(0, 3)} {selected}
          </motion.span>
        </AnimatePresence>

        <div className="mt-auto pt-6">
          {events.length === 0 ? (
            <span className="text-[10px] text-white/35">No events scheduled</span>
          ) : (
            <ul className="space-y-1.5">
              {events.map((e) => (
                <li key={e} className="flex gap-2 text-[10px] leading-snug text-white/70">
                  <span className="mt-1 h-[3px] w-[3px] shrink-0 rounded-full bg-[#e6142d]" />
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function NavArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous month" : "Next month"}
      className="flex h-5 w-5 items-center justify-center rounded text-white/45 transition-colors duration-150 hover:bg-white/10 hover:text-white"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d={dir === "prev" ? "M6.5 1.5L3 5l3.5 3.5" : "M3.5 1.5L7 5l-3.5 3.5"}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
