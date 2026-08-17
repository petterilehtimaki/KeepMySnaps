import { GUIDE, OPTIONAL_TOGGLES, type GuideStep } from "@/content/export-guide";

/**
 * The tap-by-tap Snapchat export guide on /how-it-works.
 *
 * The illustrations are drawn here rather than screenshotted. Two reasons: a
 * real screenshot carries somebody's name, username and friends list, and
 * Snapchat's own screens differ by platform, app version and whether the phone
 * is in dark mode. These are deliberately generic — grey placeholder rows, no
 * faces, and "Jane Doe" throughout — and they're drawn in the site's own
 * palette so they read as diagrams rather than as evidence.
 *
 * Anything a reader has to match against their screen is set in real words;
 * everything else is a grey bar, because inventing plausible-looking UI copy
 * would be worse than admitting we've left it out.
 */

const INK = "#1A1A17";
const MUTED = "#8A8A84";
const HAIR = "#ECEBE6";
const FILL = "#EFEDE8";
const FAINT = "#F6F5F2";
const BLUE = "#2563EB";

/* ── primitives ──────────────────────────────────────────────────────────── */

function Frame({
  h,
  label,
  children,
}: {
  h: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 240 ${h}`}
      className="h-auto w-full max-w-[240px]"
      role="img"
      aria-label={label}
    >
      <rect
        x="0.75"
        y="0.75"
        width="238.5"
        height={h - 1.5}
        rx="14"
        fill="#FFFFFF"
        stroke={HAIR}
        strokeWidth="1.5"
      />
      {children}
    </svg>
  );
}

/** A stand-in for text we haven't reproduced. */
function Bar({
  x,
  y,
  w,
  h = 6,
  fill = FILL,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
}

function Rule({ y, x1 = 16, x2 = 224 }: { y: number; x1?: number; x2?: number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={HAIR} strokeWidth="1.25" />;
}

/** The blue outline that says "this one". */
function Ring({
  x,
  y,
  w,
  h,
  rx = 10,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={BLUE}
      fillOpacity="0.04"
      stroke={BLUE}
      strokeWidth="1.75"
    />
  );
}

function Toggle({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width="30"
        height="17"
        rx="8.5"
        fill={on ? BLUE : "#FFFFFF"}
        stroke={on ? BLUE : HAIR}
        strokeWidth="1.5"
      />
      <circle
        cx={on ? x + 21.5 : x + 8.5}
        cy={y + 8.5}
        r="5.75"
        fill={on ? "#FFFFFF" : MUTED}
      />
    </>
  );
}

function Chevron({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 4}l4 4-4 4`}
      stroke={MUTED}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

function Label({
  x,
  y,
  children,
  size = 10.5,
  weight = 600,
  fill = INK,
  anchor,
}: {
  // SVG takes either; the screens below use both, so don't narrow it.
  x: number | string;
  y: number | string;
  children: string;
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: "middle" | "end";
}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor}>
      {children}
    </text>
  );
}

/* ── the screens ─────────────────────────────────────────────────────────── */

/** 1 — the profile icon in the top-left corner. */
function ChatScreen() {
  return (
    <Frame
      h={352}
      label="Illustration of Snapchat's chat screen. The round profile icon in the top-left corner is circled."
    >
      <circle cx="30" cy="34" r="12" fill={FILL} />
      <circle cx="30" cy="34" r="18.5" fill="none" stroke={BLUE} strokeWidth="1.75" />
      <Label x="120" y="38" anchor="middle" size={12.5} weight={700}>
        Chat
      </Label>
      <circle cx="196" cy="34" r="9" fill={FAINT} />
      <circle cx="218" cy="34" r="9" fill={FAINT} />
      <Rule y={58} x1={0} x2={240} />

      {[84, 128, 172, 216, 260].map((cy) => (
        <g key={cy}>
          <circle cx="34" cy={cy} r="14" fill={FILL} />
          <Bar x={58} y={cy - 11} w={96} h={7} />
          <Bar x={58} y={cy + 3} w={52} h={5} fill={FAINT} />
        </g>
      ))}

      <Rule y={306} x1={0} x2={240} />
      {[38, 78, 120, 162, 202].map((cx) => (
        <circle key={cx} cx={cx} cy="330" r="7" fill={FAINT} />
      ))}
    </Frame>
  );
}

