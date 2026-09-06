export default function Guide() {
  return (
    <main className="flex-1 px-6 py-16">
      <section className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            使用说明
          </h1>
          <p className="mt-4 text-neutral-400">
            关于本站照片的浏览、下载和使用方式。
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">怎么浏览照片</h2>
          <p className="leading-relaxed text-neutral-300">
            进入任意一个系列，点击喜欢的照片即可全屏欣赏。照片下方有「详细信息」按钮，点开可以看到这张照片的拍摄地点、使用的器材和参数。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">在电脑上</h2>
          <p className="leading-relaxed text-neutral-300">
            全屏浏览时，点击照片两侧的箭头即可切换，也可以直接按键盘的左右方向键。按 Esc 或点击照片旁边的空白处就能退出。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">在手机上</h2>
          <p className="leading-relaxed text-neutral-300">
            左右滑动屏幕即可切换上一张或下一张；双击可以放大照片，再双击恢复原状，也可以用双指捏合自由缩放，放大后拖动就能查看细节。照片下方的小圆点表示这一组里的每张照片，点一下就能直接跳过去。横着拍的照片会有「横屏观看」按钮，点进去就是纯黑背景的全屏效果，建议把手机横过来欣赏，右上角的按钮可以随时退出。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">如何下载原图</h2>
          <p className="leading-relaxed text-neutral-300">
            全屏浏览时点击右上角的「下载原图」按钮，即可保存这张照片的原始大图，文件会以照片编号命名。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">怎么联系我</h2>
          <p className="leading-relaxed text-neutral-300">
            「关于」页面里有我的邮箱、电话、微信和 GitHub。点每一条旁边的「复制」按钮就能直接拷贝，不用手动输入；点 GitHub 一栏可以直接打开我的主页。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">可以怎么用</h2>
          <p className="leading-relaxed text-neutral-300">
            所有照片都可以自由用作电脑或手机的壁纸，也欢迎在个人学习、欣赏和非商业的分享场景中使用，无需额外申请。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">不可以怎么用</h2>
          <p className="leading-relaxed text-neutral-300">
            未经许可，请勿将本站照片用于商业用途、广告、出版物、商品包装、付费素材平台等任何可能产生经济收益的场景。本站所有作品均为本人拍摄，版权归我所有。
          </p>
        </section>
      </section>
    </main>
  );
}
