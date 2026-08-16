import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { WORKS } from '../data'

const TODAY_WORK_ID = 'celadon-vase'

const ARCHIVE = [
  { label: '釉色', value: '天青釉' },
  { label: '器型', value: '玉壶春瓶' },
  { label: '工序', value: '手拉坯 · 施釉 · 窑烧' },
  { label: '所属', value: '汝瓷烧制技艺' },
]

export default function DailyTreasurePage() {
  const work = WORKS.find(item => item.id === TODAY_WORK_ID) ?? WORKS[0]
  const today = useMemo(() => new Date(), [])
  const dateKey = useMemo(() => {
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [today])
  const dateLabel = dateKey.replaceAll('-', '.')
  const storageKey = `manxiaozhuan:daily-treasure:viewed:${dateKey}`
  const [checked, setChecked] = useState(() => localStorage.getItem(storageKey) === 'done')
  const [checking, setChecking] = useState(false)

  const markAsViewed = () => {
    if (checked || checking) return
    setChecking(true)
    window.setTimeout(() => {
      localStorage.setItem(storageKey, 'done')
      setChecked(true)
      setChecking(false)
    }, 650)
  }

  return (
    <main className="daily-treasure-page">
      <section className="daily-treasure-hero">
        <div className="daily-treasure-visual">
          <img src={work.img} alt={work.title} />
          <div className="daily-treasure-image-shade" />
          <div className="daily-treasure-date">今日一器 · {dateLabel}</div>
          <div className="daily-treasure-vertical-mark" aria-hidden="true">
            <span>一</span><span>日</span><span>一</span><span>器</span>
          </div>
          <div className="daily-treasure-caption">
            <span>DAILY OBJECT · 01</span>
            <p>慢下来，看见手艺留下的光。</p>
          </div>
        </div>

        <div className="daily-treasure-content">
          <div className="daily-treasure-edition">
            <span>编辑精选</span>
            <i />
            <Link to={`/category/${work.category}`}>汝瓷</Link>
          </div>

          <h1>{work.title}</h1>
          <p className="daily-treasure-subtitle">雨过天青，一器藏春</p>
          <div className="daily-treasure-divider" />

          <blockquote>
            天青釉不以浓烈取胜，而在光线流转间显出温润层次。器身收束舒展，釉面如雨后远空；今天，留一分钟，细看手作留下的细微变化。
          </blockquote>

          <Link className="daily-treasure-artisan" to={`/artisan/${work.artisan.id}`}>
            <img src={work.artisan.avatar} alt={work.artisan.name} />
            <div>
              <strong>{work.artisan.name}</strong>
              <span>{work.artisan.title} · 从业 {work.artisan.years} 年</span>
            </div>
            <b aria-hidden="true">→</b>
          </Link>

          <div className="daily-treasure-actions">
            <button type="button" onClick={markAsViewed} disabled={checked || checking} className={checked ? 'is-checked' : ''}>
              {checking ? '正在记下今日一赏…' : checked ? '✓ 今日已赏 · 已记入足迹' : '完成今日一赏'}
            </button>
            <Link to={`/work/${work.id}`}>查看作品详情</Link>
          </div>

          <div className="daily-treasure-archive" aria-label="器物档案">
            {ARCHIVE.map(item => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <p className="daily-treasure-next">明日 09:00，下一件非遗作品与你见面</p>
        </div>
      </section>
    </main>
  )
}