# Story page (`/story/index.html`)

Scrollytelling landing page for the domain: how Shelfie started, the market, what a shelf check costs today, how it works, real preprod transactions, the team, and buttons to `/dashboard` and `/w`. The site root `/` redirects here (`src/App.tsx`).

Static files in `public/story/` (copied as-is into the build, so Vercel and the engine serve them): `index.html`, `story.css`, `story.js`, `story-spec.json`, the logo and the team photos. No dependencies, no inline script or style (the site CSP in `codigo/vercel.json` allows `'self'` only), system fonts.

## How the scroll scene works
Scroll progress of the pinned room (0 to 1) -> frame -> `story.js` draws exactly that frame on a canvas. The frames are procedural: the cart from the logo is assembled in code (handle, basket, grid, rail, four wheels, products, verified photo, escrow blocks), so there are no image files to load. Beat ranges live in the HTML (`data-from`, `data-to`) and in `public/story/story-spec.json`. Reduced motion and no-JS show the finished cart (reduced motion) and every beat as plain content.

## Facts on the page
Every market and price figure comes from `pitch/market-pricing.md` and `pitch/pitch-plan.md` section 4, with the source linked on the page. Shelfie prices are marked as our estimates. Transaction links are the real preprod hashes in `codigo/docs/evidence/tx-hashes.md`. Change a number in the pitch files first, then here.

## Optional: AI-rendered frames instead of the drawn cart
The page works without them. If the team later wants photoreal frames (Imagen keyframes, an image-to-video model), use `asset-prompts.md` and `compile_sequence.py` here, then swap the procedural `render(p)` for a manifest-based image sequence (`frameUrlTemplate`, `frameCount`). Keep the text in HTML, never in the images.

## Run locally
`cd codigo && npm run dev -w @shelfie/web`, then open `http://127.0.0.1:5173/story/index.html` (the Vite dev server does not map `/story/` to its `index.html`; Vercel does).
