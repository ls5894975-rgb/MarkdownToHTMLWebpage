import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ARTISANS } from '../data'
import { supabase } from '../lib/supabase'
import { ARTISAN_DETAILS, DEFAULT_ARTISAN_DETAIL } from './ArtisanPage'

type BookingArtisan = {
  id: string
  name: string
  title: string
  avatar: string
  cover: string
}

type ExperienceCourse = {
  id: string
  title: string
  classDate: string
  startTime: string
  location: string
  price: number
  capacity: number
}

const TIME_SLOTS = ['上午 09:30', '下午 14:00']

function getNextDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export default function BookPage() {
  const { id } = useParams()
  const artisanId = id ?? 'zhang-wei'
  const navigate = useNavigate()
  const localArtisan = ARTISANS.find(item => item.id === artisanId) ?? ARTISANS[0]
  const [artisan, setArtisan] = useState<BookingArtisan>({
    id: localArtisan.id,
    name: localArtisan.name,
    title: localArtisan.title,
    avatar: localArtisan.avatar,
    cover: localArtisan.cover,
  })
  const [courseImage, setCourseImage] = useState(localArtisan.cover)
  const [courses, setCourses] = useState<ExperienceCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [coursesLoaded, setCoursesLoaded] = useState(false)
  const [date, setDate] = useState(getNextDate)
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1])
  const [people, setPeople] = useState(1)
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const detail = ARTISAN_DETAILS[artisan.id] ?? DEFAULT_ARTISAN_DETAIL
  const selectedCourse = courses.find(item => item.id === selectedCourseId)
  const courseTitle = selectedCourse?.title ?? detail.course.title
  const coursePrice = selectedCourse?.price ?? detail.course.price
  const courseSchedule = selectedCourse
    ? selectedCourse.classDate + ' · ' + selectedCourse.startTime + ' · ' + selectedCourse.location
    : detail.course.schedule
  const courseDescription = selectedCourse
    ? '由' + artisan.name + '带领完成传统工艺体验，课程包含材料认识、基础技法示范与独立制作。'
    : detail.course.description
  const total = useMemo(() => coursePrice * people, [coursePrice, people])

  useEffect(() => {
    let active = true

    const loadBooking = async () => {
      setCourses([])
      setSelectedCourseId('')
      setCoursesLoaded(false)
      const { data } = await supabase
        .from('artisans')
        .select('id, name, title, avatar_url, cover_url')
        .eq('id', artisanId)
        .maybeSingle()

      if (!active || !data) {
        if (active) setCoursesLoaded(true)
        return
      }
      setArtisan({
        id: data.id,
        name: data.name,
        title: data.title,
        avatar: data.avatar_url ?? '',
        cover: data.cover_url ?? '',
      })
      setCourseImage(data.cover_url ?? '')

      const { data: work } = await supabase
        .from('works')
        .select('image_url')
        .eq('artisan_id', data.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (active && work?.image_url) setCourseImage(work.image_url)

      const { data: courseRows } = await supabase
        .from('experience_courses')
        .select('id, title, class_date, start_time, location, price, capacity')
        .eq('artisan_id', data.id)
        .eq('status', 'published')
        .order('class_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(8)

      if (!active) return
      const realCourses: ExperienceCourse[] = (courseRows ?? []).map(course => ({
        id: course.id,
        title: course.title,
        classDate: course.class_date,
        startTime: String(course.start_time).slice(0, 5),
        location: course.location,
        price: course.price,
        capacity: course.capacity,
      }))
      setCourses(realCourses)
      setCoursesLoaded(true)
      if (realCourses[0]) {
        setSelectedCourseId(realCourses[0].id)
        setDate(realCourses[0].classDate)
        const hour = Number(realCourses[0].startTime.slice(0, 2))
        setTimeSlot((hour < 12 ? '上午 ' : '下午 ') + realCourses[0].startTime)
      }
    }

    void loadBooking()
    return () => {
      active = false
    }
  }, [artisanId])

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault()
    if (!date || !contact.trim()) {
      setError('请选择日期并填写手机号或微信号。')
      return
    }

    setSubmitting(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setSubmitting(false)
      setError('登录状态已失效，请重新登录后预约。')
      return
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: authData.user.id,
      artisan_id: artisan.id,
      course_id: selectedCourse?.id ?? null,
      course_title: courseTitle,
      booking_date: date,
      time_slot: timeSlot,
      participants: people,
      price_per_person: coursePrice,
      contact: contact.trim(),
      note: note.trim() || null,
    })

    setSubmitting(false)
    if (insertError) {
      const tableMissing = insertError.code === 'PGRST205' || insertError.code === '42P01'
      setError(tableMissing ? '预约数据库尚未初始化，请先运行 bookings.sql。' : `预约提交失败：${insertError.message}`)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main style={{ minHeight: 'calc(100vh - 72px)', display: 'grid', placeItems: 'center', padding: 32 }}>
        <section style={{ width: '100%', maxWidth: 520, padding: '48px 40px', textAlign: 'center', background: 'white', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 18px 50px rgba(46,35,27,0.08)' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(44,95,109,0.1)', color: 'var(--qing)', fontSize: 30 }}>✓</div>
          <h1 style={{ margin: '0 0 12px', fontFamily: "'Noto Serif SC'", fontSize: 26, color: 'var(--ink)' }}>预约信息已确认</h1>
          <p style={{ margin: '0 0 8px', fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8 }}>
            {courseTitle} · {date} · {timeSlot} · {people}人
          </p>
          <p style={{ margin: '0 0 28px', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8 }}>
            工坊会通过你留下的联系方式确认名额与付款方式。
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link to={`/artisan/${artisan.id}`} style={{ padding: '11px 24px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-mid)', fontFamily: "'Noto Sans SC'", fontSize: 14 }}>返回匠人主页</Link>
            <Link to="/home" style={{ padding: '11px 24px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600 }}>继续浏览</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '36px 32px 88px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 22, padding: 0, border: 'none', background: 'none', color: 'var(--text-mid)', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13 }}>← 返回匠人主页</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)', gap: 28, alignItems: 'start' }}>
        <section>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 16, background: '#e9e2da' }}>
            <img src={courseImage || artisan.cover} alt={courseTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,17,13,0.7), transparent 58%)' }} />
            <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, color: 'white' }}>
              <div style={{ marginBottom: 7, fontFamily: "'Noto Sans SC'", fontSize: 12, opacity: 0.82 }}>{courseSchedule}</div>
              <h1 style={{ margin: 0, fontFamily: "'Noto Serif SC'", fontSize: 25, fontWeight: 800 }}>{courseTitle}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 4px' }}>
            <img src={artisan.avatar} alt={artisan.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{artisan.name}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--text-light)' }}>{artisan.title}</div>
            </div>
          </div>

          <div style={{ padding: '22px 24px', background: 'white', border: '1px solid var(--border)', borderRadius: 14 }}>
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Noto Serif SC'", fontSize: 18, color: 'var(--ink)' }}>体验内容</h2>
            <p style={{ margin: 0, fontFamily: "'Noto Sans SC'", fontSize: 13, lineHeight: 1.9, color: 'var(--text-mid)' }}>{courseDescription}</p>
          </div>
        </section>

        <form onSubmit={submitBooking} style={{ padding: '26px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 36px rgba(46,35,27,0.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontFamily: "'Noto Serif SC'", fontSize: 22, color: 'var(--ink)' }}>预约体验</h2>

          {courses.length > 0 && (
            <label style={{ display: 'block', marginBottom: 20 }}>
              <span style={{ display: 'block', marginBottom: 9, fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>选择体验课</span>
              <select value={selectedCourseId} onChange={event => {
                const next = courses.find(item => item.id === event.target.value)
                setSelectedCourseId(event.target.value)
                if (next) {
                  setDate(next.classDate)
                  const hour = Number(next.startTime.slice(0, 2))
                  setTimeSlot((hour < 12 ? '上午 ' : '下午 ') + next.startTime)
                }
              }} style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--mi)', color: 'var(--text)', fontFamily: "'Noto Sans SC'", fontSize: 13 }}>
                {courses.map(course => <option key={course.id} value={course.id}>{course.title + ' · ' + course.classDate}</option>)}
              </select>
            </label>
          )}

          <label style={{ display: 'block', marginBottom: 20 }}>
            <span style={{ display: 'block', marginBottom: 9, fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>选择日期</span>
            <input type="date" min={getNextDate()} value={date} disabled={Boolean(selectedCourse)} onChange={event => setDate(event.target.value)} style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--mi)', color: 'var(--text)', fontFamily: "'Noto Sans SC'", fontSize: 13 }} />
          </label>

          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 9, fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>选择时段</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(selectedCourse ? [timeSlot] : TIME_SLOTS).map(slot => (
                <button type="button" key={slot} onClick={() => setTimeSlot(slot)} style={{ padding: '10px 8px', borderRadius: 8, border: timeSlot === slot ? '1px solid var(--zhu)' : '1px solid var(--border)', background: timeSlot === slot ? 'rgba(196,62,62,0.07)' : 'white', color: timeSlot === slot ? 'var(--zhu)' : 'var(--text-mid)', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13 }}>{slot}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>体验人数</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button type="button" aria-label="减少人数" onClick={() => setPeople(value => Math.max(1, value - 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>−</button>
              <span style={{ minWidth: 20, textAlign: 'center', fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>{people}</span>
              <button type="button" aria-label="增加人数" onClick={() => setPeople(value => Math.min(6, value + 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>＋</button>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', marginBottom: 9, fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>联系方式</span>
            <input value={contact} onChange={event => setContact(event.target.value)} placeholder="手机号或微信号" style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--mi)', color: 'var(--text)', fontFamily: "'Noto Sans SC'", fontSize: 13 }} />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', marginBottom: 9, fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>备注 <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>（选填）</span></span>
            <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} placeholder="儿童同行、材料过敏等情况" style={{ width: '100%', padding: '11px 12px', resize: 'vertical', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--mi)', color: 'var(--text)', fontFamily: "'Noto Sans SC'", fontSize: 13, lineHeight: 1.7 }} />
          </label>

          {error && <div role="alert" style={{ marginBottom: 14, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--zhu)' }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 18, marginBottom: 16, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)' }}>合计 · {people}人</span>
            <strong style={{ fontFamily: "'Noto Serif SC'", fontSize: 25, color: 'var(--zhu)' }}>¥{total}</strong>
          </div>

          <button disabled={submitting} type="submit" style={{ width: '100%', padding: '13px', border: 'none', borderRadius: 9, background: contact.trim() && !submitting ? 'var(--zhu)' : 'var(--text-light)', color: 'white', cursor: contact.trim() && !submitting ? 'pointer' : 'default', fontFamily: "'Noto Sans SC'", fontSize: 15, fontWeight: 700 }}>{submitting ? '正在提交…' : '立即预约'}</button>
          <p style={{ margin: '10px 0 0', textAlign: 'center', fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--text-light)' }}>提交预约不立即扣款，工坊确认后再付款</p>
        </form>
      </div>
    </main>
  )
}