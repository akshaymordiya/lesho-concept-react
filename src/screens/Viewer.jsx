import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { X, Heart, Bookmark, Share2, Play, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowRight, BadgeCheck, Tag, ArrowLeft } from 'lucide-react'
import { useApp, Img, Verified, Stars, inr } from '../ui.jsx'

/* Shared pieces — the visual language is identical across reels, posts and stories. */
function Rail({ post }) {
  const app = useApp()
  const liked = app.isLiked(post.id), saved = app.isSaved('post', post.id)
  return (
    <div className="rail">
      <button aria-label="Like" aria-pressed={liked} onClick={() => app.toggleLike(post.id)}>
        <span className="ic"><Heart size={21} fill={liked ? 'var(--orange)' : 'none'} color={liked ? 'var(--orange)' : '#fff'} /></span>{post.likes + (liked ? 1 : 0)}
      </button>
      <button aria-label="Save" aria-pressed={saved} onClick={() => app.toggleSave('post', post.id)}>
        <span className="ic"><Bookmark size={21} fill={saved ? '#fff' : 'none'} /></span>{saved ? 'Saved' : 'Save'}
      </button>
      <button aria-label="Share" onClick={() => app.share(post.title)}><span className="ic"><Share2 size={20} /></span>Share</button>
    </div>
  )
}
function BizLine({ b }) {
  const app = useApp()
  return (
    <div className="row" style={{ gap: 10, paddingRight: 60 }}>
      <button className="row" style={{ gap: 9, minHeight: 44, minWidth: 0 }} onClick={() => app.go('biz', b.id)}>
        <span className="avatar sm" style={{ background: '#fff', color: 'var(--ink)' }}>{b.name[0]}</span>
        <span className="b clamp1">{b.name}</span><Verified biz={b} />
      </button>
      {!app.following[b.id] && <button className="chip onDark" style={{ minHeight: 32 }} onClick={() => app.toggleFollow(b.id)}>Follow</button>}
    </div>
  )
}
function TagRow({ ids }) {
  const app = useApp()
  const ps = ids.map((t) => app.prod(t)).filter(Boolean)
  if (!ps.length) return <div style={{ height: 12 }} />
  return (
    <div className="tagrow" aria-label="Tagged items">
      {ps.map((p) => (
        <button key={p.id} className="ptag" onClick={() => app.go('product', p.id)}>
          <Img id={p.img} w={120} alt="" />
          <span style={{ minWidth: 0 }}><span className="tiny b clamp1" style={{ display: 'block' }}>{p.name}</span><span className="tiny muted">{inr(p.price)} · View</span></span>
        </button>
      ))}
    </div>
  )
}
function usePostCta(post, b) {
  const app = useApp()
  const isDump = post.type === 'dump'
  const go = () => {
    if (post.eventId) return app.go('event', post.eventId)
    if (post.cta === 'Explore collection' || isDump || !post.tags?.length || /restaurant|studio|store/.test(post.cta || '')) return app.go('biz', b.id)
    app.go('product', post.tags[0])
  }
  return [isDump ? 'Explore collection' : post.cta || 'Visit business', go]
}

export default function Viewer({ param, active }) {
  const app = useApp()
  const post = app.post(param) || app.posts[0]
  return post.type === 'reel' ? <ReelsFeed startId={post.id} active={active} /> : <PostViewer startId={post.id} />
}

/* ---------- Reels: full-screen vertical feed, one reel per swipe ---------- */
function ReelsFeed({ startId, active }) {
  const app = useApp()
  const reels = useMemo(() => app.posts.filter((p) => p.type === 'reel'), [app.posts])
  const start = Math.max(0, reels.findIndex((p) => p.id === startId))
  const [idx, setIdx] = useState(start)
  const [hint, setHint] = useState(true)
  const ref = useRef()
  useLayoutEffect(() => { ref.current.scrollTop = start * ref.current.clientHeight }, [])
  useEffect(() => { const t = setTimeout(() => setHint(false), 3200); return () => clearTimeout(t) }, [])
  const jump = (d) => ref.current.scrollTo({ top: (idx + d) * ref.current.clientHeight, behavior: 'smooth' })
  useEffect(() => {
    if (!active) return
    const onKey = (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); jump(1) } if (e.key === 'ArrowUp') { e.preventDefault(); jump(-1) } if (e.key === 'Escape') app.back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, idx])
  const onScroll = (e) => {
    const i = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight)
    if (i !== idx) { setIdx(i); setHint(false) }
  }
  return (
    <div className="viewer">
      <div className="reels" ref={ref} onScroll={onScroll} aria-label="Reels feed">
        {reels.map((p, i) => <ReelPage key={p.id} post={p} on={active && i === idx} near={Math.abs(i - idx) <= 1} />)}
      </div>
      <div className="vtop">
        <button className="icon-btn onDark" aria-label="Close" onClick={app.back}><ArrowLeft size={20} /></button>
        <span className="b" style={{ fontSize: 17 }}>Reels</span>
        <span style={{ flex: 1 }} />
        <span className="badge glass" style={{ fontSize: 12, padding: '5px 10px' }}>{idx + 1} of {reels.length}</span>
      </div>
      {hint && idx < reels.length - 1 && <div className="swipehint" aria-hidden="true"><ChevronUp size={18} />Swipe up for the next reel</div>}
    </div>
  )
}

