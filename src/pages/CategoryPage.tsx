import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { CATEGORIES, WORKS } from '../data'
import WorkCard from '../components/WorkCard'

const FILTERS = ['最新', '最热', '可定制', '体验课']

const KNOWLEDGE = {
  history: {
    title: '苏绣历史',
    icon: '📜',
    content: '苏绣，即苏州刺绣，发源于苏州，距今已有两千多年历史。宋代苏绣已具相当规模，明代更是精湛无比，清代宫廷中大量使用苏绣制品，与粤绣、湘绣、蜀绣并称"中国四大名绣"，2006年列入国家级非物质文化遗产名录。',
  },
  craft: {
    title: '工艺技法',
    icon: '✂️',
    content: '苏绣技法多达数十种，常见的有：平绣（线条平齐排列）、散套绣（色彩自然渗化）、双面绣（两面图案俱佳）、乱针绣（交叉针法表现光影）、戗针绣、接针绣等。每种技法适用不同题材和风格，呈现出苏绣独特的艺术语言。',
  },
  pattern: {
    title: '传统纹样',
    icon: '🎨',
    content: '苏绣纹样以花鸟虫鱼、山水人物为主，常见有：牡丹（富贵）、莲花（清廉）、梅兰竹菊（四君子）、凤凰（祥瑞）、锦鲤（吉庆有余）等。纹样多取吉祥寓意，融合中国传统文化精髓。',
  },
}

export default function CategoryPage() {
  const { id } = useParams()
  const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
  const [filter, setFilter] = useState('最热')
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  const works = WORKS.filter(w => id === 'suzhou-embroidery' ? w.category === 'suzhou-embroidery' : true)
    .sort((a, b) => b.likes - a.likes)

  return (
    <main>
      {/* Category hero */}
      <section style={{ position: 'relative', height: 320, overflow: 'hidden', background: cat.color }}>
        <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Noto Sans SC'", marginBottom: 8 }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.4)' }}>首页</Link>
              {' / '}{cat.name}
            </div>
            <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 42, fontWeight: 900, color: 'white', margin: '0 0 10px' }}>{cat.name}</h1>
            <p style={{ fontFamily: "'Noto Serif SC'", fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', fontStyle: 'italic' }}>
              以针为笔，以线为墨，绣尽东方风雅
            </p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              {[['匠人', `${cat.count}位`], ['作品', `${cat.works}件`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'white' }}>{v}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Noto Sans SC'" }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge expand */}
      <section style={{ background: 'var(--yue)', borderBottom: '1px solid var(--border-warm)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid rgba(196,62,62,0.1)' }}>
            {Object.entries(KNOWLEDGE).map(([key, val]) => (
              <button key={key} onClick={() => setExpandedTab(expandedTab === key ? null : key)} style={{
                padding: '14px 20px', fontSize: 13, fontFamily: "'Noto Sans SC'",
                background: 'none', border: 'none', cursor: 'pointer',
                color: expandedTab === key ? 'var(--zhu)' : 'var(--text-mid)',
                borderBottom: expandedTab === key ? '2px solid var(--zhu)' : '2px solid transparent',
                fontWeight: expandedTab === key ? 600 : 400,
                transition: 'all 0.15s',
              }}>
                {val.icon} {val.title}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", padding: '14px 0' }}>
              点击了解非遗知识
            </span>
          </div>
          {expandedTab && (
            <div style={{ padding: '20px 0 24px', maxWidth: 720 }}>
              <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text)', lineHeight: 1.9, margin: 0 }}>
                {KNOWLEDGE[expandedTab as keyof typeof KNOWLEDGE].content}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filter + works */}
      <section style={{ padding: '40px 0 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text-mid)' }}>共 {works.length} 件作品</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans SC'",
                  border: filter === f ? 'none' : '1px solid var(--border)',
                  background: filter === f ? 'var(--zhu)' : 'white',
                  color: filter === f ? 'white' : 'var(--text-mid)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div className="waterfall">
            {works.map(w => <WorkCard key={w.id} work={w} />)}
          </div>
        </div>
      </section>
    </main>
  )
}
