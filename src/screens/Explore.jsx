import React, { useEffect, useRef, useState } from 'react'
import { Search, MapPin, ChevronDown, SlidersHorizontal, Map as MapIcon, List, X, SearchX, MapPinOff, Info, ArrowUpDown, Sparkles } from 'lucide-react'
import { useApp, Chip, ProductCard, BizCard, EventCard, Sheet, Empty, Note, CatIcon, CheckRow, inr } from '../ui.jsx'
import { CATS, cat as catOf } from '../data.js'

const SORTS = [['rel', 'Relevance'], ['dist', 'Distance'], ['low', 'Price: low to high'], ['rate', 'Rating']]
const PRICE_CAPS = [null, 500, 2500, 5000, 25000]

export default function Explore() {
  const app = useApp()
  const [q, setQ] = useState('')
  const [catId, setCatId] = useState('all')
  const [type, setType] = useState('product')
  const [sort, setSort] = useState('rel')
  const [flt, setFlt] = useState({ cap: null, rate4: false, offer: false, verified: false })
  const [view, setView] = useState('list')
  const [pin, setPin] = useState(null)
  const [sheet, setSheet] = useState(null)
  const seedT = useRef(0)

  useEffect(() => {
    const s = app.exploreSeed
    if (!s || s.t === seedT.current) return
    seedT.current = s.t
    if (s.q != null) setQ(s.q)
    if (s.cat) { setCatId(s.cat); setType(s.cat === 'events' ? 'event' : 'product') }
    if (s.type) setType(s.type)
    if (s.view) setView(s.view)
    app.setExploreSeed(null)
  }, [app.exploreSeed])

  const pickCat = (id) => { setCatId(id); if (id === 'events') setType('event'); else if (type === 'event') setType('product') }
  const ql = q.trim().toLowerCase()
  const match = (...fields) => !ql || ql.split(/\s+/).every((w) => fields.some((f) => f && f.toLowerCase().includes(w)))
  const d = (b) => app.distOf(b) ?? 0
  const inCat = (c) => catId === 'all' || c === catId

  let items = []
  if (!app.area.remote) {
    if (type === 'product') {
      items = app.products.filter((p) => inCat(p.cat) && match(p.name, p.tags.join(' '), app.biz(p.bizId).name, catOf(p.cat).label))
        .filter((p) => (!flt.cap || p.price <= flt.cap) && (!flt.rate4 || p.rating >= 4.5) && (!flt.offer || app.offerFor(p.id)) && (!flt.verified || app.biz(p.bizId).verified))
      if (sort === 'dist') items.sort((a, b) => d(app.biz(a.bizId)) - d(app.biz(b.bizId)))
      if (sort === 'low') items.sort((a, b) => a.price - b.price)
      if (sort === 'rate') items.sort((a, b) => b.rating - a.rating)
    } else if (type === 'biz') {
      items = app.businesses.filter((b) => inCat(b.cat) && match(b.name, b.tagline, b.addr, catOf(b.cat).label))
        .filter((b) => (!flt.rate4 || b.rating >= 4.5) && (!flt.verified || b.verified) && (!flt.offer || app.offers.some((o) => o.bizId === b.id)))
      items = [...items].sort((a, b) => (sort === 'rate' ? b.rating - a.rating : d(a) - d(b)))
    } else {
      items = app.events.filter((e) => match(e.name, e.type, e.venue)).filter((e) => !flt.cap || e.price <= flt.cap)
      if (sort === 'low') items = [...items].sort((a, b) => a.price - b.price)
    }
  }
  const nFlt = (flt.cap ? 1 : 0) + flt.rate4 + flt.offer + flt.verified
  const sponsored = type === 'product' && !ql && catId === 'all' && sort === 'rel' && !nFlt ? app.prod('h3') : null
  const showMap = view === 'map' && type === 'biz'
  const selected = pin && items.find((b) => b.id === pin)

  return (
    <>
      <div className="screen tabbed">
        <div className="pad" style={{ paddingTop: 14 }}>
          <div className="between">
            <h1 className="h1" style={{ fontSize: 22 }}>Explore</h1>
            <button className="chip" onClick={app.openArea}><MapPin size={14} color="var(--blue)" />{app.area.name}<ChevronDown size={14} /></button>
          </div>
          <div className="search" style={{ marginTop: 12 }} role="search">
            <Search size={18} color="var(--muted)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Products, places, dishes, events" aria-label="Search" />
            {q && <button className="icon-btn plain" style={{ width: 36, height: 36, marginRight: -8 }} aria-label="Clear search" onClick={() => setQ('')}><X size={16} /></button>}
          </div>
        </div>

        <div className="hscroll tight" style={{ marginTop: 12 }}>
          <Chip on={catId === 'all'} onClick={() => pickCat('all')}>All</Chip>
          {CATS.map((c) => <Chip key={c.id} on={catId === c.id} onClick={() => pickCat(c.id)}><CatIcon id={c.id} size={15} />{c.label}</Chip>)}
        </div>

        <div className="pad" style={{ marginTop: 12 }}>
          <div className="seg" role="tablist">
            {[['product', 'Products & services'], ['biz', 'Businesses'], ['event', 'Events']].map(([id, l]) => (
              <button key={id} role="tab" aria-selected={type === id} className={type === id ? 'on' : ''} onClick={() => { setType(id); if (id === 'event') setCatId('events'); else if (catId === 'events') setCatId('all') }}>{l}</button>
            ))}
          </div>
          <div className="between" style={{ marginTop: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <button className={`chip ${nFlt ? 'on blue' : ''}`} onClick={() => setSheet('filter')}><SlidersHorizontal size={14} />Filters{nFlt ? ` · ${nFlt}` : ''}</button>
              <button className="chip" onClick={() => setSheet('sort')}><ArrowUpDown size={14} />{SORTS.find((s) => s[0] === sort)[1].split(':')[0]}</button>
            </div>
            {type === 'biz' && (
              <div className="seg" style={{ padding: 3 }}>
                <button className={view === 'list' ? 'on' : ''} aria-label="List view" onClick={() => setView('list')} style={{ minHeight: 34, padding: '0 10px' }}><List size={16} /></button>
                <button className={view === 'map' ? 'on' : ''} aria-label="Map view" onClick={() => setView('map')} style={{ minHeight: 34, padding: '0 10px' }}><MapIcon size={16} /></button>
              </div>
            )}
          </div>
          <div className="tiny muted" style={{ marginTop: 10 }}>
            {app.area.remote ? '' : `${items.length} result${items.length === 1 ? '' : 's'}${ql ? ` for “${q.trim()}”` : ''} · distances from ${app.area.name} centre`}
          </div>
        </div>

        {app.area.remote ? (
          <Empty icon={MapPinOff} title={`Nothing listed in ${app.area.name} yet`} text={`Lesho hasn't onboarded businesses in ${app.area.city} in this preview.`} action="Choose another area" onAction={app.openArea} />
        ) : items.length === 0 ? (
          <Empty icon={SearchX} title="No matches" text="Try a broader term, another category or fewer filters. You can also ask the guide to find alternatives."
            action="Ask the guide" onAction={() => { app.setGuideSeed({ text: q || catOf(catId)?.label || 'Explore local stores', t: Date.now() }); app.tab('guide') }} />
        ) : showMap ? (
          <div className="pad" style={{ marginTop: 12 }}>
            <MockMap items={items} pin={pin} setPin={setPin} />
            <Note icon={Info}>Illustrative static map. The orange dot is the centre of {app.area.name}, not your live location.</Note>
            <div style={{ marginTop: 12 }}>
              {selected ? <div className="card" style={{ padding: '0 12px' }}><BizCard b={selected} row /></div> : <div className="small muted" style={{ textAlign: 'center', padding: 12 }}>Tap a pin to preview a business</div>}
            </div>
          </div>
        ) : type === 'product' ? (
          <div className="pad grid2" style={{ marginTop: 14 }}>
            {items.slice(0, 2).map((p) => <ProductCard key={p.id} p={p} grid />)}
            {sponsored && (
              <div style={{ position: 'relative' }}>
                <ProductCard p={sponsored} grid />
                <span className="badge dark" style={{ position: 'absolute', left: 8, top: 8 }}>Sponsored</span>
              </div>
            )}
            {items.slice(2).filter((p) => !sponsored || p.id !== sponsored.id).map((p) => <ProductCard key={p.id} p={p} grid />)}
          </div>
        ) : (
          <div className="pad" style={{ marginTop: 6 }}>
            {items.map((x) => (type === 'biz' ? <BizCard key={x.id} b={x} row /> : <EventCard key={x.id} e={x} row />))}
          </div>
        )}
      </div>

      <button className="btn dark sm" style={{ position: 'absolute', right: 16, bottom: 94, zIndex: 35, boxShadow: 'var(--shadow-2)' }}
        onClick={() => { if (ql) app.setGuideSeed({ text: q, t: Date.now() }); app.tab('guide') }}>
        <Sparkles size={15} color="var(--orange)" />Ask guide
      </button>

      {sheet === 'sort' && (
        <Sheet title="Sort by" onClose={() => setSheet(null)}>
          {SORTS.filter((s) => type === 'product' || (type === 'biz' ? s[0] !== 'low' : ['rel', 'low'].includes(s[0]))).map(([id, l]) => (
            <CheckRow key={id} on={sort === id} onClick={() => { setSort(id); setSheet(null) }}><span className="b">{l}</span></CheckRow>
          ))}
          <Note icon={Info}>Relevance never ranks by payment. Sponsored results are always labelled.</Note>
        </Sheet>
      )}
      {sheet === 'filter' && (
        <Sheet title="Filters" onClose={() => setSheet(null)}
          footer={<div className="row"><button className="btn ghost" onClick={() => setFlt({ cap: null, rate4: false, offer: false, verified: false })}>Clear</button><button className="btn primary grow" onClick={() => setSheet(null)}>Show {items.length} result{items.length === 1 ? '' : 's'}</button></div>}>
          {type !== 'biz' && (
            <>
              <div className="b small" style={{ margin: '4px 0 8px' }}>Maximum price</div>
              <div className="wrap">{PRICE_CAPS.map((c) => <Chip key={c ?? 'any'} on={flt.cap === c} onClick={() => setFlt({ ...flt, cap: c })}>{c ? `Up to ${inr(c)}` : 'Any'}</Chip>)}</div>
              <div className="divider" style={{ margin: '16px 0 8px' }} />
            </>
          )}
          {type !== 'event' && (
            <>
              <CheckRow on={flt.rate4} onClick={() => setFlt({ ...flt, rate4: !flt.rate4 })}><span className="b">Rated 4.5 and above</span></CheckRow>
              <CheckRow on={flt.verified} onClick={() => setFlt({ ...flt, verified: !flt.verified })}><span className="b">Verified businesses only</span></CheckRow>
              <CheckRow on={flt.offer} onClick={() => setFlt({ ...flt, offer: !flt.offer })}><span className="b">Has a current offer</span><br /><span className="muted">Businesses are listed with or without offers</span></CheckRow>
            </>
          )}
        </Sheet>
      )}
    </>
  )
}

function MockMap({ items, pin, setPin }) {
  const app = useApp()
  const X = [-7.6, 5.6], Y = [-5.8, 3.6]
  const px = (x) => `${((x - X[0]) / (X[1] - X[0])) * 100}%`
  const py = (y) => `${((Y[1] - y) / (Y[1] - Y[0])) * 100}%`
  return (
    <div className="map" style={{ marginBottom: 10 }}>
      <svg className="bg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <rect width="400" height="300" fill="#eef2f6" />
        <path d="M285 0 C270 70 300 120 282 180 S300 260 290 300" stroke="#cfe0f5" strokeWidth="26" fill="none" />
        <path d="M0 96 H400 M0 196 H400 M70 0 V300 M170 0 V300 M240 0 V300 M340 0 V300" stroke="#fff" strokeWidth="7" />
        <path d="M0 40 L400 150 M20 300 L210 0" stroke="#fff" strokeWidth="4" />
        <rect x="88" y="112" width="60" height="62" rx="8" fill="#dcefe2" />
        <rect x="186" y="214" width="40" height="44" rx="8" fill="#dcefe2" />
      </svg>
      <span className="you" style={{ left: px(app.area.x), top: py(app.area.y) }} title={`${app.area.name} centre`} />
      {items.map((b) => (
        <button key={b.id} className={`pin ${pin === b.id ? 'on' : ''}`} style={{ left: px(b.x), top: py(b.y), zIndex: pin === b.id ? 2 : 1 }} aria-label={b.name} onClick={() => setPin(b.id)}>
          <i><CatIcon id={b.cat} size={14} /></i>
        </button>
      ))}
    </div>
  )
}