function ReelPage({ post, on, near }) {
  const app = useApp()
  const b = app.biz(post.bizId)
  const [playing, setPlaying] = useState(true)
  const [prog, setProg] = useState(0)
  const [burst, setBurst] = useState(0)
  const tapT = useRef(null)
  const [label, cta] = usePostCta(post, b)
  useEffect(() => {
    if (!on) { setProg(0); setPlaying(true); return }
    if (!playing) return
    const t = setInterval(() => setProg((p) => (p >= 100 ? 0 : p + 0.5)), 45)
    return () => clearInterval(t)
  }, [on, playing])
  useEffect(() => () => clearTimeout(tapT.current), [])
  // Single tap pauses, double tap likes — the familiar reel gestures.
  const tap = () => {
    if (tapT.current) {
      clearTimeout(tapT.current); tapT.current = null
      if (!app.isLiked(post.id)) app.toggleLike(post.id)
      setBurst((n) => n + 1)
    } else tapT.current = setTimeout(() => { tapT.current = null; setPlaying((p) => !p) }, 240)
  }
  return (
    <section className="reelpage" aria-label={post.title}>
      <div className={`media ${on && playing ? 'playing' : ''}`}>
        {near && <Img id={post.img} w={900} alt={post.title} />}
        <span className="shade" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 40%, rgba(0,0,0,.88) 100%)' }} />
      </div>
      <button className="center" aria-label={playing ? 'Pause' : 'Play'} onClick={tap}>
        {!playing && <span className="icon-btn onDark" style={{ width: 72, height: 72, background: 'rgba(0,0,0,.45)' }}><Play size={30} fill="#fff" /></span>}
        {burst > 0 && <Heart key={burst} className="burst" size={96} fill="var(--orange)" color="var(--orange)" />}
      </button>
      <Rail post={post} />
      <div className="vbot">
        <BizLine b={b} />
        <div style={{ marginTop: 6, paddingRight: 56 }}>
          <div className="h3" style={{ fontSize: 16 }}>{post.title}</div>
          <p className="small clamp2" style={{ opacity: .85, marginTop: 3 }}>{post.caption}</p>
        </div>
        <TagRow ids={post.tags || []} />
        {post.offerId && <button className="chip onDark" style={{ marginBottom: 10 }} onClick={() => app.go('offer', post.offerId)}><Tag size={14} color="var(--orange)" />{app.offer(post.offerId)?.title}</button>}
        <button className="btn light block" onClick={cta}>{label}<ArrowRight size={17} /></button>
      </div>
      <div className="reelprog"><b style={{ width: `${prog}%` }} /></div>
    </section>
  )
}

