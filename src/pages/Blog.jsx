import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { isWeddingDomain, SITE_URL } from '../utils/siteBrand';
import PalacioLayout from '../components/palacio/PalacioLayout';
import { useReveal } from '../components/palacio/shared';
import BlogClassic from './BlogClassic';

export const blogDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Stored posts often start with their own title; the page already shows it as the heading.
export const bodyText = (post) => {
  const text = post.text.trim();
  const title = (post.title || '').trim();
  return title && text.toLowerCase().startsWith(title.toLowerCase()) ? text.slice(title.length).trim() : text;
};

export function BlogCard({ post }) {
  const text = bodyText(post);
  const excerpt = text.length > 160 ? `${text.slice(0, 160).trim()}…` : text;
  return (
    <Link className="bcard" to={`/blog/${post.slug}-${post.id}`}>
      <div className="bi">
        {post.imageUrl && <img src={post.imageUrl} alt={post.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      </div>
      <div className="bb">
        <span className="loc">{blogDate(post.date)}</span>
        <h3>{post.title}</h3>
        <p>{excerpt}</p>
        <span className="more">Read more →</span>
      </div>
    </Link>
  );
}

function setMeta(name, content, prop) {
  const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(prop ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function PalacioBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useReveal([posts.length]);

  useEffect(() => {
    const title = 'Luxury Travel Blog — Costa Rica Villa Vacation Tips | The Palacio Collection';
    const desc = 'Explore travel tips, destination guides, and insider advice for planning your luxury villa vacation in Costa Rica.';
    document.title = title;
    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', `${SITE_URL}/blog`, true);
    fetch('/.netlify/functions/get-blog-posts')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        // Posts for the villa site: no site field (legacy), 'villa' or 'both'.
        setPosts(all.filter((p) => !p.site || p.site === 'villa' || p.site === 'both'));
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  return (
    <PalacioLayout>
      <Helmet>
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Helmet>
      <header className="bhero">
        <div className="wrap">
          <div className="eyebrow">The Palacio Journal</div>
          <h1>News &amp; Stories</h1>
          <p>Insider tips, estate updates and life in Costa Rica.</p>
        </div>
      </header>
      <section className="bl">
        <div className="wrap">
          {loading && <p className="center lead">Loading…</p>}
          {!loading && posts.length === 0 && <p className="center lead">No posts yet. Check back soon!</p>}
          {!loading && posts.length > 0 && (
            <div className="bgrid">{posts.map((p) => <BlogCard key={p.id} post={p} />)}</div>
          )}
        </div>
      </section>
    </PalacioLayout>
  );
}

export default function Blog() {
  return isWeddingDomain() ? <BlogClassic /> : <PalacioBlog />;
}
