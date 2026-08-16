import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type WorkComment = {
  id: string
  user_id: string
  user_name: string
  avatar_url: string | null
  content: string
  created_at: string
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`
  return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function WorkComments({ workId }: { workId: string }) {
  const [comments, setComments] = useState<WorkComment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadComments = async () => {
      setLoading(true)
      setError('')
      const { data, error: loadError } = await supabase
        .from('work_comments')
        .select('id, user_id, user_name, avatar_url, content, created_at')
        .eq('work_id', workId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!active) return
      setLoading(false)
      if (loadError) {
        const tableMissing = loadError.code === 'PGRST205' || loadError.code === '42P01'
        setError(tableMissing ? '评论数据库尚未初始化，请先运行 work-comments.sql。' : `评论读取失败：${loadError.message}`)
        return
      }
      setComments((data ?? []) as WorkComment[])
    }

    void loadComments()
    return () => { active = false }
  }, [workId])

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    const text = content.trim()
    if (!text || submitting) return

    setSubmitting(true)
    setError('')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setError('请登录后再发表评论。')
      setSubmitting(false)
      return
    }

    const user = authData.user
    const userName = user.user_metadata?.display_name
      ?? user.user_metadata?.full_name
      ?? user.email?.split('@')[0]
      ?? '非遗爱好者'
    const avatarUrl = user.user_metadata?.avatar_url ?? null
    const { data, error: insertError } = await supabase
      .from('work_comments')
      .insert({
        work_id: workId,
        user_id: user.id,
        user_name: userName,
        avatar_url: avatarUrl,
        content: text,
      })
      .select('id, user_id, user_name, avatar_url, content, created_at')
      .single()

    setSubmitting(false)
    if (insertError) {
      const tableMissing = insertError.code === 'PGRST205' || insertError.code === '42P01'
      setError(tableMissing ? '评论数据库尚未初始化，请先运行 work-comments.sql。' : `评论提交失败：${insertError.message}`)
      return
    }

    setComments(current => [data as WorkComment, ...current])
    setContent('')
  }

  return (
    <section>
      <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
        💬 评论区（{comments.length}条）
      </h3>

      <form onSubmit={submitComment} style={{ marginBottom: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 12, background: 'white' }}>
        <textarea
          value={content}
          onChange={event => setContent(event.target.value)}
          rows={3}
          maxLength={500}
          aria-label="填写评论"
          placeholder="说说你对这件作品的感受，或向传承人提出问题…"
          style={{ width: '100%', padding: 0, resize: 'vertical', border: 0, outline: 'none', background: 'transparent', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontSize: 13, lineHeight: 1.75 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 10 }}>{content.length}/500</span>
          <button type="submit" disabled={!content.trim() || submitting} style={{ padding: '8px 18px', border: 0, borderRadius: 8, background: content.trim() && !submitting ? 'var(--zhu)' : '#b8aea7', color: 'white', cursor: content.trim() && !submitting ? 'pointer' : 'default', fontFamily: "'Noto Sans SC'", fontSize: 12, fontWeight: 650 }}>
            {submitting ? '发表中…' : '发表评论'}
          </button>
        </div>
      </form>

      {error && <p role="alert" style={{ margin: '8px 0', color: '#b33b32', fontFamily: "'Noto Sans SC'", fontSize: 11 }}>{error}</p>}
      {loading && <p style={{ padding: '18px 0', color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 12 }}>正在加载评论…</p>}
      {!loading && !error && comments.length === 0 && (
        <div style={{ padding: '22px 18px', textAlign: 'center', borderRadius: 10, background: 'rgba(242,237,230,0.55)', color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 12 }}>还没有评论，来留下第一条真实感受吧。</div>
      )}

      {comments.map((comment, index) => (
        <article key={comment.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0, borderRadius: '50%', background: ['#C43E3E', '#2C5F6D', '#5A4A2A'][index % 3] }}>
            {comment.avatar_url
              ? <img src={comment.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontSize: 12, fontFamily: "'Noto Serif SC'", fontWeight: 700 }}>{comment.user_name.slice(0, 1)}</span>}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <strong style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{comment.user_name}</strong>
              <time dateTime={comment.created_at} style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{relativeTime(comment.created_at)}</time>
            </div>
            <p style={{ overflowWrap: 'anywhere', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{comment.content}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