/* ---------- Posts: photo dump (swipeable carousel), single image, update, review ---------- */
function PostViewer({ startId }) {
  const app = useApp()
  const list = useMemo(() => app.posts.filter((p) => p.type !== 'reel'), [app.posts])
  const [id, setId] = useState(startId)
  const post = app.post(id) || list[0]
  const b = app.biz(post.bizId)
  const idx = list.findIndex((p) => p.id === post.id)
  const [slide, setSlide] = useState(0)
  const scroller = useRef(), target = useRef(0)
  const isDump = post.type === 'dump', isReview = post.type === 'review'
  const review = isReview ? app.review(post.reviewId) : null
  const slides = isDump ? post.imgs : [{ img: post.img }]
  const cur = slides[Math.min(slide, slides.length - 1)]
  const [label, cta] = usePostCta(post, b)
  useEffect(() => { setSlide(0); target.current = 0; if (scroller.current) scroller.current.scrollLeft = 0 }, [id])
  const move = (d) => setId(list[(idx + d + list.length) % list.length].id)
  const slideTo = (d) => {
    target.current = Math.max(0, Math.min(slides.length - 1, target.current + d))
    scroller.current.scrollTo({ left: target.current * scroller.current.clientWidth, behavior: 'smooth' })
  }
  const onScroll = (e) => {
    const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth)
    if (i !== slide) setSlide(i)
  }
  return (
    <div className="viewer">
      <div className="media hsnap" ref={scroller} onScroll={onScroll} onPointerDown={() => { target.current = slide }}>
        {slides.map((s, i) => <div className="slidepage" key={`${post.id}-${i}`}><Img id={s.img} w={900} alt={s.cap || post.title} /></div>)}
      </div>
      <span className="shade" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 40%, rgba(0,0,0,.88) 100%)' }} />

      {isDump && slide > 0 && <button className="icon-btn onDark navbtn" style={{ left: 10 }} aria-label="Previous photo" onClick={() => slideTo(-1)}><ChevronLeft size={22} /></button>}
      {isDump && slide < slides.length - 1 && <button className="icon-btn onDark navbtn" style={{ right: 10 }} aria-label="Next photo" onClick={() => slideTo(1)}><ChevronRight size={22} /></button>}

      <div className="progress">{isDump && slides.map((_, i) => <i key={i}><b style={{ width: i <= slide ? '100%' : 0 }} /></i>)}</div>
      <div className="vtop">
        <button className="icon-btn onDark" aria-label="Close" onClick={app.back}><X size={20} /></button>
        <span className="badge glass" style={{ fontSize: 12, padding: '5px 10px' }}>
          {isDump ? `Photos · ${slide + 1} of ${slides.length}` : isReview ? 'Customer review' : post.type === 'update' ? 'Business update' : 'Post'}
        </span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn onDark" aria-label="Previous post" onClick={() => move(-1)}><ChevronUp size={20} /></button>
        <button className="icon-btn onDark" aria-label="Next post" onClick={() => move(1)}><ChevronDown size={20} /></button>
      </div>

      <Rail post={post} />
      <div className="vbot">
        <BizLine b={b} />
        {isReview && review ? (
          <div style={{ marginTop: 8, paddingRight: 56 }}>
            <div className="row" style={{ gap: 8 }}>
              <Stars value={review.rating} /><span className="small b">{review.author}</span>
              {review.verified ? <span className="badge green"><BadgeCheck size={11} />Verified {review.verified}</span> : <span className="badge glass">Unverified</span>}
            </div>
            <p className="small" style={{ marginTop: 6 }}>“{review.text}”</p>
            {review.reply && <p className="tiny" style={{ marginTop: 6, opacity: .8, borderLeft: '2px solid var(--blue)', paddingLeft: 8 }}>{review.reply}</p>}
          </div>
        ) : (
          <div style={{ marginTop: 6, paddingRight: 56 }}>
            <div className="h3" style={{ fontSize: 16 }}>{post.title}</div>
            <p className="small" style={{ opacity: .85, marginTop: 3 }}>{isDump && cur.cap ? cur.cap : post.caption}</p>
          </div>
        )}
        <TagRow ids={isDump ? (cur.tag ? [cur.tag] : []) : post.tags || []} />
        {post.offerId && <button className="chip onDark" style={{ marginBottom: 10 }} onClick={() => app.go('offer', post.offerId)}><Tag size={14} color="var(--orange)" />{app.offer(post.offerId)?.title}</button>}
        <button className="btn light block" onClick={cta}>{label}<ArrowRight size={17} /></button>
      </div>
    </div>
  )
}

