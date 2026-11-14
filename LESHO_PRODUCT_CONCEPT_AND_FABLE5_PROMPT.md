# LESHO --- Product Concept & Experience Definition

**Document type:** Product vision, concept definition, category
experience and prototype brief\
**Status:** Working product definition --- collaborative draft, not a
locked PRD\
**Product:** Lesho\
**Initial market direction:** India-first, with a focused local launch
before broader expansion\
**Primary surfaces:** Consumer mobile experience, merchant experience,
and platform operations/admin

------------------------------------------------------------------------

## 1. Executive vision

Lesho is an **intelligent local-commerce discovery and lead-generation
platform**. It helps people discover relevant products, services,
businesses, offers and local events, and helps local businesses turn
that discovery into measurable customer enquiries and visits.

Lesho combines the useful parts of modern social platforms---short-form
videos, photo posts, product storytelling, creator-like merchant
publishing, saves, sharing and consumer reviews---with the utility of
local search, catalogues, business profiles, guided recommendations and
trackable enquiries.

It is **social in format, but commerce-first in purpose**.

Lesho is not intended to become a general-purpose social network.
Content should have a clear relationship to a product, service,
business, promotion, shopping experience, restaurant, event or other
local commercial offering. General memes, unrelated personal updates,
generic entertainment posts and unrelated lifestyle content are outside
the core product purpose.

The platform must serve two equally important consumer behaviours:

1.  **Guided discovery:** a user explains what they need and an AI
    shopping/local discovery assistant helps them find relevant options.
2.  **Independent exploration:** a user browses nearby or selected
    locations through a well-organised discovery experience without
    having to chat with AI.

Both routes should lead naturally to useful product information and,
when the consumer chooses, a traceable business interaction.

### The core promise

-   **For consumers:** Find the right thing, from the right local
    business, with less effort and better context.
-   **For merchants:** Get discoverable, present products and
    experiences attractively, and receive attributable customer
    leads---not just vanity views.
-   **For Lesho:** Build trusted local-commerce intent data and monetise
    clearly defined, genuine lead outcomes.

------------------------------------------------------------------------

## 2. Product principles

These principles should guide every feature and design decision.

### 2.1 Commerce-first, not generic social media

Lesho can borrow familiar social interaction patterns, but every post
must be anchored to a commercial entity or experience. A post may be a
product reel, a new-arrival photo dump, a service demonstration, a
restaurant dish, a customer review, an event announcement or a
promotion. It should not be an unrelated personal status update.

### 2.2 Discovery must work with or without discounts

A merchant should not need to run a sale to be relevant. A consumer may
want a good saree, a reliable electrician, a restaurant with a
particular cuisine, a phone with certain specifications, or a weekend
event. Catalogue quality, service quality, location, reputation,
availability and relevance can be enough.

Offers are one discovery signal---not the whole product.

### 2.3 Two equal discovery modes

AI assistance must not become a gate that blocks ordinary browsing. A
user can start with a need and ask for help, or open the app and
explore. Switching between these modes should be effortless.

### 2.4 Category-aware conversion

A restaurant visit, a clothing enquiry, a salon appointment, an
electronics quotation and an event ticket enquiry are not the same
action. Lesho should have a common lead foundation but category-specific
interaction flows.

### 2.5 Trust and clarity

Never present an estimated price, stock level, opening status, event
capacity or merchant claim as verified when it is not. Show data
freshness and verification status where it matters. AI should explain
why it recommends something and distinguish known facts from
assumptions.

### 2.6 Merchant ROI over vanity metrics

Views and reach are useful diagnostics, but the commercial promise is
attributable demand. Merchant reporting must distinguish content
engagement, enquiries, qualified leads, visits, verified redemptions and
confirmed conversions.

### 2.7 Progressive disclosure

Do not overwhelm consumers with every filter, statistic, badge and
action at once. Show the most useful information first; reveal detailed
specifications, terms, reviews and lead actions when relevant.

### 2.8 Local-first, location-flexible

The default experience can be local, but users should be able to select
another neighbourhood, city or area and explore it remotely. Do not
assume that the user is physically present in the selected location.

------------------------------------------------------------------------

## 3. The two consumer experiences

## 3.1 Experience A --- AI-guided discovery

The AI assistant should feel like a knowledgeable local shopping guide
or mall concierge---not a generic chatbot and not an advertising bot.

### Example

A consumer says:

> I need a good saree for a wedding. My budget is around ₹5,000.

The assistant should identify or clarify the useful constraints:

-   Product category: saree
-   Occasion: wedding
-   Budget: approximately ₹5,000
-   Selected location or travel radius
-   Style, fabric, colour or other preferences, if needed
-   Whether the user wants a specific purchase soon or is just exploring

It can then present a curated selection of relevant products from
multiple local stores. The results should be useful even when stores do
not have discounts.

### AI discovery result

A result can include:

-   Product image or video
-   Product name and relevant details
-   Price or price range, with freshness/verification label
-   Store and branch name
-   Distance or selected-area relevance
-   Available product options, if supplied by the merchant
-   Relevant offer, if one exists
-   Rating/review context, if available
-   Why the item matches the user's request
-   Actions: view product, view store, compare, save, enquire, call,
    message or get directions

### Cross-store discovery

The assistant should be able to curate products from different
businesses into one coherent result set. It should not restrict the
consumer to one merchant's catalogue.

A user should be able to compare options, open the original product,
inspect the seller's full catalogue, see other products and promotions,
and contact the seller.

### AI behaviour requirements

-   Ask only useful clarifying questions; do not turn every search into
    a long interview.
