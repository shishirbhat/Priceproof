/**
 * Content for the Meridian Motorsport experience.
 *
 * Everything here is original placeholder copy for an invented racing
 * marque. It is deliberately shaped like real editorial content — same
 * field names, same rough character counts — so swapping in a licensed CMS
 * feed later is a data change, not a layout change.
 */

export type SpecRow = { label: string; value: string };

export type CarModel = {
  id: string;
  /** Short label shown in the bottom switcher pill bar. */
  name: string;
  /** Display heading inside the detail overlay. */
  title: string;
  /** Class descriptor shown under the switcher. */
  klass: string;
  blurb: string;
  specs: SpecRow[];
  /** Footnotes pinned to the bottom corners of the spec panel. */
  footnoteLeft: string;
  footnoteRight: string;
  series: string;
  news: { title: string; body: string };
  /** Body paint, used by the turntable renderer. */
  paint: { base: string; accent: string };
};

export const MODELS: CarModel[] = [
  {
    id: "963",
    name: "963",
    title: "963",
    klass: "LMDh prototype",
    blurb:
      "The 963 is the marque's return to top-flight prototype racing, built to the LMDh formula so one car can contest both the world championship and the American series. A twin-turbo V8 carries a standardised hybrid system, and the whole package is regulated by balance of performance — so the engineering effort goes into being consistently quick over a full stint rather than fast on one lap.",
    specs: [
      { label: "Engine", value: "Twin-turbo V8 combustion engine" },
      { label: "Displacement", value: "4.6 litres" },
      {
        label: "Performance",
        value:
          "Engine power output circa 500 kW at 8,360 rpm. Combined power output up to 520 kW at rear axle (pending on BoP)",
      },
      {
        label: "Gears",
        value: "Single specification hybrid system, 7-speed racing transmission, pneumatically actuated",
      },
      { label: "Weight", value: "Minimum weight 1,030 kg (pending on BoP)" },
    ],
    footnoteLeft: "Drive line",
    footnoteRight: "Racing clutch",
    series: "IMSA WeatherTech SportsCar Championship",
    news: {
      title: "Podium finish and strong points haul at the Six Hours of the Glen",
      body:
        "A clean opening stint and a well-judged second stop secured third place, with the car running inside the top five for the full distance.",
    },
    paint: { base: "#6f757e", accent: "#e6142d" },
  },
  {
    id: "99x",
    name: "99X Electric",
    title: "99X Electric",
    klass: "Formula E single-seater",
    blurb:
      "A fully electric single-seater for street circuits, where results are decided by how late the car can brake and how much energy it recovers doing so. Under the current regulations the powertrain recovers a substantial share of the energy it uses, which makes race strategy an energy-management problem as much as a driving one.",
    specs: [
      { label: "Powertrain", value: "Rear-mounted permanent magnet motor" },
      { label: "Battery", value: "Single specification, 38.5 kWh usable" },
      {
        label: "Performance",
        value:
          "350 kW in qualifying configuration, 300 kW in race configuration. Regeneration up to 600 kW under braking",
      },
      { label: "Gears", value: "Single-speed fixed ratio transmission" },
      { label: "Weight", value: "Minimum weight 854 kg including driver" },
    ],
    footnoteLeft: "Energy",
    footnoteRight: "Recovery system",
    series: "ABB FIA Formula E World Championship",
    news: {
      title: "Championship lead retaken in a wet season finale",
      body:
        "An early switch to a more aggressive regeneration map paid off across the closing laps, recovering enough energy to run a full attack sequence to the flag.",
    },
    paint: { base: "#5b6676", accent: "#3d8bff" },
  },
  {
    id: "911-gt3-r",
    name: "911 GT3 R",
    title: "911 GT3 R",
    klass: "Customer GT racing",
    blurb:
      "The customer car, and the one that has to work everywhere — a GT3 designed to be run by teams without a factory behind them. Rebuild intervals, spare part cost and setup range mattered as much as outright lap time, because the car spends its life in the hands of the teams that bought it.",
    specs: [
      { label: "Engine", value: "Naturally aspirated flat-six" },
      { label: "Displacement", value: "4.2 litres" },
      {
        label: "Performance",
        value:
          "Circa 416 kW, adjusted by air restrictor to the balance of performance of each series",
      },
      { label: "Gears", value: "6-speed sequential racing gearbox, paddle shift" },
      { label: "Weight", value: "Circa 1,250 kg (pending on BoP)" },
    ],
    footnoteLeft: "Chassis",
    footnoteRight: "Customer racing",
    series: "GT World Challenge",
    news: {
      title: "Customer teams sweep the podium at a rain-interrupted Spa",
      body:
        "Three privateer entries finished inside the top four across twenty-four hours, the winning car completing the distance on its original brake package.",
    },
    paint: { base: "#8b9099", accent: "#e6142d" },
  },
  {
    id: "911-cup",
    name: "911 Cup",
    title: "911 GT3 Cup",
    klass: "One-make championship",
    blurb:
      "One specification, no development. Every car leaves the same building with the same sealed parts, so the championship is decided entirely by what the driver does with it. It remains one of the shortest routes from a national race licence to a professional seat.",
    specs: [
      { label: "Engine", value: "Naturally aspirated flat-six" },
      { label: "Displacement", value: "4.0 litres" },
      { label: "Performance", value: "375 kW, single sealed specification" },
      { label: "Gears", value: "6-speed sequential, mechanical limited-slip differential" },
      { label: "Weight", value: "Circa 1,260 kg in race trim" },
    ],
    footnoteLeft: "Specification",
    footnoteRight: "One-make series",
    series: "Mobil 1 Supercup",
    news: {
      title: "Supercup grid grows for the European season",
      body:
        "The one-make field reaches its largest entry to date, with eleven rookies taking a seat under the series' junior development scheme.",
    },
    paint: { base: "#9aa0a8", accent: "#e6142d" },
  },
];

