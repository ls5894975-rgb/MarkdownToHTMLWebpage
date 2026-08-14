import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { ARTISANS, WORKS } from '../data'

const TABS = ['作品', '简介', '体验课']

export default function ArtisanPage() {
  const { id } = useParams()
  const artisan = ARTISANS.find(a => a.id === id) || ARTISANS[0]
  const [tab, setTab] = useState('作品')
  const [followed, setFollowed] = useState(false)
  const works = WORKS.filter(w => w.artisan.id === artisan.id)

  return (
    <main>
      {/* Cover */}
      <div style={{ position: 'relative', height: 280, background: '#2a2520', overflow: 'hidden' }}>
        <img src={artisan.cover} alt={artisan.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
      </div>

      {/* Profile */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, transform: 'translateY(-48px)', marginBottom: -24 }}>
          <img src={artisan.avatar} alt={artisan.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--mi)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0 }} />
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 26, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>{artisan.name}</h1>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(196,62,62,0.1)', border: '1px solid rgba(196,62,62,0.2)', fontSize: 11, fontFamily: "'Noto Sans SC'", color: 'var(--zhu)' }}>已认证</span>
            </div>
            <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', margin: '0 0 12px' }}>{artisan.title}</p>
          </div>
          <button onClick={() => setFollowed(!followed)} style={{
            padding: '9px 24px', borderRadius: 8, cursor: 'pointer',
            background: followed ? 'var(--mi)' : 'var(--zhu)',
            color: followed ? 'var(--text-mid)' : 'white',
            fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600,
            border: followed ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'all 0.15s', marginBottom: 8, flexShrink: 0,
          }}>
            {followed ? '已关注' : '+ 关注'}
          </button>
        </div>

        {/* Quote + stats */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, color: 'var(--text-mid)', fontStyle: 'italic', margin: '0 0 20px' }}>
            "{artisan.quote}"
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
            {[['从业', `${artisan.years}年`], ['作品', `${artisan.works}件`], ['粉丝', `${artisan.fans.toLocaleString()}`]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'var(--zhu)' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '12px 20px', fontSize: 14, fontFamily: "'Noto Sans SC'", background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? 'var(--zhu)' : 'var(--text-mid)',
              borderBottom: tab === t ? '2px solid var(--zhu)' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400, transition: 'all 0.15s', marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === '作品' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
            {works.map(w => (
              <Link key={w.id} to={`/work/${w.id}`} style={{ display: 'block', borderRadius: 12, overflow: 'hidden', background: '#e8e0d8', aspectRatio: '1', position: 'relative' }}>
                <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ''}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}
                >
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                    <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 13, fontWeight: 700, color: 'white' }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'Noto Sans SC'" }}>♡ {w.likes.toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === '简介' && (
          <div style={{ maxWidth: 600, marginBottom: 64 }}>
            <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 15, color: 'var(--text)', lineHeight: 2, marginBottom: 24 }}>{artisan.bio}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['专长工艺', '双面绣、盘金绣、散套绣'],
                ['代表作品', '《双面猫》《金丝凤凰》'],
                ['获奖荣誉', '国际工艺美术展金奖 2022'],
                ['工坊地址', '江苏省苏州市姑苏区平江路'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'white', borderRadius: 10, padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Noto Serif SC'", color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === '体验课' && (
          <div style={{ marginBottom: 64 }}>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
              <img src="https://images.unsplash.com/photo-1585887346669-6437a1275e3e?w=400&h=300&fit=crop&auto=format" alt="苏绣体验课" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ padding: '24px 28px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 8 }}>下周日 10:00 · 苏州姑苏区工坊</div>
                <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px' }}>苏绣入门体验课</h3>
                <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, margin: '0 0 20px' }}>在张蔚老师的带领下，亲身体验苏绣的基本针法，完成一件专属小作品。适合零基础爱好者，所有材料工具由工坊提供。</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'var(--zhu)' }}>¥158</span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>/人 · ⭐ 4.8 · 194人参加过</span>
                  </div>
                  <Link to="/book" style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--qing)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600 }}>立即预约</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', padding: '14px 0', zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={artisan.avatar} alt={artisan.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{artisan.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>接受定制咨询</div>
            </div>
          </div>
          <Link to={`/consult/${works[0]?.id || ''}`} style={{ padding: '10px 28px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 700 }}>
            🎨 咨询定制
          </Link>
        </div>
      </div>
    </main>
  )
}