-   Do not invent products, prices, stock, discounts, ratings, opening
    hours or booking availability.
-   Explain when a value is merchant-provided, recently confirmed,
    estimated or unavailable.
-   Respect the user's budget and location constraints.
-   Offer alternatives when an exact match is unavailable.
-   Avoid ranking purely by paid promotion. Sponsored placement must be
    clearly labelled and must not silently override relevance.
-   Keep the consumer in control. Recommendations are not automatic
    purchases or bookings.
-   Provide direct paths from AI results into normal product, business,
    event and category pages.
-   Learn preferences only through transparent, appropriate controls; do
    not expose private user behaviour to merchants.

### Suggested entry point

A calm, inviting prompt such as:

**"What are you looking for today?"**

Example prompt chips: - Find something for a wedding - Good food near
me - Compare phones - Discover events this weekend - Find a salon -
Explore local stores

These are examples, not a fixed final list.

## 3.2 Experience B --- Manual exploration

Manual exploration is equally important. A consumer may have no specific
need and simply want to see what's interesting nearby or in another
area.

The home experience should combine clear editorial sections rather than
becoming an endless, undifferentiated feed.

Potential sections:

-   For you
-   Near you
-   New arrivals
-   Popular products
-   Local favourites
-   Offers worth checking
-   Food and dining
-   Events this week
-   Recently added businesses
-   Product reels
-   Collections and photo stories
-   Shops you follow

Sections should be selected and ordered based on location, context, user
preferences and available inventory. Do not show empty sections or
manufacture trends when there is insufficient data.

### Explore controls

-   Around me
-   Choose an area
-   Explore another city
-   Category selection
-   Search
-   Map/list toggle where useful
-   Relevant filters such as price, distance, rating, availability, date
    or service type

Location controls should be visible and understandable. If location
permission is not granted, manual location selection must still work.

### AI inside manual exploration

AI can be available as a persistent, non-intrusive assistant entry
point. It can help refine a search, compare visible items or answer
questions about a business. It should not interrupt scrolling or force
the user into a conversation.

------------------------------------------------------------------------

## 4. Social-style publishing --- commerce content, not general content

This is a defining part of Lesho. The platform should feel familiar to
people who use modern social apps, but the publishing model must be
designed around products and commercial experiences.

### 4.1 Supported content formats

#### A. Short-form video / reels

Merchants can publish short vertical videos showing:

-   A product in use
-   New arrivals
-   Product details, quality or craftsmanship
-   Before-and-after service results
-   Food preparation or a signature dish
-   Store walkthroughs
-   A collection or seasonal range
-   Event highlights or previews
-   A service demonstration
-   A product comparison or explanation

A reel must be linked to at least one relevant product, catalogue item,
service, business, offer or event. It may link to several items when the
video genuinely showcases a collection.

#### B. Image posts

A single image can showcase:

-   A product
-   A service
-   A dish
-   A new collection
-   A promotion
-   A store or venue
-   An event
-   A product detail or specification

Image posts should support a clear title/caption, merchant identity,
location context and relevant linked entities.

#### C. Photo dumps / multi-image carousels

Merchants can publish a collection of images as one post. Examples:

-   "New festive saree collection"
-   "Five looks from our new arrivals"
-   "Inside our new café menu"
-   "Our latest handmade furniture pieces"
-   "Event highlights and venue photos"

Each image can have optional descriptive text and, where useful, a
product tag. A carousel should make it easy to open a tagged item
without losing the original post.

#### D. Product/catalogue posts

A structured product listing is different from a social post. It should
contain product data such as name, price, variants, description, images,
availability status (if maintained), SKU/reference and category
attributes. A merchant can attach a product to a reel or image post.

#### E. Offers and promotions

Offers should be structured, with terms and validity---not just a
graphic saying "SALE".

Possible fields include: - Offer title and description - Eligible
products/services - Discount or benefit - Start and end date/time -
Minimum purchase or eligibility - Redemption method - Branch
applicability - Usage limits, if any - Terms and exclusions - Whether a
Lesho lead/reference is required

#### F. Business updates

Updates can include new timings, a new branch, service changes, seasonal
availability or an announcement relevant to customers. They must remain
business-related.

#### G. Consumer reviews and product experiences

Consumers should be able to publish reviews tied to a product, service,
business visit or event experience. A review is not a general social
post.

Review content can include: - Rating, where appropriate - Text - Photos
and/or video - Product/service purchased or experienced - Visit or
transaction context, where verifiable - Date of experience - Optional
merchant response

Clearly distinguish verified-purchase/verified-visit reviews from
unverified reviews. Do not imply verification unless the platform has
evidence.

### 4.2 Content boundaries

Allowed: - Product showcase - Product demo - Product comparison -
Collection/photo dump - Restaurant dish/menu showcase - Service
demonstration - Customer product review - Store/venue experience
review - Offer/promotion - Business announcement - Event announcement or
event recap

Not core Lesho content: - Unrelated personal selfies/statuses - General
memes or jokes - Political or unrelated public debate - Generic
entertainment videos - Unrelated lifestyle influencer content - Posts
with no meaningful connection to a business, product, service or event

Moderation policy should define edge cases, but the product should
consistently reinforce this commerce-first boundary.

### 4.3 Social interactions

Potential interactions: - Like/react - Save/bookmark - Share - Comment
or ask a product question - Follow a business - Open tagged product -
Visit business profile - Enquire about product/service - Claim an offer
or create a visit intent

Do not make likes and comments the core success metric. The most
important actions are useful discovery and genuine business intent.

