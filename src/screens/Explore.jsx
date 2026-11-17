import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Search, MapPin, ChevronDown, ChevronRight, SlidersHorizontal, Map as MapIcon, List, X, SearchX, MapPinOff, Info, ArrowUpDown, Sparkles, Plus, Minus, LocateFixed, KeyRound } from 'lucide-react'
import { useApp, Img, Chip, ProductCard, BizCard, EventCard, Sheet, Empty, Note, CatIcon, CheckRow, Verified, Rating, inr, priceOf } from '../ui.jsx'
import { CATS, cat as catOf } from '../data.js'

const SORTS = [['rel', 'Relevance'], ['dist', 'Distance'], ['low', 'Price: low to high'], ['rate', 'Rating']]
const PRICE_CAPS = [null, 500, 2500, 5000, 25000]
const RADII = [null, 2, 5, 10]
const NO_FLT = { cap: null, rate4: false, offer: false, verified: false, radius: null }

export default function Explore() {
  const app = useApp()
  const [q, setQ] = useState('')
  const [catId, setCatId] = useState('all')
  const [type, setType] = useState('product')
  const [sort, setSort] = useState('rel')
  const [flt, setFlt] = useState(NO_FLT)
  const [view, setView] = useState('list')
  const [pin, setPin] = useState(null)
  const [rentOnly, setRentOnly] = useState(false)
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
    if (s.rent) { setRentOnly(true); setType('product'); if (!s.cat) setCatId('all') }
    app.setExploreSeed(null)
  }, [app.exploreSeed])
  useEffect(() => { setPin(null) }, [type, catId, app.area.id])

  const pickCat = (id) => { setCatId(id); if (id === 'events' && !rentOnly) setType('event'); else if (type === 'event' && id !== 'all' && id !== 'entertainment') setType('product') }
  const ql = q.trim().toLowerCase()
  const match = (...fields) => !ql || ql.split(/\s+/).every((w) => fields.some((f) => f && f.toLowerCase().includes(w)))
  const d = (b) => app.distOf(b) ?? 0
  const inCat = (c) => catId === 'all' || c === catId
  const inRadius = (o) => !flt.radius || d(o) <= flt.radius

  let items = []
  if (!app.area.remote) {
    if (type === 'product') {
      items = app.products.filter((p) => inCat(p.cat) && (!rentOnly || p.rent) && match(p.name, p.tags.join(' '), app.biz(p.bizId).name, catOf(p.cat).label))
        .filter((p) => (!flt.cap || p.price <= flt.cap) && (!flt.rate4 || p.rating >= 4.5) && (!flt.offer || app.offerFor(p.id)) && (!flt.verified || app.biz(p.bizId).verified) && inRadius(app.biz(p.bizId)))
      if (sort === 'dist') items.sort((a, b) => d(app.biz(a.bizId)) - d(app.biz(b.bizId)))
      if (sort === 'low') items.sort((a, b) => a.price - b.price)
      if (sort === 'rate') items.sort((a, b) => b.rating - a.rating)
    } else if (type === 'biz') {
      items = app.businesses.filter((b) => inCat(b.cat) && match(b.name, b.tagline, b.addr, catOf(b.cat).label))
        .filter((b) => (!flt.rate4 || b.rating >= 4.5) && (!flt.verified || b.verified) && (!flt.offer || app.offers.some((o) => o.bizId === b.id)) && inRadius(b))
      items = [...items].sort((a, b) => (sort === 'rate' ? b.rating - a.rating : d(a) - d(b)))
    } else {
      items = app.events.filter((e) => inCat(e.cat || 'events') && match(e.name, e.type, e.venue)).filter((e) => (!flt.cap || e.price <= flt.cap) && inRadius(e))
      if (sort === 'low') items = [...items].sort((a, b) => a.price - b.price)
      if (sort === 'dist') items = [...items].sort((a, b) => d(a) - d(b))
    }
  }
  const nFlt = (flt.cap ? 1 : 0) + flt.rate4 + flt.offer + flt.verified + (flt.radius ? 1 : 0)
  const sponsored = type === 'product' && !rentOnly && !ql && catId === 'all' && sort === 'rel' && !nFlt ? app.prod('h3') : null
  const isMap = view === 'map'

  // Every result maps to the coordinates of the shop (or venue) behind it.
  const pins = useMemo(() => {
    if (type === 'biz') return items.map((b) => ({ id: b.id, x: b.x, y: b.y, img: b.cover, title: b.name, sub: `${catOf(b.cat).label} · ${app.distLabel(b)}`, biz: b, open: () => app.go('biz', b.id) }))
    if (type === 'event') return items.map((e) => ({ id: e.id, x: e.x, y: e.y, img: e.img, title: e.name, sub: `${e.date} · ${e.priceLabel.split(' ·')[0]}`, event: e, open: () => app.go('event', e.id) }))
    const groups = new Map()
    items.forEach((p) => { if (!groups.has(p.bizId)) groups.set(p.bizId, []); groups.get(p.bizId).push(p) })
    return [...groups].map(([bizId, ps]) => {
      const b = app.biz(bizId)
      return { id: bizId, x: b.x, y: b.y, img: ps[0].img, title: b.name, sub: `${ps.length} matching item${ps.length > 1 ? 's' : ''} · ${app.distLabel(b)}`, biz: b, products: ps, count: ps.length, open: () => app.go('biz', bizId) }
    })
  }, [items.map((i) => i.id).join(), type, app.area.id])

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
          <Chip className="blue" on={rentOnly} onClick={() => { setRentOnly(!rentOnly); if (!rentOnly) setType('product') }}><KeyRound size={15} />For rent</Chip>
          {CATS.map((c) => <Chip key={c.id} on={catId === c.id} onClick={() => pickCat(c.id)}><CatIcon id={c.id} size={15} />{c.label}</Chip>)}
        </div>

        <div className="pad" style={{ marginTop: 12 }}>
          <div className="seg" role="tablist">
            {[['product', 'Products & services'], ['biz', 'Businesses'], ['event', 'Events']].map(([id, l]) => (
              <button key={id} role="tab" aria-selected={type === id} className={type === id ? 'on' : ''} onClick={() => { setType(id); if (id === 'event') { if (!['all', 'events', 'entertainment'].includes(catId)) setCatId('all'); setRentOnly(false) } else { if (id === 'biz') setRentOnly(false); if (type === 'event' && catId === 'events') setCatId('all') } }}>{l}</button>
            ))}
          </div>
          <div className="between" style={{ marginTop: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <button className={`chip ${nFlt ? 'on blue' : ''}`} onClick={() => setSheet('filter')}><SlidersHorizontal size={14} />Filters{nFlt ? ` · ${nFlt}` : ''}</button>
              {!isMap && <button className="chip" onClick={() => setSheet('sort')}><ArrowUpDown size={14} />{SORTS.find((s) => s[0] === sort)[1].split(':')[0]}</button>}
            </div>
            <div className="seg" style={{ padding: 3 }} role="group" aria-label="Result layout">
              <button className={!isMap ? 'on' : ''} aria-label="List view" aria-pressed={!isMap} onClick={() => setView('list')} style={{ minHeight: 34, padding: '0 12px' }}><List size={16} /></button>
              <button className={isMap ? 'on' : ''} aria-label="Map view" aria-pressed={isMap} onClick={() => setView('map')} style={{ minHeight: 34, padding: '0 12px' }}><MapIcon size={16} />Map</button>
            </div>
          </div>
          <div className="tiny muted" style={{ marginTop: 10 }}>
            {app.area.remote ? '' : `${items.length} ${rentOnly ? 'rental' : 'result'}${items.length === 1 ? '' : 's'}${isMap && type === 'product' ? ` at ${pins.length} shop${pins.length === 1 ? '' : 's'}` : ''}${ql ? ` for “${q.trim()}”` : ''}${flt.radius ? ` within ${flt.radius} km` : ''} · distances from ${app.area.name} centre`}
          </div>
        </div>

        {app.area.remote ? (
          <Empty icon={MapPinOff} title={`Nothing listed in ${app.area.name} yet`} text={`Lesho hasn't onboarded businesses in ${app.area.city} in this preview.`} action="Choose another area" onAction={app.openArea} />
        ) : isMap ? (
          <div className="pad" style={{ marginTop: 10 }}>
            <MapView pins={pins} type={type} sel={pin} setSel={setPin} radius={flt.radius} setRadius={(r) => setFlt({ ...flt, radius: r })} />
            <div style={{ marginTop: 10 }}><Note icon={Info}>Illustrative static map. Pins sit at each shop's or venue's listed location; the orange dot is the centre of {app.area.name}, not your live location.</Note></div>
          </div>
        ) : items.length === 0 ? (
          <Empty icon={SearchX} title="No matches" text="Try a broader term, another category or fewer filters. You can also ask the guide to find alternatives."
            action="Ask the guide" onAction={() => { app.setGuideSeed({ text: q || catOf(catId)?.label || 'Explore local stores', t: Date.now() }); app.tab('guide') }} />
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

      {!isMap && (
        <button className="btn dark sm" style={{ position: 'absolute', right: 16, bottom: 94, zIndex: 35, boxShadow: 'var(--shadow-2)' }}
          onClick={() => { if (ql) app.setGuideSeed({ text: q, t: Date.now() }); app.tab('guide') }}>
          <Sparkles size={15} color="var(--orange)" />Ask guide
        </button>
      )}

      {sheet === 'sort' && (
        <Sheet title="Sort by" onClose={() => setSheet(null)}>
          {SORTS.filter((s) => type === 'product' || (type === 'biz' ? s[0] !== 'low' : s[0] !== 'rate')).map(([id, l]) => (
            <CheckRow key={id} on={sort === id} onClick={() => { setSort(id); setSheet(null) }}><span className="b">{l}</span></CheckRow>
          ))}
          <Note icon={Info}>Relevance never ranks by payment. Sponsored results are always labelled.</Note>
        </Sheet>
      )}
      {sheet === 'filter' && (
        <Sheet title="Filters" onClose={() => setSheet(null)}
          footer={<div className="row"><button className="btn ghost" onClick={() => setFlt(NO_FLT)}>Clear</button><button className="btn primary grow" onClick={() => setSheet(null)}>Show {items.length} result{items.length === 1 ? '' : 's'}</button></div>}>
          <div className="b small" style={{ margin: '4px 0 8px' }}>Distance from {app.area.name} centre</div>
          <div className="wrap">{RADII.map((r) => <Chip key={r ?? 'any'} on={flt.radius === r} onClick={() => setFlt({ ...flt, radius: r })}>{r ? `Within ${r} km` : 'Any distance'}</Chip>)}</div>
          {type !== 'biz' && (
            <>
              <div className="b small" style={{ margin: '16px 0 8px' }}>Maximum price</div>
              <div className="wrap">{PRICE_CAPS.map((c) => <Chip key={c ?? 'any'} on={flt.cap === c} onClick={() => setFlt({ ...flt, cap: c })}>{c ? `Up to ${inr(c)}` : 'Any'}</Chip>)}</div>
            </>
          )}
          {type !== 'event' && (
            <>
              <div className="divider" style={{ margin: '16px 0 8px' }} />
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

/* ---------- Pannable, zoomable illustrative map with photo pins ---------- */
const KX = [-7.6, 5.6], KY = [-5.8, 3.6]            // map bounds in km (x east, y north)
const ASPECT = (KX[1] - KX[0]) / (KY[1] - KY[0])
const ZOOMS = [1, 1.55, 2.3]
const VH = 470

function MapView({ pins, type, sel, setSel, radius, setRadius }) {
  const app = useApp()
  const [zi, setZi] = useState(1)
  const vp = useRef(), centre = useRef(null), drag = useRef(null), cards = useRef({})
  const H = VH * ZOOMS[zi], W = H * ASPECT
  const px = (x) => ((x - KX[0]) / (KX[1] - KX[0])) * W
  const py = (y) => ((KY[1] - y) / (KY[1] - KY[0])) * H
  const OFF = (VH - (type === 'product' ? 190 : 104)) / 2 + 48 // keep the focus point clear of the result cards
  const centreOn = (x, y, smooth) => vp.current?.scrollTo({ left: px(x) - vp.current.clientWidth / 2, top: py(y) - OFF, behavior: smooth ? 'smooth' : 'auto' })
  const selPin = pins.find((p) => p.id === sel)

  // Keep the same spot in view when zooming; start centred on the chosen area.
  useLayoutEffect(() => {
    const c = centre.current
    if (c) centreOn(c.x, c.y)
    else centreOn(app.area.x, app.area.y)
  }, [zi])
  useEffect(() => { centre.current = null; centreOn(app.area.x, app.area.y, true) }, [app.area.id])
  useEffect(() => {
    if (!selPin) return
    centreOn(selPin.x, selPin.y, true)
    cards.current[selPin.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [sel])
  const onScroll = () => {
    const el = vp.current
    centre.current = { x: KX[0] + ((el.scrollLeft + el.clientWidth / 2) / W) * (KX[1] - KX[0]), y: KY[1] - ((el.scrollTop + OFF) / H) * (KY[1] - KY[0]) }
  }
  // Mouse drag pans the map on desktop; touch uses native scrolling.
  const onDown = (e) => { if (e.pointerType === 'mouse') drag.current = { x: e.clientX, y: e.clientY, l: vp.current.scrollLeft, t: vp.current.scrollTop, moved: false } }
  const onMove = (e) => {
    const g = drag.current
    if (!g) return
    const dx = e.clientX - g.x, dy = e.clientY - g.y
    if (Math.abs(dx) + Math.abs(dy) > 4) g.moved = true
    vp.current.scrollLeft = g.l - dx; vp.current.scrollTop = g.t - dy
  }
  const onUp = () => { const g = drag.current; drag.current = null; return g?.moved }
  const rDiam = radius ? ((2 * radius) / 1.25 / (KX[1] - KX[0])) * W : 0
  const callBelow = selPin && py(selPin.y) < 190

  return (
    <div className="mapwrap">
      <div className="mapvp" ref={vp} onScroll={onScroll} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        onClick={(e) => { if (e.target === e.currentTarget || e.target.tagName === 'svg' || e.target.closest('svg')) setSel(null) }}>
        <div className="mapinner" style={{ width: W, height: H }}>
          <MapArt areas={app.areas.filter((a) => !a.remote)} />
          {radius && <span className="mradius" style={{ left: px(app.area.x), top: py(app.area.y), width: rDiam, height: rDiam }} />}
          <span className="mcentre" style={{ left: px(app.area.x), top: py(app.area.y) }} title={`${app.area.name} centre`} />
          {pins.map((p) => (
            <button key={p.id} className={`mpin ${sel === p.id ? 'on' : ''}`} style={{ left: px(p.x), top: py(p.y), zIndex: sel === p.id ? 50 : 10 + Math.round(py(p.y) / 20) }}
              aria-label={p.title} aria-pressed={sel === p.id} onClick={(e) => { e.stopPropagation(); setSel(p.id) }}>
              <span className="ph"><Img id={p.img} w={120} alt="" /></span>
              {p.count > 1 && <span className="ct">{p.count}</span>}
            </button>
          ))}
          {selPin && (
            <button className="mcall" onClick={(e) => { e.stopPropagation(); selPin.open() }}
              style={{ left: Math.max(8, Math.min(W - 222, px(selPin.x) - 107)), top: callBelow ? py(selPin.y) + 8 : py(selPin.y) - 76 - 52 }}>
              <span className="grow"><span className="b small clamp1" style={{ display: 'block' }}>{selPin.title}</span><span className="tiny muted clamp1" style={{ display: 'block' }}>{selPin.sub}</span></span>
              <ChevronRight size={18} color="var(--blue)" style={{ flex: 'none' }} />
            </button>
          )}
        </div>
      </div>

      <div className="maptop">
        {RADII.slice(0, 3).map((r) => <button key={r ?? 'any'} className={`chip ${radius === r ? 'on' : ''}`} aria-pressed={radius === r} onClick={() => setRadius(r)}>{r ? `${r} km` : 'Any distance'}</button>)}
      </div>
      <div className="mapctl">
        <button className="icon-btn" aria-label="Zoom in" disabled={zi === ZOOMS.length - 1} onClick={() => setZi(zi + 1)}><Plus size={18} /></button>
        <button className="icon-btn" aria-label="Zoom out" disabled={zi === 0} onClick={() => setZi(zi - 1)}><Minus size={18} /></button>
        <button className="icon-btn" aria-label={`Centre on ${app.area.name}`} onClick={() => { setSel(null); centreOn(app.area.x, app.area.y, true) }}><LocateFixed size={18} /></button>
      </div>
      {pins.length === 0 && <div className="mapnote">No results on the map{radius ? ` within ${radius} km` : ''}.<br />Try a wider distance or fewer filters.</div>}

      <div className="mapcards" aria-label="Results on the map">
        {pins.map((p) => (
          <div key={p.id} ref={(el) => { cards.current[p.id] = el }} className={`mcard ${sel === p.id ? 'on' : ''}`} onClick={() => setSel(p.id)}>
            <div className="row" style={{ gap: 10 }}>
              <Img className="th" id={p.event ? p.event.img : p.biz.cover} w={140} alt="" />
              <div className="grow">
                <div className="row" style={{ gap: 4 }}><span className="b small clamp1">{p.title}</span>{p.biz && <Verified biz={p.biz} size={13} />}</div>
                <div className="tiny muted clamp1">{p.event ? `${p.event.date} · ${p.event.venue}` : p.sub}</div>
                {p.biz && !p.products && <div style={{ marginTop: 2 }}><Rating value={p.biz.rating} count={p.biz.reviews} /></div>}
                {p.event && <div className="tiny b" style={{ marginTop: 2 }}>{p.event.priceLabel.split(' ·')[0]}</div>}
              </div>
              <button className="btn soft sm" style={{ padding: '0 12px', minHeight: 36 }} aria-label={`Open ${p.title}`} onClick={(e) => { e.stopPropagation(); p.open() }}>{type === 'event' ? 'Details' : 'Shop'}</button>
            </div>
            {p.products && (
              <div className="mini">
                {p.products.slice(0, 3).map((pr) => (
                  <button key={pr.id} onClick={(e) => { e.stopPropagation(); app.go('product', pr.id) }} aria-label={pr.name}>
                    <Img id={pr.img} w={160} alt="" />
                    <span className="tiny b clamp1" style={{ display: 'block', marginTop: 4 }}>{priceOf(pr)}</span>
                    <span className="tiny muted clamp1" style={{ display: 'block' }}>{pr.name}</span>
                  </button>
                ))}
                {p.products.length < 3 && Array.from({ length: 3 - p.products.length }).map((_, i) => <span key={i} style={{ flex: 1 }} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Hand-drawn city backdrop at 100 px per km. Not real cartography. */
const MapArt = React.memo(function MapArt({ areas }) {
  const X = (x) => (x - KX[0]) * 100, Y = (y) => (KY[1] - y) * 100
  return (
    <svg viewBox="0 0 1320 940" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="blocks" width="66" height="58" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
          <rect width="66" height="58" fill="#eef1f5" /><path d="M0 0H66M0 0V58" stroke="#fff" strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="1320" height="940" fill="url(#blocks)" />
      <path d="M930 -10 C900 150 990 260 950 420 S1010 700 960 950" stroke="#cbdff5" strokeWidth="58" fill="none" strokeLinecap="round" />
      <ellipse cx={X(-3.6)} cy={Y(-0.7)} rx="46" ry="30" fill="#cbdff5" />
      <rect x={X(0.0)} y={Y(-0.9)} width="74" height="60" rx="12" fill="#d9eedf" />
      <rect x={X(-5.3)} y={Y(-1.4)} width="96" height="70" rx="12" fill="#d9eedf" />
      <rect x={X(2.9)} y={Y(-3.2)} width="110" height="84" rx="12" fill="#d9eedf" />
      <rect x={X(-2.0)} y={Y(2.6)} width="84" height="56" rx="12" fill="#d9eedf" />
      <g stroke="#fff" strokeWidth="16" fill="none" strokeLinecap="round">
        <path d="M90 -10 C150 260 120 560 210 950" />
        <path d="M500 -10 C520 300 480 620 520 950" />
        <path d="M790 -10 C770 320 800 640 780 950" />
        <path d="M-10 170 C400 150 800 190 1330 150" />
        <path d="M-10 350 C420 330 860 360 1330 340" />
        <path d="M-10 600 C380 570 900 620 1330 580" />
        <path d="M-10 780 C420 800 880 760 1330 800" />
        <path d="M1080 -10 C1100 320 1060 640 1110 950" />
      </g>
      <g stroke="#f7d9b8" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M90 -10 C150 260 120 560 210 950" /><path d="M-10 350 C420 330 860 360 1330 340" />
      </g>
      <g fontFamily="inherit" fontSize="17" fontWeight="700" fill="#9aa0ab" letterSpacing="2" textAnchor="middle">
        {areas.map((a) => <text key={a.id} x={X(a.x)} y={Y(a.y) + 52}>{a.name.toUpperCase()}</text>)}
        <text x="975" y="250" fill="#8fb4de" transform="rotate(78 975 250)" letterSpacing="4">SABARMATI</text>
      </g>
    </svg>
  )
})
