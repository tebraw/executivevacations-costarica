import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import VillaDetailPage from './pages/VillaDetailPage'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import WeddingBlog from './pages/WeddingBlog'
import Pricing from './pages/Pricing'
import Weddings from './pages/Weddings'
import WeddingPackages from './pages/WeddingPackages'
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
      </Routes>
    </Router>
  )
}

export default App
