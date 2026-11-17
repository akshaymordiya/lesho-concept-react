# Lesho — interactive concept preview

This is the clickable prototype that the production apps are built from. Specifications live in `../docs/`.

A frontend-only React prototype of Lesho, a local-commerce discovery and lead-generation
concept. See `LESHO_PRODUCT_CONCEPT_AND_FABLE5_PROMPT.md` for the original product definition and `../docs/` for the build specification.

## Run

```bash
cd concept
npm install
npm run dev      # http://localhost:5180
npm run build    # production bundle in dist/
```

On desktop the app sits in a phone frame with a side panel that jumps to any screen and
switches between the consumer and merchant views. Under 520 px wide it fills the viewport.
Screens are also addressable by hash, e.g. `#/c/product/p1`, `#/c/viewer/dp1`, `#/m/mleads`.

## Structure

- `src/data.js` — all mock data (Ahmedabad businesses, catalogue, posts, offers, events, reviews, leads)
- `src/styles.css` — design tokens and component styles
- `src/ui.jsx` — shared components (cards, sheets, image with fallback, mock reference code)
- `src/App.jsx` — state, stack navigation, device frame
- Rentals: any catalogue item can be listed to sell, rent out, or both (`rent` on a product in `src/data.js`; screens in `src/screens/Rental.jsx`). Customers send a dated rental request; the shop accepts, hands over against the reference and marks the return. No payment or deposit is handled in the app.
- Entertainment: cinemas, theatres and arcades list showtimes, activities, events and coupon codes. Claiming a coupon reveals the code and creates a reference; tickets and seats are never sold or held in the app.
- Claim expiry: an offer can give claims a time limit (`claimWindow` in minutes on an offer in `src/data.js`). Claims show a live countdown and expire on their own; the merchant composer has a 1-minute demo option.
- `src/screens/` — Home, Guide (mock AI), Explore, Detail (product, business, event, offer),
  Viewer (vertical reels feed, stories, photo-dump carousel, review), Flows (enquiry, visit intent, confirmation, review), Me, Merchant

## What is simulated

Everything is local state and resets on reload. There is no backend, AI model, map, payment,
upload or messaging. The guide is deterministic keyword matching over the mock catalogue.
Reels and stories are still images with motion and timers. The Explore map is an illustrative drawing, not real cartography. Reference codes are decorative, not scannable.
Photos load from the Unsplash CDN and fall back to a neutral tile when offline.
Lead prices in the merchant view are sample figures; pricing is an open product decision.
