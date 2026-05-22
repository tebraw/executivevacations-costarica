import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';

function BlogCard({ post }) {
  const date = new Date(post.date);
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const excerpt = post.text.length > 160 ? post.text.slice(0, 160).trim() + '…' : post.text;

  return (
    <Link
      to={`/blog/${post.slug}-${post.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid #f0ece4',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        {post.imageUrl ? (
          <div style={{ height: '220px', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
        ) : (
          <div style={{
            height: '160px', flexShrink: 0,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.6">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '22px 24px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
            color: GOLD, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
            marginBottom: '8px', display: 'block',
          }}>
            {formatted}
          </span>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: '1.1rem', color: '#111', lineHeight: 1.35,
            marginBottom: '12px', flex: 0,
          }}>
            {post.title}
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem',
            color: '#6b7280', lineHeight: 1.65, flex: 1,
          }}>
            {excerpt}
          </p>
          <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.83rem',
              fontWeight: 600, color: GOLD,
            }}>
              Read more
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/.netlify/functions/get-blog-posts')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setPosts([]); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Header />

      {/* Hero Banner */}
      <div style={{
        paddingTop: '120px', paddingBottom: '64px',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: GOLD, marginBottom: '12px', fontWeight: 600,
        }}>
          Executive Vacations
        </p>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff',
          lineHeight: 1.15, marginBottom: '16px',
        }}>
          News &amp; Stories
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)', maxWidth: '500px', margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Insider tips, villa updates and life in Costa Rica.
        </p>
      </div>

      {/* Posts grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 96px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
            Loading…
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280', fontSize: '1rem' }}>
              No posts yet — check back soon!
            </p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px',
          }}>
            {posts.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
