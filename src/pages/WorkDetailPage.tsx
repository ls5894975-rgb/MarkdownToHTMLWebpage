import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { WORKS } from '../data'

const AI_ANSWERS: Record<string, string> = {
  '这件作品的工艺难点在哪？': '最大难点在于"双面绣"技法——在同一底料两面同时绣出形态不同的图案，且两面均整洁无痕。盘金绣部分需将金线按纹路盘曲，再以细线逐针订固，既要保持金线张力，又要确保图案流畅，极考验手眼配合。张蔚老师为此件作品耗时逾半年。',
  '这个纹样有什么寓意？': '缠枝莲纹以莲花为主题，枝蔓缠绕、连绵不断，象征"生生不息、吉祥绵延"。莲花本身在中国文化中有"出淤泥而不染"的君子寓意，与猫的灵动形象相映成趣，整体寓意高洁、长寿与吉祥。',
  '适合作为什么礼物？': '非常适合作为高端商务礼品、结婚贺礼或收藏馈赠。其独特的双面绣工艺赋予作品极高艺术价值与收藏价值，搭配作品数字身份证，更是一份有文化温度的珍贵馈赠。价格面议，可根据需求定制尺寸和图案。',
}

export default function WorkDetailPage() {
  const { id } = useParams()
  const work = WORKS.find(w => w.id === id) || WORKS[0]
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)
  const [openKnowledge, setOpenKnowledge] = useState<number | null>(null)
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [collected, setCollected] = useState(false)

  const askAI = (q: string) => {
    setAiLoading(true)
    setAiAnswer(null)
    setTimeout(() => {
      setAiAnswer(AI_ANSWERS[q] || '这是一件精美的非遗作品，承载着传承人数十年的匠心积淀。')
      setAiLoading(false)
    }, 800)
  }

  const related = WORKS.filter(w => w.id !== work.id && w.category === work.category).slice(0, 3)

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--text-light)' }}>首页</Link>
        {' / '}
        <Link to={`/category/${work.category}`} style={{ color: 'var(--text-light)' }}>苏绣</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>{work.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }}>
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

          {/* AI Q&A */}
          {work.aiQuestions.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
                🤖 问问 AI 小传
              </h3>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: aiAnswer || aiLoading ? 16 : 0 }}>
                  {work.aiQuestions.map(q => (
                    <button key={q} onClick={() => askAI(q)} style={{
                      padding: '10px 14px', borderRadius: 7, border: '1px solid var(--border)',
                      background: 'var(--mi)', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text)',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--zhu-light)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
                    >
                      <span style={{ color: 'var(--text-light)' }}>▸</span> {q}
                    </button>
                  ))}
                </div>
                {aiLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--zhu)', opacity: 0.6, animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>AI 小传正在思考…</span>
                  </div>
                )}
                {aiAnswer && (
                  <div style={{ background: 'rgba(196,62,62,0.04)', border: '1px solid rgba(196,62,62,0.1)', borderRadius: 8, padding: '14px 16px' }}>
                    <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text)', lineHeight: 1.9, margin: 0 }}>{aiAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
              💬 评论区（{work.comments}条）
            </h3>
            {[
              { user: '莫小云', text: '张老师的双面绣真的太绝了，两面图案完全不同，正面白猫活灵活现！', time: '2天前' },
              { user: '王一尘', text: '盘金绣的工艺细节看得我目瞪口呆，这得多少年的功力才能绣出这种效果？', time: '5天前' },
              { user: '李雨桐', text: '已经预约了定制，期待自己的那一件！', time: '1周前' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: ['#C43E3E', '#2C5F6D', '#5A4A2A'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 12, fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>{c.user[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.user}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{c.time}</span>
                  </div>
                  <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: info + CTA */}
        <div style={{ position: 'sticky', top: 80 }}>
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
                <Link to="/book" style={{
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
    </main>
  )
}
