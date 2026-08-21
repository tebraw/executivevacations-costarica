import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import VillaDetailPage from './pages/VillaDetailPage'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const WeddingBlog = lazy(() => import('./pages/WeddingBlog'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Weddings = lazy(() => import('./pages/Weddings'))
const WeddingPackages = lazy(() => import('./pages/WeddingPackages'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Cookies = lazy(() => import('./pages/Cookies'))

import { isWeddingDomain } from './utils/siteBrand'

// Fires once on load to record QR-code-sourced visits (?ref=...)
function QRTracker() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^[a-zA-Z0-9_-]{1,50}$/.test(ref)) {
      fetch(`/.netlify/functions/track-visit?ref=${encodeURIComponent(ref)}`).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function App() {
  const weddingDomain = isWeddingDomain();

  return (
    <Router>
      <QRTracker />
      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/13038818588"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Wendy on WhatsApp"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50px',
          padding: '12px 20px 12px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          textDecoration: 'none',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: '600',
          fontSize: '15px',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'; }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="26" height="26" fill="white" style={{flexShrink: 0}}>
          <path d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7C17.2 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4zm0 36c-3.1 0-6.1-.8-8.7-2.4l-.6-.4-6.2 1.6 1.7-6-.4-.6C8.2 29.8 7.3 27 7.3 24 7.3 14.8 14.8 7.3 24 7.3S40.7 14.8 40.7 24 33.2 40 24 40zm10.9-14.4c-.6-.3-3.5-1.7-4-1.9s-.9-.3-1.3.3-1.5 1.9-1.8 2.3-.7.4-1.3.1c-.6-.3-2.4-.9-4.6-2.8-1.7-1.5-2.8-3.4-3.2-3.9s0-.8.3-1.1l.9-1.1c.2-.3.3-.6.5-.9s.1-.6 0-.9c-.1-.3-1.3-3.1-1.8-4.3-.5-1.1-1-1-1.3-1h-1.1c-.4 0-1 .1-1.5.7s-2 2-2 4.8 2.1 5.6 2.4 6c.3.4 4.1 6.3 10 8.8 1.4.6 2.5 1 3.3 1.2 1.4.4 2.7.4 3.7.2 1.1-.2 3.5-1.4 4-2.8s.5-2.5.4-2.8c-.2-.3-.6-.4-1.2-.7z"/>
        </svg>
        <div style={{display: 'flex', flexDirection: 'column', lineHeight: '1.2'}}>
          <span style={{fontSize: '13px', fontWeight: '400', opacity: '0.9'}}>Questions? Chat with</span>
          <span style={{fontSize: '16px', fontWeight: '700'}}>Wendy 👋</span>
        </div>
      </a>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={weddingDomain ? <Weddings /> : <Home />} />
        <Route path="/villa/:slug" element={<VillaDetailPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/wedding-blog" element={<WeddingBlog />} />
        <Route path="/pricing" element={weddingDomain ? <WeddingPackages /> : <Pricing />} />
        <Route path="/pricing/" element={weddingDomain ? <WeddingPackages /> : <Pricing />} />
        <Route path="/weddings" element={<Weddings />} />
        <Route path="/wedding-packages" element={<WeddingPackages />} />
        <Route path="/admin12345" element={<AdminDashboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>
      </Suspense>
    </Router>
  )
}

export default App
