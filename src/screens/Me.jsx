import React, { useState } from 'react'
import { Bookmark, ChevronRight, Compass, LocateFixed, MapPin, Store, ArrowRight, Sparkles, Tag, Check, Settings, ShieldCheck, RotateCcw, Send, CalendarCheck, Ticket, ArrowLeft, Play, Images, MessageSquareText, KeyRound } from 'lucide-react'
import { useApp, SaveBtn, statusTone, isPast, Img, Empty, ProductRow, BizCard, EventCard, Chip, CatIcon, Note, Verified } from '../ui.jsx'
import { CATS, USER, cat as catOf } from '../data.js'

const TYPES = [['all', 'All'], ['product', 'Products'], ['biz', 'Businesses'], ['post', 'Posts'], ['offer', 'Offers'], ['event', 'Events']]

export function Saved() {
  const app = useApp()
  const [type, setType] = useState('all')
  const all = Object.entries(app.saved).filter(([, v]) => v).map(([k]) => k.split(':'))
  const items = all.filter(([t]) => type === 'all' || t === type)
  return (
    <div className="screen tabbed">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1" style={{ fontSize: 22 }}>Saved</h1>
        <p className="small muted" style={{ marginTop: 2 }}>{all.length} item{all.length === 1 ? '' : 's'} · only you can see these</p>
      </div>
      <div className="hscroll tight" style={{ marginTop: 12 }}>
        {TYPES.map(([id, l]) => <Chip key={id} on={type === id} onClick={() => setType(id)}>{l}{id !== 'all' ? ` ${all.filter(([t]) => t === id).length}` : ''}</Chip>)}
      </div>
      {items.length === 0 ? (
        <Empty icon={Bookmark} title={type === 'all' ? 'Nothing saved yet' : `No saved ${TYPES.find((t) => t[0] === type)[1].toLowerCase()}`}
          text="Tap the bookmark on any product, business, post, offer or event to keep it here." action="Explore nearby" onAction={() => app.tab('explore')} />
      ) : (
        <div className="pad" style={{ marginTop: 6 }}>
          {items.map(([t, id]) => {
            const row = (() => {
            if (t === 'product') { const p = app.prod(id); return p && <ProductRow p={p} /> }
            if (t === 'biz') return <BizCard b={app.biz(id)} row />
            if (t === 'event') return <EventCard e={app.event(id)} row />
            if (t === 'offer') {
              const o = app.offer(id)
              return o && (
                <button className="listrow" onClick={() => app.go('offer', id)}>
                  <span className="img" style={{ background: 'var(--orange-50)', animation: 'none', display: 'grid', placeItems: 'center', color: 'var(--orange-ink)' }}><Tag size={24} /></span>
                  <span className="grow"><span className="b clamp2" style={{ fontSize: 14, lineHeight: 1.3 }}>{o.title}</span><span className="tiny muted clamp1" style={{ display: 'block', marginTop: 3 }}>{app.biz(o.bizId).name} · {o.valid}</span></span>
                  <ChevronRight size={18} color="var(--faint)" />
                </button>
              )
            }
            const post = app.post(id)
            return post && (
              <button className="listrow" onClick={() => app.go('viewer', id)}>
                <Img id={post.img} w={200} alt={post.title}><span className="badge glass" style={{ position: 'absolute', left: 4, bottom: 4, padding: '2px 6px' }}>{post.type === 'reel' ? <Play size={10} fill="currentColor" /> : <Images size={10} />}</span></Img>
                <span className="grow"><span className="b clamp2" style={{ fontSize: 14, lineHeight: 1.3 }}>{post.title}</span><span className="tiny muted clamp1" style={{ display: 'block', marginTop: 3 }}>{app.biz(post.bizId).name} · {post.type === 'dump' ? 'Photo collection' : post.type[0].toUpperCase() + post.type.slice(1)}</span></span>
                <ChevronRight size={18} color="var(--faint)" />
              </button>
            )
            })()
            return row && <div key={t + id} className="savedrow"><div className="grow">{row}</div><SaveBtn type={t} id={id} className="plain" /></div>
          })}
        </div>
      )}
    </div>
  )
}

