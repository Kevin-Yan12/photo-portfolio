import { useState } from 'react';
import { Link } from 'react-router-dom';
import photos from '../data/photos.json';
import { thumbUrl } from '../utils/cloudinary';
import { slugify } from '../utils/slugify';
import { getSeriesLabel } from '../utils/series';

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

export default function Series() {
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
    <main className="flex-1 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            系列
          </h1>
          <p className="mt-2 text-neutral-400">
            {seriesList.length} 个摄影系列
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <Link
              key={series.slug}
              to={`/series/${series.slug}`}
              className="group relative block aspect-[3/2] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-600 hover:shadow-lg hover:shadow-black/20"
            >
              <CoverImage
                cloudinaryId={series.cover.cloudinaryId}
                alt={`${getSeriesLabel(series.name)} 封面`}
              />

              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 z-30 p-5">
                <h2 className="text-xl font-medium text-white">
                  {getSeriesLabel(series.name)}
                </h2>
                <p className="mt-1 text-sm text-neutral-300">
                  {series.count} 张照片
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
