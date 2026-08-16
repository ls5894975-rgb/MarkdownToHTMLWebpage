import { corsHeaders, jsonResponse, requireUser } from '../_shared/http.ts'

type ChatMessage = {
  role?: 'user' | 'assistant'
  content?: string
}

type GuideRequest = {
  question?: string
  history?: ChatMessage[]
  work?: {
    title?: string
    category?: string
    description?: string
    tags?: string[]
    artisanName?: string
    artisanTitle?: string
    knowledge?: Array<{ tag?: string; title?: string; body?: string }>
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: '仅支持 POST 请求。' }, 405)

  try {
    requireUser(req)
    const apiKey = Deno.env.get('DOUBAO_API_KEY')
    const model = Deno.env.get('DOUBAO_MODEL') || 'deepseek-v4-flash-ga-260731'
    if (!apiKey) return jsonResponse({ error: '尚未配置 DOUBAO_API_KEY。' }, 500)

    const body = await req.json() as GuideRequest
    const question = body.question?.trim()
    if (!question) return jsonResponse({ error: '请输入想了解的问题。' }, 400)
    if (question.length > 500) return jsonResponse({ error: '问题请控制在 500 字以内。' }, 400)

    const work = body.work ?? {}
    const knowledge = (work.knowledge ?? [])
      .slice(0, 8)
      .map(item => `【${item.tag || '非遗知识'}】${item.title || ''}：${item.body || ''}`)
      .join('\n')

    const context = [
      `作品名称：${work.title || '未提供'}`,
      `非遗品类：${work.category || '未提供'}`,
      `作品介绍：${work.description || '未提供'}`,
      `作品标签：${Array.isArray(work.tags) ? work.tags.join('、') : '未提供'}`,
      `传承人：${work.artisanName || '未提供'}`,
      `传承人身份：${work.artisanTitle || '未提供'}`,
      knowledge ? `已知非遗知识：\n${knowledge}` : '已知非遗知识：未提供',
    ].join('\n')

    const history = (body.history ?? [])
      .filter(message => (message.role === 'user' || message.role === 'assistant') && message.content?.trim())
      .slice(-6)
      .map(message => ({ role: message.role!, content: message.content!.trim().slice(0, 1000) }))

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
        max_tokens: 850,
        messages: [
          {
            role: 'system',
            content: '你是“AI 小传”，负责为非遗作品展示页提供自然、专业、有历史纵深的中文讲解。先直接回答用户的问题，再结合该非遗品类的传统技法、审美特点和历史发展补充背景。页面没有给出的个体作品细节，不要虚构为确定事实；可以用“一般而言”“传统工艺中”“历史上这一品类常见”等自然表达区分通用知识。禁止使用“当前页面资料无法确认”“资料不足”之类机械提示，也不要编造奖项、价格、传承谱系或人物经历。回答控制在150至300字，层次清楚，适合普通爱好者阅读。',
          },
          {
            role: 'user',
            content: `以下是当前页面可确认的资料：\n\n${context}`,
          },
          ...history,
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      const message = result?.error?.message || result?.message || `模型请求失败（${response.status}）`
      return jsonResponse({ error: message }, response.status)
    }

    const text = result?.choices?.[0]?.message?.content?.trim()
    if (!text) return jsonResponse({ error: 'AI 小传没有返回有效回答，请重试。' }, 502)
    return jsonResponse({ text })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'AI 小传回答失败。' }, 400)
  }
})
