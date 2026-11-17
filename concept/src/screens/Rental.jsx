import React, { useState } from 'react'
import { KeyRound, CalendarRange, Info, AlertCircle, Minus, Plus, Check, ShieldCheck, Truck, Store, ClipboardCheck, Wallet, ChevronRight } from 'lucide-react'
import { useApp, TopBar, Img, Chip, Note, CheckRow, Verified, ProductCard, inr } from '../ui.jsx'

/* ---------- Rental helpers. The preview's "today" is fixed at Sat, 14 Nov 2026. ---------- */
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const BASE = new Date(2026, 10, 14)
export const dayAt = (i) => { const d = new Date(BASE); d.setDate(d.getDate() + i); return d }
export const dayLabel = (i) => { const d = dayAt(i); return `${WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]}` }
export const WINDOW = 15 // days shown in the start-date picker

export const unitWord = (u, n = 1) => `${u}${n === 1 ? '' : 's'}`
export const rentLabel = (p) => `${inr(p.rent.rate)}/${p.rent.unit}`
export function estimate(rent, n) {
  if (rent.unit === 'day' && rent.week && n >= 7) return { total: Math.floor(n / 7) * rent.week + (n % 7) * rent.rate, weekly: true }
  return { total: n * rent.rate, weekly: false }
}
const endIndex = (rent, start, n) => (rent.unit === 'month' ? start + n * 30 : start + n)
const clash = (rent, start, n) => (rent.blocked || []).filter((b) => (rent.unit === 'month' ? b === start : b >= start && b < start + n))