### 4.4 Content-to-commerce continuity

Every content surface should provide a sensible next step. A product
reel should allow the viewer to open the product. A restaurant dish post
should lead to the menu/business page. An event video should lead to
event details and an enquiry/ticket path. A photo dump should link to
the items shown.

Do not make every post look like a hard-sell advertisement. Good product
storytelling should be engaging and informative; conversion actions can
remain clear but unobtrusive.

------------------------------------------------------------------------

## 5. Core product entities and information model

This is a conceptual product model, not a final database schema.

  Entity                 Purpose
  ---------------------- -------------------------------------------------------
  Consumer               Person exploring, saving, reviewing or enquiring
  Business               Merchant/organiser identity
  Branch/location        Physical outlet or service location
  Product                Tangible item sold by a business
  Catalogue/collection   Group of products or services
  Service                A service offered by a business
  Event                  Time-bound experience, event or activity
  Content post           Reel, image, photo dump, update or review
  Offer/promotion        Structured commercial benefit
  Campaign               A merchant's organised promotion or publishing effort
  Review                 Consumer feedback tied to an entity/experience
  Lead/intent            Traceable consumer interest sent to a business
  Attribution event      Evidence of an action and its source
  Redemption/visit       Evidence that a consumer used an offer or visited
  Merchant outcome       Business-reported or verified status of a lead

A post is not the product itself. A product can exist in a catalogue and
be referenced by multiple posts. An offer can apply to one or many
products, services or branches. An event has its own schedule and
booking/enquiry requirements.

This separation prevents the app from becoming a collection of
disconnected social posts.

------------------------------------------------------------------------

## 6. Category experiences and conversion journeys

The app should have a consistent design language but category-specific
information and actions.

## 6.1 Fashion, clothing and accessories

**Consumer discovery** - Browse by clothing type, occasion, style, size,
colour, fabric and budget where data exists. - Explore reels and photo
dumps for new collections. - Compare similar products across stores. -
Open product details and the store's complete catalogue. - Check
variants, price and availability information when maintained.

**Actions** - Ask about size/colour/availability - Enquire with the
store - Save product - Visit store / directions - Claim an applicable
offer

**Merchant content** - New arrivals - Collection reels - Lookbooks/photo
dumps - Product detail images - Occasion/seasonal collections - Customer
styling or product reviews, with consent

**Lead type:** Product enquiry, availability enquiry, store-visit intent
or offer claim.

## 6.2 Restaurants, cafés and food

**Consumer discovery** - Browse by cuisine, dish, dietary preference,
budget, ambience, distance and occasion where information is
available. - Discover dishes through images and short videos. - View
menus, price information, business hours, location and reviews. -
Explore restaurants with or without offers.

**Actions** - View menu - Ask a question - Call or message - Get
directions - Create an optional visit intent / partial booking - Claim a
restaurant offer

### Optional visit intent / partial booking concept

This is not necessarily a guaranteed table reservation. It is a way for
a consumer to tell a restaurant: "I intend to visit this evening."

A possible flow: 1. Consumer selects a restaurant. 2. Consumer chooses
intended date and an approximate arrival window. 3. Consumer enters
party size and optional note. 4. Lesho creates a unique visit-intent
reference. 5. Restaurant receives the lead and can acknowledge it. 6.
Restaurant manages actual seating and timing directly. 7. At arrival,
the reference can be shown or checked to attribute the visit and apply
an eligible offer.

This flow must be labelled honestly as a **visit request/intent**, not a
confirmed reservation, unless the restaurant explicitly confirms a real
reservation.

Open product decisions: - Should visit intent be optional or the primary
restaurant lead action? - What minimum information is needed? - Can a
restaurant set capacity or pause incoming intents? - What happens if the
restaurant does not acknowledge? - How are cancellations and no-shows
handled? - Is a lead billable when created, acknowledged, or when a
visit is verified? - Can a consumer simply call or walk in without
creating an intent?

**Lead type:** Menu enquiry, call/message lead, visit intent, confirmed
reservation (only if supported), offer claim or verified visit.

## 6.3 Events and experiences

Events are a first-class category, not merely another business post.

**Consumer discovery** - Browse by date, location, event type, audience,
price and availability where supplied. - View event posters, photo
galleries, teaser reels and venue details. - Understand schedule,
organiser, ticket price, age/entry rules and booking instructions.

**Actions** - Enquire about the event - Request booking/tickets -
Contact organiser through WhatsApp/call - Open external ticketing link -
Save/share event - Create a trackable Lesho event enquiry/reference

**Offline/manual booking attribution** The final transaction may happen
outside Lesho---for example, through WhatsApp, a phone call or an
organiser's manual process. Lesho should still create a unique
lead/reference that the organiser can recognise and report against.

Possible evidence: - Unique enquiry ID - QR/reference code - Organiser
acknowledgement - Ticket/booking confirmation entered by organiser -
Consumer confirmation, where appropriate

Do not claim a ticket was purchased merely because a user clicked
WhatsApp or opened a booking link.

**Lead type:** Event enquiry, ticket/booking request, external booking
click, organiser-confirmed booking.

## 6.4 Beauty and wellness

**Consumer discovery** - Browse services, packages, price ranges,
portfolios, results, location and reviews. - View short demonstrations
and before/after content where consent and policy allow. - Compare
providers.

**Actions** - Ask about a service/package - Request an appointment -
Call/message - Get directions - Claim an offer

**Lead type:** Service enquiry, appointment request, verified
appointment/visit.

## 6.5 Electronics and appliances