export type JournalItem = {
  id: string;
  kicker: string;
  title: string;
  /** Grid placement class — drives the bento layout. */
  area: string;
  /** Hue pair used to generate the tile's placeholder artwork. */
  tone: [string, string];
  tall?: boolean;
};

export const JOURNAL: JournalItem[] = [
  {
    id: "heritage",
    kicker: "From 1951 to 2026",
    title: "75 Years of Porsche Motorsport",
    area: "heritage",
    tone: ["#2b3a4a", "#c8874a"],
  },
  {
    id: "gt4",
    kicker: "Car",
    title: "The new 911 GT4 R",
    area: "feature",
    tone: ["#243044", "#8fa6c4"],
    tall: true,
  },
  {
    id: "anniversary",
    kicker: "News",
    title: "Porsche celebrates 75 years of Motorsport",
    area: "newsA",
    tone: ["#1e2128", "#6e7684"],
  },
  {
    id: "formula",
    kicker: "Racing",
    title: "Wehrlein retakes Formula E championship lead",
    area: "newsB",
    tone: ["#2a1f3a", "#7b5cc4"],
  },
  {
    id: "supercup",
    kicker: "Series",
    title: "Porsche Mobil 1 Supercup",
    area: "series",
    tone: ["#22262c", "#9aa4b2"],
  },
];

export const NAV_ITEMS = ["Series", "Cars", "Teams", "Events", "Journal"] as const;

/**
 * Days in the displayed month that carry a race event. The calendar marks
 * these with a red dot; selecting one swaps the day panel.
 */
export const EVENT_DAYS: Record<number, string[]> = {
  4: ["GT World Challenge — Round 4"],
  5: ["GT World Challenge — Round 4"],
  10: ["Mobil 1 Supercup — Free practice"],
  11: ["Mobil 1 Supercup — Race 1"],
  12: ["Mobil 1 Supercup — Race 2"],
  19: ["ABB FIA Formula E — Round 11"],
  25: ["IMSA WeatherTech — Six Hours"],
  26: ["IMSA WeatherTech — Six Hours"],
};
