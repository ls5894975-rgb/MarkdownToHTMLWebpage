import { type CSSProperties, useEffect, useRef, useState } from 'react'
import './timeline-cinema.css'

const FOCUS_DURATION = 3000

const SCENES = [
  {
    chapter: '第一幕 · 诞生',
    year: '北宋晚期',
    title: '天青初现',
    quote: '雨过天青的颜色，在清凉寺的窑火中成为一代审美。',
    detail: '北宋末年的清凉寺，年轻窑工守仁负责给匣钵垫上细小支钉。宫廷要的器物必须满釉，不能让圈足露胎，他便一遍遍调整支钉的位置。开窑那天，几十件器物中只有一只洗的釉色像雨后天空，底部留下五枚细若芝麻的支痕。老师傅没有夸奖，只让他把失败的瓷片全部留下。守仁后来才明白，汝窑二十年左右的辉煌不是偶然得来的天青，而是无数次配釉、控火和舍弃共同换来的克制之美。',
    video: 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/timeline/scene-1.mp4',
    tone: '#a46346',
  },
  {
    chapter: '第二幕 · 沉寂',
    year: '南宋至元代',
    title: '珍器难得',
    quote: '窑火熄灭以后，一片天青成为后人反复追寻的旧梦。',
    detail: '南宋都城临安的一间旧货铺里，一位书生偶然见到一只带细密开片的青色小盘。掌柜说它来自北方旧都，经历战乱后只剩半边完整。书生用积蓄买下它，并在木盒中垫上棉絮。每逢雨后，他都会把小盘放到窗边，看釉色随着天光变得深浅不同。那时完整汝窑器已经难得，旧器与残片在收藏者手中被珍重保存。真正的窑火虽然沉寂，天青色却借由人的记忆继续流传。',
    video: 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/timeline/scene-2.mp4',
    tone: '#547781',
  },
  {
    chapter: '第三幕 · 追摹',
    year: '明清时期',
    title: '仿汝成风',
    quote: '后世追摹的不只是釉色，更是宋人清淡含蓄的精神。',
    detail: '雍正年间，景德镇御窑厂的一名年轻窑工第一次见到宫中送来的宋汝洗。他把器物放在不同光线下观察，发现釉色并非单一的蓝或绿，而是在灰胎与细碎开片之间透出温润层次。为了仿出这种质感，窑工们反复调整胎釉配方和烧成气氛。新器出窑后，造型已带有清代风格，釉色却仍向宋汝致意。明清仿汝并不是复制原物，而是让每个时代用自己的工艺重新理解天青。',
    video: 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/timeline/scene-3.mp4',
    tone: '#796653',
  },
  {
    chapter: '第四幕 · 复烧',
    year: '1957—1988',
    title: '窑火重燃',
    quote: '古老配方没有留下答案，现代匠人用数百次试验重新寻找天青。',
    detail: '二十世纪八十年代，汝瓷试验组的记录本已经写满四十多种配方。一次试烧失败后，研究员老周没有立刻倒掉釉浆，而是把温度曲线、还原气氛和冷却时间逐项标记。团队连续进行数百次试验，终于在窑门打开时看见稳定的天蓝与天青釉色。有人轻轻敲响新器，清越的声音在厂房里回荡。现代复烧不是神秘古方突然重现，而是传统经验与材料分析共同完成的一次漫长接力。',
    video: 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/timeline/scene-4.mp4',
    tone: '#6e5b45',
  },
  {
    chapter: '第五幕 · 新生',
    year: '2011 至今',
    title: '非遗新生',
    quote: '被看见、被学习、被使用，汝瓷才会从历史走进今天。',
    detail: '汝瓷烧制技艺列入国家级非物质文化遗产名录后，一位年轻学徒来到汝州学习。最初她只想做一件好看的茶杯，师父却先让她认识高岭土、玛瑙和釉浆，再练习观察窑火与开片。半年后，她把传统天青釉用在适合现代生活的器形上，并把制作过程记录下来分享给更多人。体验课上，孩子们第一次触摸泥土，老匠人也听见了新的问题。非遗的新生，就发生在这样的相遇之中。',
    video: 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/timeline/scene-5.mp4',
    tone: '#a33f3b',
  },
]
export default function TimelineTheaterPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [started, setStarted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<'focus' | 'background'>('focus')
  const [muted, setMuted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [playError, setPlayError] = useState('')

  const scene = SCENES[activeIndex]
  const sceneStyle = { '--scene-tone': scene.tone } as CSSProperties

  const playCurrentVideo = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !started || muted
    void video.play().then(() => setPlayError('')).catch(() => {
      setPlayError('浏览器暂未允许声音播放，请点击右上角声音按钮。')
    })
  }

  const beginFocus = (restartVideo = true) => {
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    setPhase('focus')
    setDialogOpen(false)

    const video = videoRef.current
    if (video && restartVideo) video.currentTime = 0
    playCurrentVideo()

    focusTimerRef.current = setTimeout(() => {
      setPhase('background')
    }, FOCUS_DURATION)
  }

  useEffect(() => {
    if (!started) return

    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.muted = muted
      void video.play().then(() => setPlayError('')).catch(() => {
        setPlayError('点击声音按钮即可继续有声播放。')
      })
    }

    setPhase('focus')
    setDialogOpen(false)
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    focusTimerRef.current = setTimeout(() => {
      setPhase('background')
    }, FOCUS_DURATION)

    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    }
  }, [activeIndex, started])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = !started || muted
  }, [muted, started])

  const startJourney = () => {
    setStarted(true)
    setMuted(false)
    setPlayError('')
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.muted = false
      void video.play().catch(() => setPlayError('点击声音按钮即可开启有声播放。'))
    }
  }

  const changeScene = (index: number) => {
    if (index === activeIndex) {
      beginFocus()
      return
    }
    setActiveIndex(index)
  }

  const toggleSound = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (videoRef.current) {
      videoRef.current.muted = nextMuted
      if (!nextMuted) void videoRef.current.play().catch(() => setPlayError('请再次点击以开启声音。'))
    }
  }

  const goNext = () => {
    changeScene(activeIndex < SCENES.length - 1 ? activeIndex + 1 : 0)
  }

  return (
    <main className={'timeline-cinema ' + (phase === 'background' ? 'is-background' : 'is-focus')} style={sceneStyle}>
      <video
        key={scene.video}
        ref={videoRef}
        className="timeline-cinema-video"
        src={scene.video}
        autoPlay
        loop
        playsInline
        muted={!started || muted}
        preload="auto"
        onCanPlay={() => {
          if (started) playCurrentVideo()
        }}
      />

      <div className="timeline-cinema-shade" />
      <div className="timeline-cinema-grain" />

      {!started && (
        <section className="timeline-cinema-intro" aria-label="时间轴剧场开场">
          <div className="timeline-cinema-intro-card">
            <div className="timeline-cinema-intro-kicker">RU WARE · A THOUSAND YEARS</div>
            <h1>汝窑时间轴</h1>
            <p>五段影像，沿着汝窑从北宋天青、明清追摹到现代复烧与非遗传承的轨迹，观看一千年的窑火流变。</p>
            <button type="button" className="timeline-cinema-start" onClick={startJourney}>
              <span aria-hidden="true">▶</span>
              开启有声旅程
            </button>
          </div>
        </section>
      )}

      {started && (
        <>
          {phase === 'focus' && (
            <>
              <div className="timeline-cinema-progress" aria-hidden="true">
                <span key={activeIndex + '-' + phase} />
              </div>
              <div className="timeline-cinema-focus-label">第 {activeIndex + 1} 幕 · 沉浸观看</div>
            </>
          )}

          <button type="button" className="timeline-cinema-audio" onClick={toggleSound} aria-label={muted ? '开启声音' : '关闭声音'}>
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
            {muted ? '开启声音' : '本幕声音'}
          </button>

          {playError && <div className="timeline-cinema-focus-label" style={{ top: 62 }}>{playError}</div>}

          <section className="timeline-cinema-story" aria-live="polite">
            <div className="timeline-cinema-chapter">{scene.chapter} · {scene.year}</div>
            <h1>{scene.title}</h1>
            <p className="timeline-cinema-quote">“{scene.quote}”</p>
            <div className="timeline-cinema-actions">
              <button type="button" className="primary" onClick={() => setDialogOpen(true)}>展开这一幕</button>
              <button type="button" onClick={() => beginFocus()}>重看前 3 秒</button>
              <button type="button" onClick={goNext}>{activeIndex < SCENES.length - 1 ? '进入下一幕 →' : '回到第一幕 ↺'}</button>
            </div>
          </section>

          {phase === 'background' && (
            <nav className="timeline-cinema-rail" aria-label="五幕时间轴">
              {SCENES.map((item, index) => (
                <button
                  key={item.video}
                  type="button"
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => changeScene(index)}
                  aria-label={'进入第' + (index + 1) + '幕：' + item.title}
                >
                  <em>{String(index + 1).padStart(2, '0')} · {item.title}</em>
                  <i />
                </button>
              ))}
            </nav>
          )}

          <div className="timeline-cinema-number">
            {String(activeIndex + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
          </div>
        </>
      )}

      {dialogOpen && (
        <div className="timeline-cinema-dialog-backdrop" role="presentation" onClick={() => setDialogOpen(false)}>
          <section
            className="timeline-cinema-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-dialog-title"
            onClick={event => event.stopPropagation()}
          >
            <button type="button" className="timeline-cinema-dialog-close" aria-label="关闭" onClick={() => setDialogOpen(false)}>×</button>
            <div className="timeline-cinema-intro-kicker">{scene.chapter} · {scene.year}</div>
            <h2 id="timeline-dialog-title">{scene.title}</h2>
            <p>{scene.detail}</p>
            <div className="timeline-cinema-dialog-footer">
              <span>朝代小故事 · 第 {activeIndex + 1} 则 / 共 {SCENES.length} 则 · 依据时代背景创作</span>
              {activeIndex < SCENES.length - 1
                ? <button type="button" onClick={() => { setDialogOpen(false); changeScene(activeIndex + 1) }}>前往下一章 →</button>
                : <strong>汝瓷仍在新生</strong>}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}