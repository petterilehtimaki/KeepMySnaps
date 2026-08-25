/**
 * Drawing an overlay onto the thing it belongs to.
 *
 * Lives on its own because both halves of the job need it — photos are
 * composited in `process.ts`, videos frame by frame in `video.ts` — and
 * `process` already imports `video`.
 */

/**
 * Draws `src` over the whole frame without squashing it.
 *
 * An overlay is the phone's screen, not the photo — a 720x1280 snap routinely
 * ships a 720x1384 overlay — so scaling it to the frame's exact width and
 * height stretches the caption by however much the two aspects differ. Scaling
 * to cover and centring costs a few pixels off an edge that was empty anyway,
 * and keeps the text the shape it was written in.
 */
export function drawCovering(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  src: CanvasImageSource & { width: number; height: number },
  width: number,
  height: number,
) {
  if (!src.width || !src.height) return;
  const scale = Math.max(width / src.width, height / src.height);
  const w = src.width * scale;
  const h = src.height * scale;
  ctx.drawImage(src, (width - w) / 2, (height - h) / 2, w, h);
}