/** 2 — the gear, top-right. */
function ProfileScreen() {
  return (
    <Frame
      h={352}
      label="Illustration of a Snapchat profile screen for a placeholder account named Jane Doe. The settings gear in the top-right corner is circled."
    >
      <path
        d="M26 28l-6 6 6 6"
        stroke={MUTED}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="138" y="24" width="44" height="20" rx="10" fill={FILL} />
      <circle cx="208" cy="34" r="8.5" fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="208" cy="34" r="2.75" fill={INK} />
      <circle cx="208" cy="34" r="16.5" fill="none" stroke={BLUE} strokeWidth="1.75" />

      <circle cx="120" cy="96" r="28" fill={FILL} />
      <Label x="120" y="146" anchor="middle" size={13} weight={700}>
        Jane Doe
      </Label>
      <Label x="120" y="163" anchor="middle" size={10.5} weight={500} fill={MUTED}>
        janedoe123
      </Label>

      <rect x="16" y="180" width="100" height="28" rx="14" fill="none" stroke={HAIR} strokeWidth="1.5" />
      <Label x="66" y="198" anchor="middle" size={10}>
        My Account
      </Label>
      <rect x="124" y="180" width="100" height="28" rx="14" fill="none" stroke={HAIR} strokeWidth="1.5" />
      <Label x="174" y="198" anchor="middle" size={10}>
        Public Profile
      </Label>

      <Label x="16" y="240" size={10.5} weight={700}>
        Stories
      </Label>
      {[250, 292].map((y) => (
        <g key={y}>
          <rect x="16" y={y} width="208" height="34" rx="8" fill={FAINT} />
          <circle cx="38" cy={y + 17} r="10" fill={FILL} />
          <Bar x={58} y={y + 14} w={78} h={6} />
        </g>
      ))}
    </Frame>
  );
}

/** 3 — My Data, buried in Privacy Controls. */
function SettingsScreen() {
  return (
    <Frame
      h={392}
      label="Illustration of Snapchat's Settings list, scrolled to the Privacy Controls section. The My Data row is circled."
    >
      <path
        d="M26 28l-6 6 6 6"
        stroke={MUTED}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Label x="120" y="38" anchor="middle" size={12.5} weight={700}>
        Settings
      </Label>
      <Rule y={58} x1={0} x2={240} />

      <Label x="16" y="82" size={10} weight={700} fill={MUTED}>
        My Account
      </Label>
      <Bar x={16} y={94} w={120} />
      <Bar x={16} y={112} w={96} />

      <Label x="16" y="146" size={10} weight={700} fill={MUTED}>
        Additional Services
      </Label>
      <Bar x={16} y={158} w={104} />
      <Bar x={16} y={176} w={132} />

      <Label x="16" y="212" size={10.5} weight={700}>
        Privacy Controls
      </Label>

      {[
        ["Clear Data", 240],
        ["Map", 276],
        ["Family Center", 312],
      ].map(([text, y]) => (
        <g key={text as string}>
          <Label x={16} y={y as number} size={10.5} weight={500} fill={MUTED}>
            {text as string}
          </Label>
          <Chevron x={212} y={(y as number) - 4} />
          <Rule y={(y as number) + 12} />
        </g>
      ))}

      <Ring x={8} y={332} w={224} h={40} />
      <Label x="20" y="357" size={11.5} weight={700}>
        My Data
      </Label>
      <Chevron x={208} y={352} />
    </Frame>
  );
}

