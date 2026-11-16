import React, { useState } from 'react'
import {
  Share2, Phone, Navigation, MessageCircle, MapPin, Clock, ChevronRight, Info, Tag, ShieldCheck, ShieldQuestion, CalendarDays, Ticket, Play,
  ExternalLink, PenLine, UserPlus, UserCheck, CalendarCheck, Check, Store, Users, MessageSquareText,
} from 'lucide-react'
import { useApp, Img, TopBar, SaveBtn, Verified, Rating, Stars, Note, Chip, ProductCard, ProductRow, ReviewCard, OfferCard, EventCard, PostTile, Empty, priceOf, CatIcon } from '../ui.jsx'
import { cat as catOf } from '../data.js'

function Gallery({ imgs, alt, height = 400, children }) {
  const [i, setI] = useState(0)
  return (
    <div style={{ position: 'relative' }}>
      <div className="gallery" style={{ height }} onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {imgs.map((id, k) => <Img key={k} id={id} w={800} alt={`${alt} — photo ${k + 1}`} />)}
      </div>
      {imgs.length > 1 && <div className="dots" style={{ position: 'absolute', bottom: 14, left: 0, right: 0 }}>{imgs.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>}
      {children}
    </div>
  )
}

const BizRow = ({ b }) => {
  const app = useApp()
  return (
    <button className="card padded tap row" onClick={() => app.go('biz', b.id)}>
      <span className="avatar">{b.name[0]}</span>
      <span className="grow">
        <span className="row" style={{ gap: 5 }}><span className="b clamp1">{b.name}</span><Verified biz={b} /></span>
        <span className="tiny muted clamp1" style={{ display: 'block' }}>{b.addr} · {app.distLabel(b)}</span>
      </span>
      <ChevronRight size={18} color="var(--faint)" />
    </button>
  )
}

export function ProductDetail({ param }) {
  const app = useApp()
  const p = app.prod(param)
  const [variant, setVariant] = useState(p?.variants?.[0])
  if (!p) return <div className="screen"><TopBar title="Not found" /><Empty icon={Store} title="This item is no longer listed" text="It may have been removed by the business." /></div>
  const b = app.biz(p.bizId), c = catOf(p.cat), offer = app.offerFor(p.id)
  const revs = app.reviews.filter((r) => r.target.type === 'product' && r.target.id === p.id)
  const similar = app.products.filter((x) => x.id !== p.id && x.cat === p.cat && x.bizId !== p.bizId && x.tags.some((t) => p.tags.includes(t))).slice(0, 6)
  const more = app.products.filter((x) => x.id !== p.id && x.bizId === p.bizId).slice(0, 6)
  const isFood = p.cat === 'food'
  const lead = () => app.openLead({ catId: p.cat, bizId: b.id, subject: p.name, source: 'Product page', variant })

  return (
    <>
      <div className="screen barred">
        <Gallery imgs={p.imgs} alt={p.name}>
          <TopBar clear right={<span className="row" style={{ gap: 8 }}>
            <button className="icon-btn glass" aria-label="Share" onClick={() => app.share(p.name)}><Share2 size={18} /></button>
            <SaveBtn type="product" id={p.id} />
          </span>} />
        </Gallery>
        <div className="pad" style={{ paddingTop: 18 }}>
          <div className="row" style={{ gap: 6 }}><span className="badge blue"><CatIcon id={p.cat} size={11} />{c.label}</span><span className="badge grey">{p.kind}</span></div>
          <h1 className="h2" style={{ marginTop: 10, fontSize: 20 }}>{p.name}</h1>
          <div className="row" style={{ marginTop: 8, alignItems: 'baseline', gap: 10 }}>
            <span className="price" style={{ fontSize: 23 }}>{priceOf(p)}</span>
            <Rating value={p.rating} count={p.reviews} />
          </div>
          <div className="tiny muted" style={{ marginTop: 2 }}>{p.fresh}</div>

          {p.variants?.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="b small" style={{ marginBottom: 8 }}>Options listed by the store</div>
              <div className="wrap">{p.variants.map((v) => <Chip key={v} on={variant === v} onClick={() => setVariant(v)}>{v}</Chip>)}</div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Note tone={p.avail.tone === 'ok' ? 'green' : p.avail.tone === 'warn' ? 'amber' : ''} icon={Info}>
              <b>{p.avail.label}.</b> Lesho has not verified this — confirm with the {isFood ? 'restaurant' : 'business'} before you go.
            </Note>
          </div>

          {offer && (
            <button className="card orange padded tap row" style={{ marginTop: 12 }} onClick={() => app.go('offer', offer.id)}>
              <span className="kind intent" style={{ background: 'var(--orange)', color: 'var(--ink)' }}><Tag size={17} /></span>
              <span className="grow"><span className="b small" style={{ display: 'block' }}>{offer.title}</span><span className="tiny muted">{offer.valid} · terms apply</span></span>
              <ChevronRight size={18} />
            </button>
          )}

          <p style={{ marginTop: 18 }}>{p.desc}</p>
          <div style={{ marginTop: 12 }}>{Object.entries(p.attrs).map(([k, v]) => <div key={k} className="kv"><span>{k}</span><span>{v}</span></div>)}</div>

          <div className="eyebrow" style={{ margin: '22px 0 8px' }}>{isFood ? 'Served at' : p.kind === 'Service' ? 'Offered by' : 'Sold by'}</div>
          <BizRow b={b} />

          <div className="between" style={{ marginTop: 26 }}>
            <h2 className="h3" style={{ fontSize: 18 }}>Reviews</h2>
            <button className="link" onClick={() => app.openReview({ type: 'product', id: p.id })}><PenLine size={14} style={{ marginRight: 4 }} />Write a review</button>
          </div>
          <div className="row" style={{ marginTop: 6 }}><span className="price" style={{ fontSize: 26 }}>{p.rating}</span><span><Stars value={p.rating} /><span className="tiny muted" style={{ display: 'block' }}>{p.reviews} ratings · {revs.filter((r) => r.verified).length} of {revs.length} shown are verified</span></span></div>
          {revs.length ? revs.map((r) => <ReviewCard key={r.id} r={r} />) : <p className="small muted" style={{ marginTop: 10 }}>No written reviews yet. Ratings come from earlier visits.</p>}
        </div>

        {similar.length > 0 && (
          <div className="section"><div className="section-head"><h2 className="h3" style={{ fontSize: 18 }}>Similar from other local sellers</h2></div>
            <div className="hscroll">{similar.map((x) => <ProductCard key={x.id} p={x} />)}</div></div>
        )}
        {more.length > 0 && (
          <div className="section"><div className="section-head"><h2 className="h3" style={{ fontSize: 18 }}>More from {b.name}</h2><button className="link" onClick={() => app.go('biz', b.id)}>{isFood ? 'Menu' : 'Catalogue'}<ChevronRight size={15} /></button></div>
            <div className="hscroll">{more.map((x) => <ProductCard key={x.id} p={x} />)}</div></div>
        )}
        <div style={{ height: 24 }} />
      </div>
      <div className="actionbar">
        <button className="icon-btn" aria-label={`Call ${b.name}`} onClick={() => app.contact('call', b, p.name)}><Phone size={19} /></button>
        <button className="icon-btn" aria-label="Get directions" onClick={() => app.contact('directions', b, p.name)}><Navigation size={19} /></button>
        {isFood
          ? <><button className="icon-btn" aria-label="Ask a question" onClick={lead}><MessageSquareText size={19} /></button><button className="btn primary" onClick={() => app.go('visit', b.id)}><CalendarCheck size={18} />Plan a visit</button></>
          : <button className="btn primary" onClick={lead}>{c.lead.cta}</button>}
      </div>
    </>
  )
}

export function BusinessProfile({ param }) {
  const app = useApp()
  const b = app.biz(param), c = catOf(b.cat)
  const items = app.products.filter((p) => p.bizId === b.id)
  const posts = app.posts.filter((p) => p.bizId === b.id)
  const offers = app.offers.filter((o) => o.bizId === b.id)
  const events = app.events.filter((e) => e.bizId === b.id)
  const revs = app.reviews.filter((r) => r.bizId === b.id)
  const isFood = b.cat === 'food', isOrg = b.cat === 'events'
  const tabs = [
    ...(items.length ? [['cat', isFood ? 'Menu' : b.cat === 'fashion' || b.cat === 'electronics' || b.cat === 'home' ? 'Catalogue' : 'Services']] : []),
    ...(events.length ? [['events', 'Events']] : []),
    ['posts', `Posts${posts.length ? ` ${posts.length}` : ''}`], ['offers', 'Offers'], ['reviews', 'Reviews'], ['about', 'About'],
  ]
  const [tab, setTab] = useState(tabs[0][0])
  const following = app.following[b.id]

  return (
    <>
      <div className="screen barred">
        <div className="cover">
          <Img id={b.cover} w={800} alt={b.name} /><span className="shade" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 45%)' }} />
          <TopBar clear right={<span className="row" style={{ gap: 8 }}>
            <button className="icon-btn glass" aria-label="Share" onClick={() => app.share(b.name)}><Share2 size={18} /></button>
            <SaveBtn type="biz" id={b.id} />
          </span>} />
        </div>
        <div className="pad" style={{ marginTop: -32, position: 'relative' }}>
          <div className="between" style={{ alignItems: 'flex-end' }}>
            {app.stories.some((x) => x.bizId === b.id)
              ? <button className={`avatar lg ringed ${app.seenStories[b.id] ? 'seen' : ''}`} aria-label={`View ${b.name} story`} onClick={() => app.go('story', b.id)}>{b.name[0]}</button>
              : <span className="avatar lg">{b.name[0]}</span>}
            <button className={`btn sm ${following ? 'ghost' : 'dark'}`} onClick={() => app.toggleFollow(b.id)}>{following ? <><UserCheck size={15} />Following</> : <><UserPlus size={15} />Follow</>}</button>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10 }}><h1 className="h2" style={{ fontSize: 20 }}>{b.name}</h1><Verified biz={b} size={20} /></div>
          <p className="small muted" style={{ marginTop: 2 }}>{b.tagline}</p>
          <div className="wrap" style={{ marginTop: 10, gap: 6 }}>
            <span className="badge blue"><CatIcon id={b.cat} size={11} />{c.label}</span>
            {b.verified ? <span className="badge green"><ShieldCheck size={11} />Ownership verified</span> : <span className="badge amber"><ShieldQuestion size={11} />Verification pending</span>}
            <span className="badge grey"><Rating value={b.rating} count={b.reviews} /></span>
          </div>
          <div className="small" style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            <div className="row" style={{ gap: 8 }}><MapPin size={15} color="var(--muted)" style={{ flex: 'none' }} /><span>{b.addr} · <span className="muted">{app.distLabel(b)}</span></span></div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}><Clock size={15} color="var(--muted)" style={{ flex: 'none', marginTop: 2 }} /><span>{b.hours} <span className="muted">· merchant-provided hours</span></span></div>
          </div>
          <div className="quick" style={{ marginTop: 16 }}>
            <button onClick={() => app.contact('call', b)}><Phone size={19} />Call</button>
            <button onClick={() => app.contact('whatsapp', b)}><MessageCircle size={19} />WhatsApp</button>
            <button onClick={() => app.contact('directions', b)}><Navigation size={19} />Directions</button>
            <button onClick={() => app.openReview({ type: 'biz', id: b.id })}><PenLine size={19} />Review</button>
          </div>
        </div>

        <div className="tabs" style={{ marginTop: 18 }} role="tablist">
          {tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}
        </div>

        <div className="pad" style={{ paddingTop: 14, minHeight: 300 }}>
          {tab === 'cat' && (isFood || b.cat !== 'fashion' && b.cat !== 'home' && b.cat !== 'electronics'
            ? <>{isFood && <Note icon={Info}>Menu prices are merchant-provided and may differ at the table.</Note>}{items.map((p) => <ProductRow key={p.id} p={p} />)}</>
            : <div className="grid2">{items.map((p) => <ProductCard key={p.id} p={p} grid />)}</div>)}
          {tab === 'events' && events.map((e) => <EventCard key={e.id} e={e} row />)}
          {tab === 'posts' && (posts.length
            ? <div className="grid2">{posts.map((p) => <PostTile key={p.id} post={p} style={{ width: '100%' }} />)}</div>
            : <Empty icon={Store} title="No posts yet" text={`${b.name} hasn't published reels or photos. Its listings are still available.`} />)}
          {tab === 'offers' && (offers.length
            ? <div className="stack">{offers.map((o) => <div key={o.id} style={{ display: 'grid' }}><OfferCard o={o} /></div>)}</div>
            : <Empty icon={Tag} title="No current offers" text={`${b.name} is discoverable without discounts. Browse the ${isFood ? 'menu' : 'listings'} or send an enquiry.`} />)}
          {tab === 'reviews' && (
            <>
              <div className="between">
                <div className="row"><span className="price" style={{ fontSize: 26 }}>{b.rating}</span><span><Stars value={b.rating} /><span className="tiny muted" style={{ display: 'block' }}>{b.reviews} ratings</span></span></div>
                <button className="btn soft sm" onClick={() => app.openReview({ type: 'biz', id: b.id })}><PenLine size={14} />Write</button>
              </div>
              {revs.length ? revs.map((r) => <ReviewCard key={r.id} r={r} showTarget={r.target.type !== 'biz'} />) : <p className="small muted" style={{ marginTop: 12 }}>No written reviews in this preview yet.</p>}
            </>
          )}
          {tab === 'about' && (
            <>
              <p>{b.about}</p>
              <div style={{ marginTop: 12 }}>
                <div className="kv"><span>Address</span><span>{b.addr}</span></div>
                <div className="kv"><span>Hours</span><span>{b.hours}</span></div>
                <div className="kv"><span>On Lesho since</span><span>2026</span></div>
                <div className="kv"><span>Established</span><span>{b.since} (merchant-stated)</span></div>
                <div className="kv"><span>Verification</span><span>{b.verified ? 'Ownership and contact verified' : 'Pending review'}</span></div>
              </div>
              <div style={{ marginTop: 12 }}><Note icon={Info}>{b.verified ? 'Verified means Lesho confirmed who runs this listing. It is not an endorsement of products or prices.' : 'This business has not completed verification yet. Details are self-reported.'}</Note></div>
              <button className="link" style={{ marginTop: 10 }} onClick={() => app.toast('Report received — our moderation team will review it (simulated)')}>Report this business</button>
            </>
          )}
        </div>
      </div>
      <div className="actionbar">
        {isFood ? (
          <><button className="btn ghost" onClick={() => app.openLead({ catId: 'food', bizId: b.id, subject: b.name, source: 'Business profile' })}>Ask a question</button>
            <button className="btn primary" onClick={() => app.go('visit', b.id)}><CalendarCheck size={18} />Plan a visit</button></>
        ) : isOrg ? (
          <button className="btn primary" onClick={() => app.openLead({ catId: 'events', mode: 'question', bizId: b.id, subject: b.name, source: 'Organiser profile' })}>Ask the organiser</button>
        ) : (
          <button className="btn primary" onClick={() => app.openLead({ catId: b.cat, bizId: b.id, subject: b.name, source: 'Business profile' })}>{c.lead.cta}</button>
        )}
      </div>
    </>
  )
}

