/**
 * A miniature software 3D renderer for the hero turntable.
 *
 * The reference hero is a photographic turntable sequence — hundreds of
 * licensed studio renders played back against drag. We generate the car
 * instead: a lofted body built from cross-sections, flat-shaded against a
 * fixed studio light rig, painter-sorted and drawn to a 2D canvas.
 *
 * That buys three things a frame sequence does not. It is a few kilobytes
 * rather than a few megabytes, it rotates continuously instead of snapping
 * to the nearest captured frame, and the paint is a runtime parameter, so
 * switching models restyles the same geometry.
 */

export type Vec3 = [number, number, number];


/** Longitudinal stations. x runs nose (negative) to tail (positive). */
type Station = {
  x: number;
  /** Half-width of the body at its widest point. */
  w: number;
  /** Floor height and roof height at this station. */
  yb: number;
  yt: number;
  /** Roof half-width as a fraction of w — this is what tapers the cabin. */
  taper: number;
};

/** A complete body: stations plus the fittings that belong to it. */
type Silhouette = {
  stations: Station[];
  /** Front and rear axle position, wheel radius, and track half-width. */
  wheels: { front: number; rear: number; radius: number; track: number };
  /** Racing aero — wing, splitter, diffuser. Road cars have none. */
  aero: boolean;
  /** Height of the rear light bar, which follows the tail of each body. */
  tailLightY: number;
  /** Height of the head lights. */
  headLightY: number;
  /** Cabin stations get the darker glazing treatment. */
  glassFrom: number;
  glassTo: number;
  glassAbove: number;
};

const RACE: Station[] = [
  { x: -2.12, w: 0.46, yb: 0.14, yt: 0.34, taper: 0.72 },
  { x: -1.78, w: 0.66, yb: 0.11, yt: 0.46, taper: 0.80 },
  { x: -1.34, w: 0.78, yb: 0.12, yt: 0.58, taper: 0.86 },
  { x: -0.82, w: 0.82, yb: 0.13, yt: 0.72, taper: 0.90 },
  { x: -0.28, w: 0.84, yb: 0.13, yt: 1.06, taper: 0.60 },
  { x: 0.34, w: 0.84, yb: 0.13, yt: 1.14, taper: 0.56 },
  { x: 0.92, w: 0.85, yb: 0.13, yt: 1.00, taper: 0.64 },
  { x: 1.52, w: 0.85, yb: 0.12, yt: 0.80, taper: 0.84 },
  { x: 1.94, w: 0.78, yb: 0.15, yt: 0.72, taper: 0.90 },
  { x: 2.14, w: 0.62, yb: 0.20, yt: 0.66, taper: 0.94 },
];

/** Short overhangs, tall glasshouse, near-vertical tailgate. */
const HATCHBACK: Station[] = [
  { x: -1.80, w: 0.52, yb: 0.22, yt: 0.55, taper: 0.80 },
  { x: -1.50, w: 0.70, yb: 0.18, yt: 0.72, taper: 0.86 },
  { x: -1.10, w: 0.78, yb: 0.18, yt: 0.86, taper: 0.90 },
  { x: -0.70, w: 0.80, yb: 0.19, yt: 1.06, taper: 0.74 },
  { x: -0.20, w: 0.82, yb: 0.19, yt: 1.34, taper: 0.62 },
  { x: 0.45, w: 0.82, yb: 0.19, yt: 1.38, taper: 0.60 },
  { x: 1.05, w: 0.81, yb: 0.19, yt: 1.30, taper: 0.64 },
  { x: 1.50, w: 0.78, yb: 0.19, yt: 1.04, taper: 0.80 },
  { x: 1.78, w: 0.66, yb: 0.22, yt: 0.82, taper: 0.88 },
];

/** Three-box: bonnet, cabin, and a separate boot deck behind it. */
const SEDAN: Station[] = [
  { x: -2.05, w: 0.52, yb: 0.20, yt: 0.50, taper: 0.80 },
  { x: -1.70, w: 0.72, yb: 0.16, yt: 0.64, taper: 0.86 },
  { x: -1.25, w: 0.80, yb: 0.16, yt: 0.78, taper: 0.90 },
  { x: -0.75, w: 0.83, yb: 0.17, yt: 0.96, taper: 0.88 },
  { x: -0.20, w: 0.85, yb: 0.17, yt: 1.24, taper: 0.64 },
  { x: 0.40, w: 0.85, yb: 0.17, yt: 1.28, taper: 0.60 },
  { x: 0.95, w: 0.84, yb: 0.17, yt: 1.08, taper: 0.70 },
  { x: 1.50, w: 0.82, yb: 0.17, yt: 0.86, taper: 0.86 },
  { x: 1.95, w: 0.74, yb: 0.19, yt: 0.82, taper: 0.90 },
  { x: 2.08, w: 0.60, yb: 0.24, yt: 0.76, taper: 0.94 },
];

