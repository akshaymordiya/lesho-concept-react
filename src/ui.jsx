import React, { createContext, useContext, useState } from 'react'
import {
  Shirt, UtensilsCrossed, PartyPopper, Scissors, Smartphone, Sofa, Car, Dumbbell, Wrench,
  Star, Bookmark, BadgeCheck, ArrowLeft, X, Check, MapPin, Play, Images, Tag, ChevronRight, Store, ImageOff, Megaphone, MessageSquareQuote,
} from 'lucide-react'
import { cat as catOf } from './data.js'

export const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')
export const priceOf = (p) => (p.priceNote === 'from' ? 'From ' : '') + inr(p.price) + (p.priceNote && p.priceNote !== 'from' ? ' ' + p.priceNote : '')

const CAT_ICONS = { Shirt, UtensilsCrossed, PartyPopper, Scissors, Smartphone, Sofa, Car, Dumbbell, Wrench }
export function CatIcon({ id, size = 20 }) {
  const I = CAT_ICONS[catOf(id)?.icon] || Store
  return <I size={size} strokeWidth={1.8} />
}

export const imgUrl = (id, w = 600, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=${w}${h ? `&h=${h}` : ''}`

export function Img({ id, w = 600, h, alt = '', className = '', style, children }) {
  const [st, setSt] = useState('loading')
  return (
    <div className={`img ${st} ${className}`} style={style}>
      {st !== 'failed' && id && (
        <img src={imgUrl(id, w, h)} alt={alt} loading="lazy" onLoad={() => setSt('loaded')} onError={() => setSt('failed')} />
      )}
      {(st === 'failed' || !id) && (
        <div className="fallback"><div><ImageOff size={20} strokeWidth={1.6} style={{ margin: '0 auto 4px' }} />{alt ? <div className="clamp2" style={{ padding: '0 8px' }}>{alt}</div> : null}</div></div>
      )}
      {children}
    </div>
  )
}

export function Stars({ value, size = 13 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= Math.round(value) ? '' : 'off'} fill="currentColor" strokeWidth={0} />)}
    </span>
  )
}
export const Rating = ({ value, count }) => (
  <span className="rating"><Star size={13} strokeWidth={0} />{value.toFixed(1)}{count != null && <span className="muted" style={{ fontWeight: 500 }}>({count})</span>}</span>
)

export function SaveBtn({ type, id, className = 'glass', size = 18 }) {
  const app = useApp()
  const on = app.isSaved(type, id)
  return (
    <button className={`icon-btn ${className} ${on && className !== 'onDark' ? '' : ''}`} aria-label={on ? 'Remove from saved' : 'Save'} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); app.toggleSave(type, id) }}>
      <Bookmark size={size} strokeWidth={1.9} fill={on ? 'currentColor' : 'none'} color={on && className !== 'onDark' ? 'var(--blue)' : 'currentColor'} />
    </button>
  )
}

export const Verified = ({ biz, size = 15 }) => biz.verified
  ? <BadgeCheck size={size} color="var(--blue)" aria-label="Verified business" style={{ flex: 'none' }} />
  : null

export function TopBar({ title, right, clear, onBack }) {
  const app = useApp()
  return (
    <div className={`topbar ${clear ? 'clear' : ''}`}>
      <button className={`icon-btn ${clear ? 'glass' : 'plain'}`} aria-label="Back" onClick={onBack || app.back}><ArrowLeft size={20} /></button>
      {!clear && <div className="title">{title}</div>}
      {right || <span className="sp" />}
    </div>
  )
}

export function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <h3 className="h3" style={{ fontSize: 18 }}>{title}</h3>
          <button className="icon-btn plain" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}

export const Chip = ({ on, onClick, children, className = '' }) => (
  <button className={`chip ${on ? 'on' : ''} ${className}`} aria-pressed={!!on} onClick={onClick}>{children}</button>
)

export const Note = ({ tone = '', icon: I, children }) => (
  <div className={`note ${tone}`}>{I && <I size={15} />}<span>{children}</span></div>
)

export const CheckRow = ({ on, onClick, children }) => (
  <button type="button" className={`check ${on ? 'on' : ''}`} role="checkbox" aria-checked={on} onClick={onClick}>
    <span className="box">{on && <Check size={14} strokeWidth={3} />}</span><span>{children}</span>
  </button>
)

export function SectionHead({ title, sub, action, onAction }) {
  return (
    <div className="section-head">
      <div><h2 className="h2">{title}</h2>{sub && <div className="small muted" style={{ marginTop: 2 }}>{sub}</div>}</div>
      {action && <button className="link" onClick={onAction}>{action}<ChevronRight size={15} /></button>}
    </div>
  )
}

export function Empty({ icon: I, title, text, action, onAction }) {
  return (
    <div className="empty">
      <div className="ic"><I size={26} strokeWidth={1.7} /></div>
      <div className="h3">{title}</div>
      <p className="small muted" style={{ marginTop: 6 }}>{text}</p>
      {action && <button className="btn primary sm" style={{ marginTop: 16 }} onClick={onAction}>{action}</button>}
    </div>
  )
}

/* ---------- Content cards ---------- */
export function ProductCard({ p, grid }) {
  const app = useApp()
  const b = app.biz(p.bizId)
  const offer = app.offerFor(p.id)
  return (
    <div className={`pcard ${grid ? 'grid' : ''}`} role="button" tabIndex={0} onClick={() => app.go('product', p.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); app.go('product', p.id) } }}>
      <Img id={p.img} w={400} alt={p.name}>
        <span className="save"><SaveBtn type="product" id={p.id} /></span>
        {offer && <span className="badge orange" style={{ position: 'absolute', left: 8, bottom: 8 }}><Tag size={11} />{offer.short}</span>}
      </Img>
      <div className="meta">
        <div className="name clamp2">{p.name}</div>
        <div className="price" style={{ marginTop: 3 }}>{priceOf(p)}</div>
        <div className="tiny muted clamp1" style={{ marginTop: 2 }}>{b.name} · {app.distLabel(b)}</div>
      </div>
    </div>
  )
}

export function ProductRow({ p, right }) {
  const app = useApp()
  const b = app.biz(p.bizId)
  return (
    <button className="listrow" onClick={() => app.go('product', p.id)}>
      <Img id={p.img} w={200} alt={p.name} />
      <div className="grow">
        <div className="b clamp1" style={{ fontSize: 14 }}>{p.name}</div>
        <div className="tiny muted clamp1" style={{ marginTop: 2 }}>{b.name} · {app.distLabel(b)}</div>
        <div className="row" style={{ marginTop: 5, gap: 8 }}><span className="price">{priceOf(p)}</span><Rating value={p.rating} count={p.reviews} /></div>
      </div>
      {right || <ChevronRight size={18} color="var(--faint)" />}
    </button>
  )
}

export function BizCard({ b, row }) {
  const app = useApp()
  if (row) return (
    <button className="listrow" onClick={() => app.go('biz', b.id)}>
      <Img id={b.cover} w={200} alt={b.name} />
      <div className="grow">
        <div className="row" style={{ gap: 5 }}><span className="b clamp1" style={{ fontSize: 14 }}>{b.name}</span><Verified biz={b} /></div>
        <div className="tiny muted clamp1" style={{ marginTop: 2 }}>{catOf(b.cat).label} · {b.addr}</div>
        <div className="row" style={{ marginTop: 5, gap: 8 }}><Rating value={b.rating} count={b.reviews} /><span className="tiny muted">{app.distLabel(b)}</span></div>
      </div>
      <ChevronRight size={18} color="var(--faint)" />
    </button>
  )
  return (
    <button className="bizcard" onClick={() => app.go('biz', b.id)}>
      <Img id={b.cover} w={480} alt={b.name}>
        <span className="badge glass" style={{ position: 'absolute', left: 10, top: 10 }}><CatIcon id={b.cat} size={12} />{catOf(b.cat).label}</span>
      </Img>
      <div style={{ padding: '12px 14px 14px' }}>
        <div className="row" style={{ gap: 5 }}><span className="b clamp1">{b.name}</span><Verified biz={b} /></div>
        <div className="tiny muted clamp1" style={{ marginTop: 2 }}>{b.tagline}</div>
        <div className="between" style={{ marginTop: 9 }}>
          <Rating value={b.rating} count={b.reviews} />
          <span className="tiny muted row" style={{ gap: 3 }}><MapPin size={12} />{app.distLabel(b)}</span>
        </div>
      </div>
    </button>
  )
}

export function EventCard({ e, row }) {
  const app = useApp()
  if (row) return (
    <button className="listrow" onClick={() => app.go('event', e.id)}>
      <Img id={e.img} w={200} alt={e.name} />
      <div className="grow">
        <div className="b clamp2" style={{ fontSize: 14, lineHeight: 1.3 }}>{e.name}</div>
        <div className="tiny muted clamp1" style={{ marginTop: 3 }}>{e.date} · {e.venue}</div>
        <div className="tiny b" style={{ marginTop: 3 }}>{e.priceLabel}</div>
      </div>
      <ChevronRight size={18} color="var(--faint)" />
    </button>
  )
  return (
    <button className="event" onClick={() => app.go('event', e.id)}>
      <Img id={e.img} w={560} alt={e.name}>
        <span style={{ position: 'absolute', left: 10, top: 10 }} className="datebox"><span>{e.mon}</span><b>{e.day}</b></span>
        <span className="badge glass" style={{ position: 'absolute', right: 10, top: 10 }}>{e.type}</span>
      </Img>
      <div style={{ padding: '12px 14px 14px' }}>
        <div className="b clamp1">{e.name}</div>
        <div className="tiny muted clamp1" style={{ marginTop: 3 }}>{e.date} · {e.time.split(' – ')[0]} · {e.venue}</div>
        <div className="small b" style={{ marginTop: 6 }}>{e.priceLabel}</div>
      </div>
    </button>
  )
}

export function OfferCard({ o }) {
  const app = useApp()
  const b = app.biz(o.bizId)
  return (
    <button className="offer" onClick={() => app.go('offer', o.id)}>
      <span className="cut"><Tag size={18} /></span>
      <div className="eyebrow" style={{ color: 'var(--orange-ink)' }}>{catOf(b.cat).label}</div>
      <div className="h3 clamp2" style={{ marginTop: 6, paddingRight: 50, minHeight: 42, lineHeight: 1.3 }}>{o.title}</div>
      <div className="row" style={{ marginTop: 12, gap: 6 }}><span className="small b clamp1">{b.name}</span><Verified biz={b} size={14} /></div>
      <div className="tiny muted" style={{ marginTop: 2 }}>{o.valid}</div>
    </button>
  )
}

const POST_META = { reel: ['Reel', Play], dump: ['Photos', Images], image: ['Post', null], update: ['Update', Megaphone], review: ['Review', MessageSquareQuote] }
export function PostTile({ post, style }) {
  const app = useApp()
  const b = app.biz(post.bizId)
  const [label, I] = POST_META[post.type]
  return (
    <button className="reel" style={style} onClick={() => app.go('viewer', post.id)}>
      <Img id={post.img} w={400} alt={post.title} />
      <span className="shade" />
      <span className="top">
        <span className="badge glass">{I && <I size={11} fill={post.type === 'reel' ? 'currentColor' : 'none'} />}{label}{post.dur ? ` · ${post.dur}` : post.imgs ? ` · ${post.imgs.length}` : ''}</span>
      </span>
      <span className="bot">
        <span className="b clamp2" style={{ fontSize: 13.5, lineHeight: 1.25, display: '-webkit-box' }}>{post.type === 'review' ? `“${app.review(post.reviewId)?.text}”` : post.title}</span>
        <span className="tiny clamp1" style={{ opacity: .85, marginTop: 4, display: 'block' }}>{b.name}</span>
      </span>
    </button>
  )
}

export function ReviewCard({ r, showTarget }) {
  const app = useApp()
  const t = r.target
  const targetName = t.type === 'product' ? app.prod(t.id)?.name : t.type === 'event' ? app.event(t.id)?.name : app.biz(t.id)?.name
  return (
    <div className="review">
      <div className="row">
        <div className="avatar sm round">{r.author[0]}</div>
        <div className="grow">
          <div className="b small">{r.author}</div>
          <div className="row" style={{ gap: 6 }}><Stars value={r.rating} size={12} /><span className="tiny muted">{r.date}</span></div>
        </div>
        {r.verified
          ? <span className="badge green"><BadgeCheck size={12} />Verified {r.verified}</span>
          : <span className="badge grey">Unverified</span>}
      </div>
      {showTarget && targetName && (
        <button className="tiny b" style={{ color: 'var(--blue-deep)', marginTop: 8, minHeight: 24 }}
          onClick={() => app.go(t.type === 'product' ? 'product' : t.type === 'event' ? 'event' : 'biz', t.id)}>
          About: {targetName}
        </button>
      )}
      <p className="small" style={{ marginTop: 8 }}>{r.text}</p>
      {r.imgs?.length > 0 && <div className="thumbs">{r.imgs.map((i) => <Img key={i} id={i} w={160} alt="Review photo" />)}</div>}
      {r.reply && <div className="reply"><div className="tiny b" style={{ marginBottom: 2 }}>Merchant reply</div>{r.reply}</div>}
    </div>
  )
}

/* Decorative, deterministic QR-like pattern. Not a scannable code. */
export function MockCode({ seed, size }) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const cells = []
  const n = 13
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 4 && c >= c0 && c < c0 + 4
    for (const [r0, c0] of [[0, 0], [0, n - 4], [n - 4, 0]]) {
      if (inBox(r0, c0)) { const rr = r - r0, cc = c - c0; return rr === 0 || rr === 3 || cc === 0 || cc === 3 || (rr > 0 && rr < 3 && cc > 0 && cc < 3) ? 1 : 0 }
    }
    return null
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const f = finder(r, c)
    h = (h * 1103515245 + 12345) >>> 0
    cells.push(f != null ? f : (h >> 16) & 1)
  }
  const st = size ? { width: size, height: size, padding: Math.max(4, Math.round(size * 0.07)), gap: size < 90 ? 1 : size > 190 ? 3 : 2, borderRadius: size < 90 ? 10 : 14 } : undefined
  return <div className="mockcode" style={st} aria-label="Decorative reference pattern">{cells.map((f, i) => <i key={i} className={f ? 'f' : ''} />)}</div>
}

/* Enquiry status helpers shared by the consumer activity screens. */
const notYet = (s) => /not yet/i.test(s)
export const statusTone = (s) => !notYet(s) && /Visited|redeemed|Attended|Converted|confirmed/i.test(s) ? 'green' : /Expired|Cancelled|Invalid|Not interested|Unreachable|Disputed/i.test(s) ? 'grey' : 'blue'
export const isPast = (s) => !notYet(s) && /Visited|redeemed|Attended|Converted|Expired|Cancelled|Invalid|Not interested/i.test(s)
