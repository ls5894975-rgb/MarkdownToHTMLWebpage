import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { CATEGORIES, WORKS } from '../data'
import { supabase } from '../lib/supabase'
import { getWorkKnowledge, getWorkQuestions } from '../lib/workKnowledge'
import WorkComments from '../components/WorkComments'
import './work-detail-responsive.css'

const DEFAULT_AI_QUESTIONS = [
  '这件作品最值得欣赏的细节是什么？',
  '它使用了哪些传统技法？',
  '日常应该如何保存和养护？',
]

type AiChatMessage = {
  role: 'user' | 'assistant'
  content: string
}
type Work = (typeof WORKS)[number]

function withWorkKnowledge(work: Work): Work {
  return {
    ...work,
    knowledge: getWorkKnowledge(work.category, work.title),
    aiQuestions: getWorkQuestions(work.category),
  }
}

const WORK_SELECT = `
  id, title, category_id, image_url, image_height, price_text,
  tags, likes_count, comments_count, description,
  knowledge, ai_questions, hotspots,
  artisan:artisans (
    id, name, title, category_id, bio, quote, avatar_url,
    cover_url, years_experience, work_count, follower_count
  )
`

function mapDatabaseWork(row: any, fallback: Work): Work {
  const artisan = row.artisan
  const category = row.category_id ?? fallback.category
  const title = row.title ?? fallback.title
  return {
    id: row.id,
    title,
    artisan: artisan ? {
      id: artisan.id,
      name: artisan.name,
      title: artisan.title,
      years: artisan.years_experience,
      works: artisan.work_count,
      fans: artisan.follower_count,
      quote: artisan.quote ?? '',
      avatar: artisan.avatar_url ?? '',
      cover: artisan.cover_url ?? '',
      category: artisan.category_id ?? '',
      links: {},
      bio: artisan.bio ?? '',
    } : fallback.artisan,
    category,
    img: row.image_url ?? fallback.img,
    imgH: row.image_height ?? fallback.imgH,
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    tags: row.tags ?? [],
    price: row.price_text ?? '面议',
    desc: row.description ?? '',
    knowledge: getWorkKnowledge(category, title),
    aiQuestions: getWorkQuestions(category),
    hotspots: Array.isArray(row.hotspots) && row.hotspots.length ? row.hotspots : fallback.hotspots,
  }
}

