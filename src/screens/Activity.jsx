import React, { useEffect, useRef, useState } from 'react'
import { Search, X, Send, CalendarCheck, Ticket, Tag, MessageSquareText, ChevronRight, Copy, Info, ShieldCheck, QrCode, ClipboardList, ArrowLeft, ArrowUp, SearchX, Maximize2, ArrowLeftRight, KeyRound } from 'lucide-react'
import { useApp, TopBar, Chip, Empty, MockCode, Verified, Note, statusTone, isPast } from '../ui.jsx'

const REF_ICON = { visit: CalendarCheck, event: Ticket, offer: Tag, enquiry: Send, rental: KeyRound }
const has = (q, ...fields) => !q || q.split(/\s+/).every((w) => fields.some((f) => f && f.toLowerCase().includes(w)))

/* Enlarged reference code, centred over the current screen. */
export function QrPopover({ id }) {
  const app = useApp()
  const r = app.refs.find((x) => x.id === id)
  if (!r) return null
  const b = app.biz(r.bizId), status = app.refStatus(r)
  return (
    <div className="scrim centre" onClick={app.closeSheet} role="dialog" aria-modal="true" aria-label={`Reference code ${r.id}`}>
      <div className="popover" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn plain" style={{ position: 'absolute', right: 6, top: 6 }} aria-label="Close" onClick={app.closeSheet}><X size={20} /></button>
        <div className="eyebrow">{r.typeLabel}</div>
        <div className="row" style={{ gap: 5, justifyContent: 'center', marginTop: 2 }}><span className="b clamp1">{b.name}</span><Verified biz={b} /></div>
        <div className="small muted clamp1">{r.subject}</div>
        <div style={{ margin: '16px 0 12px' }}><MockCode seed={r.id} size={224} /></div>
        <div className="refcode">{r.id}</div>
        <span className={`badge ${statusTone(status)}`} style={{ marginTop: 8 }}>{status}</span>
        <p className="tiny muted" style={{ marginTop: 10 }}>Show this at the counter so the business can find your request. Decorative mock code for this preview — not a scannable QR.</p>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn ghost grow" onClick={() => app.toast('Reference copied (simulated)')}><Copy size={16} />Copy</button>
          <button className="btn primary grow" onClick={() => { app.closeSheet(); app.go('ref', r.id) }}>Details</button>
        </div>
      </div>
    </div>
  )
}

function EnquiryCard({ r }) {
  const app = useApp()
  const I = REF_ICON[r.kind] || Send, b = app.biz(r.bizId), status = app.refStatus(r), unread = app.unreadFor('consumer', r.id)
  return (
    <div className="enq">
      <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <button className="row grow" style={{ alignItems: 'flex-start', gap: 12, textAlign: 'left' }} onClick={() => app.go('ref', r.id)} aria-label={`${r.typeLabel}, ${b.name}, ${r.id}`}>
          <span className={`kind ${r.kind === 'enquiry' ? 'enquiry' : 'intent'}`}><I size={17} /></span>
          <span className="grow">
            <span className="b small clamp1" style={{ display: 'block' }}>{r.typeLabel}</span>
            <span className="small clamp1" style={{ display: 'flex', gap: 4, alignItems: 'center' }}><span className="clamp1">{b.name}</span><Verified biz={b} size={13} /></span>
            <span className="tiny muted clamp1" style={{ display: 'block', marginTop: 2 }}>{r.subject}</span>
            <span className="tiny muted clamp1" style={{ display: 'block', marginTop: 2 }}>{r.id} · {r.created}</span>
          </span>
        </button>
        <button className="qrbtn" aria-label={`Show reference code ${r.id}`} onClick={() => app.openSheet({ type: 'qr', id: r.id })}>
          <MockCode seed={r.id} size={58} /><span className="zoom"><Maximize2 size={10} /></span>
        </button>
      </div>
      <div className="between" style={{ marginTop: 10 }}>
        <span className={`badge ${statusTone(status)}`}>{status}</span>
        <button className={`btn sm ${unread ? 'primary' : 'soft'}`} onClick={() => app.go('chat', r.id)}><MessageSquareText size={15} />{unread ? `${unread} new message${unread > 1 ? 's' : ''}` : 'Message'}</button>
      </div>
    </div>
  )
}

