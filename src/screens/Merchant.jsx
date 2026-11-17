import React, { useEffect, useState } from 'react'
import {
  Inbox, CheckCheck, Footprints, IndianRupee, ChevronRight, MousePointerClick, MessageSquareText, CalendarCheck, BadgeCheck, ArrowLeftRight, Search,
  Film, Image as ImageIcon, Images, Tag, Megaphone, PartyPopper, Package, Plus, Pencil, Info, Check, Flag, AlertCircle, Eye, ArrowLeft, Link2, Play, Receipt, Timer, KeyRound, Minus,
} from 'lucide-react'
import { useApp, Img, TopBar, Chip, Note, Sheet, Empty, Verified, inr, priceOf } from '../ui.jsx'
import { ANALYTICS, PRICING, SAMPLE_MEDIA, CATS } from '../data.js'
import { RentalLeadActions, RentalsStrip, dayAt, dayLabel } from './Rental.jsx'
import { ConversationList } from './Activity.jsx'

const ME = 'b1'
const KIND = {
  click: { label: 'Click', icon: MousePointerClick, hint: 'A tap on call, WhatsApp or directions. Not proof of contact.' },
  enquiry: { label: 'Enquiry', icon: MessageSquareText, hint: 'A deliberate request submitted through Lesho.' },
  intent: { label: 'Intent', icon: CalendarCheck, hint: 'A planned visit, rental request or offer claim. Not yet evidenced.' },
  verified: { label: 'Verified outcome', icon: BadgeCheck, hint: 'Evidence-backed: the reference was checked in person.' },
}
const statusTone = (s) => /New/.test(s) ? 'orange' : /redeemed|Visited|Converted|Returned/.test(s) ? 'green' : /Invalid|Disputed|Unreachable|Not interested|Declined/.test(s) ? 'red' : /Click/.test(s) ? 'grey' : 'blue'
const billLabel = (l) => l.billable === 'yes' ? `Billable · ${inr(l.kind === 'verified' ? PRICING.verified : PRICING.enquiry)}` : l.billable === 'no' ? 'Not billed' : l.billable === 'review' ? 'Billing on hold' : 'Not billed yet'
const Err = ({ children }) => <div className="errtxt" role="alert"><AlertCircle size={14} />{children}</div>

function LeadCard({ l }) {
  const app = useApp()
  const K = KIND[l.kind]
  return (
    <button className="lead" onClick={() => app.go('mlead', l.id)}>
      <span className="row" style={{ alignItems: 'flex-start' }}>
        <span className={`kind ${l.kind}`}><K.icon size={18} /></span>
        <span className="grow">
          <span className="between"><span className="b small clamp1">{l.typeLabel}</span><span className={`badge ${statusTone(l.status)}`}>{l.status}</span></span>
          <span className="small clamp1" style={{ display: 'block', marginTop: 2 }}>{l.subject}</span>
          <span className="tiny muted clamp1" style={{ display: 'block', marginTop: 4 }}>{l.consumer} · via {l.source} · {l.created}</span>
          <span className="row" style={{ marginTop: 8, gap: 6 }}><span className="badge grey">{K.label}</span><span className="badge grey">{billLabel(l)}</span>{app.unreadFor('merchant', l.id) > 0 && <span className="badge blue"><MessageSquareText size={11} />{app.unreadFor('merchant', l.id)} new</span>}</span>
        </span>
      </span>
    </button>
  )
}

export function MDashboard() {
  const app = useApp()
  const b = app.biz(ME)
  const [code, setCode] = useState('')
  const [lookupErr, setLookupErr] = useState(false)
  const real = app.leads.filter((l) => l.kind !== 'click')
  const nNew = real.filter((l) => l.status === 'New').length
  const nAck = real.filter((l) => /Acknowledged|Contacted|Qualified|confirmed/.test(l.status)).length
  const nVer = app.leads.filter((l) => l.kind === 'verified').length
  const spend = app.leads.reduce((s, l) => s + (l.billable === 'yes' ? (l.kind === 'verified' ? PRICING.verified : PRICING.enquiry) : 0), 0)
  const max = Math.max(...ANALYTICS.week.map((w) => w[1]))
  const total = ANALYTICS.week.reduce((s, w) => s + w[1], 0)
  const lookup = (e) => {
    e.preventDefault()
    const hit = app.leads.find((l) => l.id.toLowerCase() === code.trim().toLowerCase() || l.id.toLowerCase().endsWith(code.trim().toLowerCase()))
    if (hit && code.trim().length >= 5) { setLookupErr(false); setCode(''); app.go('mlead', hit.id) } else setLookupErr(true)
  }
  return (
    <div className="screen tabbed grey">
      <div className="mhead">
        <div className="between">
          <div className="row" style={{ gap: 10 }}>
            <span className="avatar" style={{ background: '#fff', color: 'var(--ink)' }}>{b.name[0]}</span>
            <div><div className="row" style={{ gap: 5 }}><span className="b">{b.name}</span><Verified biz={b} /></div><div className="tiny" style={{ opacity: .65 }}>CG Road branch · Merchant demo</div></div>
          </div>
          <button className="chip onDark" onClick={() => app.setMode('consumer')}><ArrowLeftRight size={14} />Consumer</button>
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="tiny" style={{ opacity: .65 }}>Enquiries and visit intents, last 7 days</div>
          <div className="row" style={{ alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1 }}>{total}</span><span className="badge" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>Clicks not included</span></div>
          <div className="bars" role="img" aria-label={`Leads per day: ${ANALYTICS.week.map((w) => `${w[0]} ${w[1]}`).join(', ')}`}>
            {ANALYTICS.week.map(([d, n], i) => (
              <div key={d} className={`bar ${i === ANALYTICS.week.length - 1 ? 'hi' : ''}`}><b>{n}</b><i style={{ height: `${(n / max) * 100}%` }} /><span>{d}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 16 }}>
        <div className="grid2" style={{ gap: 10 }}>
          <button className="stat blue" onClick={() => app.tab('mleads')}>
            <span className="between"><span className="ic"><Inbox size={17} /></span><ChevronRight size={16} /></span>
            <div className="num">{nNew}</div><div className="tiny muted">New leads to acknowledge</div>
          </button>
          <button className="stat" onClick={() => app.tab('mleads')}>
            <span className="ic"><CheckCheck size={17} /></span>
            <div className="num">{nAck}</div><div className="tiny muted">Acknowledged or contacted</div>
          </button>
          <button className="stat" onClick={() => app.tab('mleads')}>
            <span className="ic" style={{ background: 'var(--green-50)', color: 'var(--green)' }}><Footprints size={17} /></span>
            <div className="num">{nVer}</div><div className="tiny muted">Verified visits and redemptions</div>
          </button>
          <button className="stat" onClick={() => app.tab('manalytics')}>
            <span className="ic" style={{ background: 'var(--orange-50)', color: 'var(--orange-ink)' }}><IndianRupee size={17} /></span>
            <div className="num">{inr(spend)}</div><div className="tiny muted">Lead spend in this inbox</div>
          </button>
        </div>

        <RentalsStrip />

        <form className="card padded" style={{ marginTop: 12 }} onSubmit={lookup}>
          <div className="b small">Customer at the counter?</div>
          <div className="tiny muted">Enter their Lesho reference to find the lead. No POS integration needed.</div>
          <div className="row" style={{ marginTop: 10, gap: 8 }}>
            <input className={`input ${lookupErr ? 'err' : ''}`} value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setLookupErr(false) }} placeholder="e.g. LSH-VIS-3M9P4 or 3M9P4" aria-label="Lesho reference" />
            <button className="btn dark" type="submit" aria-label="Look up reference"><Search size={18} /></button>
          </div>
          {lookupErr && <Err>No lead matches that reference for this branch.</Err>}
        </form>

        <div className="between" style={{ marginTop: 22, marginBottom: 10 }}><h2 className="h3" style={{ fontSize: 18 }}>Recent activity</h2><button className="link" onClick={() => app.tab('mleads')}>Inbox<ChevronRight size={15} /></button></div>
        {app.leads.slice(0, 4).map((l) => <LeadCard key={l.id} l={l} />)}
        <div style={{ marginTop: 12 }}><Note icon={Info}>Charges use sample pricing for illustration. Lead pricing is still an open product decision.</Note></div>
      </div>
    </div>
  )
}

