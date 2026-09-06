import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import photos from '../data/photos.json';
import { displayUrl, originalUrl, thumbUrl } from '../utils/cloudinary';
import { slugify } from '../utils/slugify';
import { getSeriesLabel } from '../utils/series';
import ImmersiveViewer from '../components/ImmersiveViewer';

// 与 Tailwind md 断点一致：≤768px 视为移动端，灯箱启用触屏手势
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handleChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

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
        src={thumbUrl(photo.cloudinaryId.trim())}
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

const INFO_BTN_CLASS =
  'rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors duration-200 ';

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  index,
  count,
  onJump,
}) {
  const isMobile = useIsMobile();
  const [showInfo, setShowInfo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState(() =>
    thumbUrl(photo.cloudinaryId.trim())
  );
  const [bgVisible, setBgVisible] = useState(true);
  const [immersive, setImmersive] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [slideDir, setSlideDir] = useState(null); // 'next' | 'prev' | null

  const zwRef = useRef(null);
  const scaleRef = useRef(1);
  const touchRef = useRef(null);
  const lastTapRef = useRef({ t: 0, x: 0, y: 0 });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (immersive) return; // 沉浸模式有自己的 Esc 处理
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, immersive]);

  // 切换照片：重置加载状态、收起信息条、复位缩放与滑动方向
  useEffect(() => {
    setLoaded(false);
    setShowInfo(false);
    setSlideDir(null);
    scaleRef.current = 1;
  }, [photo.id]);

  // 预加载判断横竖构图，决定移动端是否显示「横屏观看」入口
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLandscape(img.naturalWidth > img.naturalHeight);
    img.src = displayUrl(photo.cloudinaryId.trim());
    return () => {
      img.onload = null;
    };
  }, [photo.cloudinaryId]);

  // 移动端触屏手势：双击在 1x/2x 间切换，捏合缩放由 react-zoom-pan-pinch 处理
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) {
      touchRef.current = null; // 多指 = 捏合，不参与滑动/双击判定
      return;
    }
    const t = e.touches[0];
    const now = Date.now();
    const last = lastTapRef.current;

    if (
      now - last.t < 300 &&
      Math.hypot(t.clientX - last.x, t.clientY - last.y) < 30
    ) {
      lastTapRef.current = { t: 0, x: 0, y: 0 };
      touchRef.current = null;
      const zw = zwRef.current;
      if (!zw) return;
      if (scaleRef.current > 1.05) {
        zw.resetTransform(250);
      } else {
        zw.centerView(2, 250);
      }
      return;
    }
    lastTapRef.current = { t: now, x: t.clientX, y: t.clientY };
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  // 1x 状态下水平滑动 ≥50px 切换照片；放大状态下单指拖动是平移，不切换
  const handleTouchEnd = (e) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || scaleRef.current > 1.05) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx < 0 && hasNext) {
      setSlideDir('next');
      onNext();
    } else if (dx > 0 && hasPrev) {
      setSlideDir('prev');
      onPrev();
    }
  };

  const jumpTo = (i) => {
    setSlideDir(null);
    onJump(i);
  };

  // 环境光背景交叉淡入
  useEffect(() => {
    const next = thumbUrl(photo.cloudinaryId.trim());
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

      {/* 图片主容器 + 下方工具条 */}
      <div
        className="relative flex h-full w-full flex-col items-center justify-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 主图区：透明容器，圆角/柔影/描边直接作用于照片 */}
        <div
          className="relative h-[64vh] w-[92vw] md:h-[78vh]"
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        >
          {!loaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
            </div>
          )}

          {isMobile ? (
            /* 移动端：可缩放容器（key 变化时重置缩放并触发滑动过渡动画） */
            <div
              key={photo.id}
              onClick={(e) => {
                e.stopPropagation(); // 不冒泡到遮罩，避免误关灯箱
                if (showInfo) setShowInfo(false); // 与桌面端一致：点照片收起信息条
              }}
              className={`flex h-full w-full items-center justify-center ${
                slideDir === 'next'
                  ? 'lb-slide-next'
                  : slideDir === 'prev'
                  ? 'lb-slide-prev'
                  : ''
              }`}
            >
              <TransformWrapper
                ref={zwRef}
                minScale={1}
                maxScale={5}
                limitToBounds
                centerOnInit
                disablePadding
                wheel={{ disabled: true }}
                doubleClick={{ disabled: true }}
                onTransform={(_, state) => {
                  scaleRef.current = state.scale;
                }}
              >
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                >
                  <img
                    src={displayUrl(photo.cloudinaryId.trim())}
                    alt={photo.title}
                    onLoad={() => setLoaded(true)}
                    className={`max-h-full max-w-full rounded-xl object-contain shadow-[0_0_80px_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-opacity duration-300 ${
                      loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          ) : (
            /* 桌面端：保持原有交互不变 */
            <div
              className="flex h-full w-full items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (showInfo) setShowInfo(false);
              }}
            >
              <img
                src={displayUrl(photo.cloudinaryId.trim())}
                alt={photo.title}
                onLoad={() => setLoaded(true)}
                className={`max-h-full max-w-full rounded-xl object-contain shadow-[0_0_80px_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-opacity duration-300 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}

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

          {/* 左右切换箭头（桌面端专用，移动端用滑动手势替代） */}
          {!isMobile && hasPrev && (
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
          {!isMobile && hasNext && (
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

        </div>

        {/* 移动端进度圆点：当前照片高亮加宽，点击跳转 */}
        {isMobile && count > 0 && (
          <div className="flex max-w-[80vw] flex-wrap items-center justify-center gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpTo(i);
                }}
                aria-label={`查看第 ${i + 1} 张照片`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-white/90' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* 图片下方细窄工具条 */}
        <div className="relative flex h-8 items-center justify-center gap-3">
          {isMobile && isLandscape && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImmersive(true);
              }}
              className={`${INFO_BTN_CLASS}border-white/30 text-neutral-300 hover:border-white/70 hover:text-white`}
            >
              横屏观看
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo((v) => !v);
            }}
            className={`rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors duration-200 ${
              showInfo
                ? 'border-white/70 text-white'
                : 'border-white/30 text-neutral-300 hover:border-white/70 hover:text-white'
            }`}
          >
            详细信息
          </button>

          {/* 信息条：位于按钮正上方展开，不遮挡按钮本身 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-full left-1/2 z-50 mb-3 w-[min(92vw,560px)] -translate-x-1/2 rounded-lg border border-white/10 bg-black/60 p-5 text-center backdrop-blur-md transition-all duration-300 ${
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

      {immersive && (
        <ImmersiveViewer
          photo={photo}
          onClose={() => setImmersive(false)}
        />
      )}
    </div>
  );
}

export default function SeriesDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

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
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
          >
            ← 返回
          </button>
        </div>

        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            {getSeriesLabel(seriesName)}
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
          index={activeIndex}
          count={matchedPhotos.length}
          onJump={setActiveIndex}
        />
      )}
    </main>
  );
}
