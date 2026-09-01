export default function Guide() {
  return (
    <main className="flex-1 px-6 py-16">
      <section className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            使用说明
          </h1>
          <p className="mt-4 text-neutral-400">
            关于本站图片的使用与下载方式。
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">如何下载原图</h2>
          <p className="leading-relaxed text-neutral-300">
            进入任意系列详情页，点击照片打开灯箱，再点击右上角的「下载原图」按钮即可保存该照片的原始大图。下载文件名为 <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm text-neutral-200">cloudinaryId.jpg</code>。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">个人使用</h2>
          <p className="leading-relaxed text-neutral-300">
            所有照片均可自由用作个人电脑或手机的壁纸，也欢迎在个人学习、欣赏、非公开社交分享场景中使用，无需额外申请。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">禁止商用</h2>
          <p className="leading-relaxed text-neutral-300">
            未经许可，请勿将本站照片用于商业用途、广告、出版物、商品包装、付费素材平台等任何可能产生经济收益的场景。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">版权归属</h2>
          <p className="leading-relaxed text-neutral-300">
            本站所有摄影作品版权归摄影师所有。图片由 Cloudinary 托管，通过动态 URL 加载展示。
          </p>
        </section>
      </section>
    </main>
  );
}
