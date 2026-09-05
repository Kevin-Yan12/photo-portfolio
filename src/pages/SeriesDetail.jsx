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
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition-colors ${
        status === 'error'
          ? 'border-red-900/70 bg-red-950/40 text-red-300 hover:border-red-700 hover:text-red-200'
          : 'border-white/20 bg-black/40 text-white hover:border-white/40 hover:bg-black/70'
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
  const [showInfo, setShowInfo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState(() =>
    displayUrl(photo.cloudinaryId.trim())
  );
  const [bgVisible, setBgVisible] = useState(true);

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

  // 切换照片：重置加载状态、收起信息条
  useEffect(() => {
    setLoaded(false);
    setShowInfo(false);
  }, [photo.id]);

  // 环境光背景交叉淡入
  useEffect(() => {
    const next = displayUrl(photo.cloudinaryId.trim());
    if (next === bgSrc) return undefined;
    setBgVisible(false);
    const timer = setTimeout(() => {
      setBgSrc(next);
      setBgVisible(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [photo.cloudinaryId, bgSrc]);

  const handleBackdropClick = () => {
    if (showInfo) {
      setShowInfo(false);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      {/* 环境光背景层：模糊放大副本 + 黑色遮罩，不拦截交互 */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={bgSrc}
          alt=""
          className={`h-full w-full scale-150 object-cover blur-[60px] transition-opacity duration-500 ${
            bgVisible ? 'opacity-40' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 图片主容器 */}
      <div
        className="relative flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[82vh] w-[92vw]">
          {!loaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
            </div>
          )}

          <img
            src={displayUrl(photo.cloudinaryId.trim())}
            alt={photo.title}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* 右上角：下载 + 关闭，悬浮半透明 */}
          <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
            <DownloadButton photo={photo} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full border border-white/20 bg-black/40 p-2 text-xl leading-none text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-black/70"
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          {/* 左右切换箭头 */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-2 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-2xl leading-none text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-black/70"
              aria-label="上一张"
            >
              ‹
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-2xl leading-none text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-black/70"
              aria-label="下一张"
            >
              ›
            </button>
          )}

          {/* 底部中央：信息开关 */}
          <div className="absolute bottom-3 left-1/2 z-50 -translate-x-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo((v) => !v);
              }}
              className={`rounded-full border px-4 py-1.5 text-xs tracking-wider backdrop-blur transition-all duration-300 ${
                showInfo
                  ? 'border-white/40 bg-black/60 text-white'
                  : 'border-white/20 bg-black/40 text-neutral-300 hover:bg-black/60 hover:text-white'
              }`}
            >
              ℹ️ 详细信息
            </button>
          </div>

          {/* 信息条：默认收起，底部滑出 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-14 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-lg border border-white/10 bg-black/60 p-5 text-center backdrop-blur-md transition-all duration-300 ${
              showInfo
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0'
            }`}
          >
            <h2 className="text-lg font-light text-white">{photo.title}</h2>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-300">
              {photo.location && <span>{photo.location}</span>}
              {photo.location && photo.date && <span>·</span>}
              {photo.date && <span>{photo.date}</span>}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-400">
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
