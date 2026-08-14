import { useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIES, WORKS, ARTISANS, ACTIVITIES } from '../data'
import WorkCard from '../components/WorkCard'

const FILTERS = ['最新', '最热', '可定制']

export default function HomePage() {
  const [filter, setFilter] = useState('最热')

  const filteredWorks = filter === '可定制'
    ? WORKS.filter(w => w.tags.includes('可定制'))
    : [...WORKS].sort((a, b) => filter === '最热' ? b.likes - a.likes : b.id.localeCompare(a.id))

  return (
    <main>
      {/* Hero banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, #2C3A30 60%, var(--qing) 100%)',
        padding: '64px 0 72px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cline x1='40' y1='10' x2='40' y2='70' stroke='white' stroke-width='0.3'/%3E%3Cline x1='10' y1='40' x2='70' y2='40' stroke='white' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(196,62,62,0.2)', border: '1px solid rgba(196,62,62,0.3)', borderRadius: 6, padding: '4px 12px', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--zhu-light)' }} />
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em' }}>非遗匠心精选平台</span>
              </div>
              <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '0 0 16px' }}>
                与匠人同行<br />
                <span style={{ color: 'var(--yue)' }}>守护非遗之美</span>
              </h1>
              <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 32px', maxWidth: 420 }}>
                连接非遗传承人与爱好者，让每一件匠心作品找到懂得它的人
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/category/suzhou-embroidery" style={{
                  padding: '12px 28px', borderRadius: 8, background: 'var(--zhu)', color: 'white',
                  fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600,
                }}>
                  探索作品
                </Link>
                <Link to="/artisan/zhang-wei" style={{
                  padding: '12px 28px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: 'white',
                  fontFamily: "'Noto Sans SC'", fontSize: 14, border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  认识匠人
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {WORKS.slice(0, 4).map((w, i) => (
                <Link key={w.id} to={`/work/${w.id}`} style={{ borderRadius: 10, overflow: 'hidden', background: '#2a2520', aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }}>
                  <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.opacity = '0.85'}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '56px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>探索非遗品类</h2>
              <p style={{ fontSize: 13, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", margin: 0 }}>以针为笔，以土为墨，刻录东方美学</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} style={{ display: 'block' }}>
                <div style={{
                  borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '3/4',
                  background: cat.color,
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = ''}
                >
                  <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 10px 12px' }}>
                    <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 2 }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: "'Noto Sans SC'" }}>{cat.count}位匠人</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured work of the week */}
      <section style={{ padding: '0 0 56px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: 'var(--ink)', borderRadius: 16, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
            <div style={{ padding: '48px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>本周一器</span>
              </div>
              <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 'clamp(20px, 2.5vw, 36px)', fontWeight: 700, color: 'white', lineHeight: 1.3, margin: '0 0 16px' }}>
                双面猫苏绣<br />
                <span style={{ color: 'var(--yue)', fontSize: '0.65em', fontWeight: 400 }}>绣了半年的神级作品</span>
              </h3>
              <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 32px', maxWidth: 360 }}>
                一针一线手工盘金绣，双面图案各不相同。正面白猫戏蝶，背面黑猫望月，历时半年精绣而成。
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <img src={ARTISANS[0].avatar} alt={ARTISANS[0].name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                <div>
                  <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 600, color: 'white' }}>{ARTISANS[0].name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Noto Sans SC'" }}>{ARTISANS[0].title}</div>
                </div>
              </div>
              <Link to="/work/double-cat" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 8, background: 'var(--zhu)', color: 'white',
                fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 500, alignSelf: 'flex-start',
              }}>
                查看详情
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={WORKS[0].img} alt="双面猫苏绣" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--ink) 0%, transparent 30%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Works waterfall */}
      <section style={{ padding: '0 0 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>精选作品</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans SC'",
                  border: filter === f ? 'none' : '1px solid var(--border)',
                  background: filter === f ? 'var(--zhu)' : 'white',
                  color: filter === f ? 'white' : 'var(--text-mid)',
                  fontWeight: filter === f ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div className="waterfall">
            {filteredWorks.map(w => <WorkCard key={w.id} work={w} />)}
          </div>
        </div>
      </section>

      {/* Artisan story */}
      <section style={{ background: 'var(--yue)', padding: '64px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 28px' }}>匠人故事</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {ARTISANS.map(a => (
              <Link key={a.id} to={`/artisan/${a.id}`} style={{ display: 'block' }}>
                <div style={{
                  background: 'white', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid var(--border-warm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = ''
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
                  }}
                >
                  <div style={{ height: 180, overflow: 'hidden', background: '#e8e0d8' }}>
                    <img src={a.cover} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '20px 20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <img src={a.avatar} alt={a.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--yue)' }} />
                      <div>
                        <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{a.title}</div>
                      </div>
                    </div>
                    <p style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8, margin: '0 0 16px', fontStyle: 'italic' }}>
                      "{a.quote}"
                    </p>
                    <div style={{ display: 'flex', gap: 20 }}>
                      {[['从业', `${a.years}年`], ['作品', `${a.works}件`], ['粉丝', `${a.fans.toLocaleString()}`]].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 16, fontWeight: 700, color: 'var(--zhu)' }}>{v}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{k}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section style={{ padding: '64px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px' }}>📅 近期活动</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {ACTIVITIES.map(act => (
              <div key={act.id} style={{
                display: 'grid', gridTemplateColumns: '200px 1fr',
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border)',
              }}>
                <img src={act.img} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 6 }}>{act.date}</div>
                  <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{act.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-mid)', fontFamily: "'Noto Sans SC'", marginBottom: 16 }}>
                    {act.artisan} · ⭐ {act.rating} · {act.count}人参加过
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 20, fontWeight: 700, color: 'var(--zhu)' }}>¥{act.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>/人</span></div>
                    <Link to="/book" style={{
                      padding: '8px 20px', borderRadius: 7, background: 'var(--qing)', color: 'white',
                      fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 500,
                    }}>立即预约</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--ink)', padding: '40px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--zhu)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 11, fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>满</span>
            </div>
            <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>满小传</span>
          </div>
          <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            © 2024 满小传 · 非遗匠心精选平台
          </p>
        </div>
      </footer>
    </main>
  )
}
