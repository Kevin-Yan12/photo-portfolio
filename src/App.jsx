import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Series from './pages/Series';
import SeriesDetail from './pages/SeriesDetail';
import About from './pages/About';
import Guide from './pages/Guide';

function Navigation() {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-white ${
      isActive ? 'text-white' : 'text-neutral-400'
    }`;

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
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
      <div className="flex min-h-screen flex-col">
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
