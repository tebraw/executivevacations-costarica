import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ROSE = '#c084a0';

function BlogCard({ post }) {
  const date = new Date(post.date);
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const excerpt = post.text.length > 160 ? post.text.slice(0, 160).trim() + '…' : post.text;

  return (
    <Link to={`/blog/${post.slug}-${post.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid #f0eaf0',
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
        {post.imageUrl ? (
          <div style={{ height: '220px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        ) : (
          <div style={{
            height: '160px', flexShrink: 0,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.5" opacity="0.6">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        )}

        <div style={{ padding: '22px 24px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
            color: ROSE, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
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
          <span style={{
            marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem',
            fontWeight: 600, color: ROSE,
          }}>
            Read more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function WeddingBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = 'Wedding Blog — Costa Rica Destination Wedding Inspiration | Executive Vacations';
    const desc = 'Wedding inspiration, planning tips, and real Costa Rica destination wedding stories from Executive Vacations.';
    document.title = title;
    const setMeta = (name, content, prop) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', 'https://executivevacations.net/wedding-blog', true);

    fetch('/.netlify/functions/get-blog-posts')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        // Show posts for wedding site: 'wedding' or 'both'
        const filtered = all.filter(p => p.site === 'wedding' || p.site === 'both');
        setPosts(filtered); setLoading(false);
      })
      .catch(() => { setPosts([]); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#fdfaf9' }}>
      <Header />

      {/* Hero Banner */}
      <div style={{
        paddingTop: '120px', paddingBottom: '64px',
        background: 'linear-gradient(160deg, #1a0a10 0%, #2d1520 100%)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: ROSE, marginBottom: '12px', fontWeight: 600,
        }}>
          Executive Vacations
        </p>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff',
          lineHeight: 1.15, marginBottom: '16px',
        }}>
          Wedding Stories &amp; Inspiration
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)', maxWidth: '520px', margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Planning tips, real weddings, and ideas for your perfect Costa Rica ceremony.
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
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💍</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280', fontSize: '1rem' }}>
              No wedding posts yet — check back soon!
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
