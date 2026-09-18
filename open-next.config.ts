import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import incrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Cloudflare build config.
 *
 * The only thing this site needs from the adapter is somewhere to read
 * prerendered pages from. Every guide is built at deploy time and nothing
 * revalidates on a timer, so the pages ship as static assets and are served
 * from there. Without this, the guide routes 404: the dynamic segment has no
 * cache to read its prerendered HTML out of.
 *
 * No image optimisation (every image is committed at its final size) and no
 * queue (nothing is revalidated in the background).
 */
export default defineCloudflareConfig({ incrementalCache });
