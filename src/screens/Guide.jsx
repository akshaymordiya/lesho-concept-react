import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, ArrowUp, RotateCcw, Scale, Check, Info, Compass, Eye, X } from 'lucide-react'
import { useApp, Img, Chip, Note, Rating, SaveBtn, Sheet, EventCard, BizCard, inr, priceOf, Verified } from '../ui.jsx'
import { cat as catOf } from '../data.js'
import { PROMPTS } from './Home.jsx'

// Deterministic mock "AI": keyword intent parsing over local mock data. No model is called.
const INTENTS = [
  { cat: 'services', type: 'product', kw: ['ac', 'repair', 'cleaning', 'cleaner', 'tutor', 'electrician', 'plumber'], noun: 'a home service' },
  { cat: 'fashion', type: 'product', kw: ['saree', 'sari', 'lehenga', 'kurta', 'wedding', 'dress', 'suit', 'outfit'], noun: 'occasion wear' },
  { cat: 'electronics', type: 'product', kw: ['phone', 'mobile', 'headphone', 'earbuds'], noun: 'a phone' },
  { cat: 'events', type: 'event', kw: ['event', 'weekend', 'concert', 'workshop', 'music', 'festival'], noun: 'events' },
  { cat: 'beauty', type: 'product', kw: ['salon', 'hair', 'facial', 'spa', 'makeup'], noun: 'a salon service' },
  { cat: 'home', type: 'product', kw: ['sofa', 'furniture', 'chair', 'interior'], noun: 'furniture' },
  { cat: 'fitness', type: 'product', kw: ['gym', 'yoga', 'fitness', 'workout'], noun: 'a gym or class' },
  { cat: 'auto', type: 'product', kw: ['car', 'bike', 'test drive', 'servicing'], noun: 'car care' },
  { cat: 'food', type: 'product', kw: ['food', 'dosa', 'thali', 'dinner', 'lunch', 'breakfast', 'restaurant', 'cafe', 'café', 'coffee', 'eat', 'hungry'], noun: 'food' },
  { cat: null, type: 'biz', kw: ['store', 'shop', 'local'], noun: 'local stores' },
]
const SUBS = ['saree', 'lehenga', 'suit', 'phone', 'headphones', 'dosa', 'thali', 'coffee', 'sofa', 'chair', 'hair', 'facial', 'gym', 'cleaning', 'ac']
const STYLES = { fashion: ['silk', 'georgette'], electronics: ['5g'], food: ['south indian', 'gujarati'] }

function parseBudget(t) {
  const m = t.replace(/,/g, '').match(/(?:₹|rs\.?\s?|under\s|around\s|below\s|upto\s|up to\s)\s*(\d+(?:\.\d+)?)\s*(k)?/i) || t.replace(/,/g, '').match(/\b(\d{3,7})\b()/)
  if (!m) return null
  const n = parseFloat(m[1]) * (m[2] ? 1000 : 1)
  return n >= 50 ? Math.round(n) : null
}
function interpret(text) {
  const t = ` ${text.toLowerCase()} `
  const hit = INTENTS.find((i) => i.kw.some((k) => new RegExp(`\\b${k}s?\\b`).test(t)))
  const budget = parseBudget(t)
  const sub = SUBS.find((s) => t.includes(s === 'ac' ? ' ac ' : s)) || (t.includes('sari') ? 'saree' : t.includes('mobile') ? 'phone' : null)
  const style = hit && (STYLES[hit.cat] || []).find((s) => t.includes(s))
  return { ...(hit || { cat: null, type: 'unknown' }), budget, sub, style: style || null, occasion: /wedding|shaadi|sangeet|reception/.test(t) ? 'wedding' : null, text }
}

function resultsFor(intent, f, app) {
  if (intent.type === 'event') return app.events.map((e) => ({ type: 'event', item: e }))
  if (intent.type === 'biz') return [...app.businesses].sort((a, b) => (app.distOf(a) ?? 0) - (app.distOf(b) ?? 0)).slice(0, 5).map((b) => ({ type: 'biz', item: b }))
  if (intent.type !== 'product') return []
  const cap = f.budget ? f.budget * (f.stretch ? 1.15 : 1) : Infinity
  return app.products
    .filter((p) => p.cat === intent.cat)
    .filter((p) => !intent.sub || p.tags.includes(intent.sub) || new RegExp(`\\b${intent.sub}`, 'i').test(p.name))
    .filter((p) => !f.occasion || p.tags.includes(f.occasion))
    .filter((p) => !f.style || p.tags.includes(f.style))
    .filter((p) => p.price <= cap)
    .filter((p) => !f.near || (app.distOf(app.biz(p.bizId)) ?? 0) <= 5)
    .sort((a, b) => (f.budget ? (a.price > f.budget) - (b.price > f.budget) : 0) || b.rating - a.rating)
    .slice(0, 6)
    .map((p) => ({ type: 'product', item: p, over: f.budget && p.price > f.budget ? p.price - f.budget : 0 }))
}