**Consumer discovery** - Browse products by brand, model, category,
budget and specifications. - Compare products across local sellers. -
View demonstration videos, product photos and explainers. - See
warranty, delivery, installation and stock details only when supplied
and current.

**Actions** - Ask for quotation - Check availability - Ask about
exchange/finance/delivery - Contact seller - Visit store

**Lead type:** Product enquiry, quotation request, availability enquiry,
store-visit intent.

## 6.6 Home, furniture and interiors

**Consumer discovery** - Browse room, furniture type, material,
dimensions, style and budget. - View collections and room setups. -
Explore customisation and delivery information.

**Actions** - Request consultation - Ask for a quote - Enquire about
dimensions/material/customisation - Visit showroom

**Lead type:** Consultation request, quotation enquiry, showroom visit
intent.

## 6.7 Automotive

**Consumer discovery** - Browse vehicles, accessories, parts, repair and
maintenance services. - Compare specifications, service packages and
providers. - See service centre details and relevant media.

**Actions** - Request test drive - Ask for quotation - Request service
appointment - Contact dealer/provider

**Lead type:** Vehicle enquiry, test-drive request, service appointment,
quotation request.

## 6.8 Fitness and sports

**Consumer discovery** - Browse gyms, studios, classes, coaches,
facilities and membership packages. - View facility tours and class
clips. - Compare location, timings and pricing where available.

**Actions** - Request a trial - Enquire about membership - Book an
introductory session - Contact the provider

**Lead type:** Trial request, membership enquiry, class booking request.

## 6.9 Local and professional services

Examples include repair, cleaning, tutoring, photography, home services
and professional providers.

**Consumer discovery** - Browse service type, coverage area, price
guidance, credentials, portfolio and reviews. - See availability only
where the provider maintains it.

**Actions** - Describe the requirement - Request a callback/quote -
Select a preferred time window - Contact provider

**Lead type:** Qualified service enquiry, callback request, quotation
request or appointment request.

------------------------------------------------------------------------

## 7. Business profiles and merchant publishing

A business profile should be the trustworthy home for all of a
merchant's offerings.

### Business profile sections

-   Business identity and verification state
-   Branches and service areas
-   Address, map and contact options
-   Opening hours
-   Description and key attributes
-   Product/service catalogue
-   Reels and image posts
-   Photo dumps/collections
-   Offers and promotions
-   Events (where relevant)
-   Consumer reviews and merchant replies
-   Relevant policies and business links

### Merchant publishing tools

The merchant should be able to choose the right publishing format: - Add
a product/catalogue item - Publish a reel - Publish a single image -
Publish a photo dump/carousel - Create an offer - Publish a business
update - Create/list an event - Respond to reviews and enquiries

The creation flow should encourage linking content to an existing
product/service/event or creating the linked entity first. Avoid forcing
merchants to enter duplicate information every time they post.

### Merchant operations

-   Business and branch onboarding
-   Ownership/contact verification
-   Catalogue management
-   Content publishing and scheduling (later if needed)
-   Offer terms and validity
-   Lead inbox
-   Lead status updates
-   QR/reference scanning or lookup
-   Analytics and billing
-   Team access/roles (later)
-   Report or dispute a lead

------------------------------------------------------------------------

## 8. The central lead engine

The lead engine is a core differentiator. It should be common underneath
category-specific flows.

### 8.1 Conceptual lead lifecycle

1.  Consumer discovers a product, service, business, offer or event.
2.  Consumer takes an intentional action.
3.  Lesho records the source context and creates a unique lead/intent
    reference when appropriate.
4.  The business receives the lead in its inbox or chosen notification
    channel.
5.  Business acknowledges, contacts or serves the consumer.
6.  The business updates the outcome where possible.
7.  Lesho records evidence, status and attribution.
8.  A billable event is calculated only according to transparent pricing
    rules.

### 8.2 Lead status model

Possible statuses: - Created - Sent to business - Delivered -
Acknowledged - Contact attempted - Contacted - Qualified -
Visit/appointment requested - Visit/appointment confirmed -
Visited/attended - Offer redeemed - Converted - Not interested -
Unreachable - Cancelled - Expired - Disputed - Invalid/duplicate

Not every category needs every status. Use a shared core plus
category-specific status transitions.

### 8.3 Engagement is not automatically a lead

Keep these metrics distinct:

  -----------------------------------------------------------------------
  Action                  Meaning                 Automatically a
                                                  billable lead?
  ----------------------- ----------------------- -----------------------
  Impression              Content appeared        No

  Video view              Video was watched       No

  Like                    Lightweight engagement  No

  Save                    Consumer bookmarked     No
                          content                 

  Share                   Content was shared      No

  Product detail view     Consumer opened details Usually no

  Direction request       Consumer requested      Not necessarily
                          navigation              

  Call/WhatsApp click     Consumer initiated an   Not proof of contact by
                          external contact path   itself

  Enquiry submitted       Consumer sent a         Potentially, subject to
                          deliberate request      quality rules

  Visit intent            Consumer expressed a    Category/pricing-rule
                          planned visit           dependent

  Verified visit          Visit was evidenced     Potentially billable

  Verified redemption     Offer was redeemed and  Potentially billable
                          attributed              

  Confirmed booking/sale  Business-confirmed      Potentially billable
                          outcome                 
  -----------------------------------------------------------------------

### 8.4 Attribution methods

Use a combination appropriate to the action:

-   Unique lead/reference ID
-   QR code or short code for in-person validation
-   Merchant lead inbox acknowledgement
-   Offer claim/redemption code
-   Event booking reference
-   Tracked in-app enquiry form
-   Click tracking for call/WhatsApp/external links, clearly labelled as
    a click---not a completed conversation
