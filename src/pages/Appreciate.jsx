import { useEffect, useState } from 'react';
import data from '../data/appreciate.json';

export default function Appreciate() {
  const [selected, setSelected] = useState(null); // 当前放大展示的二维码
  const [modalVisible, setModalVisible] = useState(false); // 控制淡入淡出

  const openModal = (qr) => {
    setSelected(qr);
  };
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelected(null), 300); // 等淡出动画结束再卸载
  };

  // 弹层淡入 + 锁定背景滚动 + Esc 关闭
  useEffect(() => {
    if (!selected) return undefined;
    const raf = requestAnimationFrame(() => setModalVisible(true));
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selected]);

  return (
    <main className="flex-1 px-6 pb-24 pt-[24vh] sm:pt-[30vh]">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-4xl font-light tracking-[0.3em] text-white sm:text-5xl">
          赞赏
        </h1>
        <p className="mt-4 text-sm text-neutral-400 sm:text-base">
          如果这些照片让你想起了什么
        </p>

        <div className="mt-14 flex flex-wrap items-start justify-center gap-8">
          {data.qrs.map((qr) => (
            <div key={qr.label} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => openModal(qr)}
                aria-label={`放大查看${qr.label}二维码`}
                className="group block cursor-zoom-in rounded-xl border border-white/15 shadow-[0_0_70px_rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-[0_0_90px_rgba(255,255,255,0.15)]"
              >
                <img
                  src={qr.image}
                  alt={`${qr.label}赞赏码`}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-40 rounded-xl bg-white object-cover sm:h-[200px] sm:w-[200px]"
                />
              </button>
              <p className="mt-3 text-xs text-neutral-400">{qr.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 font-serif text-zinc-400">谢谢你看到这里</p>
      </div>

      {/* 二维码放大弹层 */}
      {selected && (
        <div
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.label}赞赏码大图`}
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 transition-opacity duration-300 ${
            modalVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={selected.image}
            alt={`${selected.label}赞赏码`}
            className="w-[280px] rounded-xl border border-white/15 shadow-[0_0_100px_rgba(255,255,255,0.15)]"
          />
        </div>
      )}
    </main>
  );
}
