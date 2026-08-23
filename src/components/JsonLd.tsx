/**
 * Structured data, server-rendered into the markup so a crawler that doesn't
 * execute JavaScript still sees it.
 *
 * The payload is our own object literal, never user input, so serialising it
 * into a script tag is safe — but `<` is still escaped, because a stray `</`
 * inside any string would close the tag early and break the whole block.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
