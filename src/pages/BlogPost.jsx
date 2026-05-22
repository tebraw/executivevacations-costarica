import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // slug format: "title-slug-id" — the id is the last segment after the last dash chain
  // We stored slug as "toSlug(title)-id" so we split on "-" and the last part is numeric id
  const postId = slug ? slug.split('-').pop() : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!postId) { setNotFound(true); setLoading(false); return; }
    fetch('/.netlify/functions/get-blog-posts')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const found = Array.isArray(data) ? data.find(p => p.id === postId) : null;
        if (found) { setPost(found); } else { setNotFound(true); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#fafaf8' }}>
        <Header />
        <div style={{ paddingTop: '140px', textAlign: 'center', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen" style={{ background: '#fafaf8' }}>
        <Header />
        <div style={{ paddingTop: '140px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontWeight: 700, color: '#111', marginBottom: '12px' }}>Post not found</h2>
          <Link to="/blog" style={{ color: GOLD, fontWeight: 600, textDecoration: 'none' }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.date);
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Render paragraphs from double-newlines
  const paragraphs = post.text.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Header />

      {/* Hero */}
      <div style={{
        paddingTop: '100px',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        minHeight: post.imageUrl ? '0' : '320px',
      }}>
        {post.imageUrl && (
          <div style={{ position: 'relative', maxHeight: '480px', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.2) 60%, rgba(15,23,42,0.0) 100%)',
              zIndex: 1,
            }} />
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: post.imageUrl ? '36px 24px 48px' : '48px 24px 60px',
        }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              marginBottom: '24px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Blog
          </Link>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: GOLD, marginBottom: '10px', fontWeight: 600,
          }}>
            {formatted}
          </p>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#fff',
            lineHeight: 1.2, margin: 0,
          }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 100px' }}>
        <article>
          {paragraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.05rem', color: '#374151',
              lineHeight: 1.8, marginBottom: '24px',
            }}>
              {para.split('\n').map((line, j) => (
                j === 0 ? line : <React.Fragment key={j}><br />{line}</React.Fragment>
              ))}
            </p>
          ))}
        </article>

        {/* Back link */}
        <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid #f0ece4' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: GOLD, fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to all posts
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
