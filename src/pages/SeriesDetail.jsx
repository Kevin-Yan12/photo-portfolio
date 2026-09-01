import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import photos from '../data/photos.json';
import { displayUrl, originalUrl } from '../utils/cloudinary';
import { slugify } from '../utils/slugify';

function Tag({ children }) {
  return (
    <span className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs text-neutral-300">
      {children}
    </span>
  );
}

function PhotoCard({ photo, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative mb-4 cursor-zoom-in break-inside-avoid"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`打开大图：${photo.title}`}
    >
      <img
        src={displayUrl(photo.cloudinaryId.trim())}
        alt={photo.title}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg bg-neutral-900"
      />
      <div className="absolute inset-0 flex items-end rounded-lg bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="text-sm font-medium text-white">{photo.title}</p>
      </div>
    </div>
  );
}

function DownloadButton({ photo }) {
  const [status, setStatus] = useState('idle'); // idle | loading | error

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (status === 'loading') return;

    setStatus('loading');
    try {
      const id = photo.cloudinaryId.trim();
      const response = await fetch(originalUrl(id), { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${id}.jpg`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
      setStatus('idle');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const label =
    status === 'loading'
      ? '下载中…'
      : status === 'error'
      ? '下载失败，请重试'
      : '下载原图';

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        status === 'error'
          ? 'border-red-900 bg-red-950/30 text-red-300 hover:border-red-700 hover:text-red-200'
          : 'border-neutral-600 bg-neutral-800 text-neutral-200 hover:border-neutral-400 hover:text-white'
      } ${status === 'loading' ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {label}
    </button>
  );
}

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-50 rounded-full p-2 text-2xl text-neutral-400 transition-colors hover:text-white"
        aria-label="关闭"
      >
        ×
      </button>

      <div
        className="absolute right-20 top-5 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <DownloadButton photo={photo} />
      </div>

      <div
        className="relative mx-auto flex h-full w-full max-w-6xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 图片区：自适应占满剩余空间 */}
        <div className="relative flex w-full flex-1 min-h-0 items-center justify-center">
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-0 z-50 rounded-full bg-black/40 p-3 text-white backdrop-blur transition-colors hover:bg-black/60 sm:-left-14"
              aria-label="上一张"
            >
              ‹
            </button>
          )}

          <img
            src={displayUrl(photo.cloudinaryId.trim())}
            alt={photo.title}
            className="max-h-full max-w-full rounded-lg object-contain"
          />

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-0 z-50 rounded-full bg-black/40 p-3 text-white backdrop-blur transition-colors hover:bg-black/60 sm:-right-14"
              aria-label="下一张"
            >
              ›
            </button>
          )}
        </div>

        {/* 信息栏：最大高度固定，内容内部滚动 */}
        <div className="mt-4 w-full max-w-3xl shrink-0 overflow-y-auto rounded-lg border border-neutral-800/50 bg-neutral-900/70 p-5 text-center text-neutral-200 backdrop-blur max-h-[35vh] md:max-h-[30vh]">
          <h2 className="text-xl font-light text-white">{photo.title}</h2>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-400">
            {photo.location && <span>{photo.location}</span>}
            {photo.location && photo.date && <span>·</span>}
            {photo.date && <span>{photo.date}</span>}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            {photo.gear && <span>{photo.gear}</span>}
            {photo.gear && photo.params && <span>·</span>}
            {photo.params && <span>{photo.params}</span>}
          </div>

          {photo.tags && photo.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {photo.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeriesDetail() {
  const { slug } = useParams();

  const matchedPhotos = useMemo(() => {
    return photos.filter((photo) => slugify(photo.series) === slug);
  }, [slug]);

  const [activeIndex, setActiveIndex] = useState(null);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setActiveIndex((i) =>
      i !== null && i < matchedPhotos.length - 1 ? i + 1 : i
    );
  }, [matchedPhotos.length]);

  if (matchedPhotos.length === 0) {
    return (
      <main className="flex-1 px-6 py-16">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            系列不存在
          </h1>
          <p className="mt-4 text-neutral-400">
            没有找到 slug 为 <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-200">{slug}</code> 的系列。
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
          >
            返回首页
          </Link>
        </section>
      </main>
    );
  }

  const seriesName = matchedPhotos[0].series;
  const activePhoto =
    activeIndex !== null ? matchedPhotos[activeIndex] : null;

  return (
    <main className="flex-1 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            {seriesName}
          </h1>
          <p className="mt-2 text-neutral-400">
            {matchedPhotos.length} 张照片
          </p>
        </div>

        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {matchedPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </section>

      {activePhoto && (
        <Lightbox
          photo={activePhoto}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < matchedPhotos.length - 1}
        />
      )}
    </main>
  );
}
