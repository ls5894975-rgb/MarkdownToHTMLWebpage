import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router'
import { ARTISANS, WORKS } from '../data'
import { supabase } from '../lib/supabase'

const TABS = ['作品', '简介', '体验课']

type Artisan = (typeof ARTISANS)[number]
type ArtisanWork = { id: string; title: string; img: string; likes: number }

export type ArtisanDetail = {
  specialties: string
  honor: string
  studio: string
  course: {
    schedule: string
    title: string
    description: string
    price: number
    rating: number
    participants: number
  }
}

export const ARTISAN_DETAILS: Record<string, ArtisanDetail> = {
  'chen-ruyao': {
    specialties: '天青釉配制、支钉烧造、开片控制',
    honor: '汝瓷烧制技艺传承成果展优秀作品',
    studio: '河南省汝州市汝瓷小镇',
    course: {
      schedule: '每周六 14:00 · 汝州汝瓷工坊',
      title: '汝瓷天青釉小盏体验课',
      description: '跟随陈汝瑶老师认识汝瓷胎土与天青釉，完成修坯、施釉等步骤。作品由工坊统一烧制，完成后寄送到家。',
      price: 298,
      rating: 4.9,
      participants: 126,
    },
  },
  'gao-fenglan': {
    specialties: '套色剪纸、阴阳刻、叙事长卷',
    honor: '民间剪纸艺术展优秀传承作品',
    studio: '陕西省延安市宝塔区剪纸工坊',
    course: {
      schedule: '每周日 10:00 · 延安剪纸工坊',
      title: '吉祥窗花剪纸体验课',
      description: '从折纸、起稿到阴阳刻，由高凤兰老师带领完成一幅吉祥窗花。零基础可参加，课程包含纸张、剪具与装裱材料。',
      price: 98,
      rating: 4.9,
      participants: 238,
    },
  },
  'li-musen': {
    specialties: '浮雕、镂雕、人物山水雕刻',
    honor: '浙江省木雕精品展金奖',
    studio: '浙江省东阳市木雕小镇',
    course: {
      schedule: '每周六 09:30 · 东阳木雕工坊',
      title: '东阳木雕入门体验课',
      description: '认识木料纹理和常用刻刀，在李木森老师指导下练习线刻与浅浮雕，完成一枚可带走的木雕小挂件。',
      price: 228,
      rating: 4.8,
      participants: 112,
    },
  },
  'lin-zhixia': {
    specialties: '植物染、扎染、蓝印花布',
    honor: '青年非遗创新设计奖',
    studio: '江苏省南通市蓝印花布工坊',
    course: {
      schedule: '每周日 13:30 · 南通织染工坊',
      title: '草木蓝染方巾体验课',
      description: '从植物染料辨识、扎结防染到入缸氧化，跟随林知夏完成一方独一无二的蓝染方巾，感受草木色彩的层次变化。',
      price: 168,
      rating: 4.9,
      participants: 176,
    },
  },
  'wang-qisheng': {
    specialties: '犀皮漆、螺钿镶嵌、描金',
    honor: '传统髹漆技艺精品展金奖',
    studio: '福建省福州市鼓楼区大漆工坊',
    course: {
      schedule: '每周六 13:30 · 福州大漆工坊',
      title: '螺钿漆艺杯垫体验课',
      description: '在王漆生老师指导下了解天然大漆的髹饰流程，完成螺钿选片、构图与镶嵌，制作一枚漆艺杯垫。',
      price: 268,
      rating: 4.9,
      participants: 94,
    },
  },
  'wu-qingtao': {
    specialties: '柴烧、绞胎、茶器拉坯',
    honor: '青年陶艺邀请展优秀作品',
    studio: '浙江省龙泉市青瓷工坊',
    course: {
      schedule: '每周日 14:00 · 龙泉青瓷工坊',
      title: '手拉坯茶杯体验课',
      description: '跟随吴青陶老师认识陶土、练习定中心与拉坯成形，亲手制作一只茶杯。工坊负责修坯、上釉和烧制，并在完成后寄送。',
      price: 198,
      rating: 4.8,
      participants: 153,
    },
  },
  'zhang-wei': {
    specialties: '双面绣、盘金绣、散套绣',
    honor: '江苏省工艺美术精品展金奖',
    studio: '江苏省苏州市姑苏区平江路',
    course: {
      schedule: '每周日 10:00 · 苏州姑苏区工坊',
      title: '苏绣入门体验课',
      description: '在张蔚老师带领下学习劈丝、穿针与基础针法，完成一件专属刺绣小品。适合零基础爱好者，材料工具由工坊提供。',
      price: 158,
      rating: 4.8,
      participants: 194,
    },
  },
  'zhou-minghe': {
    specialties: '錾刻、掐丝、铜胎成形',
    honor: '传统金工艺术精品展金奖',
    studio: '江苏省南京市秦淮区金工坊',
    course: {
      schedule: '每周六 14:00 · 南京秦淮金工坊',
      title: '传统錾刻铜牌体验课',
      description: '认识錾子、锤具与铜材，在周鸣鹤老师指导下完成拓稿、走线和纹样錾刻，制作一枚专属铜牌。',
      price: 238,
      rating: 4.9,
      participants: 87,
    },
  },
}