/** Raised floor, upright glass, and a roofline that stays high to the tail. */
const SUV: Station[] = [
  { x: -2.02, w: 0.56, yb: 0.30, yt: 0.68, taper: 0.82 },
  { x: -1.68, w: 0.76, yb: 0.26, yt: 0.88, taper: 0.88 },
  { x: -1.24, w: 0.86, yb: 0.26, yt: 1.04, taper: 0.92 },
  { x: -0.72, w: 0.89, yb: 0.27, yt: 1.22, taper: 0.86 },
  { x: -0.18, w: 0.90, yb: 0.27, yt: 1.56, taper: 0.70 },
  { x: 0.45, w: 0.90, yb: 0.27, yt: 1.62, taper: 0.68 },
  { x: 1.05, w: 0.89, yb: 0.27, yt: 1.58, taper: 0.70 },
  { x: 1.62, w: 0.86, yb: 0.27, yt: 1.38, taper: 0.80 },
  { x: 2.00, w: 0.74, yb: 0.29, yt: 1.08, taper: 0.88 },
];

export type SilhouetteName = "race" | "hatchback" | "sedan" | "suv";

export const SILHOUETTES: Record<SilhouetteName, Silhouette> = {
  race: {
    stations: RACE,
    wheels: { front: -1.30, rear: 1.38, radius: 0.34, track: 0.86 },
    aero: true,
    tailLightY: 0.70,
    headLightY: 0.34,
    glassFrom: 3,
    glassTo: 7,
    glassAbove: 0.80,
  },
  hatchback: {
    stations: HATCHBACK,
    wheels: { front: -1.14, rear: 1.14, radius: 0.37, track: 0.84 },
    aero: false,
    tailLightY: 0.90,
    headLightY: 0.66,
    glassFrom: 3,
    glassTo: 7,
    glassAbove: 1.02,
  },
  sedan: {
    stations: SEDAN,
    wheels: { front: -1.34, rear: 1.34, radius: 0.37, track: 0.86 },
    aero: false,
    tailLightY: 0.86,
    headLightY: 0.60,
    glassFrom: 3,
    glassTo: 7,
    glassAbove: 0.96,
  },
  suv: {
    stations: SUV,
    wheels: { front: -1.30, rear: 1.34, radius: 0.45, track: 0.90 },
    aero: false,
    tailLightY: 1.16,
    headLightY: 0.82,
    glassFrom: 3,
    glassTo: 7,
    glassAbove: 1.24,
  },
};


/**
 * Tessellation. The previous build used 18 points per section and no
 * longitudinal subdivision, which is what made it read as a CAD viewport:
 * at that density flat shading shows every facet. Density plus a specular
 * term is what turns the same geometry into something that looks rendered.
 */
const RING = 30;
const LONG_SAMPLES = 46;

/** Superellipse exponent. Higher is boxier; 3.2 reads as a car body. */
const SECTION_N = 3.2;

function superEllipse(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 2 / SECTION_N);
}

function ring(s: Station): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < RING; i++) {
    const t = (i / RING) * Math.PI * 2;
    const up = 0.5 + 0.5 * superEllipse(Math.sin(t));
    const k = up * up * (3 - 2 * up);
    const widthScale = 1 + (s.taper - 1) * k;
    pts.push([
      s.x,
      s.yb + (s.yt - s.yb) * up,
      s.w * superEllipse(Math.cos(t)) * widthScale,
    ]);
  }
  return pts;
}

/** Catmull-Rom through one channel of the station list. */
function spline(v0: number, v1: number, v2: number, v3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * v1 +
    (-v0 + v2) * t +
    (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 +
    (-v0 + 3 * v1 - 3 * v2 + v3) * t3
  );
}

