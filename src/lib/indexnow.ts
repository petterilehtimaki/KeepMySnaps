/**
 * IndexNow host key.
 *
 * Not a secret — it is a public ownership proof. IndexNow fetches
 * `https://<host>/<key>.txt`, expects the key itself as the body, and only
 * then accepts URL submissions for this domain. The file lives in `public/`
 * because it never changes and a route handler can't own a path shaped like
 * `<key>.txt` anyway: an app-router dynamic segment has to be the whole
 * segment, so `[key].txt` never matches.
 *
 * `indexnow.test.ts` asserts the file and this constant still agree, which is
 * the only thing standing between a rename and a silently dead submission
 * endpoint.
 *
 * Bing, Yandex, Seznam and Naver consume it; Google does not participate. On a
 * domain this new that trade is worth taking — Bing's index is what feeds
 * ChatGPT's search, and it accepts new domains far faster than Google does.
 */
export const INDEXNOW_KEY = "3c94be2938cc8a991788b3ebfdd5712a";

export const INDEXNOW_KEY_FILE = `/${INDEXNOW_KEY}.txt`;
