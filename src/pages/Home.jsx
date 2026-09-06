import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import photos from '../data/photos.json';
import { displayUrl } from '../utils/cloudinary';
import { slugify } from '../utils/slugify';
import { getSeriesLabel } from '../utils/series';

function getHeroPhoto() {
  return photos.find((photo) => photo.id === 'shenzhen10') ?? photos[0];
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CoverImage({ cloudinaryId, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-neutral-800" />
      )}
      <img
        src={displayUrl(cloudinaryId.trim())}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 z-10 h-full w-full object-cover transition-all duration-[400ms] ease-out brightness-[0.85] group-hover:scale-[1.04] group-hover:brightness-[0.95] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

function SeriesCard({ name, slug, cover, count, className = '' }) {
  return (
    <Link
      to={`/series/${slug}`}
      className={`group relative block h-[300px] w-full overflow-hidden rounded-lg border border-white/10 bg-neutral-900 transition-colors duration-300 hover:border-white/30 md:h-full ${className}`}
    >
      <CoverImage cloudinaryId={cover.cloudinaryId} alt={`${getSeriesLabel(name)} 封面`} />

      <div className="absolute inset-x-0 bottom-0 z-20 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />

      <div className="absolute bottom-0 left-0 z-30 p-5">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-white">
          {getSeriesLabel(name)}
        </p>
        <p className="mt-1.5 text-xs tracking-[0.15em] text-neutral-400">
          {String(count).padStart(2, '0')} 张作品
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const heroPhoto = getHeroPhoto();

  const seriesMap = new Map();
  for (const photo of photos) {
    if (!seriesMap.has(photo.series)) {
      seriesMap.set(photo.series, []);
    }
    seriesMap.get(photo.series).push(photo);
  }

  const seriesList = Array.from(seriesMap.entries()).map(([name, items]) => ({
    name,
    slug: slugify(name),
    cover: items[0],
    count: items.length,
  }));

  const selectedSeries = seriesList.slice(0, 3);

  return (
    <main className="flex-1">
      {/* Hero 首屏 */}
      <section className="relative -mt-16 flex h-screen items-center justify-center overflow-hidden">
        <img
          src={displayUrl(heroPhoto.cloudinaryId.trim())}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="animate-hero-fade text-[clamp(3rem,8vw,7rem)] font-light tracking-[0.2em] text-white">
            LENS
          </h1>
          <p
            className="animate-hero-fade mt-6 max-w-xl text-base text-neutral-300 sm:text-lg"
            style={{ animationDelay: '0.15s' }}
          >
            用镜头记录城市、自然与街头的光影瞬间
          </p>
          <a
            href="#series"
            className="animate-hero-fade mt-10 inline-block border border-white/60 px-8 py-3 text-sm tracking-[0.25em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
            style={{ animationDelay: '0.3s' }}
          >
            探索作品 ↓
          </a>
        </div>
      </section>

      {/* 精选系列 */}
      <section id="series" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-neutral-500">
              作品系列
            </p>
            <h2 className="mt-2 text-2xl font-light text-white">精选系列</h2>
          </div>
          <Link
            to="/series"
            className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
          >
            查看全部 →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[236px]">
          {selectedSeries.map((series, index) => (
            <Reveal
              key={series.slug}
              delay={index * 100}
              className={index === 0 ? 'md:row-span-2' : ''}
            >
              <SeriesCard {...series} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