/**
 * Resample the hand-authored stations onto a smooth spline. The control
 * stations stay readable and editable; the surface the renderer sees is
 * dense enough that the facets disappear.
 */
function resample(stations: Station[], samples: number): Station[] {
  const n = stations.length;
  const at = (i: number) => stations[Math.max(0, Math.min(n - 1, i))];
  const out: Station[] = [];
  for (let s = 0; s < samples; s++) {
    const u = (s / (samples - 1)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    const t = u - i;
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    out.push({
      x: spline(p0.x, p1.x, p2.x, p3.x, t),
      w: Math.max(0.02, spline(p0.w, p1.w, p2.w, p3.w, t)),
      yb: spline(p0.yb, p1.yb, p2.yb, p3.yb, t),
      yt: spline(p0.yt, p1.yt, p2.yt, p3.yt, t),
      taper: spline(p0.taper, p1.taper, p2.taper, p3.taper, t),
    });
  }
  return out;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function polyNormal(p: Vec3[]): Vec3 {
  return normalize(cross(sub(p[1], p[0]), sub(p[2], p[0])));
}

/**
 * One shaded polygon.
 *
 * `gloss` is what separates painted bodywork from rubber: it scales both
 * the specular lobe and how much of the environment the surface picks up.
 */
type Poly = {
  pts: Vec3[];
  n: Vec3;
  color: string;
  gloss: number;
  emissive?: boolean;
};

/** A wheel: tyre carcass, tread band, and a dished rim with spokes. */
function wheel(cx: number, cz: number, r: number, halfWidth: number): Poly[] {
  const out: Poly[] = [];
  const seg = 26;
  const side = cz > 0 ? 1 : -1;
  const inner = cz - side * halfWidth;
  const outer = cz + side * halfWidth;
  const rimR = r * 0.62;

  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const b = ((i + 1) / seg) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    const cb = Math.cos(b), sb = Math.sin(b);

    // Tread, slightly crowned so the shoulder catches light.
    const t1: Vec3 = [cx + ca * r, r + sa * r, outer];
    const t2: Vec3 = [cx + cb * r, r + sb * r, outer];
    const t3: Vec3 = [cx + cb * r, r + sb * r, inner];
    const t4: Vec3 = [cx + ca * r, r + sa * r, inner];
    out.push({ pts: [t1, t2, t3, t4], n: normalize([ca, sa, 0]), color: "#0b0c0e", gloss: 0.10 });

    // Sidewall, from tread down to the rim lip.
    const s1: Vec3 = [cx + ca * r, r + sa * r, outer];
    const s2: Vec3 = [cx + cb * r, r + sb * r, outer];
    const s3: Vec3 = [cx + cb * rimR, r + sb * rimR, outer];
    const s4: Vec3 = [cx + ca * rimR, r + sa * rimR, outer];
    out.push({ pts: [s1, s2, s3, s4], n: [0, 0, side], color: "#121417", gloss: 0.16 });

    // Rim face, inset a little so the tyre reads as sitting proud of it.
    const rimZ = outer - side * halfWidth * 0.22;
    const r1: Vec3 = [cx + ca * rimR, r + sa * rimR, rimZ];
    const r2: Vec3 = [cx + cb * rimR, r + sb * rimR, rimZ];
    const hub: Vec3 = [cx, r, rimZ];
    // Five spokes: alternate light and dark wedges around the dish.
    const spoke = Math.floor((i / seg) * 10) % 2 === 0;
    out.push({
      pts: [hub, r1, r2],
      n: [0, 0, side],
      color: spoke ? "#3c4149" : "#20242a",
      gloss: spoke ? 0.7 : 0.35,
    });
  }
  return out;
}

/** An axis-aligned box. */
function box(
  x0: number, x1: number,
  y0: number, y1: number,
  z0: number, z1: number,
  color: string,
  gloss = 0.5,
): Poly[] {
  const v: Vec3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const idx = [
    [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
    [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0],
  ];
  return idx.map((f) => {
    const pts = f.map((i) => v[i]);
    return { pts, n: polyNormal(pts), color, gloss };
  });
}

export type CarMesh = {
  polys: Poly[];
  /** Overall extents, so the camera can frame whatever body it is given. */
  length: number;
  height: number;
  /** Axle positions and radius, used to place contact shadows. */
  contacts: Array<{ x: number; z: number; r: number }>;
};

export function buildCar(
  paint: { base: string; accent: string },
  silhouette: SilhouetteName = "race",
): CarMesh {
  const spec = SILHOUETTES[silhouette];
  const control = spec.stations;
  const body = resample(control, LONG_SAMPLES);
  const polys: Poly[] = [];
  const rings = body.map(ring);

  // Loft the body panels. Normals come from the surrounding surface rather
  // than the single quad, which keeps the shading continuous across seams.
  for (let s = 0; s < rings.length - 1; s++) {
    for (let i = 0; i < RING; i++) {
      const j = (i + 1) % RING;
      const pts = [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]];
      polys.push({ pts, n: polyNormal(pts), color: paint.base, gloss: 0.55 });
    }
  }

  const last = body.length - 1;
  const nose = body[0];
  const tail = body[last];
  const capNose: Vec3 = [nose.x - 0.05, (nose.yb + nose.yt) / 2, 0];
  const capTail: Vec3 = [tail.x + 0.04, (tail.yb + tail.yt) / 2, 0];
  for (let i = 0; i < RING; i++) {
    const j = (i + 1) % RING;
    const a = [capNose, rings[0][j], rings[0][i]];
    const b = [capTail, rings[last][i], rings[last][j]];
    polys.push({ pts: a, n: polyNormal(a), color: paint.base, gloss: 0.55 });
    polys.push({ pts: b, n: polyNormal(b), color: paint.base, gloss: 0.55 });
  }

  if (spec.aero) {
    polys.push(...box(-2.30, -1.60, 0.06, 0.09, -0.92, 0.92, "#0e1013", 0.3));
    polys.push(...box(1.90, 2.32, 0.07, 0.11, -0.90, 0.90, "#0e1013", 0.3));
    polys.push(...box(1.72, 2.24, 1.44, 1.51, -1.00, 1.00, "#101216", 0.45));
    polys.push(...box(1.70, 2.26, 1.14, 1.56, -1.04, -0.98, "#15181c", 0.45));
    polys.push(...box(1.70, 2.26, 1.14, 1.56, 0.98, 1.04, "#15181c", 0.45));
    polys.push(...box(1.86, 1.96, 0.84, 1.46, -0.32, -0.24, "#0d0f12", 0.4));
    polys.push(...box(1.86, 1.96, 0.84, 1.46, 0.24, 0.32, "#0d0f12", 0.4));
  } else {
    const w = tail.w * 0.92;
    polys.push(...box(nose.x - 0.06, nose.x + 0.30, nose.yb - 0.06, nose.yb + 0.04, -w, w, "#0e1013", 0.25));
    polys.push(...box(tail.x - 0.30, tail.x + 0.05, tail.yb - 0.06, tail.yb + 0.04, -w, w, "#0e1013", 0.25));
  }

  const { front, rear, radius, track } = spec.wheels;
  const tyreWidth = radius * 0.44;
  polys.push(...wheel(front, -track, radius, tyreWidth));
  polys.push(...wheel(front, track, radius, tyreWidth));
  polys.push(...wheel(rear, -track, radius, tyreWidth));
  polys.push(...wheel(rear, track, radius, tyreWidth));

  // Lights.
  const tlY = spec.tailLightY;
  const hlY = spec.headLightY;
  polys.push(
    ...box(tail.x + 0.02, tail.x + 0.05, tlY, tlY + 0.10, -tail.w * 0.82, tail.w * 0.82, paint.accent).map(
      (f) => ({ ...f, emissive: true }),
    ),
  );
  for (const sign of [-1, 1]) {
    polys.push(
      ...box(
        nose.x - 0.04, nose.x,
        hlY, hlY + 0.09,
        sign > 0 ? nose.w * 0.34 : -nose.w * 0.78,
        sign > 0 ? nose.w * 0.78 : -nose.w * 0.34,
        "#dfe6f2",
      ).map((f) => ({ ...f, emissive: true })),
    );
  }

  // Glasshouse. Glass is the glossiest thing on the car.
  const gFrom = Math.round((spec.glassFrom / (control.length - 1)) * (body.length - 1));
  const gTo = Math.round((spec.glassTo / (control.length - 1)) * (body.length - 1));
  for (let s = gFrom; s < gTo; s++) {
    for (let i = 0; i < RING; i++) {
      const j = (i + 1) % RING;
      if (rings[s][i][1] < spec.glassAbove * 1.06) continue;
      const pts = [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]];
      polys.push({ pts, n: polyNormal(pts), color: "#0a0d12", gloss: 0.8 });
    }
  }

  const length = tail.x - nose.x + (spec.aero ? 0.5 : 0.4);
  const height = Math.max(...body.map((b) => b.yt), spec.aero ? 1.56 : 0) + 0.1;
  const contacts = [
    { x: front, z: -track, r: radius },
    { x: front, z: track, r: radius },
    { x: rear, z: -track, r: radius },
    { x: rear, z: track, r: radius },
  ];
  return { polys, length, height, contacts };
}

