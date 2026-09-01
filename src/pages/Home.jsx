import { useState } from 'react';
import { Link } from 'react-router-dom';
import photos from '../data/photos.json';
import { thumbUrl } from '../utils/cloudinary';
import { slugify } from '../utils/slugify';

function CoverImage({ cloudinaryId, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-neutral-800" />
      )}
      <img
        src={thumbUrl(cloudinaryId.trim())}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

function CoverCard({ name, slug, cover, count }) {
  return (
    <Link
      to={`/series/${slug}`}
      className="group relative block aspect-[3/2] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-600 hover:shadow-lg hover:shadow-black/20"
    >
      <CoverImage cloudinaryId={cover.cloudinaryId} alt={`${name} 封面`} />

      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 z-30 p-5">
        <h3 className="text-xl font-medium text-white">{name}</h3>
        <p className="mt-1 text-sm text-neutral-300">{count} 张照片</p>
      </div>
    </Link>
  );
}

export default function Home() {
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

  return (
    <main className="flex-1 px-6 py-16">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
          个人摄影作品展示
        </h1>
        <p className="mt-4 text-neutral-400">
          用镜头记录城市、自然与街头的光影瞬间。
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-neutral-500">
          系列画廊
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <CoverCard key={series.slug} {...series} />
          ))}
        </div>
      </section>
    </main>
  );
}
