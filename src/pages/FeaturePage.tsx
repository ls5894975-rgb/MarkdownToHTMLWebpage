import { Link, useLocation } from 'react-router'

const FEATURES: Record<string, { eyebrow: string; title: string; subtitle: string; description: string }> = {
  '/timeline-theater': {
    eyebrow: 'TIMELINE THEATER',
    title: '时间轴剧场',
    subtitle: '循着时间，看见技艺如何生长',
    description: '这里将以朝代与工艺为线索，串联非遗技艺的起源、流变与当代传承。',
  },
  '/daily-treasure': {
    eyebrow: 'DAILY TREASURE',
    title: '每日赏物',
    subtitle: '一日一器，一物一故事',
    description: '每天精选一件非遗作品，从纹样、材料与技法三个角度慢慢欣赏。',
  },
  '/daily-check-in': {
    eyebrow: 'DAILY CHECK-IN',
    title: '每日打卡',
    subtitle: '把热爱，积成看得见的足迹',
    description: '每日认识一种工艺、一个纹样或一位匠人，逐步建立自己的非遗知识地图。',
  },
}

export default function FeaturePage() {
  const { pathname } = useLocation()
  const feature = FEATURES[pathname] ?? FEATURES['/daily-treasure']

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', display: 'grid', placeItems: 'center', padding: '64px 32px 100px' }}>
      <section style={{ width: '100%', maxWidth: 760, textAlign: 'center' }}>
        <div style={{ marginBottom: 13, fontFamily: "'Noto Sans SC'", fontSize: 11, letterSpacing: '0.18em', color: 'var(--zhu)' }}>{feature.eyebrow}</div>
        <h1 style={{ margin: '0 0 14px', fontFamily: "'Noto Serif SC'", fontSize: 40, color: 'var(--ink)' }}>{feature.title}</h1>
        <p style={{ margin: '0 0 22px', fontFamily: "'Noto Serif SC'", fontSize: 18, color: 'var(--text-mid)' }}>{feature.subtitle}</p>
        <div style={{ width: 44, height: 1, margin: '0 auto 22px', background: 'var(--zhu)' }} />
        <p style={{ maxWidth: 560, margin: '0 auto 32px', fontFamily: "'Noto Sans SC'", fontSize: 14, lineHeight: 2, color: 'var(--text-light)' }}>{feature.description}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: 'rgba(44,95,109,0.07)', fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--qing)' }}>栏目内容正在精心准备</div>
        <div style={{ marginTop: 30 }}>
          <Link to="/home" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 13 }}>先去首页赏物</Link>
        </div>
      </section>
    </main>
  )
}