function whyFor(p, over, f, app) {
  const b = app.biz(p.bizId), out = []
  if (f.budget) out.push(over ? `${inr(over)} over your budget — shown as a close alternative` : `Within your ${inr(f.budget)} budget`)
  if (f.occasion && p.tags.includes(f.occasion)) out.push(`Tagged for ${f.occasion}s by the store`)
  if (f.style && p.tags.includes(f.style)) out.push(`Matches “${f.style}”`)
  const d = app.distOf(b)
  if (d != null) out.push(`${d.toFixed(1)} km from ${app.area.name}`)
  if (p.rating >= 4.5) out.push(`Rated ${p.rating} by ${p.reviews} reviewers`)
  return out.slice(0, 3)
}

export default function Guide() {
  const app = useApp()
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [intent, setIntent] = useState(null)
  const [f, setF] = useState({})
  const [cmp, setCmp] = useState([])
  const [showCmp, setShowCmp] = useState(false)
  const scroller = useRef(), timer = useRef(), seedT = useRef(0)

  const send = (raw) => {
    const t = raw.trim()
    if (!t || typing) return
    setText(''); setTyping(true); setCmp([])
    setMsgs((m) => [...m, { role: 'user', text: t }])
    let next = interpret(t), nf
    // A follow-up without a new category refines the current request instead of starting over.
    const low = t.toLowerCase()
    const style = intent ? (STYLES[intent.cat] || []).find((s) => low.includes(s)) : null
    if (next.type === 'unknown' && intent && intent.type === 'product' && (next.budget || style || next.occasion || /near|close|cheaper|less/.test(low))) {
      nf = { ...f, ...(next.budget ? { budget: next.budget, stretch: false } : {}), ...(style ? { style } : {}), ...(next.occasion ? { occasion: next.occasion } : {}), ...(/near|close/.test(low) ? { near: true } : {}) }
      if (/cheaper|less/.test(low) && !next.budget) {
        const base = f.budget || Math.max(...resultsFor(intent, f, app).map((r) => r.item.price), 0)
        if (base) nf = { ...nf, budget: Math.max(50, Math.round((base * 0.85) / 50) * 50), stretch: false }
      }
      next = { ...intent, refined: true }
    } else {
      nf = { budget: next.budget, stretch: !!next.budget, occasion: next.occasion, style: next.style, near: false }
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setIntent(next); setF(nf); setMsgs((m) => [...m, { role: 'ai', intent: next }]); setTyping(false) }, 750)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (app.guideSeed && app.guideSeed.t !== seedT.current) { seedT.current = app.guideSeed.t; send(app.guideSeed.text); app.setGuideSeed(null) }
  }, [app.guideSeed])
  useEffect(() => { if (msgs.length) scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }) }, [msgs.length, typing])

  const results = intent ? resultsFor(intent, f, app) : []
  const lastAi = msgs.map((m) => m.role).lastIndexOf('ai')
  const toggleCmp = (id) => setCmp((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? (app.toast('Compare up to 3 at a time'), c) : [...c, id])
  const reset = () => { setMsgs([]); setIntent(null); setF({}); setCmp([]) }
  const stores = new Set(results.filter((r) => r.type === 'product').map((r) => r.item.bizId)).size

  const summary = () => {
    if (intent.type === 'unknown') return <>I couldn't match that to a category in this preview. Pick one below, or tell me a product, a place or an occasion.</>
    if (intent.type === 'event') return <>Here are <b>events coming up</b> around {app.area.city}. Tickets are handled by each organiser — I can only help you send a request.</>
    if (intent.type === 'biz') return <>Here are <b>local stores</b> closest to {app.area.name}. Open any profile to see its catalogue, posts and reviews.</>
    const bits = [<b key="a">{intent.sub || intent.noun}</b>]
    if (f.occasion) bits.push(<> for a <b>{f.occasion}</b></>)
    if (f.budget) bits.push(<> around <b>{inr(f.budget)}</b></>)
    bits.push(<> near <b>{app.area.name}</b></>)
    const over = results.filter((r) => r.over).length
    return (
      <>
        {intent.refined ? 'Updated. ' : ''}Here's what I understood: {bits.map((b, i) => <React.Fragment key={i}>{b}</React.Fragment>)}.{' '}
        {results.length
          ? <>I found <b>{results.length} option{results.length > 1 ? 's' : ''}</b> across {stores} store{stores > 1 ? 's' : ''}.{over ? ` ${over} ${over > 1 ? 'are' : 'is'} slightly over budget and marked.` : ''} I haven't confirmed stock with any store.</>
          : <>Nothing in the mock catalogue matches all of that. Try loosening a filter below.</>}
      </>
    )
  }

  return (
    <>
      <div className="screen" ref={scroller} style={{ paddingBottom: cmp.length ? 230 : 176 }}>
        <div className="topbar" style={{ padding: '8px 16px 8px 20px' }}>
          <div className="row grow" style={{ gap: 10 }}>
            <span className="ai-card" style={{ margin: 0, padding: 0, borderRadius: 13, background: 'none' }}><span className="spark" style={{ width: 36, height: 36, borderRadius: 13 }}><Sparkles size={18} /></span></span>
            <div><div className="h3">Lesho Guide</div><div className="tiny muted">Recommendations from mock merchant data</div></div>
          </div>
          {msgs.length > 0 && <button className="btn ghost sm" onClick={reset}><RotateCcw size={14} />New</button>}
        </div>

        {msgs.length === 0 && !typing ? (
          <div className="pad" style={{ paddingTop: 22 }}>
            <h1 className="h1">What are you<br />looking for today?</h1>
            <p className="muted" style={{ marginTop: 10 }}>Tell me what you need, your budget or the occasion. I'll compare options across local stores and explain each pick.</p>
            <div className="stack" style={{ marginTop: 22 }}>
              {PROMPTS.map((p) => (
                <button key={p} className="opt" onClick={() => send(p)}>
                  <span className="ic"><Sparkles size={16} /></span><span className="b small grow">{p}</span><ArrowUp size={16} color="var(--faint)" style={{ transform: 'rotate(45deg)' }} />
                </button>
              ))}
            </div>
            <button className="link" style={{ marginTop: 18 }} onClick={() => app.tab('explore')}><Compass size={15} style={{ marginRight: 4 }} />Prefer to browse? Open Explore</button>
          </div>
        ) : (
          <div className="chat">
            {msgs.map((m, i) => m.role === 'user' ? <div key={i} className="bubble user">{m.text}</div> : (
              i !== lastAi
                ? <div key={i} className="bubble ai muted">Earlier results replaced by your latest request.</div>
                : (
                  <React.Fragment key={i}>
                    <div className="bubble ai">{summary()}</div>
                    {intent.type === 'unknown' && (
                      <div className="wrap">{['Wedding saree', 'Dosa near me', 'Compare phones', 'Find a salon', 'Events this weekend'].map((p) => <Chip key={p} onClick={() => send(p)}>{p}</Chip>)}</div>
                    )}
                    {intent.type === 'product' && (
                      <div className="hscroll tight" style={{ margin: '0 -16px', padding: '2px 16px', scrollPaddingInline: 16 }} aria-label="Refine filters">
                        {f.budget && <Chip className="blue" on onClick={() => setF({ ...f, budget: null, stretch: false })}>Up to {inr(f.budget)}<X size={13} /></Chip>}
                        {f.budget && <Chip className="blue" on={f.stretch} onClick={() => setF({ ...f, stretch: !f.stretch })}>Allow +15%</Chip>}
                        {intent.occasion && <Chip className="blue" on={!!f.occasion} onClick={() => setF({ ...f, occasion: f.occasion ? null : intent.occasion })}>Wedding</Chip>}
                        <Chip className="blue" on={f.near} onClick={() => setF({ ...f, near: !f.near })}>Within 5 km of {app.area.name}</Chip>
                        {(STYLES[intent.cat] || []).map((s) => <Chip key={s} className="blue" on={f.style === s} onClick={() => setF({ ...f, style: f.style === s ? null : s })}>{s[0].toUpperCase() + s.slice(1)}</Chip>)}
                      </div>
                    )}
                    {results.length > 0 && <Note icon={Info} tone="amber">Recommendations use mock merchant data, not live inventory. Prices are merchant-provided; confirm with the store.</Note>}
                    {results.map((r, k) => r.type === 'product' ? (
                      <ResultCard key={r.item.id} r={r} f={f} i={k} picked={cmp.includes(r.item.id)} onCmp={() => toggleCmp(r.item.id)} />
                    ) : (
                      <div key={r.item.id} className="card" style={{ padding: '0 12px' }}>{r.type === 'event' ? <EventCard e={r.item} row /> : <BizCard b={r.item} row />}</div>
                    ))}
                    {intent.type === 'product' && results.length > 0 && (
                      <div className="wrap" style={{ marginTop: 2 }}>
                        <span className="tiny muted" style={{ width: '100%' }}>Refine</span>
                        {['Show cheaper options', 'Only near me', ...(intent.cat === 'fashion' ? ['Only silk'] : [])].map((p) => <Chip key={p} onClick={() => send(p)}>{p}</Chip>)}
                        <Chip onClick={() => { app.setExploreSeed({ cat: intent.cat, q: intent.sub || '', t: Date.now() }); app.tab('explore') }}><Compass size={14} />Browse all {catOf(intent.cat).label.toLowerCase()}</Chip>
                      </div>
                    )}
                  </React.Fragment>
                )
            ))}
            {typing && <div className="bubble ai"><span className="typing" aria-label="Guide is thinking"><i /><i /><i /></span></div>}
          </div>
        )}
      </div>

      {cmp.length > 0 && (
        <div className="cmpbar">
          <span>{cmp.length} selected{cmp.length < 2 ? ' — pick one more' : ''}</span>
          <button className="btn light sm" disabled={cmp.length < 2} onClick={() => setShowCmp(true)}><Scale size={15} />Compare</button>
        </div>
      )}
      <div className="composer">
        <form onSubmit={(e) => { e.preventDefault(); send(text) }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={intent ? 'Refine — e.g. “only silk, under ₹4,500”' : 'I need a wedding saree around ₹5,000'} aria-label="Message the guide" />
          <button className="icon-btn on" type="submit" aria-label="Send" disabled={!text.trim() || typing} style={{ opacity: text.trim() ? 1 : .5 }}><ArrowUp size={19} /></button>
        </form>
      </div>
      {showCmp && <CompareSheet ids={cmp} onClose={() => setShowCmp(false)} />}
    </>
  )
}

function ResultCard({ r, f, i, picked, onCmp }) {
  const app = useApp()
  const p = r.item, b = app.biz(p.bizId)
  return (
    <div className="result" style={{ animationDelay: `${i * 70}ms` }}>
      <button className="main" onClick={() => app.go('product', p.id)}>
        <Img id={p.img} w={240} alt={p.name} />
        <div className="grow">
          {r.over > 0 && <span className="badge amber" style={{ marginBottom: 5 }}>Over budget by {inr(r.over)}</span>}
          <div className="b clamp2" style={{ fontSize: 14.5, lineHeight: 1.3 }}>{p.name}</div>
          <div className="row" style={{ gap: 8, marginTop: 5 }}><span className="price" style={{ fontSize: 17 }}>{priceOf(p)}</span><Rating value={p.rating} count={p.reviews} /></div>
          <div className="tiny muted" style={{ marginTop: 2 }}>{p.fresh}</div>
          <div className="row tiny" style={{ gap: 4, marginTop: 6 }}><span className="b clamp1">{b.name}</span><Verified biz={b} size={13} /><span className="muted" style={{ flex: 'none' }}>· {app.distLabel(b)}</span></div>
        </div>
      </button>
      <div className="why">
        <span className="b">Why this matches</span>
        <ul>{whyFor(p, r.over, f, app).map((w) => <li key={w}>{w}</li>)}</ul>
      </div>
      <div className="acts">
        <button className="btn soft sm" onClick={() => app.go('product', p.id)}><Eye size={15} />View</button>
        <button className={`btn sm ${picked ? 'dark' : 'ghost'}`} aria-pressed={picked} onClick={onCmp}>{picked ? <Check size={15} /> : <Scale size={15} />}Compare</button>
        <SaveBtn type="product" id={p.id} className="" />
      </div>
    </div>
  )
}

function CompareSheet({ ids, onClose }) {
  const app = useApp()
  const ps = ids.map(app.prod)
  const keys = [...new Set(ps.flatMap((p) => Object.keys(p.attrs)))].slice(0, 5)
  const rows = [
    ['Price', (p) => <b>{priceOf(p)}</b>],
    ['Store', (p) => app.biz(p.bizId).name],
    ['Distance', (p) => app.distLabel(app.biz(p.bizId))],
    ['Rating', (p) => `${p.rating} (${p.reviews})`],
    ['Stock', (p) => p.avail.label],
    ...keys.map((k) => [k, (p) => p.attrs[k] || '—']),
  ]
  return (
    <Sheet title="Compare" onClose={onClose}>
      <table className="cmp">
        <tbody>
          <tr><th></th>{ps.map((p) => (
            <td key={p.id}><button onClick={() => { onClose(); app.go('product', p.id) }} style={{ width: '100%' }}>
              <Img id={p.img} w={200} alt={p.name} style={{ aspectRatio: '1', borderRadius: 12 }} />
              <div className="b clamp2" style={{ marginTop: 6, lineHeight: 1.25 }}>{p.name}</div>
            </button></td>
          ))}</tr>
          {rows.map(([k, fn]) => <tr key={k}><th>{k}</th>{ps.map((p) => <td key={p.id}>{fn(p)}</td>)}</tr>)}
        </tbody>
      </table>
      <div style={{ marginTop: 12 }}><Note icon={Info}>All values are merchant-provided mock data. Blank cells mean the store has not supplied that detail.</Note></div>
    </Sheet>
  )
}