const REF_ICON = { visit: CalendarCheck, event: Ticket, offer: Tag, enquiry: Send, rental: KeyRound }
export function Profile() {
  const app = useApp()
  const { prefs } = app
  const set = (k) => app.setPrefs((p) => ({ ...p, [k]: !p[k] }))
  const myReviews = app.reviews.filter((r) => r.author.includes('(you)')).length
  const Row = ({ k, title, text }) => (
    <button className="between" style={{ width: '100%', padding: '12px 0', textAlign: 'left', minHeight: 56 }} role="switch" aria-checked={prefs[k]} onClick={() => set(k)}>
      <span className="grow"><span className="b small" style={{ display: 'block' }}>{title}</span><span className="tiny muted">{text}</span></span>
      <span className={`toggle ${prefs[k] ? 'on' : ''}`} />
    </button>
  )
  return (
    <div className="screen tabbed grey">
      <div className="pad" style={{ paddingTop: 16 }}>
        <div className="row">
          <span className="avatar lg round" style={{ border: 0 }}>{USER.name[0]}</span>
          <div className="grow"><h1 className="h2">{USER.full}</h1><div className="small muted">{app.area.name}, {app.area.city} · {myReviews} review{myReviews === 1 ? '' : 's'}</div></div>
          <button className="icon-btn" aria-label="Settings" onClick={() => app.toast('Account settings are not part of this preview')}><Settings size={19} /></button>
        </div>

        <button className="card ink padded tap" style={{ marginTop: 18, borderRadius: 'var(--r-xl)', padding: 18 }} onClick={() => app.setMode('merchant')}>
          <span className="between">
            <span><span className="eyebrow" style={{ color: 'var(--orange)' }}>Demo</span><span className="h3" style={{ display: 'block', fontSize: 17, marginTop: 2 }}>Switch to merchant view</span><span className="tiny" style={{ opacity: .7 }}>See Rangoli Silks' leads, content and insights</span></span>
            <span className="icon-btn onDark"><Store size={19} /></span>
          </span>
        </button>

        <div className="between" style={{ marginTop: 24, marginBottom: 8 }}><h2 className="h3" style={{ fontSize: 18 }}>Enquiries and messages</h2><button className="link" onClick={() => app.go('activity', 'enquiries')}>View all<ChevronRight size={15} /></button></div>
        <div className="grid2" style={{ gap: 10 }}>
          <button className="stat" onClick={() => app.go('activity', 'enquiries')}>
            <span className="between"><span className="ic" style={{ background: 'var(--blue-50)', color: 'var(--blue-deep)' }}><Send size={17} /></span><ChevronRight size={16} color="var(--faint)" /></span>
            <div className="num">{app.refs.filter((r) => !isPast(app.refStatus(r))).length}</div><div className="tiny muted">Active enquiries · {app.refs.length} in total</div>
          </button>
          <button className="stat" onClick={() => app.go('activity', 'messages')}>
            <span className="between"><span className="ic" style={{ background: 'var(--orange-50)', color: 'var(--orange-ink)' }}><MessageSquareText size={17} /></span><ChevronRight size={16} color="var(--faint)" /></span>
            <div className="num">{app.unreadTotal('consumer')}</div><div className="tiny muted">Unread messages from shops</div>
          </button>
        </div>
        {app.refs.length > 0 && (
          <div className="card" style={{ padding: '2px 14px', marginTop: 10 }}>
            {app.refs.slice(0, 2).map((r) => {
              const I = REF_ICON[r.kind] || Send, st = app.refStatus(r)
              return (
                <button key={r.id} className="listrow" onClick={() => app.go('ref', r.id)}>
                  <span className={`kind ${r.kind === 'enquiry' ? 'enquiry' : 'intent'}`}><I size={17} /></span>
                  <span className="grow">
                    <span className="b small clamp1" style={{ display: 'block' }}>{r.typeLabel} · {app.biz(r.bizId).name}</span>
                    <span className="tiny muted clamp1" style={{ display: 'block' }}>{r.id} · {r.created}</span>
                    <span className={`badge ${statusTone(st)}`} style={{ marginTop: 5 }}>{st}</span>
                  </span>
                  <ChevronRight size={18} color="var(--faint)" />
                </button>
              )
            })}
          </div>
        )}

        <h2 className="h3" style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>Preferences</h2>
        <div className="card" style={{ padding: '2px 16px' }}>
          <Row k="personal" title="Personalised picks" text="Use my interests and saves to order Home" />
          <div style={{ borderTop: '1px solid var(--border)' }} /><Row k="offers" title="Offer notifications" text="Tell me about offers from shops I follow" />
          <div style={{ borderTop: '1px solid var(--border)' }} /><Row k="approx" title="Approximate area only" text="Merchants see my area name, never my exact location" />
        </div>
        <div className="b small" style={{ marginTop: 16, marginBottom: 8 }}>Interests</div>
        <div className="wrap">
          {CATS.map((c) => {
            const on = prefs.interests.includes(c.id)
            return <Chip key={c.id} on={on} onClick={() => app.setPrefs((p) => ({ ...p, interests: on ? p.interests.filter((x) => x !== c.id) : [...p.interests, c.id] }))}><CatIcon id={c.id} size={14} />{c.label}</Chip>
          })}
        </div>
        <div style={{ marginTop: 16 }}><Note icon={ShieldCheck}>Your browsing, saves and preferences are never shown to merchants. They only receive what you choose to send in an enquiry.</Note></div>
        <button className="btn ghost block" style={{ marginTop: 16 }} onClick={app.restartOnboarding}><RotateCcw size={16} />Replay onboarding</button>
      </div>
    </div>
  )
}