export const DEFAULT_ARTISAN_DETAIL: ArtisanDetail = {
  specialties: '传统手工技艺、材料研究、当代设计',
  honor: '非遗传承与创新作品展入选',
  studio: '线下工坊 · 预约后告知',
  course: {
    schedule: '每周末 · 线下工坊',
    title: '传统手工艺入门体验课',
    description: '跟随匠人认识传统材料与基本工具，体验核心制作步骤，并完成一件可以带走的入门作品。材料工具由工坊提供。',
    price: 168,
    rating: 4.8,
    participants: 60,
  },
}

export default function ArtisanPage() {
  const { id } = useParams()
  const initialArtisan = ARTISANS.find(item => item.id === id) || ARTISANS[0]
  const [artisan, setArtisan] = useState<Artisan>(initialArtisan)
  const [works, setWorks] = useState<ArtisanWork[]>(() => WORKS
    .filter(work => work.artisan.id === initialArtisan.id)
    .map(work => ({ id: work.id, title: work.title, img: work.img, likes: work.likes })))
  const [tab, setTab] = useState('作品')
  const [followed, setFollowed] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [coverSaving, setCoverSaving] = useState(false)
  const [coverMessage, setCoverMessage] = useState('')
  const detail = ARTISAN_DETAILS[artisan.id] ?? DEFAULT_ARTISAN_DETAIL
  const representativeWorks = works.length > 0
    ? works.slice(0, 2).map(work => `《${work.title}》`).join('、')
    : '作品正在整理中'

  useEffect(() => {
    let active = true
    const fallback = ARTISANS.find(item => item.id === id) || ARTISANS[0]

    setArtisan(fallback)
    setWorks(WORKS
      .filter(work => work.artisan.id === fallback.id)
      .map(work => ({ id: work.id, title: work.title, img: work.img, likes: work.likes })))

    const loadArtisan = async () => {
      const { data } = await supabase
        .from('artisans')
        .select('id, profile_id, category_id, name, title, bio, quote, avatar_url, cover_url, years_experience, work_count, follower_count')
        .eq('id', id ?? fallback.id)
        .maybeSingle()

      if (!active || !data) return
      const { data: authData } = await supabase.auth.getUser()
      if (active) setIsOwner(authData.user?.id === data.profile_id)
      setArtisan({
        id: data.id,
        name: data.name,
        title: data.title,
        years: data.years_experience,
        works: data.work_count,
        fans: data.follower_count,
        quote: data.quote ?? '',
        avatar: data.avatar_url ?? '',
        cover: data.cover_url ?? '',
        category: data.category_id ?? '',
        links: {},
        bio: data.bio ?? '',
      })

      const { data: workRows } = await supabase
        .from('works')
        .select('id, title, image_url, likes_count')
        .eq('artisan_id', data.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!active || !workRows) return
      setWorks(workRows.map(work => ({
        id: work.id,
        title: work.title,
        img: work.image_url ?? '',
        likes: work.likes_count,
      })))
    }

    void loadArtisan()
    return () => {
      active = false
    }
  }, [id])

  const changeCover = async (file?: File) => {
    setCoverMessage('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setCoverMessage('请选择 JPG、PNG 或 WebP 图片。')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverMessage('背景图不能超过 5MB。')
      return
    }

    setCoverSaving(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user || !isOwner) throw new Error('只有该主页所属的传承人可以修改背景图。')

      const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg')
      const coverPath = authData.user.id + '/cover.' + extension
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(coverPath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        })
      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(coverPath)
      const nextCoverUrl = publicData.publicUrl + '?v=' + Date.now()
      const { error: updateError } = await supabase
        .from('artisans')
        .update({ cover_url: nextCoverUrl })
        .eq('id', artisan.id)
      if (updateError) throw updateError

      setArtisan(current => ({ ...current, cover: nextCoverUrl }))
      setCoverMessage('主页背景已更新。')
    } catch (reason) {
      setCoverMessage(reason instanceof Error ? reason.message : '背景图更新失败，请重试。')
    } finally {
      setCoverSaving(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  return (
    <main>
      {/* Cover */}
      <div style={{ position: 'relative', height: 280, background: '#2a2520', overflow: 'hidden' }}>
        {artisan.cover && <img src={artisan.cover} alt={artisan.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        {isOwner && (
          <div style={{ position: 'absolute', top: 22, right: 28, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => void changeCover(event.target.files?.[0])} />
            <button
              type="button"
              disabled={coverSaving}
              onClick={() => coverInputRef.current?.click()}
              style={{ padding: '9px 16px', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 8, background: 'rgba(28,24,20,0.62)', color: 'white', backdropFilter: 'blur(8px)', cursor: coverSaving ? 'wait' : 'pointer', fontFamily: "'Noto Sans SC'", fontSize: 12 }}
            >
              {coverSaving ? '正在上传…' : '更换主页背景'}
            </button>
            {coverMessage && <span role="status" style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(28,24,20,0.72)', color: 'white', fontSize: 11 }}>{coverMessage}</span>}
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, transform: 'translateY(-48px)', marginBottom: -24 }}>
          <img src={artisan.avatar} alt={artisan.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--mi)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0 }} />
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Noto Serif SC'", fontSize: 26, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>{artisan.name}</h1>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(196,62,62,0.1)', border: '1px solid rgba(196,62,62,0.2)', fontSize: 11, fontFamily: "'Noto Sans SC'", color: 'var(--zhu)' }}>已认证</span>
            </div>
            <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', margin: '0 0 12px' }}>{artisan.title}</p>
          </div>
          <button onClick={() => setFollowed(!followed)} style={{
            padding: '9px 24px', borderRadius: 8, cursor: 'pointer',
            background: followed ? 'var(--mi)' : 'var(--zhu)',
            color: followed ? 'var(--text-mid)' : 'white',
            fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600,
            border: followed ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'all 0.15s', marginBottom: 8, flexShrink: 0,
          }}>
            {followed ? '已关注' : '+ 关注'}
          </button>
        </div>

        {/* Quote + stats */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'Noto Serif SC'", fontSize: 15, color: 'var(--text-mid)', fontStyle: 'italic', margin: '0 0 20px' }}>
            "{artisan.quote}"
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
            {[['从业', `${artisan.years}年`], ['作品', `${artisan.works}件`], ['粉丝', `${artisan.fans.toLocaleString()}`]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'var(--zhu)' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '12px 20px', fontSize: 14, fontFamily: "'Noto Sans SC'", background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? 'var(--zhu)' : 'var(--text-mid)',
              borderBottom: tab === t ? '2px solid var(--zhu)' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400, transition: 'all 0.15s', marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === '作品' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
            {works.map(w => (
              <Link key={w.id} to={`/work/${w.id}`} style={{ display: 'block', borderRadius: 12, overflow: 'hidden', background: '#e8e0d8', aspectRatio: '1', position: 'relative' }}>
                <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ''}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}
                >
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                    <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 13, fontWeight: 700, color: 'white' }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'Noto Sans SC'" }}>♡ {w.likes.toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === '简介' && (
          <div style={{ maxWidth: 600, marginBottom: 64 }}>
            <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 15, color: 'var(--text)', lineHeight: 2, marginBottom: 24 }}>{artisan.bio}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['专长工艺', detail.specialties],
                ['代表作品', representativeWorks],
                ['获奖荣誉', detail.honor],
                ['工坊地址', detail.studio],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'white', borderRadius: 10, padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Noto Serif SC'", color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === '体验课' && (
          <div style={{ marginBottom: 64 }}>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
              <img src={works[0]?.img || artisan.cover} alt={detail.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ padding: '24px 28px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'", marginBottom: 8 }}>{detail.course.schedule}</div>
                <h3 style={{ fontFamily: "'Noto Serif SC'", fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px' }}>{detail.course.title}</h3>
                <p style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, margin: '0 0 20px' }}>{detail.course.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontFamily: "'Noto Serif SC'", fontSize: 22, fontWeight: 700, color: 'var(--zhu)' }}>¥{detail.course.price}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>/人 · ⭐ {detail.course.rating} · {detail.course.participants}人参加过</span>
                  </div>
                  <Link to={`/book/${artisan.id}`} style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--qing)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 600 }}>立即预约</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', padding: '14px 0', zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={artisan.avatar} alt={artisan.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{artisan.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'Noto Sans SC'" }}>接受定制咨询</div>
            </div>
          </div>
          <Link to={`/consult/${works[0]?.id || ''}`} style={{ padding: '10px 28px', borderRadius: 8, background: 'var(--zhu)', color: 'white', fontFamily: "'Noto Sans SC'", fontSize: 14, fontWeight: 700 }}>
            🎨 咨询定制
          </Link>
        </div>
      </div>
    </main>
  )
}
