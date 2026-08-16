import { useMemo, useState } from 'react'
import { Link } from 'react-router'

const STORAGE_KEY = 'manxiaozhuan:daily-check-in:dates:v1'
const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']
const BADGES = [
  { name: '初见匠心', days: 1, mark: '初', note: '留下第一枚传承足迹' },
  { name: '七日知器', days: 7, mark: '七', note: '连续认识七日非遗作品' },
  { name: '识器达人', days: 30, mark: '识', note: '累计赏物三十日' },
  { name: '器道传人', days: 100, mark: '传', note: '让关注成为长久习惯' },
]

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readCheckedDates() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
  } catch {
    return []
  }
}

function streakFrom(dates: string[], today: Date) {
  const checked = new Set(dates)
  const cursor = new Date(today)
  if (!checked.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (checked.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function DailyCheckInPage() {
  const today = useMemo(() => new Date(), [])
  const todayKey = dateKey(today)
  const [checkedDates, setCheckedDates] = useState<string[]>(readCheckedDates)
  const [stamping, setStamping] = useState(false)
  const checkedSet = new Set(checkedDates)
  const checkedToday = checkedSet.has(todayKey)
  const streak = streakFrom(checkedDates, today)
  const monthPrefix = todayKey.slice(0, 7)
  const monthCount = checkedDates.filter(item => item.startsWith(monthPrefix)).length

  const weekDates = useMemo(() => {
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    return WEEK_LABELS.map((label, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return { label, key: dateKey(date), day: date.getDate() }
    })
  }, [today])

  const monthCells = useMemo(() => {
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const offset = (firstDay.getDay() + 6) % 7
    const dayCount = new Date(year, month + 1, 0).getDate()
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: dayCount }, (_, index) => {
        const day = index + 1
        const date = new Date(year, month, day)
        return { day, key: dateKey(date) }
      }),
    ]
  }, [today])

  const nextBadge = BADGES.find(badge => checkedDates.length < badge.days) ?? BADGES[BADGES.length - 1]
  const badgeProgress = Math.min(100, (checkedDates.length / nextBadge.days) * 100)
  const monthLabel = `${today.getFullYear()}年${today.getMonth() + 1}月`

  const checkIn = () => {
    if (checkedToday || stamping) return
    setStamping(true)
    window.setTimeout(() => {
      const nextDates = [...new Set([...checkedDates, todayKey])].sort()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDates))
      setCheckedDates(nextDates)
      setStamping(false)
    }, 700)
  }

  return (
    <main className="daily-checkin-page">
      <section className="daily-checkin-hero">
        <div className="daily-checkin-heading">
          <div>DAILY RITUAL · 传承足迹</div>
          <h1>每日打卡</h1>
          <p>一日识一物，一印记一程。</p>
          <Link to="/daily-treasure">返回今日赏物 →</Link>
        </div>

        <button
          type="button"
          className={`daily-checkin-seal${checkedToday ? ' is-checked' : ''}${stamping ? ' is-stamping' : ''}`}
          onClick={checkIn}
          disabled={checkedToday || stamping}
          aria-label={checkedToday ? '今日已经打卡' : '盖下今日印记'}
        >
          <span>{checkedToday ? '已' : '印'}</span>
          <strong>{stamping ? '落印中' : checkedToday ? '今日已打卡' : '盖下今日印记'}</strong>
        </button>

        <div className="daily-checkin-stats" aria-live="polite">
          <div><strong>{streak}</strong><span>连续天数</span></div>
          <i />
          <div><strong>{monthCount}</strong><span>本月足迹</span></div>
          <p>{checkedToday ? '今日印记已收入你的传承手册' : '今天还差一枚印记'}</p>
        </div>
      </section>

      <section className="daily-checkin-body">
        <div className="daily-checkin-main">
          <header className="daily-checkin-section-title">
            <div><span>本周足迹</span><h2>七日识器</h2></div>
            <p>{weekDates[0].key.replaceAll('-', '.')} — {weekDates[6].key.replaceAll('-', '.')}</p>
          </header>

          <div className="daily-checkin-week">
            {weekDates.map(item => {
              const done = checkedSet.has(item.key)
              const isToday = item.key === todayKey
              return (
                <div key={item.key} className={`${done ? 'is-done' : ''}${isToday ? ' is-today' : ''}`}>
                  <span>周{item.label}</span>
                  <strong>{done ? '印' : item.day}</strong>
                  <small>{isToday ? '今日' : done ? '已记' : '未记'}</small>
                </div>
              )
            })}
          </div>

          <header className="daily-checkin-section-title daily-checkin-calendar-title">
            <div><span>月度手册</span><h2>{monthLabel}</h2></div>
            <p>本月已留下 {monthCount} 枚印记</p>
          </header>

          <div className="daily-checkin-calendar-head">
            {WEEK_LABELS.map(label => <span key={label}>周{label}</span>)}
          </div>
          <div className="daily-checkin-calendar">
            {monthCells.map((cell, index) => {
              if (!cell) return <span key={`empty-${index}`} className="is-empty" />
              const done = checkedSet.has(cell.key)
              const isToday = cell.key === todayKey
              const future = cell.key > todayKey
              return (
                <div key={cell.key} className={`${done ? 'is-done' : ''}${isToday ? ' is-today' : ''}${future ? ' is-future' : ''}`}>
                  <span>{cell.day}</span>
                  {done && <b>印</b>}
                  {isToday && !done && <small>今</small>}
                </div>
              )
            })}
          </div>
        </div>

        <aside className="daily-checkin-aside">
          <div className="daily-checkin-aside-heading">
            <span>MILESTONES</span>
            <h2>里程碑徽章</h2>
            <p>每一次赏物，都让非遗被多看见一点。</p>
          </div>

          <div className="daily-checkin-badges">
            {BADGES.map(badge => {
              const unlocked = checkedDates.length >= badge.days
              return (
                <div key={badge.name} className={unlocked ? 'is-unlocked' : ''}>
                  <i>{badge.mark}</i>
                  <div><strong>{badge.name}</strong><span>{badge.note}</span></div>
                  <b>{unlocked ? '已解锁' : `${badge.days} 天`}</b>
                </div>
              )
            })}
          </div>

          <div className="daily-checkin-progress">
            <div><span>下一枚：{nextBadge.name}</span><b>{checkedDates.length} / {nextBadge.days}</b></div>
            <i><span style={{ width: `${badgeProgress}%` }} /></i>
          </div>

          <div className="daily-checkin-rule">
            <span>打卡说明</span>
            <p>每天完成一次赏物后即可盖印。同一天只记录一次，记录保存在当前浏览器中。</p>
          </div>
        </aside>
      </section>
    </main>
  )
}