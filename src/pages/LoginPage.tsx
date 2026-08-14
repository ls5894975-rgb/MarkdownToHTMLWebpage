import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

export default function LoginPage() {
  const [role, setRole] = useState<'fan' | 'artisan' | null>(null)
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--mi)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 900, width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}>
        {/* Left visual */}
        <div style={{ position: 'relative', background: 'var(--ink)', overflow: 'hidden', minHeight: 560 }}>
          <img src="https://images.unsplash.com/photo-1761724794734-4ee4148a621b?w=600&h=800&fit=crop&auto=format" alt="非遗之美" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(196,62,62,0.4) 0%, rgba(28,20,16,0.8) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--zhu)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: 15, fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>满</span>
              </div>
              <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 20, fontWeight: 700, color: 'white' }}>满小传</span>
            </div>
            <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.4, margin: '0 0 12px' }}>
              发现非遗之美<br />
              <span style={{ color: 'var(--yue)', fontSize: '0.75em' }}>与匠人同行</span>
            </h2>
            <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>
              连接非遗传承人与爱好者，<br />让每一件匠心作品找到懂得它的人。
            </p>
          </div>
        </div>

        {/* Right form */}
        <div style={{ background: 'white', padding: '48px 40px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>登录 / 注册</h2>
          <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-light)', margin: '0 0 32px' }}>选择你的身份，开启非遗之旅</p>

          {/* Role selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[
              { key: 'fan', icon: '🎨', title: '我是爱好者', sub: '浏览作品，咨询定制' },
              { key: 'artisan', icon: '🧵', title: '我是传承人', sub: '入驻平台，发布作品' },
            ].map(r => (
              <button key={r.key} onClick={() => setRole(r.key as 'fan' | 'artisan')} style={{
                padding: '16px', borderRadius: 10, border: `2px solid ${role === r.key ? 'var(--zhu)' : 'var(--border)'}`,
                background: role === r.key ? 'rgba(196,62,62,0.04)' : 'white',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 700, color: role === r.key ? 'var(--zhu)' : 'var(--ink)', marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--text-light)' }}>{r.sub}</div>
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>手机号</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 8,
                border: '1px solid var(--border)', outline: 'none',
                fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text)',
                background: 'var(--mi)', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--zhu)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '13px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: role ? 'var(--zhu)' : 'var(--text-light)',
              color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 700,
              marginBottom: 20, transition: 'background 0.15s',
            }}
          >
            获取验证码登录
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>或</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button style={{ padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text)' }}>
            <span style={{ fontSize: 16 }}>💬</span> 微信一键登录
          </button>

          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-light)', textDecoration: 'underline', padding: 0 }}>
            游客模式，随便逛逛 →
          </button>
        </div>
      </div>
    </main>
  )
}
