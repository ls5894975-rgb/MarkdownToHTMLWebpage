import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import ProfileSettingsCard from '../components/ProfileSettingsCard'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState('enthusiast')
  const [bookingCount, setBookingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        navigate('/login', { replace: true })
        return
      }

      const [profileResult, bookingResult] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle(),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
      ])

      if (!active) return
      setUser(authData.user)
      setRole(profileResult.data?.role ?? 'enthusiast')
      setBookingCount(bookingResult.count ?? 0)
      setLoading(false)
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [navigate])

  if (loading || !user) {
    return <main style={{ minHeight: 'calc(100vh - 60px)', display: 'grid', placeItems: 'center', fontFamily: "'Noto Sans SC'", color: 'var(--text-light)' }}>正在加载个人主页…</main>
  }

  const displayName = user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '满小传用户'
  const avatarUrl = user.user_metadata?.avatar_url ?? ''
  const joinedAt = new Date(user.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 90px' }}>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '38px 40px', borderRadius: 20, background: 'linear-gradient(135deg, #3e3029 0%, #211a17 100%)', color: 'white', boxShadow: '0 20px 55px rgba(37,27,22,0.16)' }}>
        <div style={{ position: 'absolute', width: 260, height: 260, right: -70, top: -120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 82, height: 82, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0, borderRadius: '50%', background: 'var(--zhu)', border: '3px solid rgba(255,255,255,0.7)', fontFamily: "'Noto Serif SC'", fontSize: 30, fontWeight: 800 }}>
            {avatarUrl ? <img src={avatarUrl} alt={displayName + '的头像'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : displayName.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <h1 style={{ margin: 0, fontFamily: "'Noto Serif SC'", fontSize: 28 }}>{displayName}</h1>
              <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', fontFamily: "'Noto Sans SC'", fontSize: 10 }}>{role === 'artisan' ? '传承人' : '非遗爱好者'}</span>
            </div>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'rgba(255,255,255,0.68)' }}>{user.email}</div>
            <div style={{ marginTop: 10, fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'rgba(255,255,255,0.48)' }}>{joinedAt} 加入满小传</div>
          </div>
        </div>
      </section>

      <ProfileSettingsCard user={user} role={role} onUpdated={setUser} />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 22 }}>
        {[
          ['我的预约', bookingCount, '已提交的体验课预约'],
          ['每日打卡', 0, '连续记录非遗学习'],
          ['收藏赏物', 0, '珍藏喜欢的匠心作品'],
        ].map(([label, value, hint]) => (
          <div key={label} style={{ padding: '22px', borderRadius: 14, border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ marginBottom: 7, fontFamily: "'Noto Serif SC'", fontSize: 25, fontWeight: 750, color: 'var(--zhu)' }}>{value}</div>
            <div style={{ marginBottom: 4, fontFamily: "'Noto Serif SC'", fontSize: 15, color: 'var(--ink)' }}>{label}</div>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--text-light)' }}>{hint}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 22, padding: '26px 28px', borderRadius: 16, border: '1px solid var(--border)', background: 'white' }}>
        <h2 style={{ margin: '0 0 18px', fontFamily: "'Noto Serif SC'", fontSize: 19, color: 'var(--ink)' }}>我的非遗空间</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link to="/bookings" style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--mi)', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--qing)' }}>查看我的预约 →</Link>
          <Link to="/daily-check-in" style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--mi)', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--qing)' }}>开始今日打卡 →</Link>
          {role === 'artisan' && (
            <Link
              to="/artisan-studio"
              style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '46px 1fr auto', alignItems: 'center', gap: 14, padding: '17px 19px', borderRadius: 11, border: '1px solid rgba(196,62,62,0.16)', background: 'linear-gradient(100deg, rgba(196,62,62,0.07), rgba(44,95,109,0.05))' }}
            >
              <span style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: 9, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700 }}>匠</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ color: 'var(--ink)', fontFamily: "'Noto Serif SC'", fontSize: 15 }}>传承人桌面</strong>
                <small style={{ color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 10 }}>管理作品、发布新作并查看咨询与经营数据</small>
              </span>
              <b style={{ color: 'var(--zhu)', fontFamily: "'Noto Sans SC'", fontSize: 11, fontWeight: 500 }}>进入工作台 →</b>
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}