/* Shown on the listing page of anything that can be rented. */
export function RentalBlock({ p }) {
  const r = p.rent
  return (
    <div className="card" style={{ marginTop: 16, overflow: 'visible' }}>
      <div className="row" style={{ padding: '14px 16px 0' }}>
        <span className="kind" style={{ background: 'var(--ink)', color: '#fff' }}><KeyRound size={17} /></span>
        <div className="grow"><div className="h3">Available to rent</div><div className="tiny muted">Rates and terms are set by the shop</div></div>
        <span className="badge blue">Request to rent</span>
      </div>
      <div className="rates">
        <div><b>{inr(r.rate)}</b><span>per {r.unit}</span></div>
        {r.week && <div><b>{inr(r.week)}</b><span>per week</span></div>}
        <div><b>{r.deposit ? inr(r.deposit) : 'None'}</b><span>refundable deposit</span></div>
      </div>
      <div style={{ padding: '0 16px 6px' }}>
        <div className="kv"><span>Minimum</span><span>{r.min} {unitWord(r.unit, r.min)}</span></div>
        <div className="kv"><span>Handover</span><span>{r.fulfil.join(' · ')}{r.deliveryFee ? ` (${inr(r.deliveryFee)} delivery)` : r.fulfil.includes('Home delivery') && r.deliveryFee === 0 ? ' (free)' : ''}</span></div>
        <div className="kv"><span>Included</span><span>{r.includes.join(' · ')}</span></div>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div className="b small" style={{ margin: '8px 0 8px' }}>Next two weeks</div>
        <div className="avail" aria-label="Availability for the next two weeks">
          {Array.from({ length: 14 }, (_, i) => {
            const d = dayAt(i), off = (r.blocked || []).includes(i)
            return <span key={i} className={off ? 'off' : ''} title={`${dayLabel(i)} — ${off ? 'booked' : 'free'}`}><i>{WD[d.getDay()][0]}</i>{d.getDate()}</span>
          })}
        </div>
        <div className="tiny muted" style={{ marginTop: 6 }}>Struck-through days are marked booked by the shop. Final dates are confirmed when the shop accepts your request.</div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
        <div className="row" style={{ gap: 8 }}><ClipboardCheck size={16} color="var(--green)" /><span className="b small">Rental record</span><span className="tiny muted">merchant-provided</span></div>
        <div className="small" style={{ marginTop: 6 }}>{r.record.rentals} rentals completed through Lesho references · last condition check {r.record.lastCheck}</div>
        <div className="wrap" style={{ marginTop: 8, gap: 6 }}>{r.record.checks.map((c) => <span key={c} className="badge green" style={{ padding: '4px 9px' }}><Check size={11} />{c}</span>)}</div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 14px' }}>
        <div className="b small">Rental terms</div>
        <ul className="small muted" style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>{r.terms.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  )
}

const Err = ({ children }) => <div className="errtxt" role="alert"><AlertCircle size={14} />{children}</div>

/* Request-to-rent: a lead with dates. No payment, no booking lock — the shop accepts or suggests other dates. */
export function RentRequest({ param }) {
  const app = useApp()
  const p = app.prod(param)
  const r = p?.rent
  const [start, setStart] = useState(null)
  const [n, setN] = useState(r?.min || 1)
  const [fulfil, setFulfil] = useState(r?.fulfil.length === 1 ? r.fulfil[0] : null)
  const [ask, setAsk] = useState(null)
  const [req, setReq] = useState(false)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)
  if (!r) return <div className="screen"><TopBar title="Rent" /><div className="pad small muted">This item is not listed for rent.</div></div>

  const b = app.biz(p.bizId)
  const max = r.unit === 'month' ? 12 : 30
  const hits = start == null ? [] : clash(r, start, n)
  const est = estimate(r, n)
  const delivery = fulfil === 'Home delivery' ? r.deliveryFee || 0 : 0
  const end = start == null ? null : endIndex(r, start, n)
  const endText = end == null ? '' : r.unit === 'month' ? `${dayAt(start).getDate()} ${MO[(dayAt(start).getMonth() + n) % 12]}` : dayLabel(end)
  const errs = { start: start == null, clash: hits.length > 0, fulfil: !fulfil, ask: r.ask && !ask, req: r.requires && !req, consent: !consent }
  const alts = app.products.filter((x) => x.rent && x.id !== p.id && x.cat === p.cat).slice(0, 4)
  const nextFree = (() => { for (let i = (start ?? 0) + 1; i < WINDOW; i++) if (!clash(r, i, n).length) return i; return null })()

  const submit = () => {
    setTried(true)
    if (Object.values(errs).some(Boolean)) { app.toast(errs.clash ? 'Those dates include a day the shop has marked booked' : 'Please complete the highlighted fields'); return }
    const length = `${n} ${unitWord(r.unit, n)}`
    const id = app.addRef({
      prefix: 'RNT', kind: 'rental', typeLabel: 'Rental request', bizId: b.id, subject: p.name, source: 'Rental listing', status: 'Requested — awaiting shop',
      details: [`${dayLabel(start)} → ${endText}`, length, fulfil, ...(ask ? [ask] : [])], note: note.trim(),
      rental: { productId: p.id, start: dayLabel(start), end: endText, length, fulfil, est: est.total + delivery, deposit: r.deposit },
    })
    app.replace('ref', id)
  }

  return (
    <>
      <div className="screen barred">
        <TopBar title="Request to rent" />
        <div className="pad">
          <div className="row">
            <Img id={p.img} w={200} alt={p.name} style={{ width: 56, height: 56, borderRadius: 16, flex: 'none' }} />
            <div className="grow">
              <div className="h3 clamp1">{p.name}</div>
              <div className="row tiny muted" style={{ gap: 4 }}><span className="clamp1">{b.name}</span><Verified biz={b} size={13} /><span style={{ flex: 'none' }}>· {rentLabel(p)}</span></div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Note tone="blue" icon={Info}><b>This is a rental request, not a confirmed booking.</b> {b.name} accepts or suggests other dates, and collects the rent and deposit directly. Nothing is charged on Lesho.</Note>
          </div>

          <div className="b" style={{ marginTop: 22 }}>Start date</div>
          <div className="tiny muted" style={{ marginBottom: 8 }}>Days marked booked come from the shop's calendar</div>
          <div className="hscroll tight" style={{ margin: '0 -20px' }}>
            {Array.from({ length: WINDOW }, (_, i) => {
              const d = dayAt(i), off = (r.blocked || []).includes(i)
              return (
                <button key={i} className={`chip daychip ${start === i ? 'on' : ''}`} disabled={off} aria-pressed={start === i} aria-label={`${dayLabel(i)}${off ? ', booked' : ''}`} onClick={() => setStart(i)}>
                  <span>{i === 0 ? 'Today' : WD[d.getDay()]}</span><span className="tiny" style={{ opacity: .7, fontWeight: 500 }}>{off ? 'Booked' : `${d.getDate()} ${MO[d.getMonth()]}`}</span>
                </button>
              )
            })}
          </div>
          {tried && errs.start && <Err>Choose the day you want the rental to start.</Err>}

          <div className="between" style={{ marginTop: 20 }}>
            <div>
              <div className="b">How long?</div>
              <div className="tiny muted">{start == null ? `Minimum ${r.min} ${unitWord(r.unit, r.min)}` : `Return by ${endText}`}</div>
            </div>
            <div className="stepper" role="group" aria-label={`Rental length in ${r.unit}s`}>
              <button type="button" className="icon-btn" aria-label="Shorter" disabled={n <= r.min} onClick={() => setN(n - 1)}><Minus size={18} /></button>
              <b style={{ minWidth: 74 }}>{n} <span className="small muted" style={{ fontWeight: 600 }}>{unitWord(r.unit, n)}</span></b>
              <button type="button" className="icon-btn" aria-label="Longer" disabled={n >= max} onClick={() => setN(n + 1)}><Plus size={18} /></button>
            </div>
          </div>

          {errs.clash && (
            <div className="card padded" style={{ marginTop: 14, borderColor: 'var(--amber)', background: 'var(--amber-50)' }}>
              <div className="b small" style={{ color: 'var(--amber)' }}>Not free on {hits.map(dayLabel).join(', ')}</div>
              <div className="small" style={{ marginTop: 4 }}>The shop has marked {hits.length > 1 ? 'those days' : 'that day'} as booked. Shorten the rental, pick another start date, or look at a similar listing.</div>
              {nextFree != null && <button className="btn dark sm" style={{ marginTop: 10 }} onClick={() => setStart(nextFree)}>Start {dayLabel(nextFree)} instead</button>}
            </div>
          )}
          {errs.clash && alts.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="b small" style={{ marginBottom: 8 }}>Similar rentals nearby</div>
              <div className="hscroll" style={{ margin: '0 -20px' }}>{alts.map((x) => <ProductCard key={x.id} p={x} />)}</div>
            </div>
          )}

          <div className="b" style={{ marginTop: 22, marginBottom: 8 }}>Handover</div>
          <div className="wrap">
            {r.fulfil.map((f) => <Chip key={f} on={fulfil === f} onClick={() => setFulfil(f)}>{f === 'Home delivery' ? <Truck size={15} /> : <Store size={15} />}{f}{f === 'Home delivery' ? (r.deliveryFee ? ` · ${inr(r.deliveryFee)}` : ' · free') : ''}</Chip>)}
          </div>
          {fulfil === 'Home delivery' && <div className="tiny muted" style={{ marginTop: 6 }}>Delivered within {app.area.name}. The shop confirms the exact address and time with you in chat.</div>}
          {tried && errs.fulfil && <Err>Choose how you'd like to receive it.</Err>}

          {r.ask && (
            <>
              <div className="b" style={{ marginTop: 20, marginBottom: 8 }}>{r.ask.label}</div>
              <div className="wrap">{r.ask.opts.map((o) => <Chip key={o} on={ask === o} onClick={() => setAsk(o)}>{o}</Chip>)}</div>
              {tried && errs.ask && <Err>Pick one so the shop can keep the right one ready.</Err>}
            </>
          )}

          <div className="card" style={{ marginTop: 20, padding: '4px 16px' }}>
            <div className="kv"><span>{inr(r.rate)} × {n} {unitWord(r.unit, n)}{est.weekly ? ' (weekly rate applied)' : ''}</span><span>{inr(est.total)}</span></div>
            {fulfil === 'Home delivery' && <div className="kv"><span>Delivery (shop-stated)</span><span>{delivery ? inr(delivery) : 'Free'}</span></div>}
            <div className="kv"><span className="b" style={{ color: 'var(--ink)' }}>Estimated rent, paid to the shop</span><span style={{ fontSize: 16 }}>{inr(est.total + delivery)}</span></div>
            <div className="kv"><span>Refundable deposit, held by the shop</span><span>{r.deposit ? inr(r.deposit) : 'None'}</span></div>
            <div className="kv"><span>Charged on Lesho</span><span>₹0</span></div>
          </div>
          <div className="tiny muted" style={{ marginTop: 6 }}>An estimate from the shop's listed rates. The shop confirms the final amount when it accepts.</div>

          <label className="field" style={{ marginTop: 18 }}>
            <span className="lbl">Note for the shop (optional)</span>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Needed for a function on the 20th" maxLength={240} />
          </label>
          <div style={{ marginTop: 8 }}>
            {r.requires && <><CheckRow on={req} onClick={() => setReq(!req)}>{r.requires}.</CheckRow>{tried && errs.req && <Err>Please confirm this to send the request.</Err>}</>}
            <CheckRow on={consent} onClick={() => setConsent(!consent)}>I've read the rental terms. Share my name and phone number with {b.name} for this request.</CheckRow>
            {tried && errs.consent && <Err>Your consent is needed to send the request.</Err>}
          </div>
        </div>
      </div>
      <div className="actionbar">
        <button className="btn primary" onClick={submit}><KeyRound size={18} />Send rental request</button>
      </div>
    </>
  )
}

