/**
 * Decorative colour for the hero: a scatter of blank photo shapes.
 *
 * Deliberately abstract. They are plain rounded rectangles with a fill and
 * nothing inside — no imagery, no glyphs, no rounded-square app tiles. This
 * site's pitch is that nothing leaves your browser, so anything that could be
 * read as a third-party logo or an "integrates with X" row would undercut it.
 *
 * Purely presentational: hidden from assistive tech and untouchable by the
 * pointer, so it can't intercept a tap meant for the CTA underneath.
 */

/** Warm tones extending the site palette, chosen to sit beside --color-muted. */
const CLAY = "#C98A6B";
const CLAY_DEEP = "#B87456";
const OCHRE = "#E3C27E";
const OCHRE_DEEP = "#D6AE60";
const GREIGE = "#DED3C4";
const GREIGE_DEEP = "#CFC1AE";
/** A light tint of the site blue: the cool note in a warm cluster. */
const BLUE_TINT = "#BFD0F7";
const FAINT = "#F6F5F2";
const HAIR = "#ECEBE6";

type Variant = "left" | "right" | "fan";

/** One blank photo. `t` is a rotation about its own centre. */
function Photo({
  x,
  y,
  w,
  h,
  t,
  fill,
  stroke,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  fill: string;
  stroke?: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="8"
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.5 : undefined}
      transform={`rotate(${t} ${x + w / 2} ${y + h / 2})`}
    />
  );
}

/**
 * Gradient ids have to be unique per rendered instance — the flanking pair and
 * the small fan are all in the DOM at once, and duplicate ids would silently
 * resolve to whichever came first.
 */
function Gradients({ uid }: { uid: string }) {
  const stops: [string, string, string][] = [
    [`clay-${uid}`, CLAY, CLAY_DEEP],
    [`ochre-${uid}`, OCHRE, OCHRE_DEEP],
    [`greige-${uid}`, GREIGE, GREIGE_DEEP],
  ];

  return (
    <defs>
      {stops.map(([id, from, to]) => (
        <linearGradient key={id} id={id} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      ))}
    </defs>
  );
}

const SHELL = "block h-auto";

export default function HeroThumbnails({ variant }: { variant: Variant }) {
  if (variant === "left") {
    return (
      <svg
        viewBox="0 0 190 300"
        className={`${SHELL} w-[190px]`}
        aria-hidden="true"
        focusable="false"
      >
        <Gradients uid="l" />
        <Photo x={30} y={14} w={88} h={106} t={-11} fill="url(#clay-l)" />
        <Photo x={62} y={112} w={76} h={92} t={8} fill="url(#ochre-l)" />
        <Photo x={16} y={196} w={68} h={82} t={-5} fill="url(#greige-l)" />
      </svg>
    );
  }

  if (variant === "right") {
    return (
      <svg
        viewBox="0 0 170 230"
        className={`${SHELL} w-[170px]`}
        aria-hidden="true"
        focusable="false"
      >
        <Gradients uid="r" />
        <Photo x={44} y={16} w={88} h={106} t={10} fill={BLUE_TINT} />
        <Photo x={22} y={120} w={72} h={88} t={-8} fill={FAINT} stroke={HAIR} />
      </svg>
    );
  }

  // The small screens get the whole set in one shallow fan, since there are no
  // side margins to hang anything in.
  return (
    <svg
      viewBox="0 0 236 104"
      className={`${SHELL} w-full max-w-[236px]`}
      aria-hidden="true"
      focusable="false"
    >
      <Gradients uid="f" />
      <Photo x={2} y={26} w={50} h={64} t={-14} fill="url(#greige-f)" />
      <Photo x={44} y={20} w={50} h={64} t={-7} fill="url(#clay-f)" />
      <Photo x={91} y={16} w={52} h={66} t={0} fill="url(#ochre-f)" />
      <Photo x={140} y={20} w={50} h={64} t={7} fill={BLUE_TINT} />
      <Photo x={182} y={26} w={50} h={64} t={14} fill={FAINT} stroke={HAIR} />
    </svg>
  );
}