export function MLeads({ param }) {
  const app = useApp()
  const [f, setF] = useState('all')
  const [tab, setTab] = useState(param === 'messages' ? 'messages' : 'leads')
  const unread = app.unreadTotal('merchant')
  const list = app.leads.filter((l) => f === 'all' || l.kind === f)
  return (
    <div className="screen tabbed grey">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1" style={{ fontSize: 22 }}>Lead inbox</h1>
        <p className="small muted" style={{ marginTop: 2 }}>Rangoli Silks · CG Road branch</p>
        <div className="seg" role="tablist" style={{ marginTop: 12 }}>
          <button role="tab" aria-selected={tab === 'leads'} className={tab === 'leads' ? 'on' : ''} onClick={() => setTab('leads')}>Leads · {app.leads.length}</button>
          <button role="tab" aria-selected={tab === 'messages'} className={tab === 'messages' ? 'on' : ''} onClick={() => setTab('messages')}>Messages{unread > 0 && <span className="unread">{unread}</span>}</button>
        </div>
      </div>
      {tab === 'messages' ? (
        <div className="pad" style={{ marginTop: 12 }}>
          <ConversationList side="merchant" />
          <div style={{ marginTop: 12 }}><Note icon={Info}>You can message a customer only after they contact you. Replying here marks the lead as contacted.</Note></div>
        </div>
      ) : <>
      <div className="hscroll tight" style={{ marginTop: 12 }}>
        <Chip on={f === 'all'} onClick={() => setF('all')}>All {app.leads.length}</Chip>
        {Object.entries(KIND).map(([k, v]) => <Chip key={k} on={f === k} onClick={() => setF(k)}><v.icon size={14} />{{ click: 'Clicks', enquiry: 'Enquiries', intent: 'Intents', verified: 'Verified' }[k]} {app.leads.filter((l) => l.kind === k).length}</Chip>)}
      </div>
      <div className="pad" style={{ marginTop: 12 }}>
        {f !== 'all' && <div style={{ marginBottom: 10 }}><Note icon={Info}>{KIND[f].hint}</Note></div>}
        {list.length ? list.map((l) => <LeadCard key={l.id} l={l} />) : <Empty icon={Inbox} title="Nothing here" text="Leads of this type will appear as customers reach out." />}
      </div>
      </>}
    </div>
  )
}