const CAM_Z = 26;
const ELEVATION = (-7 * Math.PI) / 180;

function project(
  p: Vec3, yaw: number, cx: number, cy: number, f: number,
): [number, number, number] {
  const [x, y, z] = p;
  const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
  const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const ry = y * Math.cos(ELEVATION) - rz * Math.sin(ELEVATION);
  const rz2 = y * Math.sin(ELEVATION) + rz * Math.cos(ELEVATION);
  const d = CAM_Z - rz2;
  const s = f / d;
  return [cx + rx * s, cy - ry * s, rz2];
}

/** Studio rig: a key light high and forward, plus a cool rear fill. */
const KEY = normalize([-0.40, 0.80, 0.44]);
const FILL = normalize([0.62, 0.22, -0.55]);
/** Half-vector for the key, against a viewer looking down +Z. */
const HALF = normalize([KEY[0], KEY[1], KEY[2] + 1]);

/**
 * Colour cache.
 *
 * At this tessellation the renderer asks for a fill colour a few thousand
 * times a frame. Quantising the lighting terms and memoising the resulting
 * string turns that from string building into a map lookup.
 */
const colorCache = new Map<string, string>();

function shade(hex: string, diffuse: number, specular: number): string {
  const dq = Math.round(diffuse * 96);
  const sq = Math.round(specular * 48);
  const key = `${hex}${dq},${sq}`;
  const hit = colorCache.get(key);
  if (hit) return hit;

  const n = parseInt(hex.slice(1), 16);
  const d = dq / 96;
  const s = (sq / 48) * 255;
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * d + s)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * d + s)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * d + s)));
  const out = `rgb(${r},${g},${b})`;
  // Bounded so a long session cannot grow it without limit.
  if (colorCache.size < 8192) colorCache.set(key, out);
  return out;
}

