import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link, useLocation, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'

const MORE_LINKS = [
  { to: '/timeline-theater', label: '时间轴剧场', eyebrow: '历史长河', icon: '轴' },
  { to: '/daily-treasure', label: '每日赏物', eyebrow: '一日一器', icon: '赏' },
  { to: '/daily-check-in', label: '每日打卡', eyebrow: '传承足迹', icon: '印' },
  { to: '/categories', label: '品类', eyebrow: '八大工艺', icon: '类' },
]

export default function NavBar() {
  const [query, setQuery] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [profileRole, setProfileRole] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()
  const displayName = profileName || userEmail?.split('@')[0] || ''

  useEffect(() => {
    let active = true

    const syncSession = async (session: Session | null) => {
      if (!active) return
      setUserEmail(session?.user.email ?? null)
      setProfileName(session?.user.user_metadata?.display_name ?? session?.user.user_metadata?.full_name ?? null)
      setProfileAvatar(session?.user.user_metadata?.avatar_url ?? null)

      if (!session) {
        setProfileRole(null)
        setAuthReady(true)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!active) return
      setProfileRole(data?.role ?? null)
      setAuthReady(true)
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,248,245,0.94)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(44,95,109,0.1)',
      boxShadow: moreOpen ? '0 10px 30px rgba(46,35,27,0.06)' : 'none',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
          <Link to="/home" style={{ padding: '6px 11px', fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)', borderRadius: 6 }}>首页</Link>
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="expanded-nav-menu"
            onClick={() => setMoreOpen(value => !value)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', border: 'none', borderRadius: 6, background: moreOpen ? 'rgba(196,62,62,0.08)' : 'transparent', color: moreOpen ? 'var(--zhu)' : 'var(--text-mid)', cursor: 'pointer', fontSize: 13, fontFamily: "'Noto Sans SC'" }}
          >
            更多
            <span aria-hidden="true" style={{ display: 'inline-block', fontSize: 10, transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>⌄</span>
          </button>
          {authReady && userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6 }}>
              <Link to="/bookings" style={{ padding: '6px 9px', borderRadius: 6, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--qing)', whiteSpace: 'nowrap' }}>我的预约</Link>
              {profileRole && (
                <span style={{ padding: '3px 7px', borderRadius: 999, background: 'rgba(158,63,45,0.1)', color: 'var(--zhu)', fontSize: 10, whiteSpace: 'nowrap' }}>
                  {profileRole === 'artisan' ? '传承人' : '爱好者'}
                </span>
              )}
              <Link
                to="/profile"
                title={`${userEmail} · 点击进入个人主页`}
                style={{ maxWidth: 150, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 5px', overflow: 'hidden', whiteSpace: 'nowrap', borderRadius: 6, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text-mid)' }}
              >
                {profileAvatar
                  ? <img src={profileAvatar} alt="" style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(158,63,45,0.18)' }} />
                  : <span style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: '50%', background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Serif SC'", fontSize: 10 }}>{displayName.slice(0, 1).toUpperCase()}</span>}
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                style={{ padding: '6px 12px', fontSize: 13, fontFamily: "'Noto Sans SC'", background: 'transparent', color: 'var(--zhu)', borderRadius: 6, border: '1px solid var(--zhu)', cursor: 'pointer' }}
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{ marginLeft: 8, padding: '6px 16px', fontSize: 13, fontFamily: "'Noto Sans SC'", fontWeight: 500, background: 'var(--zhu)', color: 'white', borderRadius: 6, border: 'none' }}
            >
              登录
            </Link>
          )}
        </nav>
      </div>

      <div id="expanded-nav-menu" aria-hidden={!moreOpen} style={{ display: 'grid', gridTemplateRows: moreOpen ? '54px' : '0px', overflow: 'hidden', borderTop: moreOpen ? '1px solid rgba(44,95,109,0.08)' : '1px solid transparent', background: 'rgba(245,240,232,0.58)', transition: 'grid-template-rows 0.22s ease, border-color 0.22s ease' }}>
        <nav aria-label="更多栏目" style={{ minHeight: 0, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {MORE_LINKS.map(item => {
            const active = location.pathname === item.to || (item.to.startsWith('/category/') && location.pathname.startsWith('/category/'))
            return (
              <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={`expanded-nav-link${active ? ' active' : ''}`}>
                <span className="expanded-nav-icon">{item.icon}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 650 }}>{item.label}</span>
                  <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 9, letterSpacing: '0.08em', opacity: 0.58 }}>{item.eyebrow}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}