/** 4 — the two toggles that matter. */
function TogglesScreen() {
  return (
    <Frame
      h={362}
      label="Illustration of the Select data to include list. Export your Memories and Export JSON Files are switched on and circled; the rest are off."
    >
      <Label x="16" y="34" size={14} weight={800}>
        My Data
      </Label>
      <Rule y={50} x1={0} x2={240} />

      <Label x="16" y="72" size={10.5} weight={700}>
        Select data to include
      </Label>
      <Label x="224" y="72" anchor="end" size={9} weight={600} fill={MUTED}>
        2 / 10 selected
      </Label>

      <Ring x={8} y={84} w={224} h={80} />
      <Label x="20" y="110" size={11} weight={700}>
        Export your Memories
      </Label>
      <Toggle x={186} y={101} on />
      <Label x="20" y="142" size={11} weight={700}>
        Export JSON Files
      </Label>
      <Label x="20" y="155" size={8.5} weight={500} fill={MUTED}>
        For data portability purposes
      </Label>
      <Toggle x={186} y={135} on />

      {[
        ["User Information", 194],
        ["Chat History", 232],
        ["Spotlight", 270],
      ].map(([text, y]) => (
        <g key={text as string}>
          <Label x={20} y={(y as number) + 5} size={10.5} weight={500} fill={MUTED}>
            {text as string}
          </Label>
          <Toggle x={186} y={(y as number) - 8} on={false} />
        </g>
      ))}

      <Label x="20" y="306" size={12} weight={700} fill={MUTED}>
        …
      </Label>

      <rect x="168" y="318" width="56" height="26" rx="13" fill={BLUE} />
      <Label x="196" y="335" anchor="middle" size={10.5} weight={700} fill="#FFFFFF">
        Next
      </Label>
    </Frame>
  );
}

/** 6 — All Time, and the address it gets sent to. */
function DateRangeScreen() {
  return (
    <Frame
      h={300}
      label="Illustration of the date range step. All Time is selected from the list of ranges and circled, and the email field reads your@email.com."
    >
      <Label x="16" y="32" size={10.5} weight={700}>
        Choose date range, confirm email
      </Label>
      <Rule y={44} />

      <rect x="16" y="58" width="124" height="106" rx="8" fill={FAINT} />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={30 + col * 19}
            cy={78 + row * 22}
            r="5"
            fill={row === 3 && col > 3 ? "#FFFFFF" : FILL}
          />
        )),
      )}

      <rect x="152" y="58" width="72" height="20" rx="10" fill={FAINT} />
      <Label x="188" y="72" anchor="middle" size={9} weight={600} fill={MUTED}>
        Last Year
      </Label>
      <rect x="152" y="84" width="72" height="20" rx="10" fill={FAINT} />
      <Label x="188" y="98" anchor="middle" size={9} weight={600} fill={MUTED}>
        2 Year
      </Label>
      <rect x="152" y="110" width="72" height="22" rx="11" fill={BLUE} />
      <Label x="188" y="125" anchor="middle" size={9.5} weight={700} fill="#FFFFFF">
        All Time
      </Label>
      <Ring x={144} y={104} w={88} h={34} rx={17} />

      <Label x="16" y="192" size={9.5} weight={600} fill={MUTED}>
        Confirm your email
      </Label>
      <rect x="16" y="200" width="208" height="28" rx="6" fill={FAINT} />
      <Label x="28" y="218" size={10.5} weight={600}>
        your@email.com
      </Label>

      <rect x="16" y="246" width="64" height="28" rx="14" fill={FILL} />
      <Label x="48" y="264" anchor="middle" size={10} weight={700} fill={MUTED}>
        Back
      </Label>
      <rect x="152" y="246" width="72" height="28" rx="14" fill={BLUE} />
      <Label x="188" y="264" anchor="middle" size={10} weight={700} fill="#FFFFFF">
        Submit
      </Label>
    </Frame>
  );
}

