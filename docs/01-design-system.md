# 01 — Design system

The theme is fixed. The source of truth is `concept/src/styles.css`; this file explains it. New screens are built from these tokens and components. Do not add colours, fonts or card styles.

## 1. Character

Minimal, mobile-first, confident. A white canvas, near-black anchor surfaces, one blue for brand and primary actions, orange as a deliberate accent. Large rounded cards with hairline borders, a floating dark pill for navigation, line icons, restrained shadows.

## 2. Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `--blue` | `#2F6DEB` | Primary buttons, selected states, links, verified tick |
| `--blue-deep` | `#1F4FBF` | Primary hover, text on blue tints |
| `--blue-50` | `#EEF4FF` | Informational surfaces, soft buttons |
| `--blue-100` | `#DBE7FF` | Focus ring |
| `--ink` | `#17191D` | Text, dark cards, bottom navigation, dark buttons |
| `--ink-2` / `--ink-3` | `#24272D` / `#3A3E46` | Raised surfaces and dividers on dark |
| `--orange` | `#FF8A32` | Accent: AI spark, offers, timers, unread on dark, today bar |
| `--orange-50` | `#FFF2E8` | Offer and coupon surfaces |
| `--orange-ink` | `#A84B08` | Text on orange tints |
| `--white` | `#FFFFFF` | Canvas, cards |
| `--bg` | `#F6F7F9` | Secondary canvas, input fill, neutral chips |
| `--border` | `#E7E9EE` | Card and divider lines |
| `--muted` | `#666C78` | Secondary text (meets 4.5:1 on white) |
| `--faint` | `#9AA0AB` | Placeholder, tertiary |
| `--green` / `--green-50` | `#17845A` / `#E8F6EF` | Verified, completed |
| `--amber` / `--amber-50` | `#94610C` / `#FFF6E0` | Caution, limited, clash |
| `--red` / `--red-50` | `#C5392C` / `#FDECEA` | Errors, destructive |

Rules:

- White dominates browsing screens. Black anchors: bottom nav, AI card, merchant header, confirmation screen, content viewers.
- Blue carries every primary action. One primary button per screen.
- Orange is never a button fill for a primary action. It marks: the AI guide, offers and coupons, timers, the highlighted bar in a chart, unread counts on dark.
- Text on `--orange` is `--ink`, never white.
- Colour never carries meaning alone; pair it with a label or icon.

## 3. Typography

One family: **Plus Jakarta Sans** (400, 500, 600, 700, 800), fallback `system-ui`.

| Role | Size / line | Weight | Tracking |
| --- | --- | --- | --- |
| Display (onboarding only) | 28 / 1.2 | 800 | −0.03em |
| Screen title `.h1` | 22–23 / 1.2 | 800 | −0.03em |
| Section title `.h2` | 18.5 / 1.2 | 800 | −0.02em |
| Card title `.h3` | 16 | 700 | −0.01em |
| Body | 15 / 1.45 | 400 | 0 |
| Small `.small` | 13 | 400–600 | 0 |
| Tiny `.tiny` | 12 | 400–600 | 0 |
| Eyebrow | 11, uppercase | 700 | 0.08em |
| Price, numerals | 17–26 | 800 | −0.01em |

Headings stay modest. The Home greeting is 21 px. Do not exceed the display size anywhere except onboarding. Timers and reference codes use tabular numerals.

## 4. Space, radius, elevation

- Spacing scale: 4, 8, 12, 16, 20, 24, 32. Page gutter is 20.
- Radius: 10 (small), 14 (inputs, notes), 20 (cards), 28 (hero cards, sheets), 999 (pills, chips, buttons).
- Shadows: `--shadow-1` hairline lift, `--shadow-2` floating elements, `--shadow-3` navigation and popovers. Cards use a border, not a shadow.
- Touch targets are at least 44 × 44 with 8 px between them.

## 5. Layout

- Mobile-first; content width is the device width. On desktop the prototype shows a phone frame; production web should centre a 390–430 px column or adapt to a two-pane layout without changing components.
- Screens scroll vertically. Horizontal carousels start at the 20 px gutter and scroll edge to edge (`scroll-padding-inline: 20px`). A carousel must never start flush with the screen edge.
- Sticky top bar on pushed screens; floating bottom navigation on tab screens; a bottom action bar on detail and form screens. Never show the bottom navigation and an action bar together.
- Stack navigation keeps earlier screens mounted so scroll position survives going back.

## 6. Components

