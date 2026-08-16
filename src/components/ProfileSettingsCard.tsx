import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import './profile-settings.css'

type Props = {
  user: User
  role: string
  onUpdated: (user: User) => void
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export default function ProfileSettingsCard({ user, role, onUpdated }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const name = user.user_metadata?.display_name
      ?? user.user_metadata?.full_name
      ?? user.email?.split('@')[0]
      ?? '满小传用户'
    setDisplayName(name)
    setAvatarUrl(user.user_metadata?.avatar_url ?? '')
  }, [user])

  useEffect(() => () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const chooseAvatar = (file?: File) => {
    setError('')
    setMessage('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请选择 JPG、PNG 或 WebP 图片。')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('头像不能超过 5MB。')
      return
    }
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    const name = displayName.trim()
    if (name.length < 2 || name.length > 20) {
      setError('用户名请输入 2—20 个字符。')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      let nextAvatarUrl = avatarUrl

      if (avatarFile) {
        const extension = (avatarFile.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg')
        const avatarPath = `${user.id}/avatar.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(avatarPath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
            cacheControl: '3600',
          })

        if (uploadError) throw new Error(`头像上传失败：${uploadError.message}`)
        const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath)
        nextAvatarUrl = `${data.publicUrl}?v=${Date.now()}`
      }

      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { display_name: name, avatar_url: nextAvatarUrl },
      })
      if (updateError) throw updateError

      if (role === 'artisan') {
        const artisanUpdate: { name: string; avatar_url?: string } = { name }
        if (nextAvatarUrl) artisanUpdate.avatar_url = nextAvatarUrl
        const { error: artisanError } = await supabase
          .from('artisans')
          .update(artisanUpdate)
          .eq('profile_id', user.id)
        if (artisanError) throw artisanError
      }

      if (updateData.user) onUpdated(updateData.user)
      setAvatarUrl(nextAvatarUrl)
      setAvatarFile(null)
      setPreviewUrl('')
      setMessage('个人资料已保存。')
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { displayName: name, avatarUrl: nextAvatarUrl } }))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败，请稍后再试。')
    } finally {
      setSaving(false)
    }
  }

  const shownAvatar = previewUrl || avatarUrl

  return (
    <section style={{ marginTop: 22, padding: '24px 28px', borderRadius: 16, border: '1px solid var(--border)', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 20 }}>
        <div>
          <span style={{ display: 'block', marginBottom: 5, color: 'var(--zhu)', fontFamily: "'Noto Sans SC'", fontSize: 10, letterSpacing: '0.14em' }}>个人资料</span>
          <h2 style={{ margin: 0, color: 'var(--ink)', fontFamily: "'Noto Serif SC'", fontSize: 20 }}>设置头像与用户名</h2>
        </div>
        <span style={{ padding: '5px 10px', borderRadius: 999, background: 'var(--mi)', color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 10 }}>
          {role === 'artisan' ? '同步到传承人主页' : '爱好者资料'}
        </span>
      </div>

      <div className="profile-settings-grid" style={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', gap: 26, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="上传新头像"
            style={{ width: 92, height: 92, overflow: 'hidden', padding: 0, border: '3px solid white', borderRadius: '50%', outline: '1px solid rgba(158,63,45,0.24)', background: 'linear-gradient(145deg, var(--zhu), #8f2727)', boxShadow: '0 8px 22px rgba(72,44,32,0.15)', cursor: 'pointer' }}
          >
            {shownAvatar
              ? <img src={shownAvatar} alt="头像预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontFamily: "'Noto Serif SC'", fontSize: 30, fontWeight: 800 }}>{displayName.slice(0, 1).toUpperCase()}</span>}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => chooseAvatar(event.target.files?.[0])} />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: 'block', margin: '9px auto 0', padding: 0, border: 0, background: 'transparent', color: 'var(--zhu)', cursor: 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 11 }}>更换头像</button>
        </div>

        <div>
          <label htmlFor="profile-display-name" style={{ display: 'block', marginBottom: 7, color: 'var(--text-mid)', fontFamily: "'Noto Sans SC'", fontSize: 12 }}>用户名</label>
          <div className="profile-settings-input-row" style={{ display: 'flex', gap: 10 }}>
            <input
              id="profile-display-name"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              maxLength={20}
              placeholder="输入新的用户名"
              style={{ minWidth: 0, flex: 1, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 9, outline: 'none', background: '#fcfbf9', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontSize: 13 }}
            />
            <button type="button" disabled={saving} onClick={() => void saveProfile()} style={{ minWidth: 106, padding: '0 18px', border: 0, borderRadius: 9, background: saving ? '#b9ada5' : 'var(--zhu)', color: 'white', cursor: saving ? 'wait' : 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 650 }}>
              {saving ? '保存中…' : '保存资料'}
            </button>
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", fontSize: 10, lineHeight: 1.6 }}>支持 JPG、PNG、WebP，文件不超过 5MB。用户名将在顶部导航和个人主页显示。</p>
          {error && <p role="alert" style={{ margin: '8px 0 0', color: '#b33b32', fontFamily: "'Noto Sans SC'", fontSize: 11 }}>{error}</p>}
          {message && <p role="status" style={{ margin: '8px 0 0', color: '#2f755b', fontFamily: "'Noto Sans SC'", fontSize: 11 }}>{message}</p>}
        </div>
      </div>
    </section>
  )
}