export function EventDetail({ param }) {
  const app = useApp()
  const e = app.event(param), b = app.biz(e.bizId)
  const teaser = app.posts.find((p) => p.eventId === e.id)
  const revs = app.reviews.filter((r) => r.target.type === 'event' && r.target.id === e.id)
  const mine = app.refs.find((r) => r.eventId === e.id)
  return (
    <>
      <div className="screen barred">
        <Gallery imgs={e.imgs} alt={e.name} height={320}>
          <TopBar clear right={<span className="row" style={{ gap: 8 }}>
            <button className="icon-btn glass" aria-label="Share" onClick={() => app.share(e.name)}><Share2 size={18} /></button>
            <SaveBtn type="event" id={e.id} />
          </span>} />
          {teaser && <button className="btn light sm" style={{ position: 'absolute', left: 16, bottom: 30 }} onClick={() => app.go('viewer', teaser.id)}><Play size={14} fill="currentColor" />Watch teaser</button>}
        </Gallery>
        <div className="pad" style={{ paddingTop: 18 }}>
          <span className="badge orange">{e.type}</span>
          <h1 className="h2" style={{ marginTop: 10, fontSize: 20 }}>{e.name}</h1>
          <div className="card" style={{ marginTop: 16, padding: '4px 14px' }}>
            <div className="kv"><span className="row" style={{ gap: 8 }}><CalendarDays size={15} />When</span><span>{e.date}<br /><span className="muted" style={{ fontWeight: 500 }}>{e.time}</span></span></div>
            <div className="kv"><span className="row" style={{ gap: 8 }}><MapPin size={15} />Where</span><span>{e.venue}</span></div>
            <div className="kv"><span className="row" style={{ gap: 8 }}><Ticket size={15} />Price</span><span>{e.priceLabel}<br /><span className="muted" style={{ fontWeight: 500 }}>Organiser-provided</span></span></div>
            <div className="kv"><span className="row" style={{ gap: 8 }}><Users size={15} />Capacity</span><span>{e.capacity}</span></div>
          </div>
          {mine && (
            <button className="card blue padded tap row" style={{ marginTop: 12 }} onClick={() => app.go('ref', mine.id)}>
              <Check size={18} color="var(--blue-deep)" /><span className="grow small"><b>You sent a {mine.typeLabel.toLowerCase()}</b><br /><span className="muted">{mine.id} · not a confirmed ticket</span></span><ChevronRight size={18} />
            </button>
          )}
          <p style={{ marginTop: 16 }}>{e.desc}</p>
          <div className="eyebrow" style={{ margin: '20px 0 8px' }}>Entry conditions</div>
          <div className="wrap">{e.rules.map((r) => <span key={r} className="badge grey" style={{ fontSize: 12, padding: '6px 10px' }}>{r}</span>)}</div>
          <div className="eyebrow" style={{ margin: '22px 0 8px' }}>Organiser</div>
          <BizRow b={b} />
          <div style={{ marginTop: 14 }}>
            <Note tone="blue" icon={Info}><b>How tickets work here.</b> Lesho sends your request to the organiser with a reference. The organiser confirms and issues tickets directly — a request or a link click is never a confirmed ticket.</Note>
          </div>
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button className="btn ghost sm grow" onClick={() => app.contact('whatsapp', b, e.name)}><MessageCircle size={15} />WhatsApp</button>
            <button className="btn ghost sm grow" onClick={() => app.contact('external', b, e.name)}><ExternalLink size={15} />Ticket page</button>
          </div>
          {revs.length > 0 && <><h2 className="h3" style={{ fontSize: 18, marginTop: 26 }}>From earlier editions</h2>{revs.map((r) => <ReviewCard key={r.id} r={r} />)}</>}
          <button className="link" style={{ marginTop: 10 }} onClick={() => app.openReview({ type: 'event', id: e.id })}><PenLine size={14} style={{ marginRight: 4 }} />Review this event</button>
          <div style={{ height: 20 }} />
        </div>
      </div>
      <div className="actionbar">
        <button className="btn ghost" onClick={() => app.openLead({ catId: 'events', mode: 'question', bizId: b.id, eventId: e.id, subject: e.name, source: 'Event page' })}>Enquire</button>
        <button className="btn primary" onClick={() => app.openLead({ catId: 'events', mode: 'tickets', bizId: b.id, eventId: e.id, subject: e.name, source: 'Event page' })}><Ticket size={18} />Request tickets</button>
      </div>
    </>
  )
}

