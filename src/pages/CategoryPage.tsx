import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { CATEGORIES, WORKS } from "../data"
import WorkCard from "../components/WorkCard"
import { supabase } from "../lib/supabase"

const FILTERS = ["最新", "最热", "可定制", "体验课"]

const CATEGORY_CONTENT = {
  "suzhou-embroidery": {
    tagline: "以针为笔，以线为墨，绣尽东方风雅",
    knowledge: {
      history: {
        title: "苏绣源流",
        icon: "📜",
        content:
          "苏绣发源于苏州，以精、细、雅、洁著称。它在历代匠人的传习中不断丰富，从日用绣品走向兼具观赏性与收藏价值的艺术作品。",
      },
      craft: {
        title: "刺绣针法",
        icon: "🪡",
        content:
          "平绣、套针、乱针与双面绣等针法共同塑造苏绣细腻的层次。匠人通过劈丝、配色和走针，让丝线呈现近似绘画的光影与质感。",
      },
      pattern: {
        title: "吉祥纹样",
        icon: "🎨",
        content:
          "花鸟虫鱼、山水人物与瑞兽是苏绣常见题材。牡丹、莲花、凤凰和锦鲤等纹样寄托着富贵、清雅、祥瑞与有余的美好愿望。",
      },
    },
  },
  ruci: {
    tagline: "雨过天青，温润如玉，一窑藏尽宋韵",
    knowledge: {
      history: {
        title: "汝瓷源流",
        icon: "📜",
        content:
          "汝瓷以含蓄温润的审美闻名。今日的传承者从古代器形、釉色与烧成经验中汲取灵感，让天青之美在当代生活中延续。",
      },
      craft: {
        title: "天青釉色",
        icon: "🔥",
        content:
          "汝瓷之美来自胎、釉、火的共同作用。制坯、修坯、施釉与烧成环环相扣，细微的温度与气氛变化都会影响最终色泽。",
      },
      pattern: {
        title: "器形美学",
        icon: "🏺",
        content:
          "汝瓷多以简净器形取胜，线条克制而比例舒展。釉面开片与温润色泽相互映衬，形成安静、雅正的视觉气质。",
      },
    },
  },
  lacquer: {
    tagline: "百遍髹涂，时光成器，漆色深处见光华",
    knowledge: {
      history: {
        title: "大漆与非遗",
        icon: "📜",
        content:
          "大漆是从漆树韧皮部采集的天然漆液。中国各地在长期实践中形成了平遥推光、福州脱胎、绛州剔犀等髹饰传统；其中平遥推光漆器髹饰技艺于2006年列入第一批国家级非物质文化遗产代表性项目名录。",
      },
      craft: {
        title: "髹漆工序",
        icon: "🖌️",
        content:
          "传统髹漆通常要经历制胎、披麻挂灰、反复髹涂、阴干、研磨和推光。天然漆需要在适宜温湿度下缓慢成膜，每层干透后才能继续；平遥推光还会用砂纸、木炭、头发等逐次研磨，直至漆面光亮如镜。",
      },
      pattern: {
        title: "装饰技法",
        icon: "🎨",
        content:
          "漆器装饰不只是绘画。描金以金色勾勒纹样，螺钿把贝壳薄片嵌入漆面，雕漆则在多层厚漆上刻纹；剔犀会交替髹涂不同色漆，再以V形刀刻出云钩、回纹，使刀口显露层层色带。",
      },
    },
  },
  woodcarving: {
    tagline: "循木而作，一刀一凿，唤醒沉睡的山河",
    knowledge: {
      history: {
        title: "木雕与非遗",
        icon: "📜",
        content:
          "木雕与建筑、家具、祭祀器具及观赏陈设相伴。东阳木雕、乐清黄杨木雕和潮州木雕均于2006年列入第一批国家级非物质文化遗产名录，展现了不同地域的木作传统。",
      },
      craft: {
        title: "雕刻技法",
        icon: "🪚",
        content:
          "木雕创作通常从选材、构图和凿粗坯开始，再经精细雕刻与修整成形。圆雕可从各个角度观赏，浮雕在平面上塑造层次，镂雕则凿透背景；潮州木雕尤其讲究层层穿插、镂通剔透。",
      },
      pattern: {
        title: "地域风格",
        icon: "🎨",
        content:
          "东阳木雕多用樟木、椴木等材料，重视构图与绘画性，常以浮雕表现；黄杨木纹理细腻，适合圆雕人物；潮州木雕多用于建筑、家具和祭祀器具，常见多层镂雕与髹漆贴金。",
      },
    },
  },
  papercut: {
    tagline: "一纸一剪，镂空成景，方寸映照万家灯火",
    knowledge: {
      history: {
        title: "剪纸与非遗",
        icon: "📜",
        content:
          "剪纸广泛用于窗花、婚庆、节令和祈愿等民俗场景，并在家庭与社区中代代传承。2009年，“中国剪纸”列入联合国教科文组织人类非物质文化遗产代表作名录。",
      },
      craft: {
        title: "剪刻技法",
        icon: "✂️",
        content:
          "剪纸既可用剪刀单幅剪制，也可叠纸后用刻刀成批刻制。阳刻保留纹样线条，阴刻刻去纹样线条，二者结合形成虚实；蔚县剪纸还以阴刻为主、阳刻为辅，并在刻成后进行多色点染。",
      },
      pattern: {
        title: "民俗纹样",
        icon: "🎨",
        content:
          "剪纸可装点窗户、顶棚和礼仪空间，也用于春节、婚礼、寿庆与祈愿。戏曲人物、花鸟鱼虫、生肖瑞兽等题材寄托祝福；安塞剪纸粗犷质朴，蔚县剪纸色彩浓艳，展现鲜明的地域审美。",
      },
    },
  },
  dyeing: {
    tagline: "经纬织梦，草木染色，把山川穿在身上",
    knowledge: {
      history: {
        title: "织染与非遗",
        icon: "📜",
        content:
          "传统织染把纺织、染料与地方生活结合起来。南通蓝印花布印染技艺、白族扎染技艺于2006年列入第一批国家级非物质文化遗产名录；苗族、革家等群体也保存着各具特色的蜡染传统。",
      },
      craft: {
        title: "防染技法",
        icon: "🧵",
        content:
          "扎染以针线绞扎布料，使扎紧处不易着色；蜡染先用熔蜡绘纹，染色后煮洗去蜡；蓝印花布则经过设计、刻版、刮防染浆、浸染、刮浆和漂洗。三者都以阻隔染液形成花纹。",
      },
      pattern: {
        title: "纹样与生活",
        icon: "🎨",
        content:
          "蓝印花布常见花卉、动物与几何纹，制成被面、包袱和头巾；白族扎染多用自然小纹样，寓意吉祥；苗族蜡染偏爱自然纹与几何纹，图案也承载族群记忆与生活经验。",
      },
    },
  },
  metalwork: {
    tagline: "金石为骨，锤声作韵，冷光之中藏有温度",
    knowledge: {
      history: {
        title: "金工与非遗",
        icon: "📜",
        content:
          "传统金工以金、银、铜为材料，涵盖器皿、首饰、陈设与礼仪用品。景泰蓝制作技艺于2006年列入第一批国家级非物质文化遗产名录，花丝镶嵌和金银细工制作技艺于2008年列入第二批。",
      },
      craft: {
        title: "锻錾技法",
        icon: "🔨",
        content:
          "锻打或锤揲用于成形，錾刻用錾子在金属表面起纹，焊接负责连接，最后再修整抛光。花丝还要把金银拉成细丝，以掐、填、攒、焊、堆、垒、织、编组成轻巧纹样。",
      },
      pattern: {
        title: "工艺辨识",
        icon: "🎨",
        content:
          "景泰蓝是在铜胎上掐粘铜丝、填珐琅釉并烧制磨光；花丝镶嵌以细丝编织、堆垒并镶嵌宝石；苗族银饰则经锻、编、錾、刻、焊接组合，常制成银帽、项圈、胸锁与手镯。",
      },
    },
  },
  pottery: {
    tagline: "以泥为骨，以火为魂，在掌心烧出山川岁月",
    knowledge: {
      history: {
        title: "陶艺与非遗",
        icon: "📜",
        content:
          "陶瓷技艺把地方泥料、造型经验与窑火知识结合起来。宜兴紫砂陶制作技艺、石湾陶塑技艺和德化瓷烧制技艺均于2006年列入第一批国家级非物质文化遗产名录。",
      },
      craft: {
        title: "成型烧造",
        icon: "🔥",
        content:
          "练泥之后可采用拉坯、泥条盘筑、拍打泥片、镶接或捏塑等方法成形。坯体干燥后再修整装饰，按需要施釉并入窑烧成；泥料、釉料、温度和窑内气氛共同影响最终质感。",
      },
      pattern: {
        title: "工艺辨识",
        icon: "🏺",
        content:
          "宜兴紫砂以茗壶为代表，常用泥片拍打或镶接成形；石湾陶塑以人物造型见长，兼有写实与夸张，并重视施釉和龙窑火候；德化瓷使用高岭土高温烧成，以洁白温润的瓷塑著称。",
      },
    },
  },
} as const

