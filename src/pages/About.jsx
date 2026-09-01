import profile from '../data/profile.json';

function isEmailLike(value) {
  return value.includes('@') && !value.startsWith('http://') && !value.startsWith('https://');
}

function SocialLink({ label, url }) {
  const isEmail = isEmailLike(url);
  const href = isEmail ? `mailto:${url}` : url;

  return (
    <a
      href={href}
      target={isEmail ? undefined : '_blank'}
      rel={isEmail ? undefined : 'noopener noreferrer'}
      className="rounded-full border border-neutral-700 bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
    >
      {label}
    </a>
  );
}

export default function About() {
  const { name, avatar, bio, links } = profile;
  const showAvatar = typeof avatar === 'string' && /^https?:\/\//.test(avatar.trim());

  return (
    <main className="flex-1 px-6 py-16">
      <section className="mx-auto max-w-2xl text-center">
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

        {links && links.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {links.map((link) => (
              <SocialLink key={link.label} {...link} />
            ))}
          </div>
        )}

        <p className="mt-16 text-sm text-neutral-600">
          所有照片仅供个人欣赏，未经许可请勿商用。
        </p>
      </section>
    </main>
  );
}
