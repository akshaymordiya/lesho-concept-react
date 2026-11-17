import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Home as HomeIcon, Compass, Sparkles, Bookmark, User, LayoutDashboard, Inbox, PlusCircle, Package, BarChart3, Signal, Wifi, BatteryFull } from 'lucide-react'
import { Ctx } from './ui.jsx'
import { AREAS, BUSINESSES, PRODUCTS, EVENTS, OFFERS, REVIEWS, POSTS, SEED_REFS, SEED_LEADS, STORIES, SEED_CHATS, SEED_READ, AUTO_REPLY } from './data.js'
import Home from './screens/Home.jsx'
import Guide from './screens/Guide.jsx'
import Explore from './screens/Explore.jsx'
import { ProductDetail, BusinessProfile, EventDetail, OfferDetail } from './screens/Detail.jsx'
import Viewer, { StoryViewer } from './screens/Viewer.jsx'
import { LeadSheet, VisitIntent, RefConfirm, ReviewComposer, AreaSheet } from './screens/Flows.jsx'
import { Saved, Profile, Onboarding } from './screens/Me.jsx'
import { Activity, Chat, QrPopover } from './screens/Activity.jsx'
import { RentRequest } from './screens/Rental.jsx'
import { MDashboard, MLeads, MLeadDetail, MCreate, MCatalogue, MAnalytics } from './screens/Merchant.jsx'

const SCREENS = {
  home: Home, explore: Explore, guide: Guide, saved: Saved, profile: Profile,
  product: ProductDetail, biz: BusinessProfile, event: EventDetail, offer: OfferDetail, viewer: Viewer, story: StoryViewer, activity: Activity, chat: Chat, rent: RentRequest, visit: VisitIntent, ref: RefConfirm,
  mdash: MDashboard, mleads: MLeads, mlead: MLeadDetail, mcreate: MCreate, mcat: MCatalogue, manalytics: MAnalytics,
}
const C_TABS = [['home', 'Home', HomeIcon], ['explore', 'Explore', Compass], ['guide', 'Guide', Sparkles], ['saved', 'Saved', Bookmark], ['profile', 'You', User]]
const M_TABS = [['mdash', 'Home', LayoutDashboard], ['mleads', 'Leads', Inbox], ['mcreate', 'Create', PlusCircle], ['mcat', 'Catalogue', Package], ['manalytics', 'Insights', BarChart3]]
const TAB_NAMES = new Set([...C_TABS, ...M_TABS].map((t) => t[0]))
const DARK_TOP = new Set(['viewer', 'story', 'ref', 'mdash'])

let keySeq = 0
const entry = (name, param) => ({ name, param, key: `${name}-${++keySeq}` })
const rid = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')

