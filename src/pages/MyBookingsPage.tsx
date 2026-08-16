import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'

type BookingRow = {
  id: string
  artisan_id: string
  course_title: string
  booking_date: string
  time_slot: string
  participants: number
  total_amount: number
  contact: string
  note: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  artisan: {
    name: string
    title: string
    avatar_url: string | null
  } | null
}

const STATUS_META = {
  pending: { label: '待确认', color: '#9A6B27', background: 'rgba(154,107,39,0.1)' },
  confirmed: { label: '已确认', color: '#2C5F6D', background: 'rgba(44,95,109,0.1)' },
  completed: { label: '已完成', color: '#4B6B45', background: 'rgba(75,107,69,0.1)' },
  cancelled: { label: '已取消', color: '#8A8178', background: 'rgba(138,129,120,0.12)' },
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true

    const loadBookings = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        navigate('/login', { replace: true })
        return
      }

      const { data, error: queryError } = await supabase
        .from('bookings')
        .select(`
          id,
          artisan_id,
          course_title,
          booking_date,
          time_slot,
          participants,
          total_amount,
          contact,
          note,
          status,
          created_at,
          artisan:artisans (name, title, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (!active) return
      if (queryError) {
        setError(`预约记录加载失败：${queryError.message}`)
      } else {
        setBookings((data ?? []) as BookingRow[])
      }
      setLoading(false)
    }

    void loadBookings()
    return () => {
      active = false
    }
  }, [navigate])

  const confirmCancellation = async () => {
    if (!cancelTarget) return

    setCancelling(true)
    setActionError('')
    const { data, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', cancelTarget.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    setCancelling(false)
    if (updateError) {
      setActionError(`取消失败：${updateError.message}`)
      return
    }
    if (!data) {
      setActionError('这条预约已被处理，请刷新页面查看最新状态。')
      return
    }

    setBookings(current => current.map(booking => (
      booking.id === cancelTarget.id ? { ...booking, status: 'cancelled' } : booking
    )))
    setCancelTarget(null)
  }

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <div style={{ marginBottom: 8, fontFamily: "'Noto Sans SC'", fontSize: 12, letterSpacing: '0.12em', color: 'var(--zhu)' }}>MY EXPERIENCES</div>
          <h1 style={{ margin: 0, fontFamily: "'Noto Serif SC'", fontSize: 30, color: 'var(--ink)' }}>我的预约</h1>
        </div>
        {!loading && !error && <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-light)' }}>共 {bookings.length} 条记录</span>}
      </div>

      {loading && (
        <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text-light)' }}>正在加载预约记录…</div>
      )}

      {error && (
        <div role="alert" style={{ padding: '18px 20px', borderRadius: 12, border: '1px solid rgba(196,62,62,0.2)', background: 'rgba(196,62,62,0.05)', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--zhu)' }}>{error}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <section style={{ padding: '64px 32px', textAlign: 'center', borderRadius: 16, border: '1px solid var(--border)', background: 'white' }}>
          <div style={{ marginBottom: 16, fontSize: 38 }}>🏺</div>
          <h2 style={{ margin: '0 0 10px', fontFamily: "'Noto Serif SC'", fontSize: 21, color: 'var(--ink)' }}>还没有体验课预约</h2>
          <p style={{ margin: '0 0 24px', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-light)' }}>去匠人主页挑选一门喜欢的非遗体验课吧。</p>
          <Link to="/home" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14 }}>浏览匠人作品</Link>
        </section>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(booking => {
            const status = STATUS_META[booking.status]
            return (
              <article key={booking.id} style={{ padding: '22px 24px', borderRadius: 15, border: '1px solid var(--border)', background: 'white', boxShadow: '0 8px 28px rgba(46,35,27,0.045)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <img src={booking.artisan?.avatar_url ?? ''} alt={booking.artisan?.name ?? '授课匠人'} style={{ width: 58, height: 58, flexShrink: 0, objectFit: 'cover', borderRadius: '50%', background: '#e8e0d8' }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 5 }}>
                      <h2 style={{ margin: 0, fontFamily: "'Noto Serif SC'", fontSize: 19, color: 'var(--ink)' }}>{booking.course_title}</h2>
                      <span style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 999, color: status.color, background: status.background, fontFamily: "'Noto Sans SC'", fontSize: 11, fontWeight: 600 }}>{status.label}</span>
                    </div>
                    <div style={{ marginBottom: 15, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text-light)' }}>{booking.artisan?.name} · {booking.artisan?.title}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr', gap: 14, padding: '14px 16px', borderRadius: 10, background: 'var(--mi)' }}>
                      {[
                        ['体验日期', formatDate(booking.booking_date)],
                        ['体验时段', booking.time_slot],
                        ['体验人数', `${booking.participants}人`],
                        ['预约金额', `¥${booking.total_amount}`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div style={{ marginBottom: 4, fontFamily: "'Noto Sans SC'", fontSize: 10, color: 'var(--text-light)' }}>{label}</div>
                          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {booking.note && <p style={{ margin: '12px 0 0', fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text-mid)' }}>备注：{booking.note}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 12 }}>
                      {booking.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('')
                            setCancelTarget(booking)
                          }}
                          style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text-light)' }}
                        >
                          取消预约
                        </button>
                      )}
                      <Link to={`/artisan/${booking.artisan_id}`} style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--qing)' }}>查看匠人主页 →</Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {cancelTarget && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(28,22,18,0.46)', backdropFilter: 'blur(4px)' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" style={{ width: '100%', maxWidth: 430, padding: '30px', borderRadius: 16, background: 'white', boxShadow: '0 24px 70px rgba(28,22,18,0.24)' }}>
            <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', marginBottom: 18, borderRadius: '50%', background: 'rgba(154,107,39,0.1)', color: '#9A6B27', fontSize: 22 }}>!</div>
            <h2 id="cancel-booking-title" style={{ margin: '0 0 10px', fontFamily: "'Noto Serif SC'", fontSize: 22, color: 'var(--ink)' }}>确定取消预约？</h2>
            <p style={{ margin: '0 0 8px', fontFamily: "'Noto Sans SC'", fontSize: 13, lineHeight: 1.8, color: 'var(--text-mid)' }}>{cancelTarget.course_title} · {formatDate(cancelTarget.booking_date)} · {cancelTarget.time_slot}</p>
            <p style={{ margin: '0 0 20px', fontFamily: "'Noto Sans SC'", fontSize: 12, lineHeight: 1.7, color: 'var(--text-light)' }}>取消后该记录会保留，但不能自行恢复。如需重新预约，请返回匠人主页提交新的预约。</p>
            {actionError && <div role="alert" style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: 'rgba(196,62,62,0.06)', fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--zhu)' }}>{actionError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" disabled={cancelling} onClick={() => setCancelTarget(null)} style={{ padding: '11px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', color: 'var(--text-mid)', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13 }}>暂不取消</button>
              <button type="button" disabled={cancelling} onClick={confirmCancellation} style={{ padding: '11px', borderRadius: 8, border: 'none', background: 'var(--zhu)', color: 'white', cursor: cancelling ? 'default' : 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600 }}>{cancelling ? '正在取消…' : '确认取消'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}