export function OfferDetail({ param }) {
  const app = useApp()
  const o = app.offer(param), b = app.biz(o.bizId)
  const mine = app.refs.find((r) => r.offerId === o.id)
  const [agree, setAgree] = useState(false)
  const claim = () => {
    const id = app.addRef({ prefix: 'OFR', kind: 'offer', typeLabel: 'Offer claim', bizId: b.id, offerId: o.id, subject: o.title, source: 'Offer detail', details: [o.valid, o.branch], status: 'Claimed — not yet redeemed' })
    app.replace('ref', id)
  }
  return (
    <>
      <div className="screen barred grey" style={{ paddingBottom: mine ? 96 : 150 }}>
        <TopBar title="Offer" right={<SaveBtn type="offer" id={o.id} className="plain" />} />
        <div className="pad">
          <div className="card orange padded" style={{ borderRadius: 'var(--r-xl)', padding: 20 }}>
            <div className="between"><span className="eyebrow" style={{ color: 'var(--orange-ink)' }}>{catOf(b.cat).label} offer</span><span className="kind" style={{ background: 'var(--orange)' }}><Tag size={17} /></span></div>
            <h1 className="h1" style={{ fontSize: 21, marginTop: 10 }}>{o.title}</h1>
            <button className="row" style={{ marginTop: 14, gap: 8, minHeight: 44 }} onClick={() => app.go('biz', b.id)}>
              <span className="avatar sm">{b.name[0]}</span><span className="b small">{b.name}</span><Verified biz={b} /><ChevronRight size={16} />
            </button>
          </div>

          <div className="card" style={{ marginTop: 12, padding: '4px 16px' }}>
            <div className="kv"><span>Validity</span><span>{o.valid}</span></div>
            <div className="kv"><span>Where</span><span>{o.branch}</span></div>
            <div className="kv"><span>Eligibility</span><span>{o.min}</span></div>
            <div className="kv"><span>Limit</span><span>{o.limit}</span></div>
          </div>

          <div className="card padded" style={{ marginTop: 12 }}>
            <div className="h3">How to redeem</div>
            <div className="timeline" style={{ marginTop: 12 }}>
              {o.steps.map((s, i) => <div key={s} className="step now"><span className="dotc" style={{ color: 'var(--blue-deep)', fontSize: 10, fontWeight: 800, boxShadow: 'none' }}>{i + 1}</span><span>{s}</span></div>)}
            </div>
          </div>

          {o.products.length > 0 && (
            <div className="card" style={{ marginTop: 12, padding: '10px 16px 4px' }}>
              <div className="h3">Applies to</div>
              {o.products.map((id) => app.prod(id)).filter(Boolean).map((p) => <ProductRow key={p.id} p={p} />)}
            </div>
          )}

          <div className="card padded" style={{ marginTop: 12 }}>
            <div className="h3">Terms and exclusions</div>
            <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>{o.terms.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
      <div className="actionbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {mine ? (
          <button className="btn dark" onClick={() => app.go('ref', mine.id)}><Check size={18} />Claimed — view reference</button>
        ) : (
          <>
            <button type="button" className={`check ${agree ? 'on' : ''}`} role="checkbox" aria-checked={agree} onClick={() => setAgree(!agree)} style={{ minHeight: 36, padding: 0 }}>
              <span className="box">{agree && <Check size={14} strokeWidth={3} />}</span><span>I've read the terms. Share my first name with {b.name} for this claim.</span>
            </button>
            <button className="btn primary" disabled={!agree} onClick={claim}>Claim offer</button>
          </>
        )}
      </div>
    </>
  )
}
