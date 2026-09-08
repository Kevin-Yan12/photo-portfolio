import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Kevin Yan · kevinyan.me</p>
        <div className="flex gap-5">
          <Link
            to="/appreciate"
            className="transition-colors duration-200 hover:text-white"
          >
            赞赏
          </Link>
          <a
            href="https://github.com/Kevin-Yan12"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-white"
          >
            GitHub
          </a>
          <a
            href="mailto:13691545965@163.com"
            className="transition-colors duration-200 hover:text-white"
          >
            邮箱
          </a>
        </div>
      </div>
    </footer>
  );
}
