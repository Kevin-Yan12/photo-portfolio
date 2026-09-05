import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Series from './pages/Series';
import SeriesDetail from './pages/SeriesDetail';
import About from './pages/About';
import Guide from './pages/Guide';

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = `fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
    scrolled
      ? 'border-b border-white/10 bg-black/50 backdrop-blur-md'
      : 'border-b border-transparent bg-transparent'
  }`;

  const linkClass = ({ isActive }) =>
    `text-sm font-medium underline-offset-4 transition-all duration-200 hover:text-white hover:underline ${
      isActive ? 'text-white' : 'text-neutral-400'
    }`;

  return (
    <header className={headerClass}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-lg font-light tracking-tight text-white">
          LENS
        </NavLink>

        <ul className="flex gap-6">
          <li>
            <NavLink to="/" className={linkClass} end>
              首页
            </NavLink>
          </li>
          <li>
            <NavLink to="/series" className={linkClass}>
              系列
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={linkClass}>
              关于
            </NavLink>
          </li>
          <li>
            <NavLink to="/guide" className={linkClass}>
              使用说明
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col pt-16">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/series" element={<Series />} />
          <Route path="/series/:slug" element={<SeriesDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/guide" element={<Guide />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