-   Merchant outcome reporting
-   Consumer confirmation when appropriate
-   Optional receipt/booking proof for selected flows, with privacy
    safeguards

A QR or code should be easy for small businesses to use. Do not require
complex POS integration for the MVP.

### 8.5 Lead quality, duplicate and dispute controls

The product must define: - What makes an enquiry valid and sufficiently
complete - Duplicate detection rules and time windows - Spam and bot
prevention - Consumer consent and contact preferences - Whether the same
consumer can enquire with multiple merchants - Merchant response
expectations - What happens when a merchant is closed or unresponsive -
How a merchant disputes an invalid lead - Whether a lead is refunded or
excluded from billing - How suspected fraud is reviewed - How
branch-level attribution works

Do not charge merchants for a lead that is clearly spam, duplicated
under the published rules or incorrectly attributed.

### 8.6 Offline conversion limitation

Lesho cannot know that a purchase happened simply because a consumer
viewed a post, clicked a phone number or walked toward a store. Use
precise labels such as "call click", "enquiry submitted", "visit
intent", "merchant-confirmed visit" and "merchant-reported sale".
Reserve "verified" for evidence-backed outcomes.

------------------------------------------------------------------------

## 9. Monetisation direction

The central commercial hypothesis is **pay for attributable, meaningful
leads**, rather than charging merely for exposure.

Potential structure to validate:

1.  Basic business presence and organic discovery may be free or
    low-friction during launch.
2.  A merchant can publish catalogue items and commerce content without
    needing a discount.
3.  Lesho charges for clearly defined billable lead milestones, with
    category-aware pricing.
4.  Optional premium visibility or campaign tools may be added later,
    but must be clearly labelled and secondary to trust and relevance.
5.  Merchant analytics show how the bill was calculated and which lead
    references contributed to it.

### Pricing questions to resolve

-   Is the billable unit an enquiry, qualified lead, confirmed visit,
    redeemed offer or confirmed booking?
-   Should different categories have different lead prices?
-   Does the merchant pay on lead creation, acknowledgement or verified
    outcome?
-   Are there free monthly lead allowances or a trial?
-   What happens to disputed, duplicate or unreachable leads?
-   How are taxes, wallet balance, invoices and refunds handled?
-   How does Lesho prevent merchants from under-reporting conversions?

Do not finalise pricing until the lead definitions and proof mechanisms
are clear.

------------------------------------------------------------------------

## 10. Consumer trust, safety and privacy

-   Ask for location permission only when it adds value; always allow
    manual area selection.
-   Avoid exposing a consumer's precise live location or movement
    history to merchants.
-   Share contact details only when needed for a consumer-requested
    interaction and with clear consent.
-   Let users manage notifications and personalisation.
-   Make sponsored content visibly labelled.
-   Make review verification status clear.
-   Provide reporting and moderation for misleading products, fake
    offers, abusive comments and fraudulent merchants.
-   Display offer terms and event conditions before a consumer commits.
-   Do not imply stock, appointment or table availability unless it is
    current and supported.
-   Do not let AI fabricate merchant claims or review summaries.

------------------------------------------------------------------------

## 11. Discovery ranking and recommendation principles

A useful ranking model can consider: - Match to stated intent - Category
and product relevance - Selected location and distance - Budget fit -
Product/service attributes - Merchant quality and review evidence - Data
freshness - Availability confidence - Consumer preferences - Content
quality and engagement as secondary signals - Paid promotion as a
separately labelled influence

Avoid a system where the highest-paying merchant always wins. The
consumer should receive relevant options, and the reason for a
recommendation should be explainable in plain language.

------------------------------------------------------------------------

## 12. Main app navigation and page concepts

The final navigation should be validated in prototype testing. A
possible consumer structure:

1.  **Home / Discover** --- curated local discovery, content and
    category sections.
2.  **Explore** --- search, categories, filters, area selection and
    map/list.
3.  **AI Guide** --- conversational intent discovery and comparisons.
4.  **Saved** --- saved products, businesses, posts, offers and events.
5.  **Profile** --- preferences, reviews, enquiries, lead/reference
    history and settings.

Some of these can be combined depending on the mobile information
architecture. The AI assistant should remain accessible without taking
over the whole app.

### Important screens for a concept prototype

-   Onboarding / location choice
-   Home discovery feed
-   AI-guided discovery conversation
-   AI curated results from multiple stores
-   Search and category browse
-   Product detail
-   Business profile
-   Reel viewer with product tags
-   Photo-dump carousel
-   Offer detail and claim
-   Restaurant menu and visit-intent flow
-   Event detail and enquiry/ticket request
-   Consumer review detail/composer
-   Lead/reference confirmation
-   Saved items
-   Consumer profile and activity
-   Merchant dashboard
-   Merchant content composer
-   Product/catalogue editor
-   Merchant lead inbox
-   Lead detail and status update
-   Merchant analytics

The prototype does not need every backend behaviour, but should show the
critical paths and believable state changes.

------------------------------------------------------------------------

## 13. Merchant analytics and platform operations

### Merchant analytics

Separate the funnel into understandable groups:

**Visibility** - Impressions - Reach/unique viewers where available -
Video views and completion - Profile views

**Consideration** - Product detail views - Catalogue opens - Saves -
Shares - Offer detail views

**Intent** - Enquiries submitted - Call/WhatsApp clicks - Visit
intents - Appointment requests - Event booking requests - Direction
requests