const NEXT = ['Contacted', 'Qualified', 'Visit confirmed', 'Not interested', 'Unreachable']
export function MLeadDetail({ param }) {
  const app = useApp()
  const l = app.leads.find((x) => x.id === param)
  if (!l) return <div className="screen"><TopBar title="Lead" /></div>
  const K = KIND[l.kind], isClick = l.kind === 'click'
  const closed = /Invalid|Disputed|redeemed|Visited|Converted/.test(l.status)
  const set = (status, extra = {}) => { app.updateLead(l.id, { status, ...extra }); app.toast(`Status updated: ${status}`) }
  return (
    <div className="screen grey">
      <TopBar title="Lead detail" />
      <div className="pad" style={{ paddingBottom: 28 }}>
        <div className="card padded">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <span className={`kind ${l.kind}`}><K.icon size={18} /></span>
            <div className="grow"><div className="h3">{l.typeLabel}</div><div className="tiny muted">{K.label} · {K.hint}</div></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="kv"><span>Status</span><span><span className={`badge ${statusTone(l.status)}`}>{l.status}</span></span></div>
            <div className="kv"><span>Reference</span><span style={{ letterSpacing: '.04em' }}>{l.id}</span></div>
            <div className="kv"><span>Created</span><span>{l.created}</span></div>
            <div className="kv"><span>Source</span><span>{l.source}</span></div>
            <div className="kv"><span>About</span><span>{l.subject}</span></div>
            <div className="kv"><span>Customer</span><span>{l.consumer}{!isClick && <><br /><span className="muted" style={{ fontWeight: 500 }}>Phone shared with consent</span></>}</span></div>
            <div className="kv"><span>Billing</span><span>{billLabel(l)}</span></div>
          </div>
        </div>

        {(l.details?.length > 0 || l.note) && (
          <div className="card padded" style={{ marginTop: 12 }}>
            <div className="h3">{isClick ? 'What was recorded' : 'Customer request'}</div>
            {l.details?.length > 0 && <div className="wrap" style={{ marginTop: 10, gap: 6 }}>{l.details.map((d) => <span key={d} className="badge grey" style={{ fontSize: 12, padding: '5px 10px' }}>{d}</span>)}</div>}
            {l.note && <p className="small" style={{ marginTop: 10 }}>{isClick || /duplicate/i.test(l.status) ? l.note : `“${l.note}”`}</p>}
          </div>
        )}

        {l.rental && <RentalLeadActions l={l} />}

        {!isClick && (
          <button className="btn dark block" style={{ marginTop: 12 }} onClick={() => app.go('chat', l.id)}>
            <MessageSquareText size={18} />{app.unreadFor('merchant', l.id) > 0 ? `Read ${app.unreadFor('merchant', l.id)} new message${app.unreadFor('merchant', l.id) > 1 ? 's' : ''}` : `Message ${l.consumer.split(' ')[0]}`}
          </button>
        )}

        {isClick ? (
          <div style={{ marginTop: 12 }}><Note icon={Info}>Clicks are shown for context only. They are never billed and never counted as a contact, visit or sale.</Note></div>
        ) : l.rental ? null : closed ? (
          <div style={{ marginTop: 12 }}><Note icon={Info} tone={/Invalid|Disputed/.test(l.status) ? 'amber' : 'green'}>
            {/Invalid/.test(l.status) ? 'Flagged under the duplicate rule and excluded from billing.' : /Disputed/.test(l.status) ? 'Dispute raised. Billing for this lead is on hold while Lesho reviews it.' : 'This lead has reached an evidenced outcome.'}
          </Note></div>
        ) : (
          <div className="card padded" style={{ marginTop: 12 }}>
            <div className="h3">Update this lead</div>
            {l.status === 'New' && <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => set('Acknowledged')}><Check size={18} />Acknowledge lead</button>}
            <div className="tiny muted" style={{ margin: '14px 0 8px' }}>Reported by you</div>
            <div className="wrap">{NEXT.map((s) => <Chip key={s} on={l.status === s} onClick={() => set(s, /Contacted|Qualified/.test(s) && l.kind === 'enquiry' ? { billable: 'yes' } : {})}>{s}</Chip>)}</div>
            <div className="tiny muted" style={{ margin: '16px 0 8px' }}>Evidence-backed</div>
            <button className="btn soft block" onClick={() => set(/Offer/.test(l.typeLabel) ? 'Offer redeemed' : 'Visited', { kind: 'verified', billable: 'yes', details: [...(l.details || []), 'Reference checked at the counter'] })}>
              <BadgeCheck size={18} />Customer showed this reference in store
            </button>
            <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => set('Converted', { note: l.note, details: [...(l.details || []), 'Sale reported by merchant'] })}>Report a sale (merchant-reported)</button>
            <button className="link" style={{ marginTop: 12, color: 'var(--red)' }} onClick={() => set('Disputed', { billable: 'review' })}><Flag size={14} style={{ marginRight: 5 }} />Report or dispute this lead</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Catalogue ---------- */
const STOCK = { ok: { label: 'In stock — merchant-reported today', tone: 'ok' }, low: { label: 'Limited pieces — merchant-reported today', tone: 'warn' }, none: { label: 'Availability not maintained by this store', tone: 'muted' } }
const stockKey = (p) => p.avail.tone === 'ok' ? 'ok' : p.avail.tone === 'warn' ? 'low' : 'none'

const RENT_DAYS = Array.from({ length: 14 }, (_, i) => i)
export function ProductEditor({ product, onClose, onSaved, rentDefault }) {
  const app = useApp()
  const pr = product?.rent
  const [d, setD] = useState({
    name: product?.name || '', price: product && product.sale !== false ? String(product.price) : '', desc: product?.desc || '', img: product?.img || SAMPLE_MEDIA[0], stock: product ? stockKey(product) : 'none',
    cat: product?.cat || 'fashion', mode: pr ? (product.sale === false ? 'rent' : 'both') : rentDefault ? 'rent' : 'sale',
    unit: pr?.unit || 'day', rate: pr ? String(pr.rate) : '', deposit: pr ? String(pr.deposit || '') : '', min: pr?.min || 1,
    fulfil: pr?.fulfil || ['Pickup at store'], includes: pr ? pr.includes.join(', ') : '', blocked: pr?.blocked || [],
  })
  const [tried, setTried] = useState(false)
  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const sells = d.mode !== 'rent', rents = d.mode !== 'sale'
  const bad = { name: d.name.trim().length < 3, price: sells && !(Number(d.price) > 0), rate: rents && !(Number(d.rate) > 0), fulfil: rents && d.fulfil.length === 0 }
  const toggle = (key, v) => set({ [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] })
  const save = () => {
    setTried(true)
    if (Object.values(bad).some(Boolean)) return
    const base = product || { id: `p-${Date.now()}`, bizId: ME, rating: 0, reviews: 0, tags: ['new'], attrs: {}, variants: [] }
    const rent = rents ? {
      unit: d.unit, rate: Number(d.rate), min: d.min, deposit: Number(d.deposit) || 0, fulfil: d.fulfil, deliveryFee: pr?.deliveryFee ?? null, blocked: d.blocked,
      ...(pr?.week ? { week: pr.week } : {}), ...(pr?.ask ? { ask: pr.ask } : {}), ...(pr?.requires ? { requires: pr.requires } : {}),
      includes: d.includes.split(',').map((x) => x.trim()).filter(Boolean).length ? d.includes.split(',').map((x) => x.trim()).filter(Boolean) : ['As described by the shop'],
      terms: pr?.terms || [`Minimum ${d.min} ${d.unit}${d.min > 1 ? 's' : ''}`, 'Carry a government ID at handover'],
      record: pr?.record || { rentals: 0, lastCheck: 'today', checks: ['Details provided by the shop'] },
    } : undefined
    const p = {
      ...base, cat: d.cat, kind: sells ? 'Product' : 'Rental', sale: sells ? undefined : false, name: d.name.trim(), price: sells ? Number(d.price) : Number(d.rate), desc: d.desc.trim() || 'No description added yet.',
      img: d.img, imgs: product && product.img === d.img ? product.imgs : [d.img], avail: sells ? STOCK[d.stock] : { label: 'Rental dates are confirmed by the shop', tone: 'muted' }, fresh: 'Merchant-provided · updated just now', rent,
    }
    app.saveProduct(p); app.toast(product ? 'Catalogue item updated' : rents ? 'Rental listing added' : 'Added to catalogue'); onSaved?.(p); onClose()
  }
  return (
    <Sheet title={product ? 'Edit item' : rentDefault ? 'New rental listing' : 'Add catalogue item'} onClose={onClose} footer={<button className="btn primary block" onClick={save}>{product ? 'Save changes' : rents ? 'Publish rental listing' : 'Add to catalogue'}</button>}>
      <div className="b small" style={{ marginBottom: 8 }}>Photo (sample images)</div>
      <div className="mediapick">{SAMPLE_MEDIA.slice(0, 4).map((m) => <button key={m} aria-label="Sample photo" aria-pressed={d.img === m} className={d.img === m ? 'on' : ''} onClick={() => set({ img: m })}><Img id={m} w={160} alt="" /></button>)}</div>
      <label className="field" style={{ marginTop: 14 }}><span className="lbl">Name</span>
        <input className={`input ${tried && bad.name ? 'err' : ''}`} value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Chanderi silk saree, teal" />
        {tried && bad.name && <Err>Add a product name.</Err>}</label>

      <div className="b small" style={{ margin: '14px 0 8px' }}>Category</div>
      <div className="hscroll tight" style={{ margin: '0 -20px' }}>{CATS.map((c) => <Chip key={c.id} on={d.cat === c.id} onClick={() => set({ cat: c.id })}>{c.label}</Chip>)}</div>

      <div className="b small" style={{ margin: '14px 0 8px' }}>How customers can get it</div>
      <div className="seg" role="radiogroup" aria-label="Listing type">
        {[['sale', 'Sell'], ['rent', 'Rent out'], ['both', 'Sell and rent']].map(([k, l]) => <button key={k} role="radio" aria-checked={d.mode === k} className={d.mode === k ? 'on' : ''} onClick={() => set({ mode: k })}>{l}</button>)}
      </div>

      {sells && (
        <>
          <label className="field" style={{ marginTop: 12 }}><span className="lbl">Selling price (₹)</span>
            <input className={`input ${tried && bad.price ? 'err' : ''}`} inputMode="numeric" value={d.price} onChange={(e) => set({ price: e.target.value.replace(/[^\d]/g, '') })} placeholder="4500" />
            {tried && bad.price && <Err>Enter a price above zero.</Err>}</label>
          <div className="b small" style={{ margin: '14px 0 8px' }}>Availability shown to customers</div>
          <div className="wrap">{[['ok', 'In stock'], ['low', 'Limited'], ['none', "I don't maintain stock"]].map(([k, l]) => <Chip key={k} on={d.stock === k} onClick={() => set({ stock: k })}>{l}</Chip>)}</div>
        </>
      )}

      {rents && (
        <div className="card flat padded" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 8 }}><KeyRound size={16} /><span className="b small">Rental details</span></div>
          <div className="grid2" style={{ marginTop: 10, gap: 10 }}>
            <label className="field"><span className="lbl">Rent (₹)</span>
              <input className={`input ${tried && bad.rate ? 'err' : ''}`} inputMode="numeric" value={d.rate} onChange={(e) => set({ rate: e.target.value.replace(/[^\d]/g, '') })} placeholder="750" aria-label="Rental rate" /></label>
            <div className="field"><span className="lbl">Charged per</span>
              <div className="seg" style={{ background: '#fff' }}>{['day', 'month'].map((u) => <button key={u} className={d.unit === u ? 'on' : ''} aria-pressed={d.unit === u} onClick={() => set({ unit: u })} style={d.unit === u ? { background: 'var(--ink)', color: '#fff' } : null}>{u[0].toUpperCase() + u.slice(1)}</button>)}</div></div>
          </div>
          {tried && bad.rate && <Err>Enter a rental rate above zero.</Err>}
          <div className="grid2" style={{ marginTop: 10, gap: 10 }}>
            <label className="field"><span className="lbl">Refundable deposit (₹)</span>
              <input className="input" inputMode="numeric" value={d.deposit} onChange={(e) => set({ deposit: e.target.value.replace(/[^\d]/g, '') })} placeholder="0 for none" aria-label="Refundable deposit" /></label>
            <div className="field"><span className="lbl">Minimum {d.unit}s</span>
              <div className="stepper" style={{ gap: 10, height: 48 }}>
                <button type="button" className="icon-btn" aria-label="Decrease minimum" disabled={d.min <= 1} onClick={() => set({ min: d.min - 1 })}><Minus size={16} /></button><b>{d.min}</b>
                <button type="button" className="icon-btn" aria-label="Increase minimum" onClick={() => set({ min: Math.min(12, d.min + 1) })}><Plus size={16} /></button>
              </div></div>
          </div>
          <div className="b small" style={{ margin: '12px 0 8px' }}>Handover</div>
          <div className="wrap">{['Pickup at store', 'Home delivery'].map((f) => <Chip key={f} on={d.fulfil.includes(f)} onClick={() => toggle('fulfil', f)}>{f}</Chip>)}</div>
          {tried && bad.fulfil && <Err>Choose at least one handover option.</Err>}
          <label className="field" style={{ marginTop: 12 }}><span className="lbl">What's included (comma separated)</span>
            <input className="input" value={d.includes} onChange={(e) => set({ includes: e.target.value })} placeholder="Dry-cleaning, garment bag" /></label>
          <div className="b small" style={{ margin: '12px 0 2px' }}>Days already booked</div>
          <div className="tiny muted" style={{ marginBottom: 8 }}>Tap to block. Customers can't start a rental on these days.</div>
          <div className="avail pick">
            {RENT_DAYS.map((i) => { const dt = dayAt(i); return <button key={i} className={d.blocked.includes(i) ? 'off' : ''} aria-pressed={d.blocked.includes(i)} aria-label={`${dayLabel(i)}${d.blocked.includes(i) ? ', booked' : ''}`} onClick={() => toggle('blocked', i)}><i>{'SMTWTFS'[dt.getDay()]}</i>{dt.getDate()}</button> })}
          </div>
          <div style={{ marginTop: 10 }}><Note icon={Info}>Customers send a rental request with dates. You accept it, then collect rent and deposit yourself — Lesho doesn't take payment.</Note></div>
        </div>
      )}

      <label className="field" style={{ marginTop: 14 }}><span className="lbl">Description</span>
        <textarea className="textarea" value={d.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="Fabric, work, what's included" /></label>
      <div style={{ marginTop: 10 }}><Note icon={Info}>Customers always see when this was last updated and that it is merchant-provided.</Note></div>
    </Sheet>
  )
}

export function MCatalogue() {
  const app = useApp()
  const [edit, setEdit] = useState(null)
  const items = app.products.filter((p) => p.bizId === ME)
  return (
    <>
      <div className="screen tabbed grey">
        <div className="pad between" style={{ paddingTop: 14 }}>
          <div><h1 className="h1" style={{ fontSize: 22 }}>Catalogue</h1><p className="small muted" style={{ marginTop: 2 }}>{items.length} items · reuse them in any post</p></div>
          <button className="btn primary sm" onClick={() => setEdit('new')}><Plus size={16} />Add</button>
        </div>
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="card" style={{ padding: '2px 14px' }}>
            {items.map((p) => (
              <div key={p.id} className="listrow">
                <Img id={p.img} w={200} alt={p.name} />
                <div className="grow">
                  <div className="b clamp1" style={{ fontSize: 14 }}>{p.name}</div>
                  <div className="wrap" style={{ gap: 6, marginTop: 2, alignItems: 'center' }}><span className="price">{priceOf(p)}</span>{p.sale !== false && <span className={`badge ${p.avail.tone === 'ok' ? 'green' : p.avail.tone === 'warn' ? 'amber' : 'grey'}`}>{p.avail.tone === 'ok' ? 'In stock' : p.avail.tone === 'warn' ? 'Limited' : 'Stock not maintained'}</span>}{p.rent && <span className="badge dark"><KeyRound size={11} />{p.sale === false ? 'For rent' : `Rent ${inr(p.rent.rate)}/${p.rent.unit}`}</span>}</div>
                  <div className="tiny muted clamp1" style={{ marginTop: 3 }}>{app.posts.filter((x) => x.tags?.includes(p.id) || x.imgs?.some((i) => i.tag === p.id)).length} linked posts · {p.fresh.split(' · ')[1]}</div>
                </div>
                <button className="icon-btn" aria-label={`Edit ${p.name}`} onClick={() => setEdit(p)}><Pencil size={17} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {edit && <ProductEditor product={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </>
  )
}

/* ---------- Content composer ---------- */
const TYPES = [
  { id: 'product', label: 'Product', hint: 'Add a catalogue item', icon: Package },
  { id: 'rental', label: 'Rental listing', hint: 'Rent out by day or month', icon: KeyRound },
  { id: 'reel', label: 'Reel', hint: 'Short vertical video', icon: Film },
  { id: 'story', label: 'Story', hint: 'Visible for 24 hours', icon: Timer },
  { id: 'image', label: 'Image', hint: 'One photo, one moment', icon: ImageIcon },
  { id: 'dump', label: 'Photo dump', hint: 'A collection in one post', icon: Images },
  { id: 'offer', label: 'Offer', hint: 'Structured terms and validity', icon: Tag },
  { id: 'update', label: 'Business update', hint: 'Timings, branch, news', icon: Megaphone },
  { id: 'event', label: 'Event', hint: 'Trunk show, workshop, launch', icon: PartyPopper },
]

export function MCreate() {
  const app = useApp()
  const [type, setType] = useState(null)
  const [d, setD] = useState({ title: '', caption: '', media: [], links: [], valid: '', terms: '', date: '', venue: '', price: '', code: '' })
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(null)
  const composing = !!type && type !== 'product' && type !== 'rental' && !done
  useEffect(() => { app.setNavHidden(composing); return () => app.setNavHidden(false) }, [composing])
  const items = app.products.filter((p) => p.bizId === ME)
  const T = TYPES.find((t) => t.id === type)
  const multi = type === 'dump'
  const needsMedia = ['reel', 'story', 'image', 'dump', 'event'].includes(type)
  const needsLink = ['reel', 'story', 'image', 'dump', 'offer'].includes(type)
  const bad = {
    title: d.title.trim().length < 4,
    media: needsMedia && (multi ? d.media.length < 2 : d.media.length < 1),
    links: needsLink && d.links.length < 1,
    valid: type === 'offer' && !d.valid.trim(),
    date: type === 'event' && (!d.date.trim() || !d.venue.trim()),
  }
  const start = (id) => { setType(id); setTried(false); setDone(null); setD({ title: '', caption: '', media: [], links: [], valid: '', terms: '', date: '', venue: '', price: '', code: '' }) }
  const pickMedia = (m) => setD((x) => ({ ...x, media: multi ? (x.media.includes(m) ? x.media.filter((y) => y !== m) : [...x.media, m]) : [m] }))
  const pickLink = (id) => setD((x) => ({ ...x, links: x.links.includes(id) ? x.links.filter((y) => y !== id) : [...x.links, id] }))

  const publish = () => {
    setTried(true)
    if (Object.values(bad).some(Boolean)) { app.toast('Please complete the highlighted fields'); return }
    const id = `${type}-${Date.now()}`
    if (type === 'offer') {
      app.addOffer({ id, bizId: ME, title: d.title.trim(), short: 'New offer', valid: d.valid.trim(), products: d.links, branch: 'CG Road branch', min: 'See terms', limit: 'One per customer', ...(d.code.trim() ? { code: d.code.trim().toUpperCase(), use: ['At the store'] } : {}),
        steps: ['Claim the offer to get a Lesho reference', 'Show the reference at the billing counter', 'The store checks the code and applies the offer'], terms: (d.terms.trim() || 'Standard store terms apply').split('\n').filter(Boolean) })
      setDone({ go: ['offer', id], label: 'offer' })
    } else if (type === 'story') {
      app.addStory(ME, { img: d.media[0], text: d.title.trim(), time: 'Just now', link: { type: 'product', id: d.links[0] } })
      setDone({ go: ['story', ME], label: 'story' })
    } else if (type === 'event') {
      app.addEvent({ id, bizId: ME, x: 0.4, y: -0.5, name: d.title.trim(), type: 'Store event', date: d.date.trim(), day: (d.date.match(/\d+/) || ['—'])[0], mon: 'NOV', time: 'Timing shared by the store', venue: d.venue.trim(), area: 'nav',
        price: Number(d.price) || 0, priceLabel: Number(d.price) ? `${inr(Number(d.price))} per person` : 'Free entry', img: d.media[0], imgs: d.media, rules: ['Details provided by the organiser'], capacity: 'Capacity not published', desc: d.caption.trim() || 'Details to be announced by the store.' })
      setDone({ go: ['event', id], label: 'event' })
    } else {
      app.publish({ id, type, bizId: ME, cat: 'fashion', title: d.title.trim(), caption: d.caption.trim(), img: d.media[0] || app.biz(ME).cover, tags: multi ? [] : d.links, likes: 0,
        ...(type === 'reel' ? { dur: '0:15', cta: d.links.length > 1 ? 'Explore collection' : 'View product' } : { cta: type === 'update' ? 'View store' : 'View product' }),
        ...(multi ? { imgs: d.media.map((m, i) => ({ img: m, cap: d.caption.trim(), tag: d.links[i % d.links.length] })) } : {}) })
      setDone({ go: ['viewer', id], label: T.label.toLowerCase() })
    }
  }

  if (!type) return (
    <div className="screen tabbed">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1" style={{ fontSize: 22 }}>Create</h1>
        <p className="small muted" style={{ marginTop: 2 }}>Everything you publish links to something customers can enquire about.</p>
        <div className="typegrid" style={{ marginTop: 16 }}>
          {TYPES.map((t) => <button key={t.id} onClick={() => start(t.id)}><span className="ic"><t.icon size={19} /></span><div className="b">{t.label}</div><div className="tiny muted">{t.hint}</div></button>)}
        </div>
        <div style={{ marginTop: 14 }}><Note icon={Info}>Lesho is for products, services, offers and events. Personal updates, memes and unrelated content are outside what can be published.</Note></div>
      </div>
    </div>
  )

  if (type === 'product' || type === 'rental') return (
    <>
      <div className="screen tabbed" />
      <ProductEditor rentDefault={type === 'rental'} onClose={() => setType(null)} onSaved={() => app.tab('mcat')} />
    </>
  )

  if (done) return (
    <div className="screen tabbed">
      <div className="pad" style={{ paddingTop: 70, textAlign: 'center' }}>
        <div className="okmark"><Check size={32} strokeWidth={2.6} /></div>
        <h1 className="h1" style={{ fontSize: 22, marginTop: 18 }}>Published</h1>
        <p className="muted" style={{ marginTop: 8 }}>Your {done.label} is live in this preview session and appears on the consumer side. Nothing was uploaded anywhere.</p>
        <button className="btn primary block" style={{ marginTop: 24 }} onClick={() => { app.setMode('consumer'); app.go(...done.go) }}><Eye size={18} />View as a customer</button>
        <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => setType(null)}>Create something else</button>
      </div>
    </div>
  )

  const cover = d.media[0]
  return (
    <>
      <div className="screen barred">
        <div className="topbar">
          <button className="icon-btn plain" aria-label="Back to content types" onClick={() => setType(null)}><ArrowLeft size={20} /></button>
          <div className="title">New {T.label.toLowerCase()}</div><span className="sp" />
        </div>
        <div className="pad" style={{ paddingBottom: 20 }}>
          {type !== 'offer' && (
            <>
              <div className="b small" style={{ marginBottom: 2 }}>{type === 'reel' ? 'Video' : multi ? 'Photos' : 'Photo'}{!needsMedia && ' (optional)'}</div>
              <div className="tiny muted" style={{ marginBottom: 8 }}>{type === 'reel' ? 'Upload is simulated — pick a sample clip cover.' : multi ? 'Pick two or more sample photos. Order is kept.' : 'Upload is simulated — pick a sample photo.'}</div>
              <div className="mediapick" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {SAMPLE_MEDIA.map((m) => (
                  <button key={m} aria-label="Sample media" aria-pressed={d.media.includes(m)} className={d.media.includes(m) ? 'on' : ''} onClick={() => pickMedia(m)}>
                    <Img id={m} w={120} alt="" />{d.media.includes(m) && <span className="num">{multi ? d.media.indexOf(m) + 1 : <Check size={12} strokeWidth={3} />}</span>}
                  </button>
                ))}
              </div>
              {tried && bad.media && <Err>{multi ? 'Pick at least two photos for a photo dump.' : 'Pick a sample to continue.'}</Err>}
            </>
          )}

          <label className="field" style={{ marginTop: 16 }}><span className="lbl">{type === 'offer' ? 'Offer title' : type === 'event' ? 'Event name' : type === 'story' ? 'Story text' : 'Title'}</span>
            <input className={`input ${tried && bad.title ? 'err' : ''}`} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} maxLength={60}
              placeholder={type === 'offer' ? 'e.g. ₹300 off on blouse stitching' : type === 'event' ? 'e.g. Bridal trunk show' : type === 'update' ? 'e.g. Open till 10 pm this week' : 'e.g. New Chanderi arrivals'} />
            {tried && bad.title && <Err>Add a clear title of at least four characters.</Err>}</label>

          {type === 'offer' && (
            <label className="field" style={{ marginTop: 12 }}><span className="lbl">Validity</span>
              <input className={`input ${tried && bad.valid ? 'err' : ''}`} value={d.valid} onChange={(e) => setD({ ...d, valid: e.target.value })} placeholder="e.g. Valid till 15 Dec 2026" />
              {tried && bad.valid && <Err>Offers need a validity so customers know when they end.</Err>}</label>
          )}
          {type === 'offer' && (
            <label className="field" style={{ marginTop: 12 }}><span className="lbl">Coupon code (optional)</span>
              <input className="input" value={d.code} onChange={(e) => setD({ ...d, code: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase() })} placeholder="e.g. SILK500" aria-label="Coupon code" />
              <span className="tiny muted" style={{ display: 'block', marginTop: 6 }}>Customers see the code only after they claim. Each claim still gets its own Lesho reference so you can count redemptions.</span></label>
          )}
          {type === 'event' && (
            <>
              <div className="grid2" style={{ marginTop: 12, gap: 10 }}>
                <label className="field"><span className="lbl">Date</span><input className={`input ${tried && !d.date.trim() ? 'err' : ''}`} value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} placeholder="Sat, 28 Nov" /></label>
                <label className="field"><span className="lbl">Entry price (₹)</span><input className="input" inputMode="numeric" value={d.price} onChange={(e) => setD({ ...d, price: e.target.value.replace(/[^\d]/g, '') })} placeholder="0 for free" /></label>
              </div>
              <label className="field" style={{ marginTop: 12 }}><span className="lbl">Venue</span><input className={`input ${tried && !d.venue.trim() ? 'err' : ''}`} value={d.venue} onChange={(e) => setD({ ...d, venue: e.target.value })} placeholder="Rangoli Silks, CG Road" /></label>
              {tried && bad.date && <Err>Add both a date and a venue.</Err>}
            </>
          )}

          {type !== 'story' && <label className="field" style={{ marginTop: 12 }}><span className="lbl">{type === 'offer' ? 'Terms and exclusions (one per line)' : type === 'event' ? 'Description' : 'Caption'}</span>
            <textarea className="textarea" value={type === 'offer' ? d.terms : d.caption} onChange={(e) => setD({ ...d, [type === 'offer' ? 'terms' : 'caption']: e.target.value })} maxLength={300}
              placeholder={type === 'offer' ? 'Not valid with other offers' : 'Describe what customers are seeing'} /></label>}

          {type !== 'event' && (
            <>
              <div className="b small" style={{ marginTop: 16 }}><Link2 size={14} style={{ verticalAlign: -2, marginRight: 4 }} />{type === 'offer' ? 'Eligible catalogue items' : 'Link catalogue items'}{!needsLink && ' (optional)'}</div>
              <div className="tiny muted" style={{ marginBottom: 8 }}>{type === 'update' ? 'Updates link to your business profile by default.' : 'Linked items reuse your catalogue details — no retyping.'}</div>
              <div className="hscroll tight" style={{ margin: '0 -20px' }}>
                {items.map((p) => (
                  <button key={p.id} className={`ptag ${d.links.includes(p.id) ? 'on' : ''}`} aria-pressed={d.links.includes(p.id)} onClick={() => pickLink(p.id)}
                    style={{ border: `1.5px solid ${d.links.includes(p.id) ? 'var(--blue)' : 'var(--border)'}`, background: d.links.includes(p.id) ? 'var(--blue-50)' : '#fff', maxWidth: 210 }}>
                    <Img id={p.img} w={120} alt="" /><span style={{ minWidth: 0 }}><span className="tiny b clamp1" style={{ display: 'block' }}>{p.name}</span><span className="tiny muted">{inr(p.price)}</span></span>
                  </button>
                ))}
              </div>
              {tried && bad.links && <Err>Link at least one catalogue item so customers have a next step.</Err>}
            </>
          )}

          <div className="eyebrow" style={{ margin: '22px 0 8px' }}>Preview</div>
          {type === 'offer' ? (
            <div className="offer" style={{ width: '100%' }}>
              <span className="cut"><Tag size={18} /></span>
              <div className="eyebrow" style={{ color: 'var(--orange-ink)' }}>Fashion</div>
              <div className="h3" style={{ marginTop: 6, paddingRight: 50 }}>{d.title || 'Your offer title'}</div>
              <div className="small b" style={{ marginTop: 10 }}>Rangoli Silks</div><div className="tiny muted">{d.valid || 'Validity'} · {d.links.length} eligible item{d.links.length === 1 ? '' : 's'}</div>
            </div>
          ) : (
            <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
              <div className="reel" style={{ width: 140, flex: 'none' }}>
                {cover ? <Img id={cover} w={300} alt="" /> : <div className="img failed" style={{ display: 'grid', placeItems: 'center', background: 'var(--ink-3)' }}><T.icon size={26} color="#fff" /></div>}
                <span className="shade" />
                <span className="top"><span className="badge glass">{type === 'reel' && <Play size={10} fill="currentColor" />}{T.label}{multi && d.media.length ? ` · ${d.media.length}` : ''}</span></span>
                <span className="bot"><span className="b clamp2" style={{ fontSize: 13, lineHeight: 1.25 }}>{d.title || 'Your title'}</span><span className="tiny" style={{ opacity: .85, display: 'block', marginTop: 3 }}>Rangoli Silks</span></span>
              </div>
              <div className="grow small">
                <div className="b">How customers see it</div>
                <p className="muted" style={{ marginTop: 4 }}>{type === 'story' ? 'Shown full-screen for 5 seconds in your story, for 24 hours.' : d.caption || 'Your caption appears under the title.'}</p>
                <div className="tiny muted" style={{ marginTop: 8 }}>{type === 'event' ? `${d.date || 'Date'} · ${d.venue || 'Venue'}` : `${d.links.length} linked item${d.links.length === 1 ? '' : 's'}`}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="actionbar" style={{ bottom: 0 }}>
        <button className="btn ghost" onClick={() => setType(null)}>Discard</button>
        <button className="btn primary" onClick={publish}>Publish {T.label.toLowerCase()}</button>
      </div>
    </>
  )
}

/* ---------- Analytics ---------- */
export function MAnalytics() {
  const [open, setOpen] = useState('int')
  const A = ANALYTICS
  const charges = A.bill.reduce((s, r) => s + r.qty * r.rate, 0)
  const credits = A.credits.reduce((s, r) => s + r.qty * r.rate, 0)
  const billable = A.bill.reduce((s, r) => s + r.qty, 0) - A.credits.reduce((s, r) => s + r.qty, 0)
  const widths = { vis: 100, con: 80, int: 62, out: 46 }
  return (
    <div className="screen tabbed grey">
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="between"><h1 className="h1" style={{ fontSize: 22 }}>Insights</h1><span className="chip" style={{ minHeight: 34 }}>1–14 Nov 2026</span></div>
        <p className="small muted" style={{ marginTop: 2 }}>Four separate stages. They are never merged into one “conversion” number.</p>

        <div className="card padded funnel" style={{ marginTop: 14 }}>
          {A.groups.map((g) => (
            <div className="frow" key={g.id}>
              <button className={`fbar ${g.tone === 'muted' ? 'muted-t' : g.tone}`} style={{ width: `${widths[g.id]}%` }} aria-expanded={open === g.id} onClick={() => setOpen(g.id)}>
                <span>{g.label}</span><span>{g.top.toLocaleString('en-IN')}</span>
              </button>
            </div>
          ))}
          <div className="tiny muted">Headline figures: impressions · product views · enquiries + visit intents · verified and merchant-reported outcomes. Bar widths are illustrative.</div>
        </div>

        <div className="seg" style={{ marginTop: 14 }} role="tablist">
          {A.groups.map((g) => <button key={g.id} role="tab" aria-selected={open === g.id} className={open === g.id ? 'on' : ''} onClick={() => setOpen(g.id)}>{g.label}</button>)}
        </div>
        {A.groups.filter((g) => g.id === open).map((g) => (
          <div key={g.id} className="card" style={{ marginTop: 10, padding: '10px 16px 4px' }}>
            <div className="tiny muted">{g.hint}</div>
            {g.rows.map(([k, v]) => <div className="kv" key={k}><span>{k}</span><span style={{ fontSize: 15 }}>{v.toLocaleString('en-IN')}</span></div>)}
            {g.id === 'int' && <div style={{ margin: '4px 0 10px' }}><Note icon={Info}>Call, WhatsApp and direction figures are clicks. They don't show that a conversation or visit happened.</Note></div>}
            {g.id === 'out' && <div style={{ margin: '4px 0 10px' }}><Note icon={Info}>“Verified” means a Lesho reference was checked in person. Sales are reported by you and not verified by Lesho.</Note></div>}
          </div>
        ))}

        <h2 className="h3" style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>How your bill is calculated</h2>
        <div className="card ink padded" style={{ borderRadius: 'var(--r-xl)', padding: 18 }}>
          <div className="between">
            <div><div className="tiny" style={{ opacity: .65 }}>Net lead charges</div><div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>{inr(charges - credits)}</div></div>
            <span className="icon-btn onDark"><Receipt size={19} /></span>
          </div>
          <div className="row" style={{ marginTop: 10, gap: 8 }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>{billable} billable leads</span>
            <span className="badge" style={{ background: 'var(--orange)', color: 'var(--ink)' }}>{inr(Math.round((charges - credits) / billable))} per billable lead</span>
          </div>
        </div>
        <div className="card" style={{ marginTop: 10, padding: '4px 16px' }}>
          {A.bill.map((r) => <div className="kv" key={r.label}><span>{r.label}<br /><span className="tiny">{r.qty} × {inr(r.rate)}</span></span><span>{inr(r.qty * r.rate)}</span></div>)}
          {A.credits.map((r) => <div className="kv" key={r.label}><span>{r.label}<br /><span className="tiny">{r.qty} × {inr(r.rate)}</span></span><span style={{ color: 'var(--green)' }}>− {inr(r.qty * r.rate)}</span></div>)}
          <div className="kv"><span className="b" style={{ color: 'var(--ink)' }}>Net charges</span><span style={{ fontSize: 16 }}>{inr(charges - credits)}</span></div>
        </div>
        <div className="card padded" style={{ marginTop: 10 }}>
          <div className="b small">Never billed</div>
          <ul className="small muted" style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>{A.free.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <div style={{ marginTop: 10 }}><Note icon={Info} tone="amber">Sample rates for illustration only. Which lead milestone is billable, and at what price, is still an open product decision.</Note></div>
      </div>
    </div>
  )
}
