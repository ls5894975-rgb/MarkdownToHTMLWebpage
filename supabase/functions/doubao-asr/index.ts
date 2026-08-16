import { corsHeaders, jsonResponse, requireUser } from '../_shared/http.ts'

const dialectCodes: Record<string, string> = {
  cant: 'cant',
  sc: 'sc',
  zh_shanghai: 'zh_shanghai',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: '仅支持 POST 请求。' }, 405)

  try {
    requireUser(req)
    const apiKey = Deno.env.get('DOUBAO_SPEECH_API_KEY')
    if (!apiKey) return jsonResponse({ error: '尚未配置 DOUBAO_SPEECH_API_KEY。' }, 500)

    const { audioBase64, dialect = 'auto' } = await req.json()
    if (typeof audioBase64 !== 'string' || audioBase64.length < 100) {
      return jsonResponse({ error: '没有收到有效录音，请重新录制。' }, 400)
    }

    const request: Record<string, unknown> = {
      model_name: 'bigmodel',
      enable_itn: true,
      enable_punc: true,
    }
    if (dialectCodes[dialect]) request.language = dialectCodes[dialect]

    const response = await fetch('https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Resource-Id': 'volc.bigasr.auc_turbo',
        'X-Api-Request-Id': crypto.randomUUID(),
        'X-Api-Sequence': '-1',
      },
      body: JSON.stringify({
        user: { uid: crypto.randomUUID() },
        audio: { data: audioBase64 },
        request,
      }),
    })

    const statusCode = response.headers.get('X-Api-Status-Code')
    const statusMessage = response.headers.get('X-Api-Message')
    const result = await response.json().catch(() => ({}))
    if (!response.ok || (statusCode && statusCode !== '20000000')) {
      return jsonResponse({
        error: statusMessage || result?.message || `语音识别请求失败（${statusCode || response.status}）`,
      }, response.ok ? 422 : response.status)
    }

    const text = result?.result?.text?.trim()
      || result?.result?.utterances?.map((item: { text?: string }) => item.text || '').join('').trim()
      || ''
    if (!text) return jsonResponse({ error: '没有识别到清晰语音，请靠近麦克风重试。' }, 422)
    return jsonResponse({ text })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : '语音识别失败。' }, 400)
  }
})
