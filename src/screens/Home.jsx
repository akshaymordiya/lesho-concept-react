import React, { useState } from 'react'
import { MapPin, ChevronDown, Search, Sparkles, ArrowUp, Bell, Images, MapPinOff, Info } from 'lucide-react'
import { useApp, Img, SectionHead, ProductCard, BizCard, EventCard, OfferCard, PostTile, ReviewCard, CatIcon, Verified, Empty, Note } from '../ui.jsx'
import { CATS, USER } from '../data.js'

export const PROMPTS = ['Wedding saree around ₹5,000', 'Good food near me', 'Compare phones under ₹25,000', 'Events this weekend', 'Find a salon', 'Explore local stores']

export default function Home() {
  const app = useApp()
  const [q, setQ] = useState('')
  const { area } = app
  const near = [...app.businesses].sort((a, b) => (app.distOf(a) ?? 0) - (app.distOf(b) ?? 0))
  const byId = (ids) => ids.map(app.prod).filter(Boolean)
  const picked = byId(app.prefs.personal ? ['p1', 'd3', 's1', 'e1', 'h1', 'f1'] : ['d1', 'p3', 'v1', 'e2', 'a1', 'h3'])
  const popular = byId(['d1', 'p5', 'v1', 'h2', 's3', 'e3'])
  const reels = app.posts.filter((p) => p.type === 'reel')
  const dump = app.posts.find((p) => p.type === 'dump')
  const stories = app.posts.filter((p) => ['dump', 'image', 'update', 'review'].includes(p.type) && p.id !== dump?.id).slice(0, 6)
  const followed = app.posts.filter((p) => app.following[p.bizId]).slice(0, 5)
  const featuredReview = app.reviews.find((r) => r.id === 'rv3')

  const goSearch = (e) => { e.preventDefault(); app.setExploreSeed({ q, t: Date.now() }); app.tab('explore') }
  const ask = (text) => { app.setGuideSeed({ text, t: Date.now() }); app.tab('guide') }

  return (
    <div className="screen tabbed">
      <header className="pad" style={{ paddingTop: 14 }}>
        <div className="between">
          <button className="row" style={{ gap: 6, minHeight: 44 }} onClick={app.openArea} aria-label="Change area">
            <span className="icon-btn" style={{ width: 38, height: 38, background: 'var(--blue-50)', border: 0, color: 'var(--blue-deep)' }}><MapPin size={17} /></span>
            <span>
              <span className="tiny muted" style={{ display: 'block', lineHeight: 1.2 }}>Exploring</span>
              <span className="b row" style={{ gap: 3, fontSize: 14.5 }}>{area.name}, {area.city}<ChevronDown size={15} /></span>
            </span>
          </button>
          <button className="icon-btn" aria-label="Notifications" onClick={() => app.toast('No new notifications')}><Bell size={19} strokeWidth={1.8} /></button>
        </div>
        <h1 className="h1" style={{ marginTop: 14, fontSize: 21 }}>Namaste, {USER.name}.<br /><span style={{ color: 'var(--faint)' }}>What's good nearby?</span></h1>
        <form className="search" style={{ marginTop: 16 }} onSubmit={goSearch} role="search">
          <Search size={18} color="var(--muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “silk saree” or “dosa near me”" aria-label="Search products, places and events" enterKeyHint="search" />
        </form>
      </header>

      <div className="section" style={{ marginTop: 20 }}>
        <div className="ai-card">
          <div className="row" style={{ padding: '0 20px' }}>
            <span className="spark"><Sparkles size={20} /></span>
            <div>
              <div className="h3" style={{ fontSize: 15.5 }}>What are you looking for today?</div>
              <div className="tiny" style={{ opacity: .7 }}>Your local guide compares across stores</div>
            </div>
          </div>
          <button className="ask" onClick={() => app.tab('guide')}>
            Describe what you need…<span className="go"><ArrowUp size={18} /></span>
          </button>
          <div className="hscroll tight">
            {PROMPTS.map((p) => <button key={p} className="chip onDark" onClick={() => ask(p)}>{p}</button>)}
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="catgrid">
          {CATS.map((c) => (
            <button key={c.id} className="cat" onClick={() => { app.setExploreSeed({ cat: c.id, t: Date.now() }); app.tab('explore') }}>
              <span className="ic"><CatIcon id={c.id} size={22} /></span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {area.remote ? (
        <div className="section">
          <Empty icon={MapPinOff} title={`We're still onboarding ${area.city}`}
            text={`There isn't enough local supply in ${area.name} yet to build honest sections, so we're not showing made-up trends.`}
            action="Explore Ahmedabad instead" onAction={() => app.setArea('nav')} />
        </div>
      ) : (
        <>
          <section className="section">
            <SectionHead title="Picked for you" sub={app.prefs.personal ? 'Based on your interests — change in You' : 'Personalisation is off — showing a general mix'} />
            <div className="hscroll">{picked.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </section>

          <section className="section">
            <SectionHead title="Near you" sub={`Distances from ${area.name} centre`} action="Map" onAction={() => { app.setExploreSeed({ view: 'map', type: 'biz', t: Date.now() }); app.tab('explore') }} />
            <div className="hscroll">{near.slice(0, 6).map((b) => <BizCard key={b.id} b={b} />)}</div>
          </section>

          <section className="section">
            <SectionHead title="Stories" sub="Today's updates from local shops" />
            <div className="hscroll stories">
              {app.stories.map((s) => {
                const b = app.biz(s.bizId), seen = !!app.seenStories[s.bizId]
                return (
                  <button key={s.bizId} className={`reel story ${seen ? 'seen' : ''}`} style={{ width: 118 }} onClick={() => app.go('story', s.bizId)} aria-label={`${b.name} story, ${s.items.length} update${s.items.length > 1 ? 's' : ''}${seen ? ', seen' : ''}`}>
                    <Img id={s.items[0].img} w={300} alt="" />
                    <span className="shade" />
                    <span className="top"><span className="avatar sm" style={{ background: '#fff', color: 'var(--ink)' }}>{b.name[0]}</span><span className="badge glass">{s.items.length}</span></span>
                    <span className="bot">
                      <span className="b clamp2" style={{ fontSize: 13, lineHeight: 1.25, display: '-webkit-box' }}>{b.name}</span>
                      <span className="tiny clamp1" style={{ opacity: .85, marginTop: 3, display: 'block' }}>{seen ? 'Seen' : s.items[s.items.length - 1].time}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="section">
            <SectionHead title="Product reels" sub="Short videos from local businesses" />
            <div className="hscroll">{reels.map((p) => <PostTile key={p.id} post={p} />)}</div>
          </section>

          {dump && (
            <section className="section">
              <SectionHead title="New arrivals" sub="Collections and photo stories" />
              <button className="bigpost" onClick={() => app.go('viewer', dump.id)}>
                <div className="mosaic">
                  {dump.imgs.slice(0, 3).map((im, i) => (
                    <Img key={i} id={im.img} w={500} alt={im.cap}>
                      {i === 2 && dump.imgs.length > 3 && <span className="more">+{dump.imgs.length - 3}</span>}
                    </Img>
                  ))}
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge blue"><Images size={11} />{dump.imgs.length} photos</span>
                    <span className="tiny muted row" style={{ gap: 4 }}>{app.biz(dump.bizId).name}<Verified biz={app.biz(dump.bizId)} size={13} /></span>
                  </div>
                  <div className="h3" style={{ marginTop: 8 }}>{dump.title}</div>
                  <div className="small muted clamp2" style={{ marginTop: 2 }}>{dump.caption}</div>
                </div>
              </button>
              <div className="hscroll" style={{ marginTop: 12 }}>
                {stories.map((p) => <PostTile key={p.id} post={p} style={{ width: 132 }} />)}
              </div>
            </section>
          )}

          <section className="section">
            <SectionHead title="Popular around you" sub="Most viewed this week in this preview's mock data" action="See all" onAction={() => app.tab('explore')} />
            <div className="pad grid2">{popular.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} grid />)}</div>
          </section>

          <section className="section">
            <SectionHead title="Offers worth a look" sub="Structured offers with clear terms" />
            <div className="hscroll">{app.offers.map((o) => <OfferCard key={o.id} o={o} />)}</div>
          </section>

          <section className="section">
            <SectionHead title="Events this week" action="All events" onAction={() => { app.setExploreSeed({ type: 'event', t: Date.now() }); app.tab('explore') }} />
            <div className="hscroll">{app.events.map((e) => <EventCard key={e.id} e={e} />)}</div>
          </section>

          {featuredReview && (
            <section className="section">
              <SectionHead title="What locals are saying" sub="Reviews tied to a product, visit or event" />
              <div className="pad"><div className="card padded" style={{ paddingTop: 0, paddingBottom: 0 }}><ReviewCard r={featuredReview} showTarget /></div></div>
            </section>
          )}

          {followed.length > 0 && (
            <section className="section">
              <SectionHead title="Shops you follow" />
              <div className="hscroll">{followed.map((p) => <PostTile key={p.id} post={p} style={{ width: 132 }} />)}</div>
            </section>
          )}

          <div className="pad section"><Note icon={Info}>Concept preview. Prices, stock and hours shown here are mock merchant data, not live information.</Note></div>
        </>
      )}
    </div>
  )
}