| Component | Class | Notes |
| --- | --- | --- |
| Primary button | `.btn.primary` | Blue pill, 48 px. One per view. |
| Dark button | `.btn.dark` | Secondary emphasis on light screens. |
| Soft button | `.btn.soft` | Blue tint; inline actions. |
| Ghost button | `.btn.ghost` | White with border; tertiary. |
| Icon button | `.icon-btn` | 44 px circle; variants `glass`, `onDark`, `plain`, `on`. Always has an `aria-label`. |
| Chip | `.chip` | Filters and choices. Selected is `--ink`; `.blue.on` for filter state. |
| Badge | `.badge` + tone | `blue` info, `green` verified or done, `orange` offer or timer, `amber` caution, `grey` neutral, `dark` label on imagery, `glass` on photos. |
| Segmented control | `.seg` | Two or three mutually exclusive views. |
| Card | `.card` | 20 px radius, 1 px border. Tones: `flat`, `blue`, `orange`, `ink`. |
| Product card | `.pcard` | 4:5 image, name, price, shop and distance. Badges sit on the image. |
| Business card | `.bizcard` | Cover, category badge, rating, distance. |
| Content tile | `.reel` | 9:15 tile for reels, stories, posts. Stories add a ring. |
| List row | `.listrow` | 72 px thumbnail, three text lines, chevron. |
| Note | `.note` + tone | Explanatory or honesty text with an icon. |
| Key-value row | `.kv` | Label left, value right; used in every detail and summary. |
| Sheet | `.sheet` | Bottom sheet for forms and pickers. |
| Popover | `.popover` in `.scrim.centre` | Centred modal; used for the enlarged reference code. |
| Reference code | `.mockcode`, `.refcode` | Pattern plus text code. Production renders a real QR. |
| Timer | `.countdown`, `.timerbox`, `.timerline` | Claim expiry. Orange on dark for the main timer. |
| Bottom navigation | `.nav` | Dark pill, five items, active item shows its label on white. |
| Action bar | `.actionbar` | Sticky bottom; primary action on the right. |
| Map pin | `.mpin` | Circular photo pin with a tail; selected is blue and larger. |
| Empty state | `.empty` | Icon tile, title, one sentence, one action. |
| Toast | `.toast` | One line, 2.6 s, above the navigation. |

Icons: one family, Lucide, 1.8–2 px stroke. No emoji as icons.

## 7. Patterns

- **Forms.** Visible labels, never placeholder-only. Errors appear under the field in red with an icon, after the first submit attempt. Consent is an explicit checkbox and is required for any lead.
- **Honesty text.** Every merchant-supplied fact that Lesho has not checked carries "merchant-provided" and a freshness time. Every request screen states what it is not ("not a confirmed reservation", "not a ticket", "not a confirmed booking").
- **Status badges.** Blue while in progress, green on a verified or completed outcome, grey when expired or declined, orange for new items in a merchant inbox.
- **Confirmation screen.** Dark background, blue icon, white ticket card with the reference, a "What happens next" timeline, and two buttons.
- **Loading.** Images shimmer until loaded and fall back to a neutral tile with the alt text. Lists should show skeleton rows of the final shape.
- **Motion.** 150–300 ms, ease `cubic-bezier(.2,.7,.2,1)`. Screens fade up 10 px; sheets slide up; the bottom nav pill morphs. Respect `prefers-reduced-motion`.
- **Reels.** Full-screen vertical feed, one reel per swipe with scroll snapping; tap to pause, double-tap to like; progress line at the bottom.
- **Stories.** Segmented progress at the top, auto-advance every 5 s, tap right or left, hold to pause, swipe sideways between shops, swipe down to close.

## 8. Accessibility

- Text contrast at least 4.5:1; large text and icons 3:1.
- Every interactive element is reachable by keyboard and has a visible focus ring (`--blue`, 2 px).
- Icon-only buttons have labels. Toggles expose pressed or checked state. Timers use `role="timer"`.
- No information by colour alone. No element that looks interactive may be inert.

## 9. Wording

- Sentence case everywhere. Plain verbs on buttons: "Send visit request", "Claim coupon", "Request to rent".
- Category-specific action labels; never a generic "Book now".
- Indian context: INR with Indian digit grouping (`₹12,500`), 12-hour times with am and pm, dates as `Sat, 14 Nov`.
- Fixed phrases, used verbatim: "merchant-provided", "merchant-reported", "not a confirmed reservation", "not a ticket", "Charged on Lesho ₹0".
