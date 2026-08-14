import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { WORKS } from '../data'

const TYPES = ['摆件', '服饰', '礼品', '其他']
const BUDGETS = ['500以下', '500–2k', '2k–5k', '5k以上']

export default function ConsultPage() {
  const { id } = useParams()
  const work = WORKS.find(w => w.id === id) || WORKS[0]
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')
  const [desc, setDesc] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <main style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 26, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>咨询已提交</h2>
          <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8, margin: '0 0 32px' }}>
            {work.artisan.name}老师将在24小时内与你联系，请留意手机通知。
          </p>
          <Link to="/" style={{ padding: '12px 32px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600 }}>
            返回首页
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--text-light)' }}>首页</Link>
        {' / '}
        <Link to={`/work/${work.id}`} style={{ color: 'var(--text-light)' }}>{work.title}</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>咨询定制</span>
      </div>

      <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 26, fontWeight: 700, color: 'var(--ink)', margin: '0 0 32px' }}>咨询定制</h1>

      {/* Work preview */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'white', borderRadius: 12, padding: '16px', border: '1px solid var(--border)', marginBottom: 32 }}>
        <img src={work.img} alt={work.title} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', background: '#e8e0d8' }} />
        <div>
          <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{work.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={work.artisan.avatar} alt={work.artisan.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)' }}>{work.artisan.name} · {work.artisan.title}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Type */}
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>我想定制</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '8px 20px', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                border: type === t ? 'none' : '1px solid var(--border)',
                background: type === t ? 'var(--zhu)' : 'white',
                color: type === t ? 'white' : 'var(--text-mid)',
                fontFamily: "'Noto Sans SC'", fontSize: 13,
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>预算范围</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {BUDGETS.map(b => (
              <button key={b} onClick={() => setBudget(b)} style={{
                padding: '8px 20px', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                border: budget === b ? 'none' : '1px solid var(--border)',
                background: budget === b ? 'var(--zhu)' : 'white',
                color: budget === b ? 'white' : 'var(--text-mid)',
                fontFamily: "'Noto Sans SC'", fontSize: 13,
              }}>{b}</button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            详细需求 <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-light)' }}>（选填）</span>
          </div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="描述你想要的作品，包括尺寸、颜色偏好、特殊要求等…"
            rows={4}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 8,
              border: '1px solid var(--border)', outline: 'none', resize: 'vertical',
              fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text)',
              background: 'var(--mi)', lineHeight: 1.8, transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--zhu)'}
            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>联系方式</div>
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="手机号或微信号"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8,
              border: '1px solid var(--border)', outline: 'none',
              fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text)',
              background: 'var(--mi)', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--zhu)'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Hint */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', background: 'rgba(44,95,109,0.06)', borderRadius: 8, border: '1px solid rgba(44,95,109,0.12)' }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--qing)', lineHeight: 1.7, margin: 0 }}>
            提交后，{work.artisan.name}老师将在24小时内通过您留下的联系方式主动联系您，请耐心等待。
          </p>
        </div>

        <button
          onClick={() => { if (contact) setSubmitted(true) }}
          style={{
            padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: contact ? 'var(--zhu)' : 'var(--text-light)',
            color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 15, fontWeight: 700,
            transition: 'background 0.15s',
          }}
        >
          提交咨询
        </button>
      </div>
    </main>
  )
}
