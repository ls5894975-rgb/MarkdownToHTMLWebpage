import { Link } from 'react-router'
import type { WORKS } from '../data'

type Work = typeof WORKS[number]

export default function WorkCard({ work }: { work: Work }) {
  const tagColors: Record<string, { bg: string; color: string }> = {
    '可定制': { bg: 'rgba(196,62,62,0.1)', color: 'var(--zhu)' },
    '在售': { bg: 'rgba(44,95,109,0.1)', color: 'var(--qing)' },
    '体验课': { bg: 'rgba(90,74,42,0.1)', color: '#5A4A2A' },
  }

  return (
    <Link to={`/work/${work.id}`} style={{ display: 'block' }}>
      <div style={{
        background: 'white', borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--border)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = ''
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f0ece6' }}>
          <img
            src={work.img}
            alt={work.title}
            style={{ width: '100%', height: work.imgH, objectFit: 'cover', display: 'block' }}
          />
          {work.tags.map(tag => (
            <span key={tag} style={{
              position: 'absolute', top: 10, right: 10,
              fontSize: 11, fontFamily: "'Noto Sans SC'", fontWeight: 500, padding: '2px 8px', borderRadius: 4,
              ...tagColors[tag],
            }}>{tag}</span>
          ))}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontFamily: "'Noto Serif SC'", fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>{work.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={work.artisan.avatar}
                alt={work.artisan.name}
                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC'", color: 'var(--text-mid)' }}>{work.artisan.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--zhu)" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {work.likes.toLocaleString()}
              </span>
            </div>
          </div>
          {work.price && (
            <div style={{ marginTop: 8, fontFamily: "'Noto Serif SC'", fontSize: 13, color: 'var(--zhu)', fontWeight: 600 }}>{work.price}</div>
          )}
        </div>
      </div>
    </Link>
  )
}