**Outcomes** - Acknowledged leads - Contacted leads - Verified visits -
Verified redemptions - Merchant-reported conversions - Disputed/invalid
leads - Cost per billable lead - Total charges and credits

Never combine all these into one "conversion" number.

### Admin and moderation

-   Business verification and branch review
-   Category and attribute management
-   Content moderation
-   Offer/event policy checks
-   Consumer reports
-   Review integrity and abuse review
-   Lead fraud and duplicate monitoring
-   Billing adjustments and disputes
-   Sponsored content governance
-   Analytics and operational health

------------------------------------------------------------------------

## 14. MVP direction and phased scope

This is a suggested sequencing framework, not a locked release plan.

### Phase 1 --- Prove local discovery and lead attribution

-   Consumer onboarding and location selection
-   Manual discovery feed and category browse
-   Business profiles and branches
-   Product/service catalogue basics
-   Image posts and short videos
-   Structured offers
-   Search and basic filters
-   Product/business detail pages
-   Enquiry capture and unique lead references
-   Merchant lead inbox
-   Basic acknowledgement/status updates
-   Basic merchant analytics
-   Admin verification and moderation

### Phase 2 --- Expand category-specific journeys

-   Restaurant visit intent
-   Event enquiry/booking reference
-   Salon/service appointment requests
-   Electronics quotations
-   QR-based offline visit/redemption
-   Photo-dump/carousel publishing
-   Consumer reviews with verification labels
-   More robust dispute and duplicate handling

### Phase 3 --- Intelligent discovery and growth

-   AI-guided cross-store discovery
-   Product comparison and natural-language filters
-   Personalised discovery
-   AI-assisted merchant content creation
-   More advanced analytics and pricing
-   Campaign management and carefully labelled sponsored placement
-   Additional categories and cities

The AI concept is central to the long-term product identity. The
sequencing above is a delivery suggestion only; the prototype should
visualise both manual and AI-led experiences so the product vision is
not reduced to a basic deals feed.

------------------------------------------------------------------------

## 15. Key unresolved product decisions

These should be discussed before turning this document into a final PRD
or committing to a detailed architecture.

1.  Which lead milestone is billable in each category?
2.  Is restaurant visit intent optional, or should it be the primary
    restaurant conversion?
3.  How much consumer information is required to create a lead?
4.  What is the minimum viable proof for an offline visit or sale?
5.  Should a merchant receive every enquiry instantly, and through which
    channels?
6.  How should lead disputes, duplicates, no-shows and merchant
    non-response work?
7.  What is the first launch city/area and which categories should
    receive the strongest initial supply?
8.  What content moderation and review-verification rules are required
    at launch?
9.  How much product/stock information can merchants realistically
    maintain?
10. What should remain free for merchants, and what exactly triggers a
    charge?

These are deliberate open questions. The current concept should not
pretend they have already been decided.

------------------------------------------------------------------------

# PART II --- FABLE 5 PROTOTYPE BUILD PROMPT

Copy the prompt below into Fable 5 along with this Markdown document and
the attached visual reference image.

------------------------------------------------------------------------

## Fable 5 prompt: Build the Lesho interactive HTML/React concept preview

You are a senior product designer, mobile UX architect and expert React
frontend prototyper. Build a polished, high-fidelity, interactive
concept preview for **Lesho**, an intelligent local-commerce discovery
and lead-generation platform.

Read the entire attached `LESHO_PRODUCT_CONCEPT.md` before designing.
Treat it as the product source of truth. Also inspect the attached
three-phone UI screenshot and use it as the visual-design reference.

### 1. First: install and use UI/UX Pro Max

Install the official UI/UX Pro Max skill from:

`https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`

Use the current official installation instructions from that repository.
The current CLI-based route is:

``` bash
npm install -g ui-ux-pro-max-cli
uipro init --ai <supported-platform>
```

Before running the command, identify which AI platform/agent identifier
is actually supported by the Fable 5 environment. Do not guess an
unsupported identifier. If Fable 5 does not support direct installation
through this CLI, inspect the repository's official instructions and use
the compatible skill-import mechanism available in the environment. If
no compatible mechanism exists, state that clearly and still apply the
design principles you can inspect from the official skill. Do not claim
that the skill was installed unless installation succeeded.

After installation, read and follow the skill's guidance. Use its
design-system workflow, relevant mobile/product UI patterns, typography
recommendations, accessibility guidance and React implementation
practices. Do not blindly accept a generic design system if it conflicts
with the explicit Lesho brand direction below.

### 2. Product understanding --- absolutely important

Lesho is **social in format, commerce-first in purpose**.

It combines: - AI-guided local shopping and discovery - Manual local
exploration - Product and service catalogues - Short-form reels/videos -
Single-image posts - Multi-image photo dumps/carousels - Offers and
promotions - Business updates - Consumer product/service reviews - Local
events and experiences - Category-specific enquiry and visit flows -
Traceable lead attribution for merchants

This is not a general social network. Do not build a generic Instagram
clone. Do not fill the app with unrelated memes, personal lifestyle
posts or generic entertainment. All social-style content must relate to
a product, service, business, offer, customer experience or event.

Do not reduce Lesho to a coupon/deals app. Businesses must be
discoverable even when they have no discount. A user should be able to
discover a product, compare local sellers, inspect catalogues, watch
product videos, read reviews, enquire or visit.

There are two equally important consumer modes: 1. AI-guided discovery:
a local shopping assistant helps a user describe what they need and
curates relevant options across multiple businesses. 2. Manual
exploration: a rich, organised feed/search/category experience for users
who simply want to browse.

The AI assistant must be visible and easy to access, but must not force
users into chat.

### 3. Visual direction --- follow the supplied screenshot

The attached screenshot shows three premium mobile screens. Borrow its
visual language: - Refined, minimal mobile-first layouts - Strong
typography hierarchy - Spacious white canvas - Black/near-black
high-contrast navigation and feature surfaces - Large rounded cards with
subtle borders - Soft neutral/pastel surfaces for secondary
information - Fine dividers and simple line icons - Carefully composed
charts/cards and clean spacing - Floating/pill-shaped bottom
navigation - Elegant onboarding with strong contrast - Restrained
shadows and carefully controlled radii - Clear, confident numbers and
concise labels

Do not reproduce the screenshot's task-management content, charts or
exact screen composition. Translate its visual style into a distinctive
local-commerce product.

### 4. Lesho brand palette

Use a modern, confident combination of **mid blue, pure white, black and
orange**.

Suggested starting tokens (adjust tastefully after using the design
skill): - Primary mid blue: `#3478F6` or a similarly refined mid-blue -
Deep blue: `#1F4FBF` - Pure white: `#FFFFFF` - Near-black: `#17191D` -
Orange accent: `#FF8A32` - Light blue surface: `#EEF4FF` - Warm orange
surface: `#FFF2E8` - Cool neutral background: `#F6F7F9` - Border:
`#E7E9EE` - Muted text: `#737985` - Success: restrained green - Warning:
restrained amber/red only when semantically necessary

Blue should carry the primary brand and key actions. Orange should be a
deliberate accent for discovery highlights, selected offer states or
important action details---not used everywhere. White should dominate
the primary browsing canvas. Black should provide contrast and anchor
important surfaces. Keep the interface premium and balanced.

### 5. Typography and components

Choose a modern, highly legible sans-serif pairing or a single strong
family. Use the UI/UX Pro Max skill to choose a suitable pairing.
Typography should feel premium, friendly and confident.

Create a consistent design system: - Type scale - Spacing scale - Radius
scale - Elevation/shadow rules - Colour tokens - Button hierarchy -
Input styles - Chips and filters - Cards - Bottom navigation -
Sheets/modals - Product cards - Merchant identity/verification
indicators - Review components - Reel and carousel controls -
Empty/loading/error states

Use consistent iconography (prefer a single coherent line-icon family).
Avoid emoji as the main icon system. Ensure contrast and touch targets
are appropriate for mobile.

### 6. Deliverable and technical constraints

Build a **frontend-only, HTML-rendered React prototype**. Use React
components and ordinary HTML/CSS (and lightweight client-side JavaScript
where needed). This is a visual concept preview, not a production
application.

-   No backend
-   No database
-   No authentication service
-   No real payments
-   No real map API requirement
-   No real AI API requirement
-   No real merchant integrations
-   No server-dependent feature

Use realistic local mock data and make key interactions work in the
browser. If the environment supports a React app, use React. Keep the
implementation easy to run and inspect. Do not build a native
iOS/Android app. Do not spend time on backend architecture.

Use believable product, merchant, review, event and offer examples
relevant to an Indian city. Use INR formatting. Use realistic names and
content; avoid lorem ipsum.

### 7. Build a mobile-first app preview with a desktop presentation frame

The primary target is a polished mobile experience. On desktop, show a
tasteful device frame or responsive app canvas so reviewers can inspect
the mobile UI comfortably. On smaller screens, the app should occupy the
viewport naturally.

Create multiple navigable screens or a working tab system. Do not make a
single static landing page. The preview must communicate the complete
product concept.

### 8. Consumer screens to implement

Build these screens with coherent navigation and meaningful
interactions:

**A. Onboarding / welcome** - Lesho branding - A concise value
proposition - Location permission explanation with a manual location
option - A clean, premium onboarding composition inspired by the
reference screenshot - A clear path into the app

**B. Home / Discover** - Greeting and selected location - Search bar
with a natural-language search hint - Prominent but tasteful AI guide
entry point - Category chips or category grid - Editorial discovery
sections such as "Picked for you", "Near you", "New arrivals", "Popular
around you", "Offers worth a look", "Events this week" - Mixed content
cards: product, business, reel, photo dump, event and review - Clear
content hierarchy; avoid a cluttered feed - Bottom navigation

**C. AI-guided discovery** Create a convincing guided shopping assistant
screen. - Chat-like but premium and compact interface - Example user
request: "I need a wedding saree around ₹5,000" - AI response with
concise explanation of interpreted intent - Relevant filter chips
(budget, occasion, location, style) - Curated products from multiple
local stores - Product cards with price, merchant, location and reason
for match - Compare/save/view product actions - A clear way to refine
the request - Make it obvious that results are recommendations based on
mock merchant data, not live inventory

**D. Explore / category browse** - Search and category filters - Area
selector - Filter/sort controls - Product/business/event results -
Optional map/list visual toggle using a static mock map if useful; no
real map integration required

**E. Product detail** - Image gallery - Product name, price, variants
and description - Merchant/branch identity and distance - Review
summary - Availability label that is clearly mock/merchant-reported -
Save/share - Enquire, contact and directions actions - Related products
or similar local sellers

**F. Business profile** - Business identity and verification indicator -
Location, hours and contact actions - Catalogue - Reels and image
posts - Photo dump/carousel - Offers - Reviews - Events if relevant -
Clear tabs or segmented sections

**G. Social-style content viewer** - Full-screen or immersive short
video/reel presentation - Product tags or linked products - Merchant
identity - Like, save and share - "View product" / "Explore collection"
CTA - A photo-dump carousel example - A review post example - Keep the
content commercial and product-related