export default function WorkDetailPage() {
  const { id } = useParams()
  const initialWork = withWorkKnowledge(WORKS.find(w => w.id === id) || WORKS[0])
  const [work, setWork] = useState<Work>(initialWork)
  const [related, setRelated] = useState<Work[]>(() => WORKS.filter(w => w.id !== initialWork.id && w.category === initialWork.category).slice(0, 3).map(withWorkKnowledge))
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)
  const [openKnowledge, setOpenKnowledge] = useState<number | null>(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [liked, setLiked] = useState(false)
  const [collected, setCollected] = useState(false)

  useEffect(() => {
    let active = true
    const fallback = withWorkKnowledge(WORKS.find(item => item.id === id) || WORKS[0])

    setWork(fallback)
    setRelated(WORKS.filter(item => item.id !== fallback.id && item.category === fallback.category).slice(0, 3).map(withWorkKnowledge))
    setActiveHotspot(null)
    setOpenKnowledge(null)
    setAiDialogOpen(false)
    setAiInput('')
    setAiMessages([])
    setAiError('')

    const loadWork = async () => {
      const { data } = await supabase
        .from('works')
        .select(WORK_SELECT)
        .eq('id', id ?? fallback.id)
        .eq('status', 'published')
        .maybeSingle()

      if (!active || !data) return
      const databaseWork = mapDatabaseWork(data, fallback)
      setWork(databaseWork)

      const { data: relatedRows } = await supabase
        .from('works')
        .select(WORK_SELECT)
        .eq('status', 'published')
        .eq('category_id', databaseWork.category)
        .neq('id', databaseWork.id)
        .limit(3)

      if (!active || !relatedRows?.length) return
      setRelated(relatedRows.map(row => {
        const relatedFallback = WORKS.find(item => item.id === row.id) || fallback
        return mapDatabaseWork(row, relatedFallback)
      }))
    }

    void loadWork()
    return () => {
      active = false
    }
  }, [id])

  const askAI = async (questionOverride?: string) => {
    const question = (questionOverride ?? aiInput).trim()
    if (!question || aiLoading) return

    const greeting: AiChatMessage = {
      role: 'assistant',
      content: `你好，我是 AI 小传。你可以问我关于“${work.title}”的工艺、纹样寓意、鉴赏或养护问题。`,
    }
    const history = aiMessages.length > 0 ? aiMessages : [greeting]
    setAiDialogOpen(true)
    setAiMessages([...history, { role: 'user', content: question }])
    setAiInput('')
    setAiError('')
    setAiLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('doubao-guide', {
        body: {
          question,
          history,
          work: {
            title: work.title,
            category: work.category,
            description: work.desc,
            tags: work.tags,
            artisanName: work.artisan.name,
            artisanTitle: work.artisan.title,
            knowledge: work.knowledge,
          },
        },
      })
      if (error) throw error
      const answer = data?.text?.trim()
      if (!answer) throw new Error('AI 小传没有返回有效回答。')
      setAiMessages(current => [...current, { role: 'assistant', content: answer }])
    } catch (error) {
      const message = error instanceof Error ? error.message : '提问失败，请稍后重试。'
      setAiError(message)
      setAiMessages(current => [...current, { role: 'assistant', content: '抱歉，我暂时没有回答成功。请稍后再试，或换一个问题。' }])
    } finally {
      setAiLoading(false)
    }
  }

  const openAiDialog = () => {
    if (aiMessages.length === 0) {
      setAiMessages([{
        role: 'assistant',
        content: `你好，我是 AI 小传。你可以问我关于“${work.title}”的工艺、纹样寓意、鉴赏或养护问题。`,
      }])
    }
    setAiError('')
    setAiDialogOpen(true)
  }

  const suggestedQuestions = work.aiQuestions.length > 0 ? work.aiQuestions : DEFAULT_AI_QUESTIONS
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 24 }}>
        <Link to="/home" style={{ color: 'var(--text-light)' }}>首页</Link>
        {' / '}
        <Link to={`/category/${work.category}`} style={{ color: 'var(--text-light)' }}>{CATEGORIES.find(item => item.id === work.category)?.name ?? '非遗品类'}</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>{work.title}</span>
      </div>

      <div className="work-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }}>
        {/* Left: image + knowledge + AI + comments */}
        <div>
          {/* Main image with hotspots */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#e8e0d8', marginBottom: 32 }}>
            <img src={work.img} alt={work.title} style={{ width: '100%', maxHeight: 580, objectFit: 'cover', display: 'block' }} />
            {work.hotspots.map((hp, i) => (
              <div key={i}>
                <button
                  onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
                  style={{
                    position: 'absolute', left: `${hp.x}%`, top: `${hp.y}%`,
                    width: 28, height: 28, borderRadius: '50%',
                    background: activeHotspot === i ? 'var(--zhu)' : 'rgba(255,255,255,0.9)',
                    border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transform: 'translate(-50%, -50%)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "'Noto Serif SC'", fontWeight: 700, color: activeHotspot === i ? 'white' : 'var(--zhu)' }}>◉</span>
                </button>
                {activeHotspot === i && (
                  <div style={{
                    position: 'absolute', left: `${hp.x}%`, top: `calc(${hp.y}% + 20px)`,
                    transform: 'translateX(-50%)',
                    background: 'var(--ink)', color: 'white', borderRadius: 8, padding: '10px 14px',
                    minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 10,
                  }}>
                    <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{hp.label}</div>
                    <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{hp.desc}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Knowledge capsules */}
          {work.knowledge.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
                📚 这件作品里的非遗知识
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {work.knowledge.map((k, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenKnowledge(openKnowledge === i ? null : i)}
                      style={{
                        width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '2px 10px', borderRadius: 5, background: 'rgba(196,62,62,0.1)', color: 'var(--zhu)', fontSize: 12, fontFamily: "'Noto Sans SC'", fontWeight: 600 }}>{k.tag}</span>
                        <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{k.title}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)', transform: openKnowledge === i ? 'rotate(180deg)' : '', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                    </button>
                    {openKnowledge === i && (
                      <div style={{ padding: '0 16px 16px' }}>
                        <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.9, margin: 0 }}>{k.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 小传对话入口 */}
          <div className="work-ai-entry">
            <div className="work-ai-entry-mark">问</div>
            <div>
              <span>AI 小传 · 非遗随身讲解</span>
              <h3>想了解这件作品？直接问我</h3>
              <p>工艺难点、纹样寓意、收藏养护，都可以继续追问。</p>
            </div>
            <button type="button" onClick={openAiDialog}>打开对话框 →</button>
          </div>
          {/* Comments */}
          <WorkComments workId={work.id} />
        </div>

        {/* Right: info + CTA */}
        <div className="work-detail-sidebar" style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '24px 24px 20px' }}>
              <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.3 }}>{work.title}</h1>
              <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, margin: '0 0 20px' }}>{work.desc}</p>

              {/* Artisan */}
              <Link to={`/artisan/${work.artisan.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--mi)', borderRadius: 10, marginBottom: 20, border: '1px solid var(--border)' }}>
                <img src={work.artisan.avatar} alt={work.artisan.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{work.artisan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{work.artisan.title}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)' }}>查看主页</div>
              </Link>

              {/* Interactions */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                <button onClick={() => setLiked(!liked)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'var(--zhu)' : 'none'} stroke={liked ? 'var(--zhu)' : 'var(--text-light)'} strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC'", color: liked ? 'var(--zhu)' : 'var(--text-light)' }}>{liked ? work.likes + 1 : work.likes}</span>
                </button>
                <button onClick={() => setCollected(!collected)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={collected ? 'var(--qing)' : 'none'} stroke={collected ? 'var(--qing)' : 'var(--text-light)'} strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC'", color: collected ? 'var(--qing)' : 'var(--text-light)' }}>收藏</span>
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC'", color: 'var(--text-light)' }}>分享</span>
                </button>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 26, fontWeight: 700, color: 'var(--zhu)' }}>{work.price}</span>
                {work.price === '面议' && <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>· 根据定制需求报价</span>}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to={`/consult/${work.id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 10, background: 'var(--zhu)', color: 'white',
                fontFamily: "'Noto Sans SC'", fontSize: 15, fontWeight: 700,
              }}>
                🎨 咨询定制
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link to={`/book/${work.artisan.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px', borderRadius: 8, background: 'var(--mi)', border: '1px solid var(--border)',
                  fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text)',
                }}>
                  🏺 预约体验
                </Link>
              </div>
            </div>
          </div>

          {/* Related works */}
          {related.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>同类作品</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {related.map(r => (
                  <Link key={r.id} to={`/work/${r.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={r.img} alt={r.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', background: '#e8e0d8' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{r.artisan.name} · ♡{r.likes.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {aiDialogOpen && (
        <div className="work-ai-backdrop" role="presentation" onClick={() => setAiDialogOpen(false)}>
          <section className="work-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="work-ai-dialog-title" onClick={event => event.stopPropagation()}>
            <header>
              <div className="work-ai-dialog-avatar">传</div>
              <div>
                <span>满小传 · AI 非遗讲解</span>
                <h2 id="work-ai-dialog-title">问问 AI 小传</h2>
                <small>正在讲解：{work.title}</small>
              </div>
              <button type="button" onClick={() => setAiDialogOpen(false)} aria-label="关闭 AI 小传">×</button>
            </header>

            <div className="work-ai-messages" aria-live="polite">
              {aiMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`work-ai-message ${message.role}`}>
                  {message.role === 'assistant' && <i>传</i>}
                  <p>{message.content}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="work-ai-message assistant thinking">
                  <i>传</i><p><span /><span /><span /> AI 小传正在查阅作品资料…</p>
                </div>
              )}
            </div>

            <form className="work-ai-composer" onSubmit={event => { event.preventDefault(); void askAI() }}>
              {aiError && <div className="work-ai-error" role="alert">{aiError}</div>}
              <div>
                <textarea
                  value={aiInput}
                  onChange={event => setAiInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void askAI()
                    }
                  }}
                  placeholder="输入你想了解的问题…"
                  aria-label="输入问题"
                  maxLength={500}
                />
                <button type="submit" disabled={!aiInput.trim() || aiLoading}>发送</button>
              </div>
              <section className="work-ai-suggestions" aria-label="推荐问题">
                <span>可以这样问</span>
                <div>
                  {suggestedQuestions.slice(0, 4).map(question => (
                    <button key={question} type="button" disabled={aiLoading} onClick={() => void askAI(question)}>{question}</button>
                  ))}
                </div>
              </section>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
