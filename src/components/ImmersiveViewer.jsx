import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { displayUrl } from '../utils/cloudinary';

const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_RADIUS = 30;
const ZOOMED_THRESHOLD = 1.05;

// 横屏沉浸模式：纯黑背景、照片满屏、双指捏合缩放 + 双击 1x/2x，仅右上角保留退出按钮。
// 仅移动端横构图照片入口使用，桌面端不渲染。
export default function ImmersiveViewer({ photo, onClose }) {
  const rootRef = useRef(null);
  const zwRef = useRef(null);
  const scaleRef = useRef(1);
  const lastTapRef = useRef({ t: 0, x: 0, y: 0 });
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const root = rootRef.current;

    const enter = async () => {
      try {
        if (root && root.requestFullscreen) {
          await root.requestFullscreen();
        }
        // iOS Safari 不支持元素级全屏，请求失败时保持页面内全屏覆盖
      } catch {
        /* 浏览器拒绝全屏时静默降级 */
      }
      try {
        await screen.orientation.lock('landscape');
        // 不支持方向锁定（如 iOS）时靠提示引导用户旋转手机
      } catch {
        /* 忽略 */
      }
    };
    enter();

    const timer = setTimeout(() => setShowHint(false), 2000);

    return () => {
      clearTimeout(timer);
      try {
        if (document.fullscreenElement) document.exitFullscreen();
      } catch {
        /* 忽略 */
      }
      try {
        screen.orientation.unlock();
      } catch {
        /* 忽略 */
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 双击在 1x / 2x 间切换；捏合缩放交给 react-zoom-pan-pinch（minScale 1 自动回弹）
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    const now = Date.now();
    const last = lastTapRef.current;

    if (
      now - last.t < DOUBLE_TAP_MS &&
      Math.hypot(t.clientX - last.x, t.clientY - last.y) < DOUBLE_TAP_RADIUS
    ) {
      lastTapRef.current = { t: 0, x: 0, y: 0 };
      const zw = zwRef.current;
      if (!zw) return;
      if (scaleRef.current > ZOOMED_THRESHOLD) {
        zw.resetTransform(250);
      } else {
        zw.centerView(2, 250);
      }
      return;
    }
    lastTapRef.current = { t: now, x: t.clientX, y: t.clientY };
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="沉浸观看模式"
      onClick={(e) => e.stopPropagation()} // 不冒泡到灯箱遮罩，避免误关整个灯箱
      onTouchStart={handleTouchStart}
    >
      <div className="absolute inset-0">
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
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            <img
              src={displayUrl(photo.cloudinaryId.trim())}
              alt={photo.title}
              className="max-h-screen max-w-screen object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      <button
        onClick={onClose}
        aria-label="退出沉浸模式"
        className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur transition-colors hover:border-white/40"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-sm tracking-[0.25em] text-neutral-300 transition-opacity duration-500 ${
          showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        请将手机横过来观看
      </div>
    </div>
  );
}