/**
 * Cached studio backdrop.
 *
 * Keyed on the canvas size: the gradients only change when the element is
 * resized, which is rare, so everything else reuses the same bitmap.
 */
let backdropCache: { key: string; canvas: HTMLCanvasElement } | null = null;

function backdropFor(
  width: number,
  height: number,
  cx: number,
  cy: number,
  S: number,
  D: number,
): HTMLCanvasElement {
  const key = `${Math.round(width)}x${Math.round(height)}`;
  if (backdropCache && backdropCache.key === key) return backdropCache.canvas;

  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  const g = c.getContext("2d")!;

  const bg = g.createRadialGradient(cx, cy - S * 0.16, S * 0.02, cx, cy, D * 1.02);
  bg.addColorStop(0, "#8b9099");
  bg.addColorStop(0.30, "#4a4e55");
  bg.addColorStop(0.62, "#212429");
  bg.addColorStop(1, "#08090a");
  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);

  const pool = g.createRadialGradient(cx, cy, S * 0.01, cx, cy, S * 0.62);
  pool.addColorStop(0, "rgba(226,230,236,0.34)");
  pool.addColorStop(0.5, "rgba(140,148,160,0.13)");
  pool.addColorStop(1, "rgba(0,0,0,0)");
  g.save();
  g.translate(cx, cy);
  g.scale(1, 0.26);
  g.translate(-cx, -cy);
  g.fillStyle = pool;
  g.fillRect(0, cy - S * 0.7, width, S * 1.4);
  g.restore();

  backdropCache = { key, canvas: c };
  return c;
}

