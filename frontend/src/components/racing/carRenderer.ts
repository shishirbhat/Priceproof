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

type Face = {
  pts: Vec3[];
  color: string;
  /** Emissive faces skip lighting and never darken — lamps and light bars. */
  emissive?: boolean;
  /** Emissive faces additionally bloom by this radius, in world units. */
  glow?: number;
};

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

/** Points per cross-section. Higher reads rounder but costs fill rate. */
const RING = 18;

/** Superellipse exponent. Higher is boxier; 3.2 reads as a car body. */
const SECTION_N = 3.2;

function superEllipse(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 2 / SECTION_N);
}

function ring(s: Station): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < RING; i++) {
    const t = (i / RING) * Math.PI * 2;
    // 0 at the floor, 1 at the roof.
    const up = 0.5 + 0.5 * superEllipse(Math.sin(t));
    // Smoothstep the taper so the shoulder line stays soft, and apply it
    // only across the upper half — the sills stay full width.
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

function faceNormal(p: Vec3[]): Vec3 {
  return normalize(cross(sub(p[1], p[0]), sub(p[2], p[0])));
}

/** A cylinder lying on the Z axis — every wheel on the car. */
function wheel(cx: number, cz: number, r: number, halfWidth: number, seg = 16): Face[] {
  const faces: Face[] = [];
  const inner = cz > 0 ? cz - halfWidth : cz + halfWidth;
  const outer = cz > 0 ? cz + halfWidth : cz - halfWidth;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const b = ((i + 1) / seg) * Math.PI * 2;
    const p1: Vec3 = [cx + Math.cos(a) * r, r + Math.sin(a) * r, outer];
    const p2: Vec3 = [cx + Math.cos(b) * r, r + Math.sin(b) * r, outer];
    const p3: Vec3 = [cx + Math.cos(b) * r, r + Math.sin(b) * r, inner];
    const p4: Vec3 = [cx + Math.cos(a) * r, r + Math.sin(a) * r, inner];
    // Tread.
    faces.push({ pts: [p1, p2, p3, p4], color: "#0c0d0f" });
    // Outer sidewall, drawn as a fan back to the hub.
    faces.push({
      pts: [[cx, r, outer], p1, p2],
      color: i % 6 === 0 ? "#1e2126" : "#15171a",
    });
  }
  return faces;
}