/** 8 — the email you're waiting for. */
function EmailScreen() {
  return (
    <Frame
      h={240}
      label="Illustration of an email from Team Snapchat with the subject: Your Snapchat data is ready for download."
    >
      <Bar x={16} y={26} w={16} h={7} />
      <Bar x={40} y={26} w={16} h={7} />
      <Bar x={200} y={26} w={24} h={7} />
      <Rule y={48} x1={0} x2={240} />

      <Label x="16" y="76" size={12.5} weight={800}>
        Your Snapchat data is
      </Label>
      <Label x="16" y="94" size={12.5} weight={800}>
        ready for download
      </Label>

      <circle cx="26" cy="124" r="10" fill={FILL} />
      <Label x="44" y="128" size={10.5} weight={700}>
        Team Snapchat
      </Label>

      <Bar x={16} y={154} w={200} />
      <Bar x={16} y={170} w={186} />
      <Bar x={16} y={186} w={128} />

      <Label x="16" y="216" size={10.5} weight={700} fill={BLUE}>
        click here
      </Label>
      <line x1="16" y1="220" x2="66" y2="220" stroke={BLUE} strokeWidth="1.25" />
    </Frame>
  );
}

/** 9 — Your exports, not the form underneath it. */
function ExportsScreen() {
  return (
    <Frame
      h={286}
      label="Illustration of the My Data page. The Your exports box, holding the finished download, is circled; the request form below it is greyed out."
    >
      <Label x="16" y="34" size={14} weight={800}>
        My Data
      </Label>
      <Label x="16" y="52" size={9.5} weight={500} fill={MUTED}>
        Data available for download
      </Label>

      <Ring x={8} y={66} w={224} h={78} />
      <Label x="20" y="90" size={10.5} weight={700}>
        Your exports
      </Label>
      <Rule y={100} x1={20} x2={220} />
      <Label x="20" y="124" size={10} weight={600} fill={MUTED}>
        Export ready
      </Label>
      <rect x="152" y="110" width="66" height="20" rx="10" fill={BLUE} />
      <Label x="185" y="124" anchor="middle" size={9} weight={700} fill="#FFFFFF">
        Download
      </Label>

      <Label x="16" y="180" size={10} weight={600} fill={MUTED}>
        Select data to include
      </Label>
      <Rule y={190} />
      {[206, 234].map((y) => (
        <g key={y}>
          <Bar x={16} y={y} w={104} />
          <Toggle x={186} y={y - 6} on={false} />
        </g>
      ))}
      <Bar x={16} y={262} w={72} />
    </Frame>
  );
}

const FIGURES: Record<NonNullable<GuideStep["figure"]>, () => React.ReactElement> = {
  chat: ChatScreen,
  profile: ProfileScreen,
  settings: SettingsScreen,
  toggles: TogglesScreen,
  daterange: DateRangeScreen,
  email: EmailScreen,
  exports: ExportsScreen,
};

/* ── the walkthrough ─────────────────────────────────────────────────────── */

export default function ExportWalkthrough() {
  return (
    <div className="mt-14">
      <ol className="space-y-14">
        {GUIDE.map((step) => {
          const Figure = step.figure ? FIGURES[step.figure] : null;

          return (
            <li
              key={step.n}
              className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-[1fr_minmax(0,240px)] md:items-start"
            >
              <div className="flex gap-4">
                <span className="tnum mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue text-[0.75rem] font-bold text-white">
                  {step.n}
                </span>

                <div className="max-w-[54ch]">
                  <h3 className="text-[1rem] font-bold tracking-[-0.015em] text-balance">
                    {step.title}
                  </h3>

                  <div className="mt-3 space-y-3.5">
                    {step.body.map((para) => (
                      <p
                        key={para.slice(0, 40)}
                        className="text-[0.9375rem] leading-[1.7] text-muted-cool"
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {step.n === "5" && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {OPTIONAL_TOGGLES.map((name) => (
                        <li
                          key={name}
                          className="rounded-[5px] bg-faint px-2.5 py-1.5 text-[0.8125rem] font-semibold text-muted-cool"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {Figure && (
                <div className="pl-10 md:pl-0">
                  <Figure />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-14 max-w-[52ch] text-[0.8125rem] leading-[1.6] text-muted">
        Those are drawings, not screenshots — no real account appears in any of
        them. Snapchat moves this flow around every so often, so match the
        wording rather than the exact position on your screen.
      </p>
    </div>
  );
}
