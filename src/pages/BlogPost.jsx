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

  // SEO
  const metaTitle = post.metaTitle || post.title + ' | Executive Vacations Costa Rica';
  const metaDesc = post.metaDesc || 'Executive Vacations Costa Rica — luxury private villa rentals. ' + post.title;
  const wordCount = post.text.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const canonicalUrl = `https://executivevacations.net/blog/${post.slug}-${post.id}`;
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: metaDesc,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: { '@type': 'Organization', name: 'Executive Vacations Costa Rica', url: 'https://executivevacations.net' },
    publisher: { '@type': 'Organization', name: 'Executive Vacations Costa Rica', url: 'https://executivevacations.net' },
    url: canonicalUrl,
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    keywords: post.focusKeyword || 'luxury villa Costa Rica, private villa rental Costa Rica',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  });

  // Inject meta tags into document head
  useEffect(() => {
    document.title = metaTitle;
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', metaDesc);
    setMeta('og:title', metaTitle, true);
    setMeta('og:description', metaDesc, true);
    setMeta('og:url', canonicalUrl, true);
    if (post.imageUrl) setMeta('og:image', post.imageUrl, true);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', canonicalUrl);
    return () => { document.title = 'Executive Vacations Costa Rica - Luxury Villa Rentals'; };
  }, [post]);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
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
            {formatted} &nbsp;·&nbsp; {readingTime} min read
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

        {/* CTA */}
        <div style={{
          marginTop: '56px', padding: '40px 36px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 100%)',
          borderRadius: '20px', textAlign: 'center',
          border: '1px solid rgba(201,169,110,0.3)',
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 600, marginBottom: '10px' }}>
            Executive Vacations Costa Rica
          </p>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>
            Ready to Plan Your Costa Rica Escape?
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Download our free Pricing Guide and discover exact rates, availability, and everything you need to book your perfect villa.
          </p>
          <a
            href="/pricing"
            style={{
              display: 'inline-block', padding: '14px 32px',
              background: 'linear-gradient(135deg, #c9a96e, #a07040)',
              borderRadius: '12px', color: '#fff',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: '0.9rem', textDecoration: 'none',
            }}
          >
            Get Your Free Pricing Guide →
          </a>
        </div>

        {/* Back link */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f0ece4' }}>
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
