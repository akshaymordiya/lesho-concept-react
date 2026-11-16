import React, { useState } from 'react'
import { Check, Minus, Plus, Info, AlertCircle, Copy, MapPin, LocateFixed, Camera, Star, CalendarCheck, Ticket, Tag, Send, ShieldCheck, X, MessageSquareText } from 'lucide-react'
import { useApp, Sheet, Chip, Note, CheckRow, TopBar, MockCode, Img, Verified } from '../ui.jsx'
import { cat as catOf, SAMPLE_MEDIA, USER } from '../data.js'

const Stepper = ({ value, set, min = 1, max = 20, label }) => (
  <div className="stepper" role="group" aria-label={label}>
    <button type="button" className="icon-btn" aria-label="Decrease" disabled={value <= min} onClick={() => set(value - 1)}><Minus size={18} /></button>
    <b>{value}</b>
    <button type="button" className="icon-btn" aria-label="Increase" disabled={value >= max} onClick={() => set(value + 1)}><Plus size={18} /></button>
  </div>
)
const Err = ({ children }) => <div className="errtxt" role="alert"><AlertCircle size={14} />{children}</div>

/* Category-aware enquiry: one lead foundation, different fields and labels per category. */
export function LeadSheet({ cfg }) {
  const app = useApp()
  const c = catOf(cfg.catId), b = app.biz(cfg.bizId), L = c.lead
  const tickets = cfg.mode === 'tickets', question = cfg.mode === 'question'
  const title = tickets ? 'Request tickets' : question ? 'Ask the organiser' : cfg.catId === 'food' ? 'Ask a question' : L.cta
  const typeLabel = tickets ? 'Ticket request' : question ? 'Event enquiry' : L.type
  const [opts, setOpts] = useState([])
  const [note, setNote] = useState('')
  const [qty, setQty] = useState(2)
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)
  const needsMsg = !tickets && opts.length === 0 && note.trim().length < 5
  const submit = () => {
    setTried(true)
    if (needsMsg || !consent) return
    const details = [...(tickets ? [`${qty} ticket${qty > 1 ? 's' : ''}`] : []), ...(cfg.variant ? [cfg.variant] : []), ...opts]
    const id = app.addRef({ prefix: L.prefix, kind: tickets || question ? 'event' : 'enquiry', typeLabel, bizId: b.id, eventId: cfg.eventId, subject: cfg.subject, source: cfg.source, details, note: note.trim() })
    app.closeSheet(); app.go('ref', id)
  }
  return (
    <Sheet title={title} onClose={app.closeSheet}
      footer={<button className="btn primary block" onClick={submit}><Send size={17} />Send {typeLabel.toLowerCase()}</button>}>
      <div className="card flat padded row" style={{ padding: 12 }}>
        <span className="avatar sm">{b.name[0]}</span>
        <span className="grow"><span className="row tiny muted" style={{ gap: 4 }}>To {b.name}<Verified biz={b} size={13} /></span><span className="b small clamp1" style={{ display: 'block' }}>{cfg.subject}{cfg.variant ? ` · ${cfg.variant}` : ''}</span></span>
      </div>

      {tickets && (
        <div className="between" style={{ marginTop: 16 }}>
          <div><div className="b small">Number of tickets</div><div className="tiny muted">The organiser confirms availability</div></div>
          <Stepper value={qty} set={setQty} max={10} label="Number of tickets" />
        </div>
      )}
      {!question && (
        <div style={{ marginTop: 16 }}>
          <div className="b small" style={{ marginBottom: 8 }}>{L.optLabel}</div>
          <div className="wrap">{L.opts.map((o) => <Chip key={o} on={opts.includes(o)} onClick={() => setOpts(opts.includes(o) ? opts.filter((x) => x !== o) : [...opts, o])}>{o}</Chip>)}</div>
        </div>
      )}
      <label className="field" style={{ marginTop: 16 }}>
        <span className="lbl">{tickets ? 'Note (optional)' : 'Your message'}</span>
        <textarea className={`textarea ${tried && needsMsg ? 'err' : ''}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder={question ? 'e.g. Is there parking at the venue?' : L.ph} maxLength={280} />
        {tried && needsMsg && <Err>Pick an option above or write a short message so the business can help.</Err>}
      </label>
      {L.note && !tickets && !question && <div style={{ marginTop: 10 }}><Note icon={Info}>{L.note}</Note></div>}
      {(tickets || question) && <div style={{ marginTop: 10 }}><Note icon={Info} tone="blue">This sends {tickets ? 'a ticket request' : 'an enquiry'} with a Lesho reference. It is not a confirmed ticket or a payment.</Note></div>}
      <div style={{ marginTop: 10 }}>
        <CheckRow on={consent} onClick={() => setConsent(!consent)}>Share my name and phone number ({USER.phone}) with {b.name} for this request only.</CheckRow>
        {tried && !consent && <Err>Your consent is needed so the business can reply.</Err>}
      </div>
    </Sheet>
  )
}

const DAYS = [['Today', 'Sat, 14 Nov'], ['Tomorrow', 'Sun, 15 Nov'], ['Mon', 'Mon, 16 Nov'], ['Tue', 'Tue, 17 Nov'], ['Wed', 'Wed, 18 Nov']]
const WINDOWS = { Lunch: ['12:00 – 12:30 pm', '12:30 – 1:00 pm', '1:00 – 1:30 pm', '1:30 – 2:00 pm'], Dinner: ['7:00 – 7:30 pm', '7:30 – 8:00 pm', '8:00 – 8:30 pm', '8:30 – 9:00 pm', '9:00 – 9:30 pm'] }

/* Restaurant visit intent — honest labelling: a request, never a confirmed reservation. */
export function VisitIntent({ param }) {
  const app = useApp()
  const b = app.biz(param)
  const [day, setDay] = useState(null)
  const [win, setWin] = useState(null)
  const [party, setParty] = useState(2)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)
  const offer = app.offers.find((o) => o.bizId === b.id)
  const errs = { day: !day, win: !win, consent: !consent }
  const submit = () => {
    setTried(true)
    if (errs.day || errs.win || errs.consent) { app.toast('Please complete the highlighted fields'); return }
    const id = app.addRef({ prefix: 'VIS', kind: 'visit', typeLabel: 'Visit request', bizId: b.id, subject: b.name, source: 'Restaurant profile', details: [day, win, `${party} ${party > 1 ? 'people' : 'person'}`], note: note.trim() })
    app.replace('ref', id)
  }
  return (
    <>
      <div className="screen barred">
        <TopBar title="Plan a visit" />
        <div className="pad">
          <div className="row">
            <Img id={b.cover} w={200} alt={b.name} style={{ width: 56, height: 56, borderRadius: 16, flex: 'none' }} />
            <div className="grow"><div className="row" style={{ gap: 5 }}><span className="h3 clamp1">{b.name}</span><Verified biz={b} /></div><div className="tiny muted clamp1">{b.addr}</div></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Note tone="blue" icon={Info}><b>This is a visit request, not a table reservation.</b> You're telling the restaurant when you plan to come. They manage seating and may confirm separately. You can also simply walk in.</Note>
          </div>

          <div className="b" style={{ marginTop: 22, marginBottom: 8 }}>Which day?</div>
          <div className="hscroll tight" style={{ margin: '0 -20px' }}>
            {DAYS.map(([l, full]) => (
              <button key={full} className={`chip ${day === full ? 'on' : ''}`} aria-pressed={day === full} style={{ flexDirection: 'column', gap: 0, minHeight: 56, padding: '0 16px', borderRadius: 16 }} onClick={() => setDay(full)}>
                <span>{l}</span><span className="tiny" style={{ opacity: .7, fontWeight: 500 }}>{full.split(', ')[1]}</span>
              </button>
            ))}
          </div>
          {tried && errs.day && <Err>Choose the day you plan to visit.</Err>}

          <div className="b" style={{ marginTop: 22 }}>Approximate arrival</div>
          <div className="tiny muted" style={{ marginBottom: 8 }}>A half-hour window is enough. Hours: {b.hours}</div>
          {Object.entries(WINDOWS).map(([meal, ws]) => (
            <div key={meal} style={{ marginBottom: 10 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{meal}</div>
              <div className="wrap">{ws.map((w) => <Chip key={w} on={win === w} onClick={() => setWin(w)}>{w}</Chip>)}</div>
            </div>
          ))}
          {tried && errs.win && <Err>Choose an approximate arrival window.</Err>}

          <div className="between" style={{ marginTop: 16 }}>
            <div><div className="b">Party size</div><div className="tiny muted">For groups above 12, call the restaurant</div></div>
            <Stepper value={party} set={setParty} max={12} label="Party size" />
          </div>

          <label className="field" style={{ marginTop: 20 }}>
            <span className="lbl">Note for the restaurant (optional)</span>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. One high chair, Jain food for two" maxLength={200} />
          </label>
          {offer && <div style={{ marginTop: 12 }}><Note tone="" icon={Tag}>Offer available: <b>{offer.title}</b>. Claim it separately from the Offers tab to get a redemption reference.</Note></div>}
          <div style={{ marginTop: 10 }}>
            <CheckRow on={consent} onClick={() => setConsent(!consent)}>Share my first name and phone number with {b.name} for this visit request.</CheckRow>
            {tried && errs.consent && <Err>Your consent is needed to send the request.</Err>}
          </div>
        </div>
      </div>
      <div className="actionbar">
        <button className="btn primary" onClick={submit}><CalendarCheck size={18} />Send visit request</button>
      </div>
    </>
  )
}

const REF_COPY = {
  visit: { icon: CalendarCheck, title: 'Visit request sent', sub: (b) => `This is not a confirmed reservation. ${b} manages seating and will confirm separately if they hold a table.`,
    steps: ['Visit intent created', 'Sent to the restaurant', 'Restaurant acknowledges', 'Show this reference on arrival to attribute your visit'] },
  event: { icon: Ticket, title: 'Request sent to organiser', sub: () => 'This is an enquiry, not a confirmed ticket. The organiser will reply with availability and payment steps.',
    steps: ['Event enquiry created', 'Sent to the organiser', 'Organiser acknowledges', 'Organiser confirms booking and issues tickets directly'] },
  offer: { icon: Tag, title: 'Offer claimed', sub: (b) => `Show this reference at ${b}. The offer is redeemed only when the business checks the code.`,
    steps: ['Offer claimed', 'Reference shared with the business', 'Show the reference in person', 'Business verifies and marks it redeemed'] },
  enquiry: { icon: Send, title: 'Enquiry sent', sub: (b) => `${b} has received your request and will contact you. Nothing has been booked or purchased.`,
    steps: ['Enquiry created', 'Sent to the business', 'Business acknowledges', 'Business contacts you'] },
}

export function RefConfirm({ param }) {
  const app = useApp()
  const r = app.refs.find((x) => x.id === param)
  if (!r) return <div className="screen"><TopBar title="Reference" /><div className="pad small muted">This reference isn't available in the current session.</div></div>
  const b = app.biz(r.bizId), copy = REF_COPY[r.kind] || REF_COPY.enquiry
  const lead = app.leads.find((l) => l.id === r.id)
  const acked = (lead && lead.status !== 'New') || /Contacted|Visited|confirmed/i.test(r.status)
  const doneN = /Visited|redeemed|Converted/i.test(lead?.status || r.status) ? 4 : acked ? 3 : 2
  const I = copy.icon
  return (
    <div className="screen dark">
      <div className="topbar clear" style={{ position: 'sticky', background: 'var(--ink)' }}>
        <span className="sp" />
        <button className="icon-btn onDark" aria-label="Close" onClick={app.back}><X size={20} /></button>
      </div>
      <div className="pad" style={{ paddingBottom: 28 }}>
        <div className="okmark"><I size={30} /></div>
        <h1 className="h1" style={{ textAlign: 'center', marginTop: 16, fontSize: 22 }}>{r.typeLabel === 'Appointment request' ? 'Appointment request sent' : r.typeLabel === 'Quotation request' ? 'Quotation request sent' : copy.title}</h1>
        <p className="small" style={{ textAlign: 'center', opacity: .75, marginTop: 8, padding: '0 6px' }}>{copy.sub(b.name)}</p>

        <div className="ticket" style={{ marginTop: 22 }}>
          <div className="between">
            <div className="grow"><div className="eyebrow">{r.typeLabel}</div><div className="b clamp2" style={{ marginTop: 2 }}>{r.subject}</div><div className="tiny muted row" style={{ gap: 4, marginTop: 2 }}>{b.name}<Verified biz={b} size={13} /></div></div>
          </div>
          <span className="badge blue" style={{ marginTop: 10 }}>{lead && lead.status !== 'New' ? lead.status : r.status}</span>
          {r.details?.length > 0 && <div className="wrap" style={{ marginTop: 12, gap: 6 }}>{r.details.map((d) => <span key={d} className="badge grey" style={{ fontSize: 12, padding: '5px 10px' }}>{d}</span>)}</div>}
          {r.note && <p className="small muted" style={{ marginTop: 10 }}>“{r.note}”</p>}
          <div className="tiny muted" style={{ marginTop: 10 }}>Created {r.created}</div>
          <div style={{ height: 0, position: 'absolute' }} />
          <div className="perf" />
          <MockCode seed={r.id} />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div className="refcode">{r.id}</div>
            <button className="link" onClick={() => app.toast('Reference copied (simulated)')}><Copy size={13} style={{ marginRight: 4 }} />Copy reference</button>
            <div className="tiny muted">Decorative mock code for this preview — not a scannable QR.</div>
          </div>
        </div>

        <div className="card ink padded" style={{ marginTop: 14, background: 'var(--ink-2)' }}>
          <div className="h3" style={{ marginBottom: 12 }}>What happens next</div>
          <div className="timeline">
            {copy.steps.map((s, i) => (
              <div key={s} className={`step ${i < doneN ? 'done' : i === doneN ? 'now' : ''}`} style={i >= doneN ? { color: i === doneN ? '#fff' : 'rgba(255,255,255,.5)' } : null}>
                <span className="dotc" style={i >= doneN ? { background: 'var(--ink-2)', borderColor: i === doneN ? 'var(--blue)' : 'var(--ink-3)' } : null}>{i < doneN && <Check size={12} strokeWidth={3} />}</span><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12 }}><Note tone="onDark" icon={ShieldCheck}>Only the details you agreed to share were sent. {b.name} cannot see your live location or browsing history.</Note></div>

        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn onDark grow" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => app.go('chat', r.id)}><MessageSquareText size={17} />Message</button>
          <button className="btn light grow" onClick={app.back}>Done</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <button className="link" style={{ color: 'rgba(255,255,255,.8)' }} onClick={() => app.go('activity', 'enquiries')}>All my enquiries</button>
        </div>
      </div>
    </div>
  )
}

export function ReviewComposer({ target }) {
  const app = useApp()
  const name = target.type === 'product' ? app.prod(target.id).name : target.type === 'event' ? app.event(target.id).name : app.biz(target.id).name
  const bizId = target.type === 'product' ? app.prod(target.id).bizId : target.type === 'event' ? app.event(target.id).bizId : target.id
  const hasRef = app.refs.some((r) => r.bizId === bizId && /Visited|redeemed/i.test(r.status))
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [tried, setTried] = useState(false)
  const bad = { rating: !rating, text: text.trim().length < 20 }
  const submit = () => {
    setTried(true)
    if (bad.rating || bad.text) return
    app.addReview({ id: `rv-${Date.now()}`, target, bizId, author: 'Aarav M. (you)', rating, date: '14 Nov 2026', verified: hasRef ? 'visit' : null, text: text.trim(), imgs: photos })
    app.closeSheet(); app.toast(hasRef ? 'Review posted with a verified-visit label' : 'Review posted as unverified')
  }
  return (
    <Sheet title="Write a review" onClose={app.closeSheet} footer={<button className="btn primary block" onClick={submit}>Post review</button>}>
      <div className="small muted">Reviewing</div><div className="b clamp1">{name}</div>
      <div style={{ marginTop: 14 }} className="row" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className="icon-btn plain" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
            <Star size={30} strokeWidth={1.5} color={n <= rating ? 'var(--orange)' : '#cfd4dc'} fill={n <= rating ? 'var(--orange)' : 'none'} />
          </button>
        ))}
      </div>
      {tried && bad.rating && <Err>Choose a rating.</Err>}
      <label className="field" style={{ marginTop: 12 }}>
        <span className="lbl">Your experience</span>
        <textarea className={`textarea ${tried && bad.text ? 'err' : ''}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you buy or try? What should others know?" maxLength={600} />
        {tried && bad.text && <Err>Please write at least 20 characters about the product or visit.</Err>}
      </label>
      <div className="b small" style={{ margin: '14px 0 8px' }} ><Camera size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add photos (sample images)</div>
      <div className="mediapick">
        {SAMPLE_MEDIA.slice(0, 4).map((m) => (
          <button key={m} className={photos.includes(m) ? 'on' : ''} aria-pressed={photos.includes(m)} aria-label="Sample photo" onClick={() => setPhotos(photos.includes(m) ? photos.filter((x) => x !== m) : [...photos, m])}>
            <Img id={m} w={160} alt="" />{photos.includes(m) && <span className="num"><Check size={12} strokeWidth={3} /></span>}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Note icon={Info} tone={hasRef ? 'green' : ''}>{hasRef
          ? 'You have a merchant-confirmed visit with this business, so this review will carry a “Verified visit” label.'
          : 'No verified visit or purchase is linked to you for this business, so the review will be labelled “Unverified”. Reviews must be about a product, service or visit.'}</Note>
      </div>
    </Sheet>
  )
}

export function AreaSheet() {
  const app = useApp()
  const cities = [...new Set(app.areas.map((a) => a.city))]
  return (
    <Sheet title="Choose where to explore" onClose={app.closeSheet}>
      <button className="opt" onClick={() => { app.setArea('nav'); app.closeSheet(); app.toast('Location is simulated — set to Navrangpura') }}>
        <span className="ic"><LocateFixed size={17} /></span>
        <span className="grow"><span className="b small" style={{ display: 'block' }}>Use my current location</span><span className="tiny muted">Simulated in this preview. Never shared with merchants.</span></span>
      </button>
      {cities.map((city) => (
        <div key={city}>
          <div className="eyebrow" style={{ margin: '18px 0 8px' }}>{city}</div>
          <div className="stack">
            {app.areas.filter((a) => a.city === city).map((a) => (
              <button key={a.id} className={`opt ${app.area.id === a.id ? 'on' : ''}`} onClick={() => { app.setArea(a.id); app.closeSheet() }}>
                <span className="ic"><MapPin size={17} /></span>
                <span className="grow"><span className="b small" style={{ display: 'block' }}>{a.name}</span>{a.remote && <span className="tiny muted">Launching soon — limited listings</span>}</span>
                {app.area.id === a.id && <Check size={18} color="var(--blue)" />}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14 }}><Note icon={Info}>You can explore any area remotely. Lesho doesn't assume you're physically there.</Note></div>
    </Sheet>
  )
}
