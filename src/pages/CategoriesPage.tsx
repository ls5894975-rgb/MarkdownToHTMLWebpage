import { Link } from 'react-router'
import { CATEGORIES } from '../data'

export default function CategoriesPage() {
  return (
    <main className="categories-index-page">
      <section className="categories-index-hero">
        <div className="categories-index-eyebrow"><span>类</span> EIGHT CRAFTS</div>
        <h1>探索非遗品类</h1>
        <p>八门手艺，八种观看东方的方式。循着材料与技法，走进作品、匠人与仍在延续的日常。</p>
        <div className="categories-index-line" />
      </section>

      <section className="categories-index-content" aria-labelledby="categories-index-title">
        <header>
          <div>
            <span>八大工艺</span>
            <h2 id="categories-index-title">择一门手艺，继续探索</h2>
          </div>
          <p>点击图片卡片进入对应品类页面</p>
        </header>

        <div className="categories-index-grid">
          {CATEGORIES.slice(0, 8).map((category, index) => (
            <Link key={category.id} to={`/category/${category.id}`} className="categories-index-card">
              <img src={category.img} alt={category.name} />
              <span className="categories-index-card-shade" />
              <span className="categories-index-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="categories-index-card-copy">
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.count} 位匠人 · {category.works} 件作品</small>
                </span>
                <b aria-hidden="true">→</b>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}