const COLLAGE = [
  [['1619516388835-2b60acc4049e', 'Sarees'], ['1668236543090-82eba5ee5976', 'Dosa']],
  [['1554118811-1e0d58224f24', 'Cafés'], ['1470229722913-7c0e2dbbafd3', 'Events'], ['1540574163026-643ea20ade25', 'Sofas']],
  [['1522337360788-8b13dee7a37e', 'Salons'], ['1512054502232-10a0a035d672', 'Phones']],
]
export function Onboarding({ onDone }) {
  const app = useApp()
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState(null)
  const [areaId, setAreaId] = useState('nav')
  const local = app.areas.filter((a) => !a.remote)
  const finish = () => { app.setArea(choice === 'gps' ? 'nav' : areaId); onDone() }
  return (
    <div className="onb">
      <div className="collage" aria-hidden="true">
        {COLLAGE.map((col, i) => (
          <div className="colm" key={i}>{col.map(([id, l]) => <Img key={id} id={id} w={300} alt=""><span className="badge glass tagc">{l}</span></Img>)}</div>
        ))}
      </div>
      {step === 0 ? (
        <div className="body">
          <div className="row" style={{ gap: 10, marginTop: 34 }}>
            <span className="logo-mark" style={{ width: 38, height: 38 }}><Compass size={21} /></span><span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>Lesho</span>
          </div>
          <h1 className="h1" style={{ fontSize: 28, marginTop: 16 }}>The right thing,<br />from the right<br /><span style={{ color: 'var(--orange)' }}>local shop.</span></h1>
          <p style={{ opacity: .72, marginTop: 12, fontSize: 15 }}>Discover products, food, services and events near you. Ask the guide, or just browse — then enquire or visit when you're ready.</p>
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className="btn primary block" onClick={() => setStep(1)}>Get started<ArrowRight size={18} /></button>
            <button className="btn block" style={{ color: 'rgba(255,255,255,.8)', marginTop: 4 }} onClick={() => { onDone(); app.setMode('merchant') }}><Store size={17} />I run a business — merchant demo</button>
          </div>
        </div>
      ) : (
        <div className="sheetw">
          <button className="link" style={{ color: 'var(--muted)', marginBottom: 4 }} onClick={() => setStep(0)}><ArrowLeft size={15} style={{ marginRight: 4 }} />Back</button>
          <h2 className="h2" style={{ fontSize: 20 }}>Where should we start?</h2>
          <p className="small muted" style={{ marginTop: 6 }}>Lesho uses an area to show nearby businesses and distances. You can change it any time, or explore another city.</p>
          <div className="stack" style={{ marginTop: 16 }}>
            <button className={`opt ${choice === 'gps' ? 'on' : ''}`} aria-pressed={choice === 'gps'} onClick={() => setChoice('gps')}>
              <span className="ic"><LocateFixed size={17} /></span>
              <span className="grow"><span className="b small" style={{ display: 'block' }}>Use my location</span><span className="tiny muted">Asked once. Used to find your area — never shared with merchants.</span></span>
              {choice === 'gps' && <Check size={18} color="var(--blue)" />}
            </button>
            <button className={`opt ${choice === 'manual' ? 'on' : ''}`} aria-pressed={choice === 'manual'} onClick={() => setChoice('manual')}>
              <span className="ic"><MapPin size={17} /></span>
              <span className="grow"><span className="b small" style={{ display: 'block' }}>Choose an area myself</span><span className="tiny muted">No location permission needed.</span></span>
              {choice === 'manual' && <Check size={18} color="var(--blue)" />}
            </button>
          </div>
          {choice === 'manual' && <div className="wrap" style={{ marginTop: 12 }}>{local.map((a) => <Chip key={a.id} on={areaId === a.id} onClick={() => setAreaId(a.id)}>{a.name}</Chip>)}</div>}
          {choice === 'gps' && <div style={{ marginTop: 12 }}><Note tone="blue" icon={Sparkles}>Preview only: no permission prompt appears. We'll place you in Navrangpura, Ahmedabad.</Note></div>}
          <button className="btn primary block" style={{ marginTop: 18 }} disabled={!choice} onClick={finish}>{choice ? 'Start exploring' : 'Choose an option to continue'}</button>
        </div>
      )}
    </div>
  )
}
