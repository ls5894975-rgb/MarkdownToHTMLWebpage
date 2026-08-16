import { corsHeaders, jsonResponse, requireUser } from '../_shared/http.ts'

type CopyRequest = {
  title?: string
  category?: string
  tags?: string
  rawStory?: string
  direction?: string
  tone?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: '仅支持 POST 请求。' }, 405)

  try {
    requireUser(req)
    const apiKey = Deno.env.get('DOUBAO_API_KEY')
    const model = Deno.env.get('DOUBAO_MODEL') || 'deepseek-v4-flash-ga-260731'
    if (!apiKey) return jsonResponse({ error: '尚未配置 DOUBAO_API_KEY。' }, 500)

    const body = await req.json() as CopyRequest
    const details = [
      `作品名称：${body.title?.trim() || '未填写'}`,
      `非遗品类：${body.category?.trim() || '未填写'}`,
      `标签：${body.tags?.trim() || '未填写'}`,
      `现有故事：${body.rawStory?.trim() || '未填写'}`,
      `文案风格：${body.tone?.trim() || '雅致自然'}`,
      `补充要求：${body.direction?.trim() || '无'}`,
    ].join('\n')

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.75,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content: '你是中国非遗作品文案编辑。语言真诚、有画面感，突出手工技艺与文化温度。只能使用用户提供的事实，禁止虚构奖项、年代、传承谱系、销量或大师身份。',
          },
          {
            role: 'user',
            content: `请依据下面信息写一段适合网页作品详情页的中文文案，约180至260字。直接输出正文，不要标题、序号或解释。\n\n${details}`,
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
    if (!text) return jsonResponse({ error: '模型没有返回可用文案，请重试。' }, 502)
    return jsonResponse({ text })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : '生成文案失败。' }, 400)
  }
})
