# OFF THE SADDLE — OBJECTS

## Original problem statement
Build an original interactive marketplace ("OBJECTS") for the artisan jewellery brand OFF THE SADDLE that feels like an interactive digital exhibition rather than an ecommerce store. Near-black background, warm off-white type, terracotta accents from the logo, large photographic jewellery objects placed spatially (varied scale/rotation), horizontal drag navigation with inertia and depth parallax, hover refinement, cinematic full-screen product view with ADD TO BAG, minimal header (logo + MENU), bottom UI "01 / 08 — DRAG TO EXPLORE →". GSAP + Lenis. Only the marketplace for v1 (no homepage/about/journal/checkout/footer).

## User choices
- Static product data in frontend (`src/data/products.js`)
- ADD TO BAG = visual confirmation + bag count in header (no checkout)
- MENU = minimal full-screen overlay with placeholder links
- AI-generated editorial jewellery photography

## Architecture
- React (CRA/craco) frontend only; backend template untouched (no API used).
- `src/lib/gsap.js` registers Draggable + InertiaPlugin.
- `src/components/Exhibition.js`: Lenis (horizontal, wheel) as scroll source of truth; GSAP Draggable proxy with inertia drives `lenis.scrollTo`; gsap.ticker positions objects with per-object depth speed, in-frame image parallax, velocity skew, active-index detection.
- `ExhibitionObject`, `Header`, `BottomUI`, `Cursor`, `ProductView` (frame-to-fullscreen transition), `MenuOverlay`.
- Logo processed to transparent PNG at `public/logo.png`.

## Implemented (June 2026)
- Full-screen spatial exhibition of 8 objects, drag + wheel navigation with inertia
- Depth parallax, image parallax, hover states (scale/rotate/dim others/reveal metadata)
- Custom cursor (VIEW / DRAG / link states)
- Cinematic product view with masked title reveal, specs, story, price, ADD TO BAG → header bag count
- Menu overlay, bottom counter + drag cue, intro animation

## Implemented (Sept 2026 — "Chronicle" film-reel redesign)
- Renamed exhibition concept "Objects" → "Chronicle" (ghost word, header title, menu link 01, product-view eyebrow)
- Aligned FILM-REEL layout: uniform tall portrait cards in a horizontal row, each framed with film-strip perforation borders (top & bottom sprocket holes) + bottom scrim; persistent top-left tag (number + place)
- Big elegant serif (Instrument Serif) product-name reveal on hover with masked slide-in animation + details fade-in; non-hovered cards dim
- Stronger multi-depth image parallax on horizontal scroll
- Bottom "chronicle pager" bar `[ 01 02 … 08 ]` highlighting active object (boxed) + progress line, updates on scroll
- Product view PREV / NEXT navigation (buttons + ArrowLeft/Right keys) — cyclic, swap-in animation, no full close; underlying exhibition glides (immediate) to keep close-morph on-screen
- BAG drawer: slide-in panel listing added items (thumb/name/place/price), Remove, running Total, Checkout (disabled when empty), empty state; Escape/backdrop/close to dismiss
- Keyboard exploration: Left/Right arrow keys glide the exhibition object-to-object with momentum (via Exhibition.glideTo imperative handle)
- Hardened ProductView.close against stale/detached sourceEl (graceful fade fallback)
- Verified via testing agent: iteration_2.json — 13/13 frontend flows passed (100%)

## Backlog
- P2: Touch/mobile fine-tuning; reduced-motion mode
- P2: Backend product API + admin
- P2: Functional checkout (currently visual); Footer; Homepage/About/Journal/Stories pages