**H. Offers** - Offer detail with validity, terms, applicable
products/branches and redemption steps - Claim action that creates a
mock unique reference - Confirmation state with reference/QR-like visual
(a decorative mock code is fine; do not imply a real QR integration)

**I. Restaurant flow** - Restaurant discovery and menu - Dish
images/videos - Restaurant profile - Optional "Plan a visit" / "Send
visit intent" flow with date, approximate arrival window and party
size - Confirmation screen clearly saying "Visit request sent" or "Visit
intent created", not "Reservation confirmed" - Unique mock reference and
note that the restaurant will confirm seating separately

**J. Event flow** - Event detail with date, venue, price and organiser -
Images/reel preview - Enquire / request tickets / contact organiser -
Mock confirmation with unique event enquiry reference - Clearly
distinguish an enquiry from a confirmed ticket

**K. Reviews** - Product/service/business-specific review cards -
Photos - Rating - "Verified visit/purchase" label only on mock entries
explicitly marked verified - Merchant reply example - Review composer
mock interaction

**L. Saved and profile** - Saved products, businesses, posts, offers and
events - Enquiry/reference history - Consumer preferences and settings

### 9. Merchant experience screens

Include a merchant-side preview that can be reached from a visible
account switcher or a dedicated demo entry.

**Merchant dashboard** - Compact overview cards for new leads,
acknowledged leads, visits/redemptions and lead spend - Recent
activity - Clear, calm data visualisation inspired by the reference
screenshot's statistics screen - Do not overfill the dashboard with
vanity metrics

**Merchant content creation** - Choose: product, reel, image, photo
dump, offer, business update or event - Link content to a
product/service/event - Image/video preview placeholder - Caption and
category fields - Publish mock action

**Catalogue management** - Product cards and a simple add/edit flow

**Lead inbox** - List of mock leads with category-aware labels - Status
and source - Lead detail with consumer request, reference ID, created
date and actions to acknowledge/update status - Make it clear which
interactions are clicks, enquiries, visit intents or verified outcomes

**Analytics** - Visibility, consideration, intent and outcome groups -
Show a simple funnel - Show sample lead charges and a transparent
billable-event breakdown - Avoid presenting a click as a sale

### 10. Category-aware content and conversion examples

Use varied examples so the prototype demonstrates Lesho is not just
fashion or offers:

-   Fashion: wedding saree, new collection photo dump, product
    availability enquiry
-   Restaurant: signature dish reel, menu, optional visit intent
-   Event: weekend music/workshop/food event, enquiry reference
-   Beauty: salon service reel, appointment request
-   Electronics: phone comparison and quotation enquiry
-   Home/furniture: sofa collection and showroom consultation
-   Automotive: service package or test-drive request
-   Fitness: gym tour and trial session
-   Local services: repair/cleaning/tutoring enquiry

Use realistic Indian context, INR prices and local business-style data.
Do not use real business logos unless supplied.

### 11. Interaction requirements

At minimum, make these interactions functional in the prototype: -
Bottom navigation changes screens - Search accepts text and filters mock
content or shows a realistic results state - Category chips change the
selected category/results - Location selector changes the displayed
selected area - AI prompt can be entered and submitted; use a
deterministic mock response and curated mock results - Product cards
open product detail - Business cards open business profile - Reel opens
content viewer - Photo dump carousel can advance/back - Save/unsave
works with local React state - Offer claim generates a mock reference -
Restaurant visit-intent form validates and creates a mock reference -
Event enquiry generates a mock reference - Merchant/consumer mode switch
works - Merchant lead can be acknowledged and its status updated -
Merchant content composer can preview and "publish" a mock post

Do not create dead buttons. If an element looks interactive, it should
do something sensible or be clearly disabled with an explanation.

### 12. Visual quality bar

The result should feel like a real, funded consumer product---not a
wireframe, generic dashboard template or AI-generated component collage.

Prioritise: - Excellent spacing and alignment - Strong typography -
Beautiful image-led commerce cards - Consistent card radii -
High-quality empty states - Clear hierarchy - Smooth, restrained
transitions - Polished bottom navigation - Thoughtful use of blue and
orange - High-quality mock imagery (use available image assets or
suitable remote placeholders if permitted; provide graceful fallbacks) -
No overflowing text - No cramped mobile layouts - No excessive
gradients, glassmorphism, neon colours or random decorative blobs - No
inconsistent icon styles - No generic admin-template look

Use the supplied screenshot as the visual benchmark for refinement,
especially its clean white layouts, bold dark surfaces, rounded cards,
elegant statistics and minimal navigation.

### 13. Final quality checks

Before finishing: 1. Confirm the app starts and renders. 2. Inspect
every main screen at mobile dimensions. 3. Inspect the desktop
presentation frame. 4. Test all key navigation and interactions. 5.
Check for console errors. 6. Check that no general-purpose social
content has slipped into the feed. 7. Check that AI discovery and manual
exploration are both clearly represented. 8. Check that reels, single
images, photo dumps, reviews, products, offers and events are all
represented. 9. Check that category-specific lead actions are not all
labelled "Book now". 10. Check that a visit intent/enquiry is never
falsely shown as a confirmed reservation or sale. 11. Check that lead
analytics distinguish views, clicks, enquiries, visits, redemptions and
conversions. 12. Summarise what was implemented and list any
interactions that remain simulated.

**Do not silently simplify the product into a generic deals feed,
generic social feed or generic dashboard. The objective is to make the
Lesho concept understandable and visually compelling through a
realistic, interactive React prototype.**
