/**
 * An illustration of Snapchat's Settings → My Data screen, showing which two
 * controls matter.
 *
 * NOTE: this is a hand-drawn mockup, not a screenshot of the real app. It is
 * deliberately generic and is here to be replaced with a genuine screenshot
 * once someone takes one. The two numbered markers correspond to the list
 * rendered beside it.
 */

const BLUE = "#2563EB";
const HAIR = "#ECEBE6";
const FILL = "#EFEDE8";
const INK = "#1A1A17";
const MUTED = "#8A8A84";

function Marker({ cx, cy, n }: { cx: number; cy: number; n: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="11" fill={BLUE} />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#FFFFFF"
      >
        {n}
      </text>
    </>
  );
}

function Screen() {
  return (
    <svg
      viewBox="0 0 360 460"
      className="h-auto w-full max-w-[360px]"
      role="img"
      aria-label="Mockup of Snapchat's My Data settings screen. A checkbox labelled Include your Memories is marked 1, and a Submit Request button is marked 2."
    >
      {/* phone frame */}
      <rect
        x="0.75"
        y="0.75"
        width="358.5"
        height="458.5"
        rx="18"
        fill="#FFFFFF"
        stroke={HAIR}
        strokeWidth="1.5"
      />

      {/* header */}
      <path
        d="M27 28l-7-7 7-7"
        stroke={MUTED}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform="translate(0 7)"
      />
      <text x="180" y="34" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>
        My Data
      </text>
      <line x1="0" y1="56" x2="360" y2="56" stroke={HAIR} strokeWidth="1.5" />

      {/* intro copy, represented rather than invented */}
      <text x="24" y="88" fontSize="15" fontWeight="700" fill={INK}>
        Request your data
      </text>
      <rect x="24" y="102" width="296" height="6" rx="3" fill={FILL} />
      <rect x="24" y="114" width="280" height="6" rx="3" fill={FILL} />
      <rect x="24" y="126" width="190" height="6" rx="3" fill={FILL} />

      {/* two ordinary rows, for context */}
      <text x="24" y="168" fontSize="13" fontWeight="600" fill={INK}>
        Email address
      </text>
      <rect x="232" y="161" width="88" height="7" rx="3.5" fill={FILL} />
      <line x1="24" y1="188" x2="320" y2="188" stroke={HAIR} strokeWidth="1.5" />

      <text x="24" y="216" fontSize="13" fontWeight="600" fill={INK}>
        Date range
      </text>
      <text x="320" y="216" textAnchor="end" fontSize="13" fontWeight="500" fill={MUTED}>
        All time
      </text>
      <line x1="24" y1="236" x2="320" y2="236" stroke={HAIR} strokeWidth="1.5" />

      {/* 1 — the checkbox that decides whether you get photos at all */}
      <rect
        x="14"
        y="250"
        width="312"
        height="56"
        rx="10"
        fill={BLUE}
        fillOpacity="0.04"
        stroke={BLUE}
        strokeWidth="1.75"
      />
      <rect x="28" y="269" width="18" height="18" rx="4" fill={BLUE} />
      <path
        d="M32.5 278.2l3.2 3.2 6-6.2"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text x="58" y="284" fontSize="13.5" fontWeight="700" fill={INK}>
        Include your Memories
      </text>
      <Marker cx={340} cy={278} n="1" />

      <rect x="24" y="326" width="240" height="6" rx="3" fill={FILL} />
      <rect x="24" y="338" width="160" height="6" rx="3" fill={FILL} />

      {/* 2 — submit */}
      <rect
        x="14"
        y="374"
        width="312"
        height="64"
        rx="12"
        fill={BLUE}
        fillOpacity="0.04"
        stroke={BLUE}
        strokeWidth="1.75"
      />
      <rect x="24" y="384" width="292" height="44" rx="6" fill={INK} />
      <text
        x="170"
        y="411"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#FFFFFF"
      >
        Submit Request
      </text>
      <Marker cx={340} cy={406} n="2" />
    </svg>
  );
}

const NOTES = [
  {
    n: "1",
    title: "“Include your Memories”",
    body: "The one that decides whether you get photos. Leave it unticked and Snapchat sends a complete archive of your account containing no pictures whatsoever, which is a long wait for nothing.",
  },
  {
    n: "2",
    title: "Submit Request",
    body: "Then this. The export goes to the email address on the account, not to your phone, and turns up somewhere between twenty minutes and several days later.",
  },
];

export default function MyDataMockup() {
  return (
    <figure className="mt-12 grid grid-cols-1 items-start gap-x-14 gap-y-10 md:grid-cols-[minmax(0,360px)_1fr]">
      <Screen />

      <div>
        <ol className="space-y-7">
          {NOTES.map((note) => (
            <li key={note.n} className="flex gap-4">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue text-[0.75rem] font-bold text-white">
                {note.n}
              </span>
              <div className="max-w-[46ch]">
                <h3 className="text-[0.9375rem] font-bold tracking-[-0.015em]">
                  {note.title}
                </h3>
                <p className="mt-1.5 text-[0.9375rem] leading-[1.65] text-muted-cool">
                  {note.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <figcaption className="mt-9 max-w-[46ch] text-[0.8125rem] leading-[1.6] text-muted">
          This is a mockup, not a screenshot. Snapchat rearranges this screen
          from time to time, so treat it as a description of what you&rsquo;re
          looking for rather than a photograph of it.
        </figcaption>
      </div>
    </figure>
  );
}
