import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'

type Role = 'fan' | 'artisan'
type AuthMode = 'signIn' | 'signUp'

const HERO_VIDEO = 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/intro/heritage-intro-111.mp4'
const HERO_POSTER = 'https://onhoobgsagmzjdwopocn.supabase.co/storage/v1/object/public/site-media/intro/heritage-intro-111-poster.jpg'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn')
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showIntro, setShowIntro] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const navigate = useNavigate()

  const isSignUp = mode === 'signUp'
  const canSubmit = email.trim().includes('@') && password.length >= 6 && (!isSignUp || role !== null)

  useEffect(() => {
    if (!showIntro) return
    const introTimer = window.setTimeout(() => setShowIntro(false), 7000)
    return () => window.clearTimeout(introTimer)
  }, [showIntro])

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('error_code') === 'otp_expired') {
      setMessage('验证链接已过期，请输入邮箱后重新发送确认邮件。')
      setIsError(true)
      window.history.replaceState({}, document.title, '/login')
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/home', { replace: true })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/home', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setIsError(false)
  }

  async function handleResend() {
    if (!email.trim().includes('@')) {
      setMessage('请先输入需要验证的邮箱。')
      setIsError(true)
      return
    }

    setIsResending(true)
    setMessage('')
    setIsError(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login` },
      })
      if (error) throw error
      setMessage('新的确认邮件已发送，请使用最新邮件中的链接。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '发送失败，请稍后重试。')
      setIsError(true)
    } finally {
      setIsResending(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsError(false)

    if (!email.trim() || password.length < 6) {
      setMessage('请输入有效邮箱，密码至少需要 6 位。')
      setIsError(true)
      return
    }

    if (isSignUp && !role) {
      setMessage('请先选择你的身份。')
      setIsError(true)
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { role },
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
          },
        })

        if (error) throw error

        if (data.session) {
          navigate('/home')
          return
        }

        setMessage('注册成功，请打开验证邮件完成邮箱确认。')
        setPassword('')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error
      navigate('/home')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败，请稍后重试。')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="editorial-auth"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(47,19,8,0.12), rgba(47,19,8,0.52)), url(${HERO_POSTER})` }}
    >
      <style>{`
        .editorial-auth {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          background-color: #7f321b;
          background-position: center;
          background-size: cover;
          color: #f7f2e9;
          isolation: isolate;
        }
        .editorial-hero-video {
          position: absolute;
          inset: 0;
          z-index: -2;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
        }
        .editorial-auth::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(180deg, rgba(20,8,3,0.1), rgba(20,8,3,0.32));
        }
        .editorial-intro {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #f2efe8;
          color: #17120f;
          animation: editorial-intro-exit 7s both;
        }
        .editorial-intro-film {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          background: #5d2b1d;
        }
        .editorial-intro-film::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(31, 12, 5, 0.08), rgba(31, 12, 5, 0.28));
          pointer-events: none;
        }
        .editorial-intro-film video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1.035);
          animation: editorial-film-breathe 8s ease-out both;
        }
        .editorial-curtain {
          position: absolute;
          right: 0;
          left: 0;
          z-index: 3;
          height: calc(50% + 1px);
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 34%, rgba(112, 87, 65, 0.055), transparent 31%),
            linear-gradient(90deg, #f4f1ea, #efebe3 52%, #f5f2eb);
          color: #211915;
          will-change: transform;
        }
        .editorial-curtain-top {
          top: 0;
          animation: editorial-curtain-up 6.55s cubic-bezier(.76, 0, .24, 1) both;
        }
        .editorial-curtain-bottom {
          bottom: 0;
          animation: editorial-curtain-down 6.55s cubic-bezier(.76, 0, .24, 1) both;
        }
        .editorial-curtain-copy {
          position: absolute;
          left: 50%;
          width: min(900px, 88vw);
          text-align: center;
          transform: translateX(-50%);
          animation: editorial-letter-in 1.25s cubic-bezier(.22, 1, .36, 1) both;
        }
        .editorial-curtain-top .editorial-curtain-copy {
          bottom: clamp(18px, 3.2vh, 38px);
        }
        .editorial-curtain-bottom .editorial-curtain-copy {
          top: clamp(16px, 2.8vh, 34px);
        }
        .editorial-curtain-kicker {
          margin: 0 0 clamp(7px, 1.1vh, 13px);
          padding-left: 0.56em;
          color: rgba(33, 25, 21, 0.54);
          font: 500 clamp(10px, 1vw, 13px)/1 'Noto Serif SC', 'Songti SC', serif;
          letter-spacing: 0.56em;
        }
        .editorial-curtain-word {
          display: block;
          margin: 0;
          font-family: 'STXingkai', '华文行楷', 'FZKai-Z03', 'KaiTi', '楷体', cursive;
          font-size: clamp(78px, 11.8vw, 164px);
          font-weight: 400;
          letter-spacing: 0.04em;
          line-height: 0.72;
          text-shadow: 0 10px 30px rgba(31, 18, 12, 0.1);
        }
        .editorial-curtain-top .editorial-curtain-word {
          margin-left: -0.42em;
          transform: rotate(-1.5deg);
        }
        .editorial-curtain-bottom .editorial-curtain-word {
          margin-left: 0.44em;
          color: #8e382d;
          transform: rotate(1.1deg);
        }
        .editorial-curtain-note {
          margin: clamp(22px, 3vh, 34px) 0 0 8em;
          color: rgba(33, 25, 21, 0.52);
          font: 400 clamp(10px, 0.95vw, 12px)/1.5 'Noto Serif SC', 'Songti SC', serif;
          letter-spacing: 0.34em;
        }
        .editorial-curtain-seal {
          position: absolute;
          top: clamp(86px, 14vh, 138px);
          left: calc(50% + min(28vw, 330px));
          display: grid;
          width: clamp(42px, 4.2vw, 58px);
          aspect-ratio: 1;
          place-items: center;
          border: 2px solid rgba(149, 48, 38, 0.82);
          color: #97372d;
          font: 500 clamp(12px, 1.3vw, 17px)/1.05 'STXingkai', '华文行楷', 'KaiTi', serif;
          letter-spacing: 0.08em;
          text-align: center;
          transform: rotate(6deg);
          animation: editorial-seal-in 0.72s 0.72s both;
        }
        .editorial-curtain-seal::after {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(149, 48, 38, 0.5);
        }        .editorial-skip {
          position: absolute;
          top: 24px;
          right: 28px;
          z-index: 5;
          border: 0;
          background: transparent;
          color: #17120f;
          font: 600 10px/1 'Noto Sans SC', sans-serif;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .editorial-progress {
          position: absolute;
          right: 4vw;
          bottom: 26px;
          left: 4vw;
          z-index: 4;
          height: 1px;
          background: rgba(23,18,15,0.2);
        }
        .editorial-progress::after {
          content: '';
          display: block;
          width: 100%;
          height: 100%;
          background: #17120f;
          transform-origin: left;
          animation: editorial-progress 6.8s linear both;
        }
        .editorial-topbar {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 30px;
          animation: editorial-rise 0.9s 0.12s both;
        }
        .editorial-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Noto Serif SC', serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .editorial-brand-mark {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.08);
          font-size: 17px;
          backdrop-filter: blur(12px);
        }
        .editorial-back {
          border: 1px solid rgba(255,255,255,0.42);
          padding: 10px 18px;
          background: rgba(255,255,255,0.08);
          color: #fffaf1;
          font: 500 11px/1 'Noto Sans SC', sans-serif;
          letter-spacing: 0.12em;
          backdrop-filter: blur(12px);
        }
        .editorial-stage {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(390px, 470px);
          min-height: 100svh;
          gap: clamp(36px, 7vw, 120px);
          align-items: center;
          padding: 92px clamp(24px, 6vw, 104px) 42px;
        }
        .editorial-copy {
          align-self: end;
          max-width: 760px;
          padding-bottom: clamp(34px, 7vh, 86px);
          animation: editorial-rise 1s 0.16s both;
        }
        .editorial-kicker {
          margin: 0 0 18px;
          font: 600 10px/1.2 'Noto Sans SC', sans-serif;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }
        .editorial-headline {
          margin: 0;
          font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
          font-size: clamp(66px, 9vw, 142px);
          font-weight: 400;
          letter-spacing: -0.06em;
          line-height: 0.74;
          text-transform: uppercase;
          text-shadow: 0 8px 40px rgba(24,8,2,0.22);
        }
        .editorial-headline em {
          display: inline-block;
          margin: 0 0.1em;
          font-weight: 400;
          text-transform: lowercase;
        }
        .editorial-copy-note {
          max-width: 390px;
          margin: 28px 0 0;
          color: rgba(255,250,241,0.72);
          font: 400 13px/1.8 'Noto Sans SC', sans-serif;
          letter-spacing: 0.06em;
        }
        .editorial-panel {
          position: relative;
          width: 100%;
          max-height: calc(100svh - 128px);
          overflow: auto;
          padding: clamp(30px, 4vw, 52px);
          background: rgba(247,243,235,0.94);
          color: #261a14;
          box-shadow: 0 28px 80px rgba(38,13,4,0.28);
          backdrop-filter: blur(20px);
          animation: editorial-panel-in 1.1s 0.28s both;
        }
        .editorial-panel-label {
          margin: 0 0 12px;
          color: #9a583f;
          font: 700 9px/1 'Noto Sans SC', sans-serif;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }
        .editorial-panel h1 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
          font-size: clamp(36px, 4vw, 54px);
          font-weight: 400;
          letter-spacing: -0.045em;
          line-height: 0.95;
        }
        .editorial-panel-subtitle {
          margin: 12px 0 28px;
          color: #8b7c71;
          font-size: 12px;
          letter-spacing: 0.08em;
        }
        .editorial-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(38,26,20,0.16);
        }
        .editorial-tab {
          position: relative;
          border: 0;
          padding: 11px 0;
          background: transparent;
          color: #a59588;
          font: 600 12px/1 'Noto Sans SC', sans-serif;
          letter-spacing: 0.15em;
        }
        .editorial-tab.active { color: #9e3f2d; }
        .editorial-tab.active::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          background: #9e3f2d;
        }
        .editorial-roles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }
        .editorial-role {
          border: 1px solid rgba(38,26,20,0.14);
          padding: 13px;
          background: transparent;
          color: #35261f;
          text-align: left;
          transition: border-color .2s, background .2s;
        }
        .editorial-role.active {
          border-color: #a54834;
          background: rgba(165,72,52,0.07);
        }
        .editorial-role strong {
          display: block;
          margin-bottom: 3px;
          font: 700 12px/1.2 'Noto Serif SC', serif;
        }
        .editorial-role span { color: #9b8c80; font-size: 10px; }
        .editorial-field { display: block; margin-bottom: 18px; }
        .editorial-field span {
          display: block;
          margin-bottom: 3px;
          color: #8f7d70;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .editorial-field input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(38,26,20,0.22);
          border-radius: 0;
          outline: 0;
          padding: 10px 0 12px;
          background: transparent;
          color: #261a14;
          font: 400 14px/1.3 'Noto Sans SC', sans-serif;
        }
        .editorial-field input:focus { border-bottom-color: #9e3f2d; }
        .editorial-message {
          margin: 0 0 14px;
          font-size: 11px;
          line-height: 1.6;
        }
        .editorial-submit {
          width: 100%;
          border: 0;
          padding: 14px 18px;
          background: #7f301f;
          color: #fffaf1;
          font: 700 12px/1 'Noto Sans SC', sans-serif;
          letter-spacing: 0.16em;
          transition: transform .2s, background .2s;
        }
        .editorial-submit:not(:disabled):hover { transform: translateY(-2px); background: #632315; }
        .editorial-submit:disabled { cursor: not-allowed; background: #b8aaa0; }
        .editorial-resend {
          width: 100%;
          border: 0;
          padding: 12px 0 0;
          background: transparent;
          color: #8f4a3d;
          font: 500 11px/1.4 'Noto Sans SC', sans-serif;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .editorial-resend:disabled { cursor: not-allowed; color: #a99c93; }
        .editorial-guest {
          width: 100%;
          border: 0;
          padding: 18px 0 0;
          background: transparent;
          color: #817064;
          font: 500 11px/1.4 'Noto Sans SC', sans-serif;
          text-decoration: underline;
          text-underline-offset: 5px;
        }
        @keyframes editorial-letter-in {
          from { opacity: 0; filter: blur(10px); transform: translate(-50%, 18px); }
          to { opacity: 1; filter: blur(0); transform: translate(-50%, 0); }
        }
        @keyframes editorial-seal-in {
          from { opacity: 0; filter: blur(4px); transform: scale(1.5) rotate(12deg); }
          to { opacity: 0.9; filter: blur(0); transform: scale(1) rotate(6deg); }
        }
        @keyframes editorial-curtain-up {
          0%, 30% { transform: translateY(0); }
          100% { transform: translateY(-101%); }
        }
        @keyframes editorial-curtain-down {
          0%, 30% { transform: translateY(0); }
          100% { transform: translateY(101%); }
        }
        @keyframes editorial-film-breathe {
          from { transform: scale(1.035); }
          to { transform: scale(1.105); }
        }        @keyframes editorial-intro-exit {
          0%, 87% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
        @keyframes editorial-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes editorial-rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes editorial-panel-in {
          from { opacity: 0; transform: translateX(48px); clip-path: inset(0 0 0 100%); }
          to { opacity: 1; transform: translateX(0); clip-path: inset(0); }
        }
        @media (max-width: 860px) {
          .editorial-auth { overflow: auto; }
          .editorial-topbar { padding: 18px; }
          .editorial-brand { font-size: 16px; }
          .editorial-brand-mark { width: 34px; height: 34px; }
          .editorial-stage {
            grid-template-columns: 1fr;
            min-height: 100svh;
            padding: 90px 16px 20px;
          }
          .editorial-copy {
            align-self: auto;
            padding: 8vh 4px 0;
          }
          .editorial-headline { font-size: clamp(52px, 17vw, 90px); }
          .editorial-copy-note { display: none; }
          .editorial-panel {
            align-self: end;
            max-height: none;
            padding: 30px 24px;
          }
        }
        @media (max-width: 520px) {
          .editorial-curtain-word { font-size: clamp(68px, 23vw, 104px); }
          .editorial-curtain-top .editorial-curtain-word { margin-left: -0.22em; }
          .editorial-curtain-bottom .editorial-curtain-word { margin-left: 0.22em; }
          .editorial-curtain-note { margin-left: 2em; letter-spacing: 0.2em; }
          .editorial-curtain-seal { top: 116px; left: auto; right: 22px; }
          .editorial-back { padding: 9px 11px; font-size: 9px; }
          .editorial-kicker { margin-bottom: 10px; }
          .editorial-copy { padding-top: 3vh; }
          .editorial-headline { font-size: 50px; }
          .editorial-panel h1 { font-size: 38px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .editorial-auth *, .editorial-auth *::before, .editorial-auth *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <video
        className="editorial-hero-video"
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {showIntro && (
        <div className="editorial-intro" aria-hidden="true">
          <button className="editorial-skip" type="button" onClick={() => setShowIntro(false)}>跳过</button>
          <div className="editorial-intro-film">
            <video
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="editorial-curtain editorial-curtain-top">
            <div className="editorial-curtain-copy">
              <p className="editorial-curtain-kicker">中国非遗</p>
              <h1 className="editorial-curtain-word">一脉</h1>
            </div>
          </div>
          <div className="editorial-curtain editorial-curtain-bottom">
            <div className="editorial-curtain-copy">
              <p className="editorial-curtain-word">承千年</p>
              <p className="editorial-curtain-note">见手艺 · 见匠心 · 见山河</p>
            </div>
            <div className="editorial-curtain-seal">守<br />艺</div>
          </div>          <div className="editorial-progress" />
        </div>
      )}

      <header className="editorial-topbar">
        <div className="editorial-brand"><span className="editorial-brand-mark">满</span><span>满小传</span></div>
        <button className="editorial-back" type="button" onClick={() => navigate('/home')}>返回首页</button>
      </header>

      <section className="editorial-stage">
        <div className="editorial-copy">
          <p className="editorial-kicker">Intangible cultural heritage · China</p>
          <h2 className="editorial-headline">Craft<br /><em>becomes</em><br />legacy.</h2>
          <p className="editorial-copy-note">连接非遗传承人与爱好者，让每一件匠心作品在当代继续生长。</p>
        </div>

        <div className="editorial-panel">
          <p className="editorial-panel-label">Member access · 会员入口</p>
          <h1>{isSignUp ? '开始收藏匠心' : '欢迎再次归来'}</h1>
          <p className="editorial-panel-subtitle">{isSignUp ? '选择身份，加入非遗社区' : '使用邮箱和密码进入你的收藏'}</p>

          <div className="editorial-tabs">
            <button type="button" className={`editorial-tab ${mode === 'signIn' ? 'active' : ''}`} onClick={() => switchMode('signIn')}>登录</button>
            <button type="button" className={`editorial-tab ${mode === 'signUp' ? 'active' : ''}`} onClick={() => switchMode('signUp')}>注册</button>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="editorial-roles">
                <button type="button" className={`editorial-role ${role === 'fan' ? 'active' : ''}`} onClick={() => setRole('fan')}>
                  <strong>爱好者</strong><span>浏览作品 · 咨询定制</span>
                </button>
                <button type="button" className={`editorial-role ${role === 'artisan' ? 'active' : ''}`} onClick={() => setRole('artisan')}>
                  <strong>传承人</strong><span>入驻平台 · 发布作品</span>
                </button>
              </div>
            )}

            <label className="editorial-field">
              <span>Email · 邮箱</span>
              <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required />
            </label>
            <label className="editorial-field">
              <span>Password · 密码</span>
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="至少 6 位密码" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required />
            </label>

            {message && <p className="editorial-message" aria-live="polite" style={{ color: isError ? '#9e3f2d' : '#2d7a4f' }}>{message}</p>}

            <button className="editorial-submit" type="submit" disabled={!canSubmit || isLoading || isResending}>
              {isLoading ? '处理中…' : isSignUp ? '创建账号' : '进入满小传'}
            </button>
            <button className="editorial-resend" type="button" onClick={handleResend} disabled={isLoading || isResending}>
              {isResending ? '正在发送…' : '验证链接失效？重新发送确认邮件'}
            </button>
          </form>

          <button className="editorial-guest" type="button" onClick={() => navigate('/home')}>游客模式，先看看作品 →</button>
        </div>
      </section>
    </main>
  )
}
