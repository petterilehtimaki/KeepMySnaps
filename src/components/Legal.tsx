import type { LegalBlock } from "@/content/legal";

/**
 * Renders the privacy policy and the terms from `src/content/legal.ts`.
 *
 * The copy lives in a content file rather than in JSX so it reads as prose
 * while it's being written and edited, instead of as a wall of escaped
 * apostrophes.
 */
export default function LegalProse({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="max-w-[64ch]">
      {blocks.map((block, i) => {
        if (block.kind === "h") {
          return (
            <h2
              key={block.text}
              className="mt-12 text-[1.0625rem] font-bold tracking-[-0.015em] text-ink first:mt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.kind === "ul") {
          return (
            <ul key={`ul-${i}`} className="mt-4 space-y-4">
              {block.items.map((item) => (
                <li
                  key={item.text.slice(0, 40)}
                  className="border-l border-hair pl-5 text-[0.9375rem] leading-[1.7] text-muted-cool"
                >
                  {item.lead && (
                    <span className="font-bold text-ink">{item.lead} </span>
                  )}
                  {item.text}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={block.text.slice(0, 40)}
            className="mt-4 text-[0.9375rem] leading-[1.7] text-muted-cool"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