/** An axis-aligned box, used for the wing plane and its endplates. */
function box(
  x0: number, x1: number,
  y0: number, y1: number,
  z0: number, z1: number,
  color: string,
): Face[] {
  const v: Vec3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const idx = [
    [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
    [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0],
  ];
  return idx.map((f) => ({ pts: f.map((i) => v[i]), color }));
}

/**
 * Assemble the full car. Paint is applied per call so the switcher can
 * restyle the same mesh without rebuilding geometry every frame.
 */
export type CarMesh = {
  faces: Face[];
  /** Overall extents, so the camera can frame whatever body it is given. */
  length: number;
  height: number;
};

export function buildCar(
  paint: { base: string; accent: string },
  silhouette: SilhouetteName = "race",
): CarMesh {
  const spec = SILHOUETTES[silhouette];
  const body = spec.stations;
  const faces: Face[] = [];
  const rings = body.map(ring);

  // Loft the body panels between adjacent stations.
  for (let s = 0; s < rings.length - 1; s++) {
    for (let i = 0; i < RING; i++) {
      const j = (i + 1) % RING;
      faces.push({
        pts: [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]],
        color: paint.base,
      });
    }
  }

  // Cap the nose and tail with triangle fans.
  const last = body.length - 1;
  const nose = body[0];
  const tail = body[last];
  const capNose: Vec3 = [nose.x - 0.05, (nose.yb + nose.yt) / 2, 0];
  const capTail: Vec3 = [tail.x + 0.04, (tail.yb + tail.yt) / 2, 0];
  for (let i = 0; i < RING; i++) {
    const j = (i + 1) % RING;
    faces.push({ pts: [capNose, rings[0][j], rings[0][i]], color: paint.base });
    faces.push({ pts: [capTail, rings[last][i], rings[last][j]], color: paint.base });
  }

  // Racing aero. Road bodies get a plain valance instead.
  if (spec.aero) {
    faces.push(...box(-2.30, -1.60, 0.06, 0.09, -0.92, 0.92, "#0e1013"));
    faces.push(...box(1.90, 2.32, 0.07, 0.11, -0.90, 0.90, "#0e1013"));
    // Rear wing: plane plus two endplates, carried on twin uprights.
    faces.push(...box(1.72, 2.24, 1.44, 1.51, -1.00, 1.00, "#101216"));
    faces.push(...box(1.70, 2.26, 1.14, 1.56, -1.04, -0.98, "#15181c"));
    faces.push(...box(1.70, 2.26, 1.14, 1.56, 0.98, 1.04, "#15181c"));
    faces.push(...box(1.86, 1.96, 0.84, 1.46, -0.32, -0.24, "#0d0f12"));
    faces.push(...box(1.86, 1.96, 0.84, 1.46, 0.24, 0.32, "#0d0f12"));
  } else {
    const w = tail.w * 0.92;
    faces.push(...box(nose.x - 0.06, nose.x + 0.30, nose.yb - 0.06, nose.yb + 0.04, -w, w, "#0e1013"));
    faces.push(...box(tail.x - 0.30, tail.x + 0.05, tail.yb - 0.06, tail.yb + 0.04, -w, w, "#0e1013"));
  }

  // Wheels, inset slightly under the arches.
  const { front, rear, radius, track } = spec.wheels;
  const tyreWidth = radius * 0.44;
  faces.push(...wheel(front, -track, radius, tyreWidth));
  faces.push(...wheel(front, track, radius, tyreWidth));
  faces.push(...wheel(rear, -track, radius, tyreWidth));
  faces.push(...wheel(rear, track, radius, tyreWidth));

  // Full-width tail bar, and a pair of headlights, tracked to this body.
  const tlY = spec.tailLightY;
  const hlY = spec.headLightY;
  faces.push(
    ...box(tail.x + 0.02, tail.x + 0.05, tlY, tlY + 0.10, -tail.w * 0.82, tail.w * 0.82, paint.accent).map(
      (f) => ({ ...f, emissive: true, glow: 0.5 }),
    ),
  );
  for (const sign of [-1, 1]) {
    faces.push(
      ...box(
        nose.x - 0.04, nose.x,
        hlY, hlY + 0.09,
        sign > 0 ? nose.w * 0.34 : -nose.w * 0.78,
        sign > 0 ? nose.w * 0.78 : -nose.w * 0.34,
        paint.accent,
      ).map((f) => ({ ...f, emissive: true, glow: 0.34 })),
    );
  }

  // Glasshouse — a darker cap over the cabin stations reads as glazing.
  for (let s = spec.glassFrom; s < spec.glassTo; s++) {
    for (let i = 0; i < RING; i++) {
      const j = (i + 1) % RING;
      if (rings[s][i][1] < spec.glassAbove) continue;
      faces.push({
        pts: [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]],
        color: "#080a0d",
      });
    }
  }

  // Extents drive the camera fit, so a tall SUV frames as well as a
  // low prototype without any per-caller tuning.
  const length = tail.x - nose.x + (spec.aero ? 0.5 : 0.4);
  const height = Math.max(...body.map((b) => b.yt), spec.aero ? 1.56 : 0) + 0.1;
  return { faces, length, height };
}

const CAM_Z = 26;
const ELEVATION = (-7 * Math.PI) / 180;

function project(
  p: Vec3, yaw: number, cx: number, cy: number, f: number,
): [number, number, number] {
  const [x, y, z] = p;
  // Yaw about the vertical axis, then pitch the camera down slightly.
  const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
  const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const ry = y * Math.cos(ELEVATION) - rz * Math.sin(ELEVATION);
  const rz2 = y * Math.sin(ELEVATION) + rz * Math.cos(ELEVATION);
  const d = CAM_Z - rz2;
  const s = f / d;
  return [cx + rx * s, cy - ry * s, rz2];
}

const KEY = normalize([-0.42, 0.78, 0.46]);
const RIM = normalize([0.35, 0.30, -0.86]);

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * amount)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * amount)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * amount)));
  return `rgb(${r},${g},${b})`;
}

/**
 * Draw one frame of the turntable.
 *
 * `yaw` is in radians and unbounded — the caller keeps accumulating it and
 * we take it modulo a turn, so drag momentum never has to be clamped.
 */
