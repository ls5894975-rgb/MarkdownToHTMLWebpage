import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

export default function NavBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(44,95,109,0.1)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--zhu)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 13, fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>满</span>
          </div>
          <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>满小传</span>
          <span style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.05em', marginTop: 2 }}>非遗匠心精选</span>
        </Link>

        <form onSubmit={submit} style={{ flex: 1, maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索非遗作品、匠人、品类…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text)', padding: '8px 0' }}
            />
          </div>
        </form>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <Link to="/" style={{ padding: '6px 12px', fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)', borderRadius: 6 }}>首页</Link>
          <Link to="/category/suzhou-embroidery" style={{ padding: '6px 12px', fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)', borderRadius: 6 }}>品类</Link>
          <Link
            to="/login"
            style={{
              marginLeft: 8, padding: '6px 16px', fontSize: 13, fontFamily: "'Noto Sans SC'", fontWeight: 500,
              background: 'var(--zhu)', color: 'white', borderRadius: 6, border: 'none',
            }}
          >
            登录
          </Link>
        </nav>
      </div>
    </header>
  )
}
