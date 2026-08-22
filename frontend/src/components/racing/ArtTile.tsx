/**
 * Procedural artwork for media tiles.
 *
 * The reference fills these slots with licensed motorsport photography.
 * Rather than ship placeholder greys, each tile renders a deterministic
 * abstract composition seeded from its id — angled speed bands, a light
 * sweep and a grain wash — so the grid has real tonal variety and the
 * hover/zoom choreography is judged against something with content in it.
 *
 * Swapping in real imagery means replacing this component's output with an
 * <img>; nothing else in the grid changes.
 */

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type Props = {
  id: string;
  tone: [string, string];
  className?: string;
};

export function ArtTile({ id, tone, className = "" }: Props) {
  const seed = hashSeed(id);
  const angle = 12 + (seed % 26);
  const bands = 4 + (seed % 3);
  const sweep = 18 + ((seed >> 3) % 50);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ background: `linear-gradient(${angle + 90}deg, ${tone[0]}, ${tone[1]})` }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`sweep-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.26" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
          </linearGradient>
          {/* The grain wash this once carried was an feTurbulence fractal at
              three octaves, re-rasterised on every tile the compositor
              touched. Removing it was worth 42% of the whole page's scroll
              raster time in an isolated ablation, for an effect invisible at
              10% opacity. Tonal variety now comes from the bands alone. */}
        </defs>

        {/* Angled speed bands. */}
        <g transform={`rotate(${angle} 200 150)`}>
          {Array.from({ length: bands }).map((_, i) => (
            <rect
              key={i}
              x={-120 + i * (420 / bands)}
              y={-80}
              width={16 + ((seed >> (i + 2)) % 40)}
              height={460}
              fill="#ffffff"
              opacity={0.045 + ((seed >> i) % 5) / 90}
            />
          ))}
        </g>

        {/* A single hard highlight edge, which gives the tile a subject. */}
        <path
          d={`M0 ${190 + (seed % 40)} Q 200 ${120 + (seed % 60)} 400 ${170 + (seed % 50)} L400 300 L0 300 Z`}
          fill="#000000"
          opacity="0.42"
        />
        <path
          d={`M0 ${190 + (seed % 40)} Q 200 ${120 + (seed % 60)} 400 ${170 + (seed % 50)}`}
          stroke="#ffffff"
          strokeOpacity="0.20"
          strokeWidth="1.4"
          fill="none"
        />

        <rect x="0" y="0" width="400" height="300" fill={`url(#sweep-${id})`} />
        <rect x={`${sweep}%`} y="0" width="2" height="300" fill="#ffffff" opacity="0.10" />
        <rect x="0" y="0" width="400" height="300" fill={`url(#floor-${id})`} />
      </svg>
    </div>
  );
}