function initialNav() {
  const m = window.location.hash.match(/^#\/(c|m)\/([a-z]+)(?:\/(.+))?$/)
  if (!m || !SCREENS[m[2]]) return null
  const mode = m[1] === 'm' ? 'merchant' : 'consumer'
  const base = mode === 'merchant' ? 'mdash' : 'home'
  const top = entry(m[2], m[3] ? decodeURIComponent(m[3]) : undefined)
  return { mode, stack: TAB_NAMES.has(m[2]) ? [top] : [entry(base), top] }
}

export default function App() {
  const init = useMemo(initialNav, [])
  const [mode, setModeRaw] = useState(init?.mode || 'consumer')
  const [stack, setStack] = useState(init?.stack || [entry('home')])
  const [onboarding, setOnboarding] = useState(!init)
  const [areaId, setAreaId] = useState('nav')
  const [saved, setSaved] = useState({ 'product:p4': true, 'biz:b5': true, 'event:ev2': true })
  const [liked, setLiked] = useState({})
  const [following, setFollowing] = useState({ b1: true, b5: true })
  const [refs, setRefs] = useState(SEED_REFS)
  const [leads, setLeads] = useState(SEED_LEADS)
  const [products, setProducts] = useState(PRODUCTS)
  const [posts, setPosts] = useState(POSTS)
  const [offers, setOffers] = useState(OFFERS)
  const [events, setEvents] = useState(EVENTS)
  const [stories, setStories] = useState(STORIES)
  const [seenStories, setSeenStories] = useState({})
  const [reviews, setReviews] = useState(REVIEWS)
  const [prefs, setPrefs] = useState({ personal: true, offers: true, approx: true, interests: ['fashion', 'food', 'events'] })
  const [sheet, setSheet] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [navHidden, setNavHidden] = useState(false)
  const [guideSeed, setGuideSeed] = useState(null)
  const [exploreSeed, setExploreSeed] = useState(null)
  const toastT = useRef()
  const [chats, setChats] = useState(SEED_CHATS)
  const [lastRead, setLastRead] = useState(SEED_READ)
  const [typing, setTyping] = useState({})
  const tsRef = useRef(1000), autoDone = useRef({}), timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const toast = useCallback((msg) => {
    setToastMsg(msg); clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const top = stack[stack.length - 1]
  useEffect(() => {
    const h = `#/${mode === 'merchant' ? 'm' : 'c'}/${top.name}${top.param ? '/' + encodeURIComponent(top.param) : ''}`
    if (window.location.hash !== h) window.history.replaceState(null, '', h)
  }, [top, mode])

  const area = AREAS.find((a) => a.id === areaId)

  const app = useMemo(() => {
    const biz = (id) => BUSINESSES.find((b) => b.id === id)
    const pushMsg = (id, msg) => setChats((c) => ({ ...c, [id]: [...(c[id] || []), { time: 'Just now', ...msg, ts: ++tsRef.current }] }))
    const unreadFor = (side, id) => (chats[id] || []).slice(lastRead[side]?.[id] || 0).filter((m) => m.from !== side && m.from !== 'system').length
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
    const distOf = (b) => area.remote ? null : Math.max(0.3, Math.hypot(b.x - area.x, b.y - area.y) * 1.25)
    return {
      mode, area, areas: AREAS, businesses: BUSINESSES, events, stories, seenStories, sheetOpen: !!sheet, products, posts, offers, reviews, refs, leads, prefs, saved, following,
      guideSeed, exploreSeed, setGuideSeed, setExploreSeed,
      biz, prod: (id) => products.find((p) => p.id === id), event: (id) => events.find((e) => e.id === id),
      offer: (id) => offers.find((o) => o.id === id), review: (id) => reviews.find((r) => r.id === id), post: (id) => posts.find((p) => p.id === id),
      offerFor: (pid) => offers.find((o) => o.products.includes(pid)),
      distOf,
      distLabel: (b) => area.remote ? AREAS.find((a) => a.id === b.area).name : `${distOf(b).toFixed(1)} km`,
      go: (name, param) => setStack((s) => [...s, entry(name, param)]),
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      tab: (name) => setStack([entry(name)]),
      replace: (name, param) => setStack((s) => [...s.slice(0, -1), entry(name, param)]),
      setMode: (m) => { setModeRaw(m); setStack([entry(m === 'merchant' ? 'mdash' : 'home')]); setSheet(null) },
      setArea: (id) => { setAreaId(id); const a = AREAS.find((x) => x.id === id); toast(`Exploring ${a.name}, ${a.city}`) },
      isSaved: (t, id) => !!saved[`${t}:${id}`],
      toggleSave: (t, id) => { const k = `${t}:${id}`; setSaved((s) => ({ ...s, [k]: !s[k] })); toast(saved[k] ? 'Removed from Saved' : 'Saved') },
      isLiked: (id) => !!liked[id], toggleLike: (id) => setLiked((l) => ({ ...l, [id]: !l[id] })),
      toggleFollow: (id) => { setFollowing((f) => ({ ...f, [id]: !f[id] })); toast(following[id] ? 'Unfollowed' : `Following ${biz(id).name}`) },
      setPrefs, toast, setNavHidden,
      share: (what) => toast(`Link to “${what}” copied (simulated)`),
      openSheet: setSheet, closeSheet: () => setSheet(null),
      openLead: (cfg) => setSheet({ type: 'lead', ...cfg }),
      openReview: (target) => setSheet({ type: 'review', target }),
      openArea: () => setSheet({ type: 'area' }),
      // Creates a consumer reference; leads for the demo merchant (b1) also land in the merchant inbox.
      // ----- In-app messaging: one thread per enquiry, shared by customer and business -----
      chats, typing, unreadFor,
      systemMessage: (id, text) => pushMsg(id, { from: 'system', text }),
      unreadTotal: (side) => (side === 'merchant' ? leads : refs).reduce((n, x) => n + unreadFor(side, x.id), 0),
      refStatus: (r) => { const l = leads.find((x) => x.id === r.id); return l && l.status !== 'New' ? l.status : r.status },
      markRead: (side, id) => { const n = (chats[id] || []).length; if ((lastRead[side]?.[id] || 0) !== n) setLastRead((x) => ({ ...x, [side]: { ...x[side], [id]: n } })) },
      sendMessage: (id, from, text) => {
        pushMsg(id, { from, text })
        if (from === 'consumer') {
          const ref = refs.find((x) => x.id === id)
          // Businesses other than the demo merchant answer with a simulated reply.
          if (ref && ref.bizId !== 'b1') {
            const replied = (chats[id] || []).some((m) => m.from === 'merchant' && m.auto)
            setTyping((t) => ({ ...t, [id]: 'merchant' }))
            later(() => {
              pushMsg(id, { from: 'merchant', auto: true, text: replied ? AUTO_REPLY.next : AUTO_REPLY[id.split('-')[1]] || AUTO_REPLY.any })
              setTyping((t) => ({ ...t, [id]: null }))
              setRefs((rs) => rs.map((x) => (x.id === id && x.status === 'Sent to business' ? { ...x, status: 'Contacted' } : x)))
            }, 1700)
          }
        } else {
          const lead = leads.find((x) => x.id === id)
          if (!lead) return
          // A reply through Lesho is evidence the business contacted the customer.
          if (!lead.rental && /^(New|Acknowledged)$/.test(lead.status)) setLeads((ls) => ls.map((x) => (x.id === id ? { ...x, status: 'Contacted', billable: x.kind === 'enquiry' ? 'yes' : x.billable } : x)))
          if (lead.consumer !== 'Aarav M.' && !autoDone.current[id]) {
            autoDone.current[id] = true
            setTyping((t) => ({ ...t, [id]: 'consumer' }))
            later(() => { pushMsg(id, { from: 'consumer', auto: true, text: AUTO_REPLY.consumer }); setTyping((t) => ({ ...t, [id]: null })) }, 1900)
          }
        }
      },
      addRef: (r) => {
        const id = `LSH-${r.prefix}-${rid()}`
        // Offer claims and visit requests carry their details on the reference; only a written note starts the conversation.
        const first = r.note || (r.kind === 'enquiry' || r.kind === 'event' ? (r.details || []).join(' · ') : '')
        setChats((c) => ({ ...c, [id]: [{ from: 'system', text: `${r.typeLabel} sent · ${id}`, time: 'Just now', ts: ++tsRef.current }, ...(first ? [{ from: 'consumer', text: first, time: 'Just now', ts: ++tsRef.current }] : [])] }))
        setLastRead((x) => ({ ...x, consumer: { ...x.consumer, [id]: first ? 2 : 1 }, merchant: { ...x.merchant, [id]: 1 } }))
        const ref = { ...r, id, created: 'Today, just now', status: r.status || 'Sent to business' }
        setRefs((x) => [ref, ...x])
        if (r.bizId === 'b1') setLeads((l) => [{ id, kind: r.kind === 'enquiry' ? 'enquiry' : 'intent', typeLabel: r.typeLabel, consumer: 'Aarav M.', subject: r.subject,
          source: r.source || 'Product page', created: 'Today, just now', status: 'New', details: r.details || [], note: r.note || '', billable: 'pending', ...(r.rental ? { rental: r.rental } : {}) }, ...l])
        return id
      },
      // Call / WhatsApp / directions are recorded as clicks only — never as contact or conversion.
      contact: (kind, b, subject) => {
        const label = { call: 'Call click', whatsapp: 'WhatsApp click', directions: 'Direction request', external: 'External booking click' }[kind]
        toast(`${label} recorded — nothing is opened in this preview`)
        if (b.id === 'b1') setLeads((l) => [{ id: `LSH-CLK-${rid()}`, kind: 'click', typeLabel: label, consumer: 'Anonymous', subject: subject || 'Business profile', source: subject ? 'Product page' : 'Business profile',
          created: 'Today, just now', status: 'Click recorded', details: [`Tapped ${kind}`], note: 'A click is not proof that a conversation happened.', billable: 'no' }, ...l])
      },
      updateLead: (id, patch) => setLeads((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      saveProduct: (p) => setProducts((ps) => (ps.some((x) => x.id === p.id) ? ps.map((x) => (x.id === p.id ? p : x)) : [p, ...ps])),
      publish: (post) => setPosts((ps) => [post, ...ps]),
      addOffer: (o) => setOffers((os) => [o, ...os]),
      addEvent: (e) => setEvents((es) => [e, ...es]),
      markStorySeen: (id) => setSeenStories((s) => (s[id] ? s : { ...s, [id]: true })),
      addStory: (bizId, item) => { setStories((ss) => (ss.some((s) => s.bizId === bizId) ? ss.map((s) => (s.bizId === bizId ? { ...s, items: [...s.items, item] } : s)) : [{ bizId, items: [item] }, ...ss])); setSeenStories((s) => ({ ...s, [bizId]: false })) },
      addReview: (r) => setReviews((rs) => [r, ...rs]),
      restartOnboarding: () => { setStack([entry('home')]); setOnboarding(true) },
    }
  }, [mode, area, products, posts, offers, events, stories, seenStories, sheet, chats, lastRead, typing, reviews, refs, leads, prefs, saved, liked, following, guideSeed, exploreSeed, toast])

  const jump = (m, ...path) => {
    setOnboarding(false); setSheet(null); setModeRaw(m)
    setStack(path.map(([n, p]) => entry(n, p)))
  }
  const tabs = mode === 'merchant' ? M_TABS : C_TABS
  const showNav = TAB_NAMES.has(top.name) && !onboarding && !(navHidden && top.name === 'mcreate')
  const newLeads = leads.filter((l) => l.status === 'New').length + app.unreadTotal('merchant')
  const darkBar = onboarding || DARK_TOP.has(top.name)

  return (
    <Ctx.Provider value={app}>
      <div className="stage">
        <aside className="side">
          <div className="logo"><span className="logo-mark"><Compass size={19} /></span>Lesho</div>
          <p className="lede">Interactive concept preview. Local discovery that is social in format and commerce-first in purpose — with traceable leads for merchants.</p>
          <div className="seg" role="tablist" aria-label="Preview mode">
            <button className={mode === 'consumer' ? 'on' : ''} onClick={() => jump('consumer', ['home'])}>Consumer</button>
            <button className={mode === 'merchant' ? 'on' : ''} onClick={() => jump('merchant', ['mdash'])}>Merchant</button>
          </div>
          <h4>Consumer screens</h4>
          <div className="jump">
            <button onClick={() => { jump('consumer', ['home']); setOnboarding(true) }}>Onboarding</button>
            <button onClick={() => jump('consumer', ['home'])}>Home</button>
            <button onClick={() => jump('consumer', ['guide'])}>AI guide</button>
            <button onClick={() => jump('consumer', ['explore'])}>Explore</button>
            <button onClick={() => { jump('consumer', ['explore']); setExploreSeed({ view: 'map', t: Date.now() }) }}>Map view</button>
            <button onClick={() => jump('consumer', ['home'], ['product', 'p1'])}>Product</button>
            <button onClick={() => jump('consumer', ['home'], ['biz', 'b1'])}>Business</button>
            <button onClick={() => jump('consumer', ['home'], ['story', 'b1'])}>Stories</button>
            <button onClick={() => jump('consumer', ['home'], ['viewer', 'r1'])}>Reels</button>
            <button onClick={() => jump('consumer', ['home'], ['viewer', 'dp1'])}>Photo dump</button>
            <button onClick={() => jump('consumer', ['home'], ['viewer', 'pv1'])}>Review post</button>
            <button onClick={() => jump('consumer', ['home'], ['offer', 'o1'])}>Offer</button>
            <button onClick={() => jump('consumer', ['home'], ['product', 'rt5'])}>Rental listing</button>
            <button onClick={() => jump('consumer', ['home'], ['product', 'p6'], ['rent', 'p6'])}>Rent request</button>
            <button onClick={() => jump('consumer', ['home'], ['biz', 'b4'])}>Restaurant</button>
            <button onClick={() => jump('consumer', ['home'], ['biz', 'b4'], ['visit', 'b4'])}>Visit intent</button>
            <button onClick={() => jump('consumer', ['home'], ['event', 'ev1'])}>Event</button>
            <button onClick={() => jump('consumer', ['home'], ['activity', 'enquiries'])}>Enquiries</button>
            <button onClick={() => jump('consumer', ['home'], ['activity', 'messages'])}>Messages</button>
            <button onClick={() => jump('consumer', ['home'], ['activity', 'messages'], ['chat', 'LSH-QUO-4T7M2'])}>Chat</button>
            <button onClick={() => jump('consumer', ['saved'])}>Saved</button>
            <button onClick={() => jump('consumer', ['profile'])}>Profile</button>
          </div>
          <h4>Merchant screens</h4>
          <div className="jump">
            <button onClick={() => jump('merchant', ['mdash'])}>Dashboard</button>
            <button onClick={() => jump('merchant', ['mleads'])}>Lead inbox</button>
            <button onClick={() => jump('merchant', ['mleads'], ['chat', 'LSH-ENQ-7Q2X8'])}>Customer chat</button>
            <button onClick={() => jump('merchant', ['mleads'], ['mlead', 'LSH-RNT-4K8QD'])}>Rental request</button>
            <button onClick={() => jump('merchant', ['mcreate'])}>Create content</button>
            <button onClick={() => jump('merchant', ['mcat'])}>Catalogue</button>
            <button onClick={() => jump('merchant', ['manalytics'])}>Analytics</button>
          </div>
          <p className="fine">All data is local mock data. No backend, live inventory, payments, maps or AI service is connected.</p>
        </aside>

        <div className="phone">
          <div className="phone-inner">
            <div className={`statusbar ${darkBar ? 'dark' : ''}`} aria-hidden="true">
              <span>9:41</span><span className="island" />
              <span className="sig"><Signal size={14} /><Wifi size={14} /><BatteryFull size={18} /></span>
            </div>
            <div className="app">
              {stack.map((s, i) => {
                const S = SCREENS[s.name]
                const active = i === stack.length - 1
                return <div key={s.key} className={`host ${active ? 'enter' : 'hidden'}`}><S param={s.param} active={active} /></div>
              })}
              {showNav && (
                <nav className="nav" aria-label="Main">
                  {tabs.map(([name, label, I]) => (
                    <button key={name} className={`${top.name === name ? 'on' : ''} ${name === 'guide' ? 'ai' : ''}`} aria-label={label} aria-current={top.name === name ? 'page' : undefined} onClick={() => app.tab(name)}>
                      <I size={21} strokeWidth={1.9} />{top.name === name && <span>{label}</span>}
                      {name === 'mleads' && newLeads > 0 && top.name !== name && <span className="dot">{newLeads}</span>}
                    </button>
                  ))}
                </nav>
              )}
              {onboarding && <Onboarding onDone={() => setOnboarding(false)} />}
              {sheet?.type === 'lead' && <LeadSheet cfg={sheet} />}
              {sheet?.type === 'review' && <ReviewComposer target={sheet.target} />}
              {sheet?.type === 'area' && <AreaSheet />}
              {sheet?.type === 'qr' && <QrPopover id={sheet.id} />}
              {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </Ctx.Provider>
  )
}