/* One row per conversation — used by the customer inbox and the merchant inbox. */
export function ConversationList({ side, q = '' }) {
  const app = useApp()
  const rows = (side === 'merchant' ? app.leads.filter((l) => l.kind !== 'click') : app.refs)
    .filter((x) => (app.chats[x.id] || []).some((m) => m.from !== 'system'))
    .map((x) => {
      const msgs = app.chats[x.id], last = msgs[msgs.length - 1]
      const name = side === 'merchant' ? x.consumer : app.biz(x.bizId).name
      return { x, last, name, unread: app.unreadFor(side, x.id), biz: side === 'merchant' ? null : app.biz(x.bizId) }
    })
    .filter(({ x, name, last }) => has(q, name, x.subject, x.typeLabel, x.id, last.text))
    .sort((a, b) => b.last.ts - a.last.ts)
  if (!rows.length) return q
    ? <Empty icon={SearchX} title="No conversations match" text="Try a business name, a product or a reference number." />
    : <Empty icon={MessageSquareText} title="No messages yet" text={side === 'merchant' ? 'Conversations start when a customer sends an enquiry.' : 'After you send an enquiry you can message the business here.'} />
  return (
    <div className="card" style={{ padding: '2px 14px' }}>
      {rows.map(({ x, last, name, unread, biz }) => (
        <button key={x.id} className="listrow" onClick={() => app.go('chat', x.id)} aria-label={`Conversation with ${name}${unread ? `, ${unread} unread` : ''}`}>
          <span className={`avatar ${side === 'merchant' ? 'round' : ''}`}>{name[0]}</span>
          <span className="grow">
            <span className="between" style={{ gap: 8 }}>
              <span className="row" style={{ gap: 4, minWidth: 0 }}><span className="b small clamp1">{name}</span>{biz && <Verified biz={biz} size={13} />}</span>
              <span className="tiny muted" style={{ flex: 'none' }}>{last.time.split(', ')[0]}</span>
            </span>
            <span className="tiny muted clamp1" style={{ display: 'block' }}>{x.typeLabel} · {x.id}</span>
            <span className="between" style={{ gap: 8, marginTop: 2 }}>
              <span className={`small clamp1 ${unread ? 'b' : 'muted'}`}>{last.from === side ? 'You: ' : ''}{last.text}</span>
              {unread > 0 && <span className="unread">{unread}</span>}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

export function Activity({ param }) {
  const app = useApp()
  const [tab, setTab] = useState(param === 'messages' ? 'messages' : 'enquiries')
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')
  const ql = q.trim().toLowerCase()
  const all = app.refs.map((r) => ({ r, status: app.refStatus(r) }))
  const match = all.filter(({ r, status }) => has(ql, r.id, r.typeLabel, r.subject, app.biz(r.bizId).name, status, (r.details || []).join(' ')))
  const active = match.filter((x) => !isPast(x.status)), past = match.filter((x) => isPast(x.status))
  const rentals = match.filter((x) => x.r.kind === 'rental')
  const shown = f === 'active' ? active : f === 'past' ? past : f === 'rent' ? rentals : match
  const unread = app.unreadTotal('consumer')
  return (
    <div className="screen grey">
      <TopBar title="Enquiries and messages" />
      <div className="pad" style={{ paddingBottom: 28 }}>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={tab === 'enquiries'} className={tab === 'enquiries' ? 'on' : ''} onClick={() => setTab('enquiries')}>Enquiries · {all.length}</button>
          <button role="tab" aria-selected={tab === 'messages'} className={tab === 'messages' ? 'on' : ''} onClick={() => setTab('messages')}>Messages{unread > 0 && <span className="unread">{unread}</span>}</button>
        </div>
        <div className="search" style={{ marginTop: 12, background: '#fff', borderColor: 'var(--border)' }} role="search">
          <Search size={18} color="var(--muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'enquiries' ? 'Search by shop, item or reference' : 'Search conversations'} aria-label={tab === 'enquiries' ? 'Search enquiries' : 'Search conversations'} />
          {q && <button className="icon-btn plain" style={{ width: 36, height: 36, marginRight: -8 }} aria-label="Clear search" onClick={() => setQ('')}><X size={16} /></button>}
        </div>

        {tab === 'enquiries' ? (
          <>
            <div className="hscroll tight" style={{ margin: '12px -20px 0' }}>
              <Chip on={f === 'all'} onClick={() => setF('all')}>All {match.length}</Chip>
              <Chip on={f === 'active'} onClick={() => setF('active')}>Active {active.length}</Chip>
              <Chip on={f === 'past'} onClick={() => setF('past')}>Past {past.length}</Chip>
              <Chip on={f === 'rent'} onClick={() => setF('rent')}><KeyRound size={14} />Rentals {rentals.length}</Chip>
            </div>
            {shown.length === 0 ? (
              all.length === 0
                ? <Empty icon={Send} title="No enquiries yet" text="When you enquire, plan a visit or claim an offer, the reference appears here." action="Explore nearby" onAction={() => app.tab('explore')} />
                : <Empty icon={SearchX} title="Nothing matches" text={ql ? `No enquiry matches “${q.trim()}”. Try a shop name or the last characters of a reference.` : 'No enquiries in this group.'} action={ql ? 'Clear search' : undefined} onAction={() => setQ('')} />
            ) : f === 'all' ? (
              <>
                {active.length > 0 && <><div className="eyebrow" style={{ margin: '18px 0 8px' }}>Active</div>{active.map(({ r }) => <EnquiryCard key={r.id} r={r} />)}</>}
                {past.length > 0 && <><div className="eyebrow" style={{ margin: '18px 0 8px' }}>Past</div>{past.map(({ r }) => <EnquiryCard key={r.id} r={r} />)}</>}
              </>
            ) : <div style={{ marginTop: 14 }}>{shown.map(({ r }) => <EnquiryCard key={r.id} r={r} />)}</div>}
            {shown.length > 0 && <div style={{ marginTop: 14 }}><Note icon={Info}>Tap a code to enlarge it for the counter. An enquiry or visit request is not a confirmed booking or purchase.</Note></div>}
          </>
        ) : (
          <div style={{ marginTop: 14 }}>
            <ConversationList side="consumer" q={ql} />
            <div style={{ marginTop: 14 }}><Note icon={ShieldCheck}>Conversations stay inside Lesho and are tied to an enquiry. Businesses can't message you unless you've contacted them first.</Note></div>
          </div>
        )}
      </div>
    </div>
  )
}

const QUICK = {
  consumer: ['Is this still available?', 'What time can I visit?', 'Could you confirm the final price?'],
  merchant: ['Yes, it is available.', 'We are open 10:30 am – 9:00 pm.', 'Please bring your Lesho reference when you visit.'],
}

/* Chat for one enquiry. The same thread is shown to the customer and to the business. */
export function Chat({ param, active }) {
  const app = useApp()
  const side = app.mode === 'merchant' ? 'merchant' : 'consumer'
  const ref = app.refs.find((x) => x.id === param), lead = app.leads.find((x) => x.id === param)
  const item = side === 'merchant' ? lead : ref
  const [text, setText] = useState('')
  const scroller = useRef()
  const msgs = app.chats[param] || []
  const otherTyping = app.typing[param] && app.typing[param] !== side
  useEffect(() => { if (active && item) app.markRead(side, param) }, [active, msgs.length])
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }) }, [msgs.length, otherTyping])
  if (!item) return <div className="screen"><TopBar title="Conversation" /><Empty icon={MessageSquareText} title="Conversation not found" text="This enquiry isn't available in the current session." /></div>

  const b = app.biz(side === 'merchant' ? 'b1' : ref.bizId)
  const name = side === 'merchant' ? lead.consumer : b.name
  const status = side === 'merchant' ? lead.status : app.refStatus(ref)
  const demoSwap = side === 'consumer' ? ref.bizId === 'b1' : lead.consumer === 'Aarav M.'
  const send = (t) => { const v = (t ?? text).trim(); if (!v) return; app.sendMessage(param, side, v); setText('') }

  return (
    <>
      <div className="screen grey" ref={scroller} style={{ paddingBottom: 138 }}>
        <div className="topbar">
          <button className="icon-btn plain" aria-label="Back" onClick={app.back}><ArrowLeft size={20} /></button>
          <button className="row grow" style={{ gap: 10, minWidth: 0, textAlign: 'left', minHeight: 44 }} disabled={side === 'merchant'} onClick={() => app.go('biz', b.id)}>
            <span className={`avatar ${side === 'merchant' ? 'round' : ''}`} style={{ width: 38, height: 38 }}>{name[0]}</span>
            <span style={{ minWidth: 0 }}>
              <span className="row" style={{ gap: 4 }}><span className="b clamp1">{name}</span>{side === 'consumer' && <Verified biz={b} size={14} />}</span>
              <span className="tiny muted clamp1" style={{ display: 'block' }}>{side === 'merchant' ? 'Customer · phone shared with consent' : 'Usually replies within a few hours'}</span>
            </span>
          </button>
          {side === 'consumer'
            ? <button className="icon-btn" aria-label="Show reference code" onClick={() => app.openSheet({ type: 'qr', id: param })}><QrCode size={19} /></button>
            : <button className="icon-btn" aria-label="Open lead detail" onClick={() => app.go('mlead', param)}><ClipboardList size={19} /></button>}
        </div>

        <div className="pad">
          <button className="card padded tap row" style={{ padding: 12 }} onClick={() => app.go(side === 'merchant' ? 'mlead' : 'ref', param)}>
            <span className="grow">
              <span className="eyebrow" style={{ display: 'block' }}>{item.typeLabel} · {item.id}</span>
              <span className="b small clamp1" style={{ display: 'block', marginTop: 2 }}>{item.subject}</span>
              <span className={`badge ${statusTone(status)}`} style={{ marginTop: 6 }}>{status}</span>
            </span>
            <ChevronRight size={18} color="var(--faint)" />
          </button>
        </div>

        <div className="chat" style={{ paddingTop: 14 }}>
          {msgs.map((m, i) => {
            if (m.from === 'system') return <div key={m.ts} className="sysmsg">{m.text}<span> · {m.time}</span></div>
            const mine = m.from === side, next = msgs[i + 1]
            const showTime = !next || next.from !== m.from || next.time !== m.time
            return (
              <React.Fragment key={m.ts}>
                <div className={`bubble ${mine ? 'user' : 'ai white'}`}>{m.text}</div>
                {showTime && <div className={`msgtime ${mine ? 'mine' : ''}`}>{mine ? 'You' : name.split(' ')[0]} · {m.time}</div>}
              </React.Fragment>
            )
          })}
          {otherTyping && <div className="bubble ai white"><span className="typing" aria-label={`${name} is typing`}><i /><i /><i /></span></div>}
          {demoSwap && !otherTyping && (
            <button className="demoswap" onClick={() => { const m = side === 'consumer' ? 'merchant' : 'consumer'; app.setMode(m); app.go(m === 'merchant' ? 'mleads' : 'activity', 'messages'); app.go('chat', param) }}>
              <ArrowLeftRight size={14} />Demo: reply as {side === 'consumer' ? 'Rangoli Silks' : 'the customer'}
            </button>
          )}
        </div>
      </div>

      <div className="chatbar">
        <div className="hscroll tight" style={{ padding: '0 16px 8px', scrollPaddingInline: 16 }}>
          {QUICK[side].map((t) => <button key={t} className="chip" style={{ minHeight: 34 }} onClick={() => setText(t)}>{t}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={side === 'merchant' ? `Reply to ${name.split(' ')[0]}` : `Message ${b.name}`} aria-label="Type a message" maxLength={500} />
          <button className="icon-btn on" type="submit" aria-label="Send message" disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : .5 }}><ArrowUp size={19} /></button>
        </form>
      </div>
    </>
  )
}