/* Dates, amount and deposit for a rental — the deposit is its own line, separate from the request status. */
export function RentalSummary({ rental, deposit, dark }) {
  const rows = [
    ['Dates', `${rental.start} → ${rental.end}`], ['Length', rental.length], ['Handover', rental.fulfil],
    ['Estimated rent', `${inr(rental.est)} · paid to the shop`],
    ['Deposit', rental.deposit ? `${inr(rental.deposit)} · ${deposit || rental.depositStatus || 'not collected yet'}` : 'None'],
  ]
  return <div>{rows.map(([k, v]) => <div className="kv" key={k} style={dark ? { borderColor: 'var(--ink-3)' } : null}><span style={dark ? { color: 'rgba(255,255,255,.6)' } : null}>{k}</span><span>{v}</span></div>)}</div>
}

export const rentalStep = (status) => (/Returned/i.test(status) ? 5 : /Handed over/i.test(status) ? 4 : /Accepted/i.test(status) ? 3 : 2)

/* Merchant actions for a rental request: accept → hand over (reference checked) → return, with deposit tracked separately. */
export function RentalLeadActions({ l }) {
  const app = useApp()
  const set = (status, extra = {}, msg) => { app.updateLead(l.id, { status, ...extra }); app.toast(`Rental ${status.toLowerCase()}`); if (msg) app.systemMessage(l.id, msg) }
  const step = rentalStep(l.status), declined = /Declined/.test(l.status)
  return (
    <div className="card padded" style={{ marginTop: 12 }}>
      <div className="row" style={{ gap: 8 }}><CalendarRange size={17} /><span className="h3">Rental</span></div>
      <div style={{ marginTop: 6 }}><RentalSummary rental={l.rental} deposit={l.deposit} /></div>
      {declined ? (
        <div style={{ marginTop: 10 }}><Note icon={Info}>You declined this request. The customer has been told the dates are unavailable.</Note></div>
      ) : step === 2 ? (
        <>
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => set('Accepted', {}, 'Rental accepted by the shop')}><Check size={18} />Accept these dates</button>
          <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => set('Declined — dates unavailable', { billable: 'no' }, 'The shop is not available on these dates')}>Decline — dates unavailable</button>
          <div className="tiny muted" style={{ marginTop: 8 }}>Accepting does not charge the customer. You collect rent and deposit at handover.</div>
        </>
      ) : step === 3 ? (
        <>
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => set('Handed over', { kind: 'verified', billable: 'yes', deposit: l.rental.deposit ? 'Held by the shop' : undefined }, 'Handed over — reference checked')}><ShieldCheck size={18} />Reference checked — hand over</button>
          <div className="tiny muted" style={{ marginTop: 8 }}>Do this when the customer shows their Lesho reference. It records a verified handover.</div>
        </>
      ) : step === 4 ? (
        <>
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => set('Returned', { deposit: l.rental.deposit ? 'Refunded in full' : undefined }, 'Returned — rental closed')}><ClipboardCheck size={18} />Mark returned, deposit refunded</button>
          {l.rental.deposit > 0 && <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => set('Returned', { deposit: 'Deduction agreed with customer' }, 'Returned — deposit settled with a deduction')}><Wallet size={17} />Returned with a deposit deduction</button>}
        </>
      ) : (
        <div style={{ marginTop: 10 }}><Note tone="green" icon={Check}>Rental closed. The item is free for the next request.</Note></div>
      )}
    </div>
  )
}

/* Small "out on rent" strip for the merchant dashboard. */
export function RentalsStrip() {
  const app = useApp()
  const rentals = app.leads.filter((l) => l.rental)
  if (!rentals.length) return null
  const waiting = rentals.filter((l) => rentalStep(l.status) === 2 && !/Declined/.test(l.status)).length
  const out = rentals.filter((l) => rentalStep(l.status) === 4).length
  return (
    <button className="card padded tap row" style={{ marginTop: 10 }} onClick={() => app.tab('mleads')}>
      <span className="kind" style={{ background: 'var(--ink)', color: '#fff' }}><KeyRound size={17} /></span>
      <span className="grow"><span className="b small" style={{ display: 'block' }}>Rentals</span><span className="tiny muted">{waiting} awaiting your reply · {out} out with customers</span></span>
      <ChevronRight size={18} color="var(--faint)" />
    </button>
  )
}
