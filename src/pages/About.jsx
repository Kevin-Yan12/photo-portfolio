import { useState } from 'react';
import profile from '../data/profile.json';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 剪贴板 API 不可用时的降级方案
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function ContactItem({ label, value, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pillClass = `shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200 ${
    copied
      ? 'border-white/70 text-white'
      : 'border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white'
  }`;

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-3.5 text-left">
      <div className="min-w-0">
        <p className="text-xs tracking-[0.2em] text-neutral-500">{label}</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block truncate text-sm text-neutral-200 transition-colors hover:text-white"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm text-neutral-200">{value}</p>
        )}
      </div>
      <button type="button" onClick={handleCopy} className={pillClass}>
        {copied ? '已复制' : '复制'}
      </button>
    </li>
  );
}

export default function About() {
  const { name, avatar, bio, contacts } = profile;
  const showAvatar = typeof avatar === 'string' && /^https?:\/\//.test(avatar.trim());

  return (
    <main className="flex-1 px-6 py-16">
      <section className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6">
          {showAvatar ? (
            <img
              src={avatar.trim()}
              alt={name}
              className="mx-auto h-28 w-28 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-neutral-800 text-2xl font-light tracking-wide text-neutral-500">
              {name.slice(0, 1)}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
          {name}
        </h1>

        <p className="mt-6 leading-relaxed text-neutral-300">{bio}</p>

        {contacts && contacts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-medium text-white">联系方式</h2>
            <ul className="mt-5 space-y-3">
              {contacts.map((c) => (
                <ContactItem key={c.label} {...c} />
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-600">
              点击「复制」即可拷贝对应联系方式
            </p>
          </div>
        )}

        <p className="mt-16 text-sm text-neutral-600">
          所有照片仅供个人欣赏，未经许可请勿商用。
        </p>
      </section>
    </main>
  );
}