type Work = typeof WORKS[number]

export default function CategoryPage() {
  const { id } = useParams()
  const initialCategory =
    CATEGORIES.find((category) => category.id === id) || CATEGORIES[0]
  const [cat, setCat] = useState(initialCategory)
  const [works, setWorks] = useState<Work[]>(() =>
    WORKS.filter((work) => work.category === initialCategory.id),
  )
  const [filter, setFilter] = useState("最热")
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  const categoryContent =
    CATEGORY_CONTENT[cat.id] ?? CATEGORY_CONTENT["suzhou-embroidery"]

  useEffect(() => {
    let active = true
    const fallbackCategory =
      CATEGORIES.find((category) => category.id === id) || CATEGORIES[0]
    setCat(fallbackCategory)
    setWorks(WORKS.filter((work) => work.category === fallbackCategory.id))

    const loadCategory = async () => {
      const { data: category } = await supabase
        .from("categories")
        .select("id, name, artisan_count, work_count, image_url, color")
        .eq("id", id ?? fallbackCategory.id)
        .maybeSingle()

      if (!active || !category) return
      setCat({
        id: category.id,
        name: category.name,
        count: category.artisan_count,
        works: category.work_count,
        img: category.image_url ?? "",
        color: category.color ?? "#5A4A3A",
      })

      const { data: workRows } = await supabase
        .from("works")
        .select(`
          id, title, category_id, image_url, image_height, price_text,
          tags, likes_count, comments_count, description,
          knowledge, ai_questions, hotspots,
          artisan:artisans (
            id, name, title, category_id, bio, quote, avatar_url,
            cover_url, years_experience, work_count, follower_count
          )
        `)
        .eq("status", "published")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false })

      if (!active || !workRows) return
      setWorks(
        workRows.map((row) => {
          const fallback = WORKS.find((work) => work.id === row.id) || WORKS[0]
          const artisan = row.artisan
          return {
            ...fallback,
            id: row.id,
            title: row.title,
            artisan: artisan
              ? {
                  id: artisan.id,
                  name: artisan.name,
                  title: artisan.title,
                  years: artisan.years_experience,
                  works: artisan.work_count,
                  fans: artisan.follower_count,
                  quote: artisan.quote ?? "",
                  avatar: artisan.avatar_url ?? "",
                  cover: artisan.cover_url ?? "",
                  category: artisan.category_id ?? "",
                  links: {},
                  bio: artisan.bio ?? "",
                }
              : fallback.artisan,
            category: row.category_id ?? category.id,
            img: row.image_url ?? fallback.img,
            imgH: row.image_height,
            likes: row.likes_count,
            comments: row.comments_count,
            tags: row.tags ?? [],
            price: row.price_text ?? "面议",
            desc: row.description ?? "",
          }
        }),
      )
    }

    void loadCategory()
    return () => {
      active = false
    }
  }, [id])

  const displayedWorks = [...works]
    .filter((work) =>
      filter === "可定制"
        ? work.tags.includes("可定制")
        : filter === "体验课"
          ? work.tags.includes("体验课")
          : true,
    )
    .sort((a, b) =>
      filter === "最热" ? b.likes - a.likes : b.id.localeCompare(a.id),
    )

  return (
    <main>
      {/* Category hero */}
      <section
        style={{
          position: "relative",
          height: 320,
          overflow: "hidden",
          background: cat.color,
        }}
      >
        <img
          src={cat.img}
          alt={cat.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              width: "100%",
              margin: "0 auto",
              padding: "0 32px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Noto Sans SC'",
                marginBottom: 8,
              }}
            >
              <Link to="/home" style={{ color: "rgba(255,255,255,0.4)" }}>
                首页
              </Link>
              {" / "}
              {cat.name}
            </div>
            <h1
              style={{
                fontFamily: "'Noto Serif SC'",
                fontSize: 42,
                fontWeight: 900,
                color: "white",
                margin: "0 0 10px",
              }}
            >
              {cat.name}
            </h1>
            <p
              style={{
                fontFamily: "'Noto Serif SC'",
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 20px",
                fontStyle: "italic",
              }}
            >
              {categoryContent.tagline}
            </p>
            <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
              {[
                ["匠人", `${cat.count}位`],
                ["作品", `${cat.works}件`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: "'Noto Serif SC'",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {v}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Noto Sans SC'",
                    }}
                  >
                    {k}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge expand */}
      <section
        style={{
          background: "var(--yue)",
          borderBottom: "1px solid var(--border-warm)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              borderBottom: "1px solid rgba(196,62,62,0.1)",
            }}
          >
            {Object.entries(categoryContent.knowledge).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setExpandedTab(expandedTab === key ? null : key)}
                style={{
                  padding: "14px 20px",
                  fontSize: 13,
                  fontFamily: "'Noto Sans SC'",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: expandedTab === key ? "var(--zhu)" : "var(--text-mid)",
                  borderBottom:
                    expandedTab === key
                      ? "2px solid var(--zhu)"
                      : "2px solid transparent",
                  fontWeight: expandedTab === key ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {val.icon} {val.title}
              </button>
            ))}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--text-light)",
                fontFamily: "'Noto Sans SC'",
                padding: "14px 0",
              }}
            >
              点击了解非遗知识
            </span>
          </div>
          {expandedTab && (
            <div
              style={{
                padding: "20px 0 24px",
                maxWidth: "100%",
                width: "min(720px, calc(100vw - 64px))",
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  fontFamily: "'Noto Sans SC'",
                  fontSize: 14,
                  color: "var(--text)",
                  lineHeight: 1.9,
                  margin: 0,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {
                  categoryContent.knowledge[
                    (expandedTab as keyof typeof categoryContent.knowledge)
                  ].content
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filter + works */}
      <section style={{ padding: "40px 0 64px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: "'Noto Sans SC'",
                fontSize: 14,
                color: "var(--text-mid)",
              }}
            >
              共 {works.length} 件作品
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "'Noto Sans SC'",
                    border: filter === f ? "none" : "1px solid var(--border)",
                    background: filter === f ? "var(--zhu)" : "white",
                    color: filter === f ? "white" : "var(--text-mid)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="category-work-grid">
            {displayedWorks.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
