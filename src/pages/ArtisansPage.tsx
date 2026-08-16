import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ARTISANS, CATEGORIES } from '../data'
import { supabase } from '../lib/supabase'
import './artisans-page.css'

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState(ARTISANS)

  useEffect(() => {
    let active = true

    supabase
      .from('artisans')
      .select('id, category_id, name, title, bio, quote, avatar_url, cover_url, years_experience, work_count, follower_count')
      .order('sort_order')
      .then(({ data }) => {
        if (!active || !data?.length) return
        setArtisans(data.map(artisan => ({
          id: artisan.id,
          name: artisan.name,
          title: artisan.title,
          years: artisan.years_experience,
          works: artisan.work_count,
          fans: artisan.follower_count,
          quote: artisan.quote ?? '',
          avatar: artisan.avatar_url ?? '',
          cover: artisan.cover_url ?? '',
          category: artisan.category_id ?? '',
          links: {},
          bio: artisan.bio ?? '',
        })))
      })

    return () => {
      active = false
    }
  }, [])

  const categoryNames = useMemo(
    () => new Map(CATEGORIES.map(category => [category.id, category.name])),
    [],
  )

  return (
    <main className="artisans-page">
      <header className="artisans-masthead">
        <div className="artisans-kicker">守 艺 · 守 心 · 守 传 承</div>
        <h1>认识匠人</h1>
        <p>走近手艺背后的人，听见岁月留在指尖的声音。每一张卡片，都是一段可以继续阅读的匠心故事。</p>
      </header>

      <section className="artisans-grid" aria-label="传承人名录">
        {artisans.map(artisan => (
          <Link className="artisan-directory-card" key={artisan.id} to={`/artisan/${artisan.id}`}>
            <div className="artisan-card-cover">
              {artisan.cover && <img src={artisan.cover} alt={`${artisan.name}的工艺作品`} />}
              <span className="artisan-card-category">{categoryNames.get(artisan.category) ?? '非遗传承'}</span>
            </div>

            <div className="artisan-card-body">
              <div className="artisan-card-avatar">
                {artisan.avatar && <img src={artisan.avatar} alt={artisan.name} />}
              </div>
              <div className="artisan-card-heading">
                <h2>{artisan.name}</h2>
                <span>{artisan.title}</span>
              </div>
              <p className="artisan-card-quote">“{artisan.quote || '一门手艺，守的是时间，也是初心。'}”</p>
              <div className="artisan-card-stats">
                {[
                  ['从业', `${artisan.years}年`],
                  ['作品', `${artisan.works}件`],
                  ['关注', artisan.fans.toLocaleString()],
                ].map(([label, value]) => (
                  <div className="artisan-card-stat" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
