import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CATEGORIES } from '../data'
import { supabase } from '../lib/supabase'

type StudioTab = 'overview' | 'works' | 'publish' | 'classes' | 'bookings' | 'analytics'

type StudioArtisan = {
  id: string
  name: string
  title: string
  avatarUrl: string
  yearsExperience: number
  followerCount: number
  isVerified: boolean
}

type StudioWork = {
  id: string
  title: string
  img: string
  desc: string
  tags: string[]
  likes: number
  comments: number
  priceText?: string
  isDemo?: boolean
}

type StudioClass = {
  id: string
  title: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  booked: number
  status: 'published' | 'paused'
}

type StudioBooking = {
  id: string
  guest: string
  phone: string
  classTitle: string
  schedule: string
  people: number
  note: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

const EMPTY_ARTISAN: StudioArtisan = {
  id: '',
  name: '传承人',
  title: '个人资料待完善',
  avatarUrl: '',
  yearsExperience: 0,
  followerCount: 0,
  isVerified: false,
}

const TABS: Array<{ id: StudioTab; label: string; mark: string }> = [
  { id: 'overview', label: '工作概览', mark: '览' },
  { id: 'works', label: '作品管理', mark: '作' },
  { id: 'publish', label: '发布作品', mark: '发' },
  { id: 'classes', label: '体验课管理', mark: '课' },
  { id: 'bookings', label: '预约管理', mark: '约' },
  { id: 'analytics', label: '经营数据', mark: '数' },
]

const MONTHS = ['3月', '4月', '5月', '6月', '7月', '8月']
const CONSULT_DATA = [12, 19, 16, 28, 35, 46]
const PUBLISH_STEPS = ['上传照片', '填写信息', '转化方式', '确认发布']
const DEMO_WORKS: StudioWork[] = [
  { id: 'demo-1', title: '云纹手作样稿', img: CATEGORIES[0].img, desc: '以传统纹样为灵感的个人创作样稿。', tags: ['可定制', '模拟作品'], likes: 286, comments: 18, priceText: '面议', isDemo: true },
  { id: 'demo-2', title: '四时花影器物', img: CATEGORIES[2].img, desc: '从四时花木中提炼色彩与构图。', tags: ['手工', '模拟作品'], likes: 168, comments: 9, priceText: '固定价格', isDemo: true },
  { id: 'demo-3', title: '山水留白小品', img: CATEGORIES[3].img, desc: '用材料肌理表现东方山水的留白。', tags: ['仅展示', '模拟作品'], likes: 92, comments: 6, priceText: '仅展示', isDemo: true },
]
const DEMO_INQUIRIES = [
  ['林女士', '想了解这件作品的定制周期', '12 分钟前'],
  ['周先生', '可以更换图案和尺寸吗？', '1 小时前'],
  ['程女士', '想预约周末的非遗体验课', '今天 09:20'],
]
const INITIAL_CLASSES: StudioClass[] = [
  { id: 'class-1', title: '传统手工艺入门体验课', date: '2026-08-22', time: '14:00', location: '非遗工坊 · 一层', price: 168, capacity: 12, booked: 8, status: 'published' },
  { id: 'class-2', title: '纹样与配色小课堂', date: '2026-08-29', time: '09:30', location: '非遗工坊 · 雅集厅', price: 128, capacity: 16, booked: 5, status: 'published' },
  { id: 'class-3', title: '亲子非遗手作体验', date: '2026-09-06', time: '15:00', location: '非遗工坊 · 庭院', price: 198, capacity: 10, booked: 0, status: 'paused' },
]
const INITIAL_BOOKINGS: StudioBooking[] = [
  { id: 'booking-1', guest: '程女士', phone: '138****5621', classTitle: '传统手工艺入门体验课', schedule: '8月22日 14:00', people: 2, note: '第一次体验，希望老师多指导。', status: 'pending' },
  { id: 'booking-2', guest: '周先生', phone: '186****2714', classTitle: '纹样与配色小课堂', schedule: '8月29日 09:30', people: 1, note: '无特殊需求', status: 'confirmed' },
  { id: 'booking-3', guest: '林女士', phone: '159****0836', classTitle: '传统手工艺入门体验课', schedule: '8月22日 14:00', people: 3, note: '携带一名儿童参加。', status: 'confirmed' },
  { id: 'booking-4', guest: '徐同学', phone: '177****4910', classTitle: '往期纹样体验课', schedule: '8月10日 15:00', people: 1, note: '已完成签到', status: 'completed' },
]
const DEFAULT_STORY = '记录作品的材料、技法与创作故事。'

const audioBlobToWavBase64 = async (blob: Blob) => {
  const audioContext = new AudioContext()
  try {
    const decoded = await audioContext.decodeAudioData(await blob.arrayBuffer())
    const samples = decoded.getChannelData(0)
    const wavBuffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(wavBuffer)
    const writeText = (offset: number, value: string) => {
      for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
    }

    writeText(0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeText(8, 'WAVE')
    writeText(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, decoded.sampleRate, true)
    view.setUint32(28, decoded.sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeText(36, 'data')
    view.setUint32(40, samples.length * 2, true)

    for (let index = 0; index < samples.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, samples[index]))
      view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    }

    const bytes = new Uint8Array(wavBuffer)
    let binary = ''
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
    }
    return btoa(binary)
  } finally {
    await audioContext.close()
  }
}

