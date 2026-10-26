import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { isWeddingDomain, SITE_URL } from '../utils/siteBrand';
import PalacioLayout from '../components/palacio/PalacioLayout';
import { useReveal } from '../components/palacio/shared';
import { BlogCard, blogDate, bodyText } from './Blog';
import BlogPostClassic from './BlogPostClassic';

function setMeta(name, content, prop = false) {
  const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(prop ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function PalacioBlogPost() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(null);
  // The post id is the last dash-separated part of the URL slug.
  const postId = slug ? slug.split('-').pop() : null;
  const post = posts && postId ? posts.find((p) => String(p.id) === postId) : null;
  useReveal([post?.id]);

  useEffect(() => {
    fetch('/.netlify/functions/get-blog-posts')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]));
  }, [postId]);

  useEffect(() => {
    if (!post) return undefined;
    const metaTitle = post.metaTitle || `${post.title} | The Palacio Collection`;
    const metaDesc = post.metaDesc || `The Palacio Collection — luxury private villas in Costa Rica. ${post.title}`;
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}-${post.id}`;
    document.title = metaTitle;
    setMeta('description', metaDesc);
    setMeta('og:title', metaTitle, true);
    setMeta('og:description', metaDesc, true);
    setMeta('og:url', canonicalUrl, true);
    if (post.imageUrl) setMeta('og:image', post.imageUrl, true);
    return undefined;
  }, [post]);

  if (!posts) {
    return (
      <PalacioLayout>
        <section className="bl"><div className="wrap center lead">Loading…</div></section>
      </PalacioLayout>
    );
  }

  if (!post) {
    return (
      <PalacioLayout>
        <section className="bl">
          <div className="wrap center">
            <h2 className="title">Post not found</h2>
            <Link className="btn btn-gold" to="/blog">Back to Blog</Link>
          </div>
        </section>
      </PalacioLayout>
    );
  }

  const body = bodyText(post);
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const minutes = Math.max(1, Math.round(body.split(/\s+/).length / 200));
  const metaDesc = post.metaDesc || `The Palacio Collection — luxury private villas in Costa Rica. ${post.title}`;
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}-${post.id}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: metaDesc,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: { '@type': 'Organization', name: 'The Palacio Collection', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'The Palacio Collection', url: SITE_URL },
    url: canonicalUrl,
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    keywords: post.focusKeyword || 'luxury villa Costa Rica, private villa rental Costa Rica',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };
  const more = posts
    .filter((p) => p.id !== post.id && (!p.site || p.site === 'villa' || p.site === 'both'))
    .slice(0, 3);

  return (
    <PalacioLayout>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <article className="bp">
        <div className="wrap bpw">
          <Link className="back" to="/blog">← Back to Blog</Link>
          <div className="eyebrow" style={{ marginTop: 26 }}>{blogDate(post.date)} · {minutes} min read</div>
          <h1>{post.title}</h1>
          {post.imageUrl && <img className="bpimg" src={post.imageUrl} alt={post.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
          <div className="bpt">
            {paragraphs.map((para, i) => (
              <p key={i}>
                {para.split('\n').map((line, j) => (j === 0 ? line : <React.Fragment key={j}><br />{line}</React.Fragment>))}
              </p>
            ))}
          </div>
        </div>
      </article>
      {more.length > 0 && (
        <section className="bl">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">Keep reading</div>
              <h2 className="title">More stories</h2>
            </div>
            <div className="bgrid" style={{ marginTop: 48 }}>{more.map((p) => <BlogCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
      <section className="final" style={{ backgroundImage: "url('/images/hero-bg.webp')" }}>
        <div className="wrap">
          <div className="eyebrow" style={{ color: '#f0bd5a' }}>The Palacio Collection</div>
          <h2>Ready to plan your Costa Rica escape?</h2>
          <p>Download our free Pricing Guide and discover exact rates, availability, and everything you need to book your perfect villa.</p>
          <Link className="btn btn-gold" to="/pricing">Get Your Free Pricing Guide →</Link>
        </div>
      </section>
    </PalacioLayout>
  );
}

export default function BlogPost() {
  return isWeddingDomain() ? <BlogPostClassic /> : <PalacioBlogPost />;
}