export function renderCar(
  ctx: CanvasRenderingContext2D,
  mesh: CarMesh,
  width: number,
  height: number,
  yaw: number,
  accent: string,
) {
  const polys = mesh.polys;
  const cx = width / 2;
  const cy = height * 0.60;
  const f = Math.min(
    (width * 0.68 * CAM_Z) / mesh.length,
    (height * 0.36 * CAM_Z) / mesh.height,
  );
  const S = Math.min(width, height);
  const D = Math.hypot(width, height) / 2;

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);

  const floorY = cy;

  // The cyclorama and the floor pool do not depend on yaw, so they are
  // rendered once into an offscreen canvas and blitted from then on.
  // Building two radial gradients and filling the full canvas twice on every
  // frame — 60 times a second, at up to 2x device pixel ratio — was the
  // single most expensive thing this hero did.
  ctx.drawImage(backdropFor(width, height, cx, cy, S, D), 0, 0, width, height);

  // Contact shadows: one soft pool under each wheel. Without these the car
  // floats, which is most of what made the old render look like a viewport.
  for (const c of mesh.contacts) {
    const [sx, sy] = project([c.x, 0, c.z], yaw, cx, cy, f);
    const rr = (c.r * f) / CAM_Z;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr * 1.9);
    g.addColorStop(0, "rgba(0,0,0,0.62)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.30);
    ctx.translate(-sx, -sy);
    ctx.fillStyle = g;
    ctx.fillRect(sx - rr * 2, sy - rr * 2, rr * 4, rr * 4);
    ctx.restore();
  }

  const drawPass = (mirror: boolean) => {
    const projected = polys.map((poly) => {
      const pts = poly.pts.map((p) =>
        project(mirror ? ([p[0], -p[1] * 0.96, p[2]] as Vec3) : p, yaw, cx, cy, f),
      );
      let depth = 0;
      for (const p of pts) depth += p[2];
      return { poly, pts, depth: depth / pts.length };
    });

    projected.sort((a, b) => a.depth - b.depth);

    for (const { poly, pts } of projected) {
      // Backface cull via signed area.
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
      }
      if (area >= 0) continue;

      let fill: string;
      if (poly.emissive) {
        fill = poly.color;
      } else {
        // Rotate the normal with the body so highlights travel across it.
        const n = poly.n;
        const nx = n[0] * cosY - n[2] * sinY;
        const ny = mirror ? -n[1] : n[1];
        const nz = n[0] * sinY + n[2] * cosY;

        const key = Math.max(0, nx * KEY[0] + ny * KEY[1] + nz * KEY[2]);
        const fillL = Math.max(0, nx * FILL[0] + ny * FILL[1] + nz * FILL[2]);

        // Environment: bright above the horizon, dark below, with a hard
        // transition. This is what makes paint read as paint.
        const env = ny > 0 ? 0.5 + 0.5 * ny : 0.16 * (1 + ny);

        const diffuse =
          0.26 + key * 0.54 + fillL * 0.16 + env * poly.gloss * 0.20;

        // Blinn-Phong lobe, tightened by gloss.
        const h = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]);
        const specular =
          poly.gloss * Math.pow(h, 42 + poly.gloss * 120) * (0.30 + poly.gloss * 0.45);

        fill = shade(poly.color, diffuse, specular);
      }

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.globalAlpha = mirror ? 0.16 : 1;
      ctx.fill();
      // Hairline stroke in the fill colour closes sub-pixel seams between
      // adjacent quads without drawing a visible wireframe.
      ctx.strokeStyle = fill;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  // Reflection.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, floorY, width, height - floorY);
  ctx.clip();
  ctx.filter = "blur(4px)";
  drawPass(true);
  ctx.filter = "none";
  ctx.restore();

  const wash = ctx.createLinearGradient(0, floorY, 0, floorY + S * 0.34);
  wash.addColorStop(0, "rgba(6,6,7,0.30)");
  wash.addColorStop(1, "rgba(6,6,7,0.96)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, floorY, width, S * 0.34);

  drawPass(false);

  // Tail-light bloom, strongest with the back of the car to camera.
  const facing = Math.cos(yaw);
  if (facing < 0.25) {
    const strength = Math.min(1, (0.25 - facing) / 1.1);
    const g = ctx.createRadialGradient(cx, cy - S * 0.05, 0, cx, cy - S * 0.05, S * 0.44);
    g.addColorStop(0, `${accent}${Math.round(strength * 62).toString(16).padStart(2, "0")}`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  const vig = ctx.createRadialGradient(cx, cy, S * 0.30, cx, cy, D * 1.05);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}