export function renderCar(
  ctx: CanvasRenderingContext2D,
  mesh: CarMesh,
  width: number,
  height: number,
  yaw: number,
  accent: string,
) {
  const faces = mesh.faces;
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height * 0.60;
  // Focal length, solved so the car fits the frame rather than being a
  // fixed multiple of it — a fixed multiple left it tiny on phones and
  // cropped on short landscape windows.
  const f = Math.min(
    (width * 0.68 * CAM_Z) / mesh.length,
    (height * 0.36 * CAM_Z) / mesh.height,
  );
  // Backdrop geometry is viewport-relative, not focal-length-relative.
  const S = Math.min(width, height);
  const D = Math.hypot(width, height) / 2;

  // Studio cyclorama: a bright pool of light behind the car falling off
  // hard into the corners.
  const bg = ctx.createRadialGradient(cx, cy - S * 0.16, S * 0.02, cx, cy, D * 1.02);
  bg.addColorStop(0, "#8b9099");
  bg.addColorStop(0.30, "#4a4e55");
  bg.addColorStop(0.62, "#212429");
  bg.addColorStop(1, "#08090a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // The ground plane (y = 0) projects to cy, so that is the horizon.
  const floorY = cy;

  // Floor pool — the ellipse of light the car sits in.
  const pool = ctx.createRadialGradient(cx, floorY, S * 0.01, cx, floorY, S * 0.62);
  pool.addColorStop(0, "rgba(226,230,236,0.34)");
  pool.addColorStop(0.5, "rgba(140,148,160,0.13)");
  pool.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.translate(cx, floorY);
  ctx.scale(1, 0.26);
  ctx.translate(-cx, -floorY);
  ctx.fillStyle = pool;
  ctx.fillRect(0, floorY - S * 0.7, width, S * 1.4);
  ctx.restore();

  const drawPass = (mirror: boolean) => {
    const projected = faces.map((face) => {
      const pts = face.pts.map((p) =>
        project(mirror ? ([p[0], -p[1] * 0.96, p[2]] as Vec3) : p, yaw, cx, cy, f),
      );
      const depth = pts.reduce((a, p) => a + p[2], 0) / pts.length;
      return { face, pts, depth };
    });

    // Painter's algorithm: far faces first.
    projected.sort((a, b) => a.depth - b.depth);

    for (const { face, pts } of projected) {
      // Backface cull in screen space via the signed area.
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
      }
      if (area >= 0) continue;

      let fill: string;
      if (face.emissive) {
        fill = face.color;
      } else {
        // Light the face in world space, after yaw, so highlights travel.
        const worldPts = face.pts.map((p): Vec3 => {
          const [x, y, z] = p;
          return [
            x * Math.cos(yaw) - z * Math.sin(yaw),
            y,
            x * Math.sin(yaw) + z * Math.cos(yaw),
          ];
        });
        const n = faceNormal(worldPts);
        const key = Math.max(0, n[0] * KEY[0] + n[1] * KEY[1] + n[2] * KEY[2]);
        const rim = Math.max(0, n[0] * RIM[0] + n[1] * RIM[1] + n[2] * RIM[2]);
        const lit = 0.46 + key * 1.30 + Math.pow(rim, 3) * 1.35;
        fill = shade(face.color, lit);
      }

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.globalAlpha = mirror ? 0.16 : 1;
      ctx.fill();
      // Hairline stroke in the fill colour closes the seams between quads
      // without introducing a visible wireframe.
      ctx.strokeStyle = fill;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  // Reflection underneath, clipped to the floor and faded out.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, floorY, width, height - floorY);
  ctx.clip();
  ctx.filter = "blur(3px)";
  drawPass(true);
  ctx.filter = "none";
  ctx.restore();

  // A gradient wash over the reflection so it dissolves into the floor.
  const wash = ctx.createLinearGradient(0, floorY, 0, floorY + S * 0.34);
  wash.addColorStop(0, "rgba(6,6,7,0.30)");
  wash.addColorStop(1, "rgba(6,6,7,0.96)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, floorY, width, S * 0.34);

  drawPass(false);

  // Bloom off the light bar, strongest when the tail faces the camera.
  const facing = Math.cos(yaw);
  if (facing < 0.25) {
    const strength = Math.min(1, (0.25 - facing) / 1.1);
    const g = ctx.createRadialGradient(cx, cy - S * 0.05, 0, cx, cy - S * 0.05, S * 0.44);
    g.addColorStop(0, `${accent}${Math.round(strength * 62).toString(16).padStart(2, "0")}`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  // Corner vignette, which is what makes the studio read as enclosed.
  const vig = ctx.createRadialGradient(cx, cy, S * 0.30, cx, cy, D * 1.05);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}