export default function ArtisanStudioPage() {
  const navigate = useNavigate()
  const [artisan, setArtisan] = useState<StudioArtisan>(EMPTY_ARTISAN)
  const [artisanWorks, setArtisanWorks] = useState<StudioWork[]>([])
  const [studioLoading, setStudioLoading] = useState(true)
  const [studioNotice, setStudioNotice] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [workFilter, setWorkFilter] = useState<'all' | 'sale' | 'custom'>('all')
  const [showAllInquiries, setShowAllInquiries] = useState(false)
  const [analyticsRange, setAnalyticsRange] = useState('近6个月')
  const [draftPreviewImage, setDraftPreviewImage] = useState('')
  const [dialect, setDialect] = useState('auto')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [showAiCopyDialog, setShowAiCopyDialog] = useState(false)
  const [aiDirection, setAiDirection] = useState('突出手工温度、作品寓意和传承价值')
  const [aiTone, setAiTone] = useState('雅致叙事')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const tabNavRef = useRef<HTMLElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [tab, setTab] = useState<StudioTab>('overview')
  const [publishStep, setPublishStep] = useState(0)
  const [draftTitle, setDraftTitle] = useState('我的非遗新作')
  const [draftDescription, setDraftDescription] = useState(DEFAULT_STORY)
  const [draftCategoryId, setDraftCategoryId] = useState('suzhou-embroidery')
  const [draftPriceText, setDraftPriceText] = useState('面议')
  const [draftTags, setDraftTags] = useState('手工、非遗、可定制')
  const [conversion, setConversion] = useState('站内咨询')
  const [published, setPublished] = useState(false)
  const [publishSaving, setPublishSaving] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [studioClasses, setStudioClasses] = useState<StudioClass[]>([])
  const [showClassForm, setShowClassForm] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [classSaving, setClassSaving] = useState(false)
  const [classDraft, setClassDraft] = useState({
    title: '传统手工艺体验课',
    date: '2026-09-12',
    time: '14:00',
    location: '非遗工坊',
    price: '168',
    capacity: '12',
  })
  const [studioBookings, setStudioBookings] = useState<StudioBooking[]>([])
  const [bookingFilter, setBookingFilter] = useState<'all' | StudioBooking['status']>('all')

  const displayWorks = artisanWorks.length > 0 ? artisanWorks : DEMO_WORKS
  const filteredWorks = displayWorks.filter(work => {
    if (workFilter === 'custom') return work.tags.includes('可定制')
    if (workFilter === 'sale') return work.priceText !== '仅展示'
    return true
  })
  const displayFollowerCount = artisan.followerCount || 86
  const draftImage = useMemo(
    () => displayWorks[0]?.img ?? CATEGORIES.find(category => category.id === draftCategoryId)?.img ?? CATEGORIES[0].img,
    [displayWorks, draftCategoryId],
  )
  const draftDisplayImage = draftPreviewImage || draftImage
  const totalLikes = displayWorks.reduce((sum, work) => sum + work.likes, 0)

  useEffect(() => {
    let active = true

    const loadCurrentArtisan = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) throw new Error('请先登录传承人账号。')

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (profileError) throw new Error(`身份读取失败：${profileError.message}`)
        if (profileData?.role !== 'artisan') {
          if (active) navigate('/profile', { replace: true })
          return
        }

        const loginName = authData.user.user_metadata?.display_name
          ?? authData.user.user_metadata?.full_name
          ?? authData.user.email?.split('@')[0]
          ?? '传承人'

        if (active) setArtisan(current => ({ ...current, name: loginName }))

        const { data: artisanData, error: artisanError } = await supabase
          .from('artisans')
          .select('id, name, title, avatar_url, years_experience, follower_count, is_verified')
          .eq('profile_id', authData.user.id)
          .maybeSingle()

        if (artisanError) throw artisanError
        if (!artisanData) {
          if (active) setStudioNotice('账号尚未建立传承人资料，请运行本次准备的初始化脚本。')
          return
        }

        if (active) {
          setArtisan({
            id: artisanData.id,
            name: artisanData.name || loginName,
            title: artisanData.title || '非遗传承人',
            avatarUrl: artisanData.avatar_url || '',
            yearsExperience: artisanData.years_experience || 0,
            followerCount: artisanData.follower_count || 0,
            isVerified: Boolean(artisanData.is_verified),
          })
        }

        const { data: worksData, error: worksError } = await supabase
          .from('works')
          .select('id, title, image_url, description, tags, likes_count, comments_count, price_text')
          .eq('artisan_id', artisanData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5)

        if (worksError) throw worksError
        if (active) {
          setArtisanWorks((worksData ?? []).map(work => ({
            id: work.id,
            title: work.title,
            img: work.image_url,
            desc: work.description ?? '',
            tags: Array.isArray(work.tags) ? work.tags : [],
            likes: work.likes_count ?? 0,
            comments: work.comments_count ?? 0,
          })))
          setStudioNotice((worksData ?? []).length === 0 ? '当前展示模拟数据，发布真实作品后会自动替换。' : '')
        }

        const [{ data: courseData, error: courseError }, { data: bookingData, error: bookingError }] = await Promise.all([
          supabase
            .from('experience_courses')
            .select('id, title, class_date, start_time, location, price, capacity, status')
            .eq('artisan_id', artisanData.id)
            .order('class_date', { ascending: true })
            .order('start_time', { ascending: true }),
          supabase
            .from('bookings')
            .select('id, course_id, course_title, booking_date, time_slot, participants, contact, note, status, created_at')
            .eq('artisan_id', artisanData.id)
            .order('created_at', { ascending: false }),
        ])

        if (courseError) throw new Error(`体验课读取失败：${courseError.message}`)
        if (bookingError) throw new Error(`预约读取失败：${bookingError.message}`)

        const realBookings: StudioBooking[] = (bookingData ?? []).map(booking => ({
          id: booking.id,
          guest: '爱好者',
          phone: booking.contact,
          classTitle: booking.course_title,
          schedule: `${booking.booking_date} · ${booking.time_slot}`,
          people: booking.participants,
          note: booking.note || '无特殊需求',
          status: booking.status as StudioBooking['status'],
        }))

        const realClasses: StudioClass[] = (courseData ?? []).map(course => ({
          id: course.id,
          title: course.title,
          date: course.class_date,
          time: String(course.start_time).slice(0, 5),
          location: course.location,
          price: course.price,
          capacity: course.capacity,
          booked: (bookingData ?? []).filter(booking =>
            booking.status !== 'cancelled'
            && (booking.course_id === course.id || (!booking.course_id && booking.course_title === course.title))
          ).reduce((sum, booking) => sum + booking.participants, 0),
          status: course.status as StudioClass['status'],
        }))

        if (active) {
          setStudioClasses(realClasses)
          setStudioBookings(realBookings)
        }
      } catch (error) {
        if (active) setStudioNotice(error instanceof Error ? error.message : '传承人资料读取失败。')
      } finally {
        if (active) setStudioLoading(false)
      }
    }

    loadCurrentArtisan()
    return () => { active = false }
  }, [navigate])

  const beginPublish = () => {
    setPublished(false)
    setPublishError('')
    setPublishStep(0)
    setTab('publish')
  }

  const beginClassCreate = () => {
    setEditingClassId(null)
    setClassDraft({ title: '传统手工艺体验课', date: '2026-09-12', time: '14:00', location: '非遗工坊', price: '168', capacity: '12' })
    setShowClassForm(true)
  }

  const editClass = (item: StudioClass) => {
    setEditingClassId(item.id)
    setClassDraft({
      title: item.title,
      date: item.date,
      time: item.time,
      location: item.location,
      price: String(item.price),
      capacity: String(item.capacity),
    })
    setShowClassForm(true)
  }

  const saveClass = async () => {
    if (!classDraft.title.trim() || !classDraft.date || !classDraft.time) {
      setActionMessage('请填写课程名称、日期和时间。')
      return
    }
    if (!artisan.id) {
      setActionMessage('当前账号尚未绑定传承人资料。')
      return
    }

    setClassSaving(true)
    try {
      const currentClass = editingClassId ? studioClasses.find(item => item.id === editingClassId) : undefined
      const payload = {
        artisan_id: artisan.id,
        title: classDraft.title.trim(),
        class_date: classDraft.date,
        start_time: classDraft.time,
        location: classDraft.location.trim() || '地点待定',
        price: Math.max(0, Number(classDraft.price) || 0),
        capacity: Math.max(1, Number(classDraft.capacity) || 1),
        status: currentClass?.status ?? 'published',
        updated_at: new Date().toISOString(),
      }
      const query = editingClassId
        ? supabase.from('experience_courses').update(payload).eq('id', editingClassId)
        : supabase.from('experience_courses').insert(payload)
      const { data, error } = await query
        .select('id, title, class_date, start_time, location, price, capacity, status')
        .single()
      if (error) throw new Error(error.message)

      const savedClass: StudioClass = {
        id: data.id,
        title: data.title,
        date: data.class_date,
        time: String(data.start_time).slice(0, 5),
        location: data.location,
        price: data.price,
        capacity: data.capacity,
        booked: currentClass?.booked ?? 0,
        status: data.status as StudioClass['status'],
      }
      setStudioClasses(current => editingClassId
        ? current.map(item => item.id === editingClassId ? savedClass : item)
        : [savedClass, ...current])
      setShowClassForm(false)
      setActionMessage(editingClassId ? '体验课信息已保存到数据库。' : '体验课已创建并保存到数据库。')
    } catch (error) {
      setActionMessage(error instanceof Error ? `保存失败：${error.message}` : '体验课保存失败。')
    } finally {
      setClassSaving(false)
    }
  }

  const toggleClassStatus = async (id: string) => {
    const target = studioClasses.find(item => item.id === id)
    if (!target) return
    const nextStatus: StudioClass['status'] = target.status === 'published' ? 'paused' : 'published'
    const { error } = await supabase
      .from('experience_courses')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      setActionMessage(`操作失败：${error.message}`)
      return
    }
    setStudioClasses(current => current.map(item => item.id === id ? { ...item, status: nextStatus } : item))
    setActionMessage(nextStatus === 'paused' ? '体验课已暂停预约并保存。' : '体验课已重新上架并保存。')
  }

  const updateBookingStatus = async (id: string, status: StudioBooking['status']) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) {
      setActionMessage(`预约处理失败：${error.message}`)
      return
    }
    setStudioBookings(current => current.map(item => item.id === id ? { ...item, status } : item))
    const messages: Record<StudioBooking['status'], string> = {
      pending: '预约已恢复为待处理并保存。',
      confirmed: '预约已确认并保存。',
      completed: '预约已标记为已完成并保存。',
      cancelled: '预约已取消并保存。',
    }
    setActionMessage(messages[status])
  }

  const openImagePicker = () => imageInputRef.current?.click()

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (draftPreviewImage) URL.revokeObjectURL(draftPreviewImage)
    setDraftPreviewImage(URL.createObjectURL(file))
    setActionMessage(`已选择图片：${file.name}`)
  }

  const editWork = (work: StudioWork) => {
    setDraftTitle(work.title)
    setDraftDescription(work.desc)
    setDraftTags(work.tags.filter(tag => tag !== '模拟作品').join('、'))
    setDraftPreviewImage(work.img)
    setPublished(false)
    setPublishStep(1)
    setTab('publish')
    setActionMessage(work.isDemo ? '已载入模拟作品，可修改后发布为你的真实作品。' : '已载入作品信息。')
  }

  const transcribeRecording = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setVoiceError('')
    try {
      const audioBase64 = await audioBlobToWavBase64(audioBlob)
      const { data, error } = await supabase.functions.invoke('doubao-asr', {
        body: { audioBase64, dialect },
      })
      if (error) throw error
      const transcript = data?.text?.trim()
      if (!transcript) throw new Error('没有识别到清晰语音，请靠近麦克风重试。')
      setDraftDescription(current => current === DEFAULT_STORY || !current.trim() ? transcript : `${current.trim()}\n${transcript}`)
      setActionMessage('方言语音已转换为文字，并加入作品故事。')
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : '语音识别失败，请检查豆包语音配置。')
    } finally {
      setIsTranscribing(false)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }

    setVoiceError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('当前浏览器不支持麦克风录音。')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream
      audioChunksRef.current = []
      const preferredType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : ''
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        setIsRecording(false)
        recordingStreamRef.current?.getTracks().forEach(track => track.stop())
        const recordedBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType })
        if (recordedBlob.size < 800) {
          setVoiceError('录音太短，请至少说 1 秒。')
          return
        }
        await transcribeRecording(recordedBlob)
      }
      recorder.start(250)
      setIsRecording(true)
      setActionMessage('正在录音；说完后再次点击即可转写。')
    } catch (error) {
      recordingStreamRef.current?.getTracks().forEach(track => track.stop())
      setVoiceError(error instanceof Error ? error.message : '无法使用麦克风。')
    }
  }

  const generateAiCopy = async () => {
    setAiGenerating(true)
    setAiError('')
    setAiResult('')
    try {
      const categoryName = CATEGORIES.find(category => category.id === draftCategoryId)?.name ?? '非遗作品'
      const { data, error } = await supabase.functions.invoke('doubao-copy', {
        body: {
          title: draftTitle,
          category: categoryName,
          tags: draftTags,
          rawStory: draftDescription,
          direction: aiDirection,
          tone: aiTone,
        },
      })
      if (error) throw error
      const copy = data?.text?.trim()
      if (!copy) throw new Error('豆包没有返回文案，请稍后重试。')
      setAiResult(copy)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '文案生成失败，请检查豆包 API 配置。')
    } finally {
      setAiGenerating(false)
    }
  }

  const applyAiCopy = () => {
    if (!aiResult.trim()) return
    setDraftDescription(aiResult.trim())
    setShowAiCopyDialog(false)
    setActionMessage('AI 文案已填入作品故事，可继续手动修改。')
  }

  const finishPublish = async () => {
    if (!draftTitle.trim() || !draftDescription.trim()) {
      setPublishError('请先填写作品名称和作品故事。')
      return
    }

    setPublishSaving(true)
    setPublishError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) throw new Error('登录状态已失效，请重新登录。')

      const { data: artisanAccount, error: artisanError } = await supabase
        .from('artisans')
        .select('id')
        .eq('profile_id', authData.user.id)
        .maybeSingle()

      if (artisanError) throw artisanError
      if (!artisanAccount) throw new Error('当前账号尚未绑定传承人资料，请先运行绑定脚本。')

      const tags = draftTags.split(/[、，,]/).map(tag => tag.trim()).filter(Boolean)
      const { data: insertedWork, error: insertError } = await supabase.from('works').insert({
        id: `${artisanAccount.id}-${Date.now()}`,
        title: draftTitle.trim(),
        category_id: draftCategoryId,
        artisan_id: artisanAccount.id,
        image_url: draftImage,
        image_height: 480,
        price_text: draftPriceText,
        tags,
        likes_count: 0,
        comments_count: 0,
        description: draftDescription.trim(),
        status: 'published',
        is_featured: false,
      }).select('id, title, image_url, description, tags, likes_count, comments_count, price_text').single()

      if (insertError) throw insertError
      if (insertedWork) {
        setArtisanWorks(current => [{
          id: insertedWork.id,
          title: insertedWork.title,
          img: insertedWork.image_url,
          desc: insertedWork.description ?? '',
          tags: Array.isArray(insertedWork.tags) ? insertedWork.tags : [],
          likes: insertedWork.likes_count ?? 0,
          comments: insertedWork.comments_count ?? 0,
        }, ...current].slice(0, 5))
      }
      setPublished(true)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : '发布失败，请稍后重试。')
    } finally {
      setPublishSaving(false)
    }
  }

  return (
    <main className="artisan-studio-page">
      <section className="artisan-studio-frame" aria-label="传承人工作台">
        <header className="artisan-studio-header">
          <div className="artisan-studio-brand">
            <span>满</span>
            <div><strong>满小传 · 传承人桌面</strong><small>ARTISAN STUDIO</small></div>
          </div>
          <nav
            ref={tabNavRef}
            aria-label="传承人桌面栏目"
            onWheel={event => {
              if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
              event.currentTarget.scrollLeft += event.deltaY
              event.preventDefault()
            }}
          >
            {TABS.map(item => (
              <button key={item.id} type="button" onClick={() => setTab(item.id)} className={tab === item.id ? 'active' : ''}>
                <i>{item.mark}</i>{item.label}
              </button>
            ))}
          </nav>
          <div className="artisan-studio-certified"><span>{artisan.isVerified ? '认' : '待'}</span> {artisan.isVerified ? '已认证传承人' : '当前登录传承人'}</div>
        </header>

        <div className="artisan-studio-layout">
          <aside className="artisan-studio-sidebar">
            <div className="artisan-studio-person">
              {artisan.avatarUrl ? <img src={artisan.avatarUrl} alt={artisan.name} /> : <i className="artisan-studio-avatar-placeholder">{artisan.name.slice(0, 1)}</i>}
              <strong>{studioLoading ? '正在读取…' : artisan.name}</strong>
              <span>{artisan.title}</span>
              <small>{artisan.yearsExperience > 0 ? `从艺 ${artisan.yearsExperience} 年` : '从艺年限待完善'}</small>
            </div>
            <div className="artisan-studio-side-stats">
              <div><strong>{displayWorks.length}</strong><span>{artisanWorks.length ? '已发布' : '模拟作品'}</span></div>
              <div><strong>{displayFollowerCount.toLocaleString()}</strong><span>关注者{artisan.followerCount ? '' : '（模拟）'}</span></div>
            </div>
            <button type="button" onClick={beginPublish} className="artisan-studio-publish-shortcut">＋ 发布新作品</button>
            <Link to={artisan.id ? `/artisan/${artisan.id}` : '/profile'} className="artisan-studio-public-link">{artisan.id ? '查看公开主页 →' : '完善传承人资料 →'}</Link>
            <div className="artisan-studio-reminder">
              <span>账号状态</span>
              <strong>{studioNotice || '资料已与当前登录账号同步'}</strong>
              <small>{artisan.id ? '发布内容将归入你的个人主页' : '初始化后即可发布自己的作品'}</small>
            </div>
          </aside>

          <div className="artisan-studio-content">
            <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            {actionMessage && <div className="studio-action-toast" role="status"><span>{actionMessage}</span><button type="button" onClick={() => setActionMessage('')}>×</button></div>}
            {tab === 'overview' && (
              <section className="studio-overview studio-tab-enter">
                <div className="studio-section-heading">
                  <div><span>今日概览</span><h1>{artisan.name}，欢迎回来</h1></div>
                  <small>{studioLoading ? '正在同步登录资料…' : '当前账号实时数据'}</small>
                </div>

                <div className="studio-kpi-grid">
                  {[
                    ['本月咨询', '46', '模拟数据', '询'],
                    ['作品获赞', totalLikes.toLocaleString(), `来自 ${displayWorks.length} 件作品`, '赞'],
                    ['关注者', displayFollowerCount.toLocaleString(), artisan.followerCount ? '个人主页数据' : '模拟数据', '关'],
                    ['待处理预约', '2', '模拟数据', '约'],
                  ].map(([label, value, delta, mark], index) => (
                    <div key={label} className={index === 0 ? 'featured' : ''}>
                      <span>{mark}</span><small>{label}</small><strong>{value}</strong><b>{delta}</b>
                    </div>
                  ))}
                </div>

                <div className="studio-overview-grid">
                  <div className="studio-panel studio-trend-panel">
                    <header><div><span>咨询趋势</span><strong>近六个月</strong></div><small>共 156 次（模拟）</small></header>
                    <div className="studio-bar-chart">
                      {CONSULT_DATA.map((value, index) => (
                        <div key={MONTHS[index]}>
                          <span>{value}</span>
                          <i style={{ height: `${value}%` }} className={index === CONSULT_DATA.length - 1 ? 'active' : ''} />
                          <small>{MONTHS[index]}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="studio-panel studio-inquiry-panel">
                    <header><div><span>最新咨询</span><strong>待回复 3 条（模拟）</strong></div><button type="button" onClick={() => setShowAllInquiries(current => !current)}>{showAllInquiries ? '收起' : '全部咨询'}</button></header>
                    {DEMO_INQUIRIES.slice(0, showAllInquiries ? 3 : 2).map(([name, message, time]) => (
                      <button className="studio-inquiry-row" type="button" key={name} onClick={() => setActionMessage(`已打开 ${name} 的模拟咨询：${message}`)}><i>{name.slice(0, 1)}</i><span><strong>{name}</strong><small>{message}</small></span><time>{time}</time></button>
                    ))}
                  </div>
                </div>

                <div className="studio-quick-row">
                  <span>常用操作</span>
                  <button type="button" onClick={beginPublish}>发布作品</button>
                  <button type="button" onClick={() => setTab('works')}>管理作品</button>
                  <button type="button" onClick={() => setTab('analytics')}>查看数据</button>
                  <Link to="/bookings">查看预约</Link>
                </div>
              </section>
            )}

            {tab === 'works' && (
              <section className="studio-works studio-tab-enter">
                <div className="studio-section-heading">
                  <div><span>作品管理</span><h1>已发布作品</h1></div>
                  <button type="button" onClick={beginPublish}>＋ 发布新作品</button>
                </div>
                <div className="studio-works-toolbar">
                  <div>
                    <button className={workFilter === 'all' ? 'active' : ''} type="button" onClick={() => setWorkFilter('all')}>全部</button>
                    <button className={workFilter === 'sale' ? 'active' : ''} type="button" onClick={() => setWorkFilter('sale')}>在售</button>
                    <button className={workFilter === 'custom' ? 'active' : ''} type="button" onClick={() => setWorkFilter('custom')}>可定制</button>
                  </div>
                  <span>共 {filteredWorks.length} 件{artisanWorks.length === 0 ? '模拟作品' : '作品'}</span>
                </div>
                <div className="studio-work-list">
                  {filteredWorks.map((work, index) => (
                    <article key={work.id}>
                      <img src={work.img} alt={work.title} />
                      <div className="studio-work-main">
                        <span>{work.tags[0] ?? '已发布'}</span>
                        <strong>{work.title}</strong>
                        <small>{work.desc}</small>
                      </div>
                      <div className="studio-work-metrics"><strong>{work.likes.toLocaleString()}</strong><span>浏览互动</span></div>
                      <div className="studio-work-metrics"><strong>{work.comments}</strong><span>咨询评论</span></div>
                      <div className="studio-work-actions">
                        {work.isDemo ? <button type="button" onClick={() => setActionMessage(`正在预览模拟作品：${work.title}`)}>预览</button> : <Link to={`/work/${work.id}`}>查看</Link>}
                        <button type="button" onClick={() => editWork(work)}>编辑</button>
                      </div>
                      {work.isDemo && <i className="studio-work-recommend">模拟数据</i>}
                      {!work.isDemo && index === 0 && <i className="studio-work-recommend">最新发布</i>}
                    </article>
                  ))}
                  {filteredWorks.length === 0 && <div className="studio-empty-works"><i>作</i><strong>当前筛选没有作品</strong><span>更换筛选条件，或发布一件新作品。</span></div>}
                </div>
              </section>
            )}

            {tab === 'publish' && (
              <section className="studio-publish studio-tab-enter">
                <div className="studio-publish-steps">
                  <header><span>发布作品</span><strong>让作品被更多人看见</strong></header>
                  {PUBLISH_STEPS.map((step, index) => (
                    <button key={step} type="button" onClick={() => !published && setPublishStep(index)} className={`${publishStep === index ? 'active' : ''}${publishStep > index || published ? ' done' : ''}`}>
                      <i>{publishStep > index || published ? '✓' : index + 1}</i><span>{step}</span>
                    </button>
                  ))}
                  <div className="studio-ai-tip"><span>AI 助手提示</span><p>上传 3—5 张不同角度图片，更容易进入精选推荐。</p></div>
                </div>

                <div className="studio-publish-main">
                  {published ? (
                    <div className="studio-publish-success">
                      <i>成</i><h2>作品发布成功</h2><p>作品已保存，并归入当前登录传承人的个人工作室。</p>
                      <div><button type="button" onClick={() => { setPublished(false); setPublishStep(0); setDraftPreviewImage('') }}>继续发布</button><button type="button" onClick={() => setTab('works')}>查看作品管理</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="studio-section-heading compact"><div><span>步骤 {publishStep + 1} / 4</span><h1>{PUBLISH_STEPS[publishStep]}</h1></div></div>
                      {publishStep === 0 && (
                        <div className="studio-upload-grid">
                          <div className="has-image"><img src={draftDisplayImage} alt="作品预览" /><button type="button" onClick={openImagePicker}>更换</button></div>
                          <button type="button" onClick={openImagePicker}><strong>＋</strong><span>添加作品正面</span></button>
                          <button type="button" onClick={openImagePicker}><strong>＋</strong><span>添加细节图片</span></button>
                        </div>
                      )}
                      {publishStep === 1 && (
                        <div className="studio-form-grid">
                          <label><span>作品名称</span><input value={draftTitle} onChange={event => setDraftTitle(event.target.value)} /></label>
                          <label><span>所属品类</span><select value={draftCategoryId} onChange={event => setDraftCategoryId(event.target.value)}>{CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                          <div className="wide studio-story-field">
                            <div className="studio-story-label"><span>作品故事</span><small>可直接口述，也可让豆包整理润色</small></div>
                            <textarea value={draftDescription} onChange={event => setDraftDescription(event.target.value)} />
                            <div className="studio-story-tools">
                              <select value={dialect} onChange={event => setDialect(event.target.value)} aria-label="语音方言">
                                <option value="auto">自动识别方言</option>
                                <option value="cant">粤语</option>
                                <option value="sc">四川话</option>
                                <option value="zh_shanghai">上海话</option>
                              </select>
                              <button type="button" className={isRecording ? 'recording' : ''} onClick={toggleRecording} disabled={isTranscribing}>{isTranscribing ? '正在识别…' : isRecording ? '停止并转写' : '语音转文字'}</button>
                              <button type="button" className="ai-copy-button" onClick={() => { setShowAiCopyDialog(true); setAiError(''); setAiResult('') }}>AI 自动生成文案</button>
                            </div>
                            {voiceError && <small className="studio-tool-error" role="alert">{voiceError}</small>}
                          </div>
                          <label><span>价格方式</span><select value={draftPriceText} onChange={event => setDraftPriceText(event.target.value)}><option>面议</option><option>固定价格</option></select></label>
                          <label><span>作品标签</span><input value={draftTags} onChange={event => setDraftTags(event.target.value)} /></label>
                        </div>
                      )}
                      {publishStep === 2 && (
                        <div className="studio-conversion-options">
                          {[
                            ['站内咨询', '爱好者向你发送定制咨询，适合高客单作品'],
                            ['预约体验', '引导用户预约体验课或到店参观'],
                            ['直接展示', '只展示作品与故事，暂不接收咨询'],
                          ].map(([name, note]) => (
                            <button key={name} type="button" onClick={() => setConversion(name)} className={conversion === name ? 'active' : ''}>
                              <i>{conversion === name ? '✓' : ''}</i><span><strong>{name}</strong><small>{note}</small></span>
                            </button>
                          ))}
                        </div>
                      )}
                      {publishStep === 3 && (
                        <div className="studio-publish-preview">
                          <img src={draftDisplayImage} alt={draftTitle} />
                          <div><span>发布预览</span><h2>{draftTitle}</h2><p>{draftDescription}</p><strong>{conversion}</strong><small>发布后仍可在“作品管理”中修改</small></div>
                        </div>
                      )}
                      <footer className="studio-publish-footer">
                        <button type="button" onClick={() => setPublishStep(Math.max(0, publishStep - 1))} disabled={publishStep === 0 || publishSaving}>上一步</button>
                        <button type="button" disabled={publishSaving} onClick={() => publishStep === 3 ? finishPublish() : setPublishStep(publishStep + 1)}>{publishSaving ? '正在发布…' : publishStep === 3 ? '确认发布' : '下一步'}</button>
                      </footer>
                      {publishError && <p className="studio-publish-error" role="alert">{publishError}</p>}
                    </>
                  )}
                </div>
              </section>
            )}

            {tab === 'classes' && (
              <section className="studio-classes studio-tab-enter">
                <div className="studio-section-heading">
                  <div><span>体验课管理</span><h1>我的体验课程</h1></div>
                  <button type="button" onClick={beginClassCreate}>＋ 新增体验课</button>
                </div>
                <div className="studio-class-summary">
                  <div><span>已上架课程</span><strong>{studioClasses.filter(item => item.status === 'published').length}</strong><small>面向爱好者开放预约</small></div>
                  <div><span>已预约名额</span><strong>{studioClasses.reduce((sum, item) => sum + item.booked, 0)}</strong><small>本期课程合计</small></div>
                  <div><span>待处理预约</span><strong>{studioBookings.filter(item => item.status === 'pending').length}</strong><small>建议及时确认</small></div>
                </div>
                <div className="studio-class-list">
                  {studioClasses.length === 0 && (
                    <div className="studio-booking-empty"><i>课</i><strong>还没有真实体验课</strong><span>点击“新增体验课”创建第一门课程</span></div>
                  )}
                  {studioClasses.map(item => (
                    <article key={item.id}>
                      <div className="studio-class-date">
                        <strong>{item.date.slice(8)}</strong>
                        <span>{item.date.slice(5, 7)}月</span>
                      </div>
                      <div className="studio-class-main">
                        <div><span className={item.status}>{item.status === 'published' ? '预约中' : '已暂停'}</span><small>￥{item.price}/人</small></div>
                        <h2>{item.title}</h2>
                        <p>{item.date} · {item.time}　{item.location}</p>
                      </div>
                      <div className="studio-class-capacity">
                        <strong>{item.booked}<small> / {item.capacity}</small></strong>
                        <span>已预约</span>
                        <i><b style={{ width: `${Math.min(100, item.booked / item.capacity * 100)}%` }} /></i>
                      </div>
                      <div className="studio-class-actions">
                        <button type="button" onClick={() => editClass(item)}>编辑</button>
                        <button type="button" className={item.status === 'published' ? 'pause' : 'publish'} onClick={() => toggleClassStatus(item.id)}>
                          {item.status === 'published' ? '暂停预约' : '重新上架'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {showClassForm && (
                  <div className="studio-class-form-card" role="dialog" aria-modal="true" aria-labelledby="studio-class-form-title">
                    <header><div><span>{editingClassId ? '编辑课程' : '新增课程'}</span><h2 id="studio-class-form-title">填写体验课信息</h2></div><button type="button" onClick={() => setShowClassForm(false)}>×</button></header>
                    <div>
                      <label className="wide"><span>课程名称</span><input value={classDraft.title} onChange={event => setClassDraft(current => ({ ...current, title: event.target.value }))} /></label>
                      <label><span>日期</span><input type="date" value={classDraft.date} onChange={event => setClassDraft(current => ({ ...current, date: event.target.value }))} /></label>
                      <label><span>时间</span><input type="time" value={classDraft.time} onChange={event => setClassDraft(current => ({ ...current, time: event.target.value }))} /></label>
                      <label className="wide"><span>上课地点</span><input value={classDraft.location} onChange={event => setClassDraft(current => ({ ...current, location: event.target.value }))} /></label>
                      <label><span>价格（元/人）</span><input type="number" min="0" value={classDraft.price} onChange={event => setClassDraft(current => ({ ...current, price: event.target.value }))} /></label>
                      <label><span>可预约人数</span><input type="number" min="1" value={classDraft.capacity} onChange={event => setClassDraft(current => ({ ...current, capacity: event.target.value }))} /></label>
                    </div>
                    <footer><button type="button" onClick={() => setShowClassForm(false)}>取消</button><button type="button" onClick={saveClass} disabled={classSaving}>{classSaving ? '正在保存…' : editingClassId ? '保存修改' : '创建并上架'}</button></footer>
                  </div>
                )}
              </section>
            )}

            {tab === 'bookings' && (
              <section className="studio-bookings studio-tab-enter">
                <div className="studio-section-heading">
                  <div><span>预约管理</span><h1>爱好者预约</h1></div>
                  <small>共 {studioBookings.length} 条预约</small>
                </div>
                <div className="studio-booking-filters">
                  {[
                    ['all', '全部'],
                    ['pending', '待处理'],
                    ['confirmed', '已确认'],
                    ['completed', '已完成'],
                    ['cancelled', '已取消'],
                  ].map(([value, label]) => (
                    <button key={value} type="button" className={bookingFilter === value ? 'active' : ''} onClick={() => setBookingFilter(value as typeof bookingFilter)}>
                      {label}<span>{value === 'all' ? studioBookings.length : studioBookings.filter(item => item.status === value).length}</span>
                    </button>
                  ))}
                </div>
                <div className="studio-booking-list">
                  {studioBookings
                    .filter(item => bookingFilter === 'all' || item.status === bookingFilter)
                    .map(item => (
                      <article key={item.id}>
                        <i>{item.guest.slice(0, 1)}</i>
                        <div className="studio-booking-person"><strong>{item.guest}</strong><span>{item.phone}</span></div>
                        <div className="studio-booking-course"><strong>{item.classTitle}</strong><span>{item.schedule} · {item.people} 人</span><small>{item.note}</small></div>
                        <span className={`studio-booking-status ${item.status}`}>
                          {{ pending: '待处理', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }[item.status]}
                        </span>
                        <div className="studio-booking-actions">
                          {item.status === 'pending' && <><button type="button" onClick={() => updateBookingStatus(item.id, 'confirmed')}>确认预约</button><button type="button" onClick={() => updateBookingStatus(item.id, 'cancelled')}>谢绝</button></>}
                          {item.status === 'confirmed' && <><button type="button" onClick={() => updateBookingStatus(item.id, 'completed')}>完成体验</button><button type="button" onClick={() => updateBookingStatus(item.id, 'cancelled')}>取消</button></>}
                          {item.status === 'cancelled' && <button type="button" onClick={() => updateBookingStatus(item.id, 'pending')}>恢复预约</button>}
                          {item.status === 'completed' && <span>已归档</span>}
                        </div>
                      </article>
                    ))}
                  {studioBookings.filter(item => bookingFilter === 'all' || item.status === bookingFilter).length === 0 && (
                    <div className="studio-booking-empty"><i>约</i><strong>当前没有此类预约</strong><span>新的预约会自动出现在这里</span></div>
                  )}
                </div>
              </section>
            )}

            {tab === 'analytics' && (
              <section className="studio-analytics studio-tab-enter">
                <div className="studio-section-heading">
                  <div><span>经营数据</span><h1>作品与咨询表现</h1></div><select value={analyticsRange} onChange={event => { setAnalyticsRange(event.target.value); setActionMessage(`已切换为${event.target.value}模拟数据`) }}><option>近6个月</option><option>近30天</option></select>
                </div>
                <div className="studio-kpi-grid analytics">
                  {[
                    ['咨询→预约转化', '31.5%', '模拟数据'],
                    ['平均回复时间', '22 分钟', '模拟数据'],
                    ['作品获赞', totalLikes.toLocaleString(), `${displayWorks.length} 件作品`],
                    ['主页关注者', displayFollowerCount.toLocaleString(), artisan.followerCount ? '实时账户数据' : '模拟数据'],
                  ].map(([label, value, delta]) => <div key={label}><small>{label}</small><strong>{value}</strong><b>{delta}</b></div>)}
                </div>
                <div className="studio-analytics-grid">
                  <div className="studio-panel studio-analytics-chart">
                    <header><strong>咨询增长趋势</strong><span>单位：次</span></header>
                    <div className="studio-line-bars">
                      {CONSULT_DATA.map((value, index) => <div key={MONTHS[index]}><span>{value}</span><i style={{ height: `${value}%` }} /><small>{MONTHS[index]}</small></div>)}
                    </div>
                  </div>
                  <div className="studio-panel studio-ranking">
                    <header><strong>作品转化排行</strong><span>作品获赞</span></header>
                    {displayWorks.slice(0, 4).map((work, index) => (
                      <div key={work.id}><i>{index + 1}</i><span><strong>{work.title}</strong><small>{work.likes.toLocaleString()} 浏览</small></span><b>{work.likes.toLocaleString()}</b></div>
                    ))}
                  </div>
                </div>
                <div className="studio-growth-flow"><span>增长路径</span>{['持续发布', '精选曝光', '获得咨询', '预约转化', '沉淀口碑'].map((item, index) => <div key={item}><strong>{item}</strong>{index < 4 && <i>→</i>}</div>)}</div>
              </section>
            )}
          </div>
        </div>

        <footer className="artisan-studio-footer"><span>满小传传承人服务中心</span><span>作品可见 · 咨询可达 · 数据可用</span></footer>
      </section>

      {showAiCopyDialog && (
        <div className="studio-ai-dialog-backdrop" role="presentation" onClick={() => setShowAiCopyDialog(false)}>
          <section className="studio-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-ai-title" onClick={event => event.stopPropagation()}>
            <header>
              <div><span>豆包 AI 文案助手</span><h2 id="studio-ai-title">把口述故事整理成作品文案</h2></div>
              <button type="button" onClick={() => setShowAiCopyDialog(false)} aria-label="关闭">×</button>
            </header>
            <div className="studio-ai-dialog-body">
              <label><span>文案风格</span><select value={aiTone} onChange={event => setAiTone(event.target.value)}><option>雅致叙事</option><option>质朴口述</option><option>展览说明</option><option>社交分享</option></select></label>
              <label><span>补充要求</span><textarea value={aiDirection} onChange={event => setAiDirection(event.target.value)} placeholder="例如：突出三十年手艺经历，控制在 180 字以内" /></label>
              <div className="studio-ai-source"><span>将参考</span><strong>{draftTitle || '未命名作品'}</strong><small>{draftDescription || '请先口述或填写一些素材'}</small></div>
              {aiResult && <div className="studio-ai-result"><span>生成结果</span><p>{aiResult}</p></div>}
              {aiError && <p className="studio-tool-error" role="alert">{aiError}</p>}
            </div>
            <footer>
              <button type="button" onClick={() => setShowAiCopyDialog(false)}>取消</button>
              <button type="button" onClick={generateAiCopy} disabled={aiGenerating}>{aiGenerating ? '豆包生成中…' : aiResult ? '重新生成' : '生成文案'}</button>
              <button type="button" className="primary" onClick={applyAiCopy} disabled={!aiResult}>采用此文案</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}