/* ---------- Stories: auto-advancing, tap to move, hold to pause, swipe between shops ---------- */
const STORY_MS = 5000
export function StoryViewer({ param, active }) {
  const app = useApp()
  const stories = app.stories
  const [bi, setBi] = useState(Math.max(0, stories.findIndex((s) => s.bizId === param)))
  const [ii, setIi] = useState(0)
  const [prog, setProg] = useState(0)
  const [held, setHeld] = useState(false)
  const down = useRef(null), suppress = useRef(false)
  const story = stories[bi], item = story.items[Math.min(ii, story.items.length - 1)]
  const b = app.biz(story.bizId)
  const paused = held || !active || app.sheetOpen
  const likeId = `story-${story.bizId}-${ii}`

  const nextBiz = () => { if (bi < stories.length - 1) { setBi(bi + 1); setIi(0) } else app.back() }
  const prevBiz = () => { if (bi > 0) { setBi(bi - 1); setIi(0) } else { setIi(0); setProg(0) } }
  const next = () => (ii < story.items.length - 1 ? setIi(ii + 1) : nextBiz())
  const prev = () => (ii > 0 ? setIi(ii - 1) : prevBiz())

  useEffect(() => { setProg(0) }, [bi, ii])
  useEffect(() => { app.markStorySeen(story.bizId) }, [bi])
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setProg((p) => p + 100 / (STORY_MS / 50)), 50)
    return () => clearInterval(t)
  }, [paused, bi, ii])
  useEffect(() => { if (prog >= 100) next() }, [prog])
  useEffect(() => {
    if (!active) return
    const onKey = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'Escape') app.back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onDown = (e) => { down.current = { x: e.clientX, y: e.clientY, t: Date.now() }; suppress.current = false; setHeld(true) }
  const onUp = (e) => {
    const d = down.current; down.current = null; setHeld(false)
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y, dt = Date.now() - d.t
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { suppress.current = true; return dx < 0 ? nextBiz() : prevBiz() }
    if (dy > 80) { suppress.current = true; return app.back() }
    if (dt > 280) suppress.current = true // a hold only pauses
  }
  const zone = (fn) => () => { if (suppress.current) { suppress.current = false; return } fn() }

  const link = item.link || { type: 'biz', id: story.bizId }
  const p = link.type === 'product' ? app.prod(link.id) : null
  const open = () => app.go(link.type === 'product' ? 'product' : link.type === 'offer' ? 'offer' : link.type === 'event' ? 'event' : 'biz', link.id)
  const ctaLabel = link.type === 'product' ? `View ${p?.kind === 'Dish' ? 'dish' : p?.kind === 'Service' ? 'service' : 'product'}` : link.type === 'offer' ? 'See offer' : link.type === 'event' ? 'View event' : 'Visit profile'
  const liked = app.isLiked(likeId)

  return (
    <div className="viewer story" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { down.current = null; setHeld(false) }}>
      <div className="media" key={`${bi}-${ii}`} style={{ animation: 'fadeIn .25s' }}>
        <Img id={item.img} w={900} alt={item.text} />
        <span className="shade" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 46%, rgba(0,0,0,.86) 100%)' }} />
      </div>
      <button className="tapzone" style={{ left: 0, width: '30%' }} aria-label="Previous story" onClick={zone(prev)} />
      <button className="tapzone" style={{ right: 0, width: '70%' }} aria-label="Next story" onClick={zone(next)} />

      <div className="progress">
        {story.items.map((_, i) => <i key={i}><b style={{ width: i < ii ? '100%' : i === ii ? `${Math.min(prog, 100)}%` : 0 }} /></i>)}
      </div>
      <div className="vtop" style={{ top: 20 }}>
        <button className="row" style={{ gap: 9, minHeight: 44, minWidth: 0 }} onClick={() => app.go('biz', b.id)} onPointerDown={(e) => e.stopPropagation()}>
          <span className="avatar sm" style={{ background: '#fff', color: 'var(--ink)' }}>{b.name[0]}</span>
          <span style={{ minWidth: 0, textAlign: 'left' }}>
            <span className="row" style={{ gap: 5 }}><span className="b small clamp1">{b.name}</span><Verified biz={b} size={14} /></span>
            <span className="tiny" style={{ opacity: .75, display: 'block' }}>{item.time} · {ii + 1} of {story.items.length}{held ? ' · Paused' : ''}</span>
          </span>
        </button>
        <span style={{ flex: 1 }} />
        <button className="icon-btn onDark" aria-label="Close" onClick={app.back} onPointerDown={(e) => e.stopPropagation()}><X size={20} /></button>
      </div>

      <div className="vbot" onPointerDown={(e) => e.stopPropagation()}>
        <p className="h3" style={{ fontSize: 17, lineHeight: 1.3 }}>{item.text}</p>
        {p ? <TagRow ids={[p.id]} /> : <div style={{ height: 12 }} />}
        <div className="row" style={{ gap: 8 }}>
          <button className="btn light grow" onClick={open}>{ctaLabel}<ArrowRight size={17} /></button>
          <button className="icon-btn onDark" style={{ width: 48, height: 48 }} aria-label="Like" aria-pressed={liked} onClick={() => app.toggleLike(likeId)}><Heart size={20} fill={liked ? 'var(--orange)' : 'none'} color={liked ? 'var(--orange)' : '#fff'} /></button>
          <button className="icon-btn onDark" style={{ width: 48, height: 48 }} aria-label="Share" onClick={() => app.share(`${b.name} story`)}><Share2 size={19} /></button>
        </div>
      </div>
    </div>
  )
}
