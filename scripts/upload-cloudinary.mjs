// 一次性脚本：把 图片素材/ 的照片批量上传到 Cloudinary（public_id = 文件名，跳过已存在的）
// 用法: node scripts/upload-cloudinary.mjs [public_id]  —— 不带参数则上传全部
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, '..', '..', '图片素材'); // 桌面/图片素材
const CLOUD = 'vpodjbvi';

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const KEY = env.CLOUDINARY_API_KEY;
const SECRET = env.CLOUDINARY_API_SECRET;
if (!KEY || !SECRET) {
  console.error('.env 缺少密钥');
  process.exit(1);
}

const SUBDIRS = ['川西', '广州', '深圳', '香港', '九寨沟', '北科大'];
// --force: 覆盖已存在的 public_id 并刷新 CDN（配合自定义源目录使用）
// --src <目录>: 用指定目录的文件作为上传源（如 /tmp/lr-master 平铺目录）
const force = process.argv.includes('--force');
const srcIdx = process.argv.indexOf('--src');
const overrideSrc = srcIdx > -1 ? process.argv[srcIdx + 1] : null;
// 位置参数 = 非 flag、且不是 --src 的取值
const positionals = [];
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--force') continue;
  if (process.argv[i] === '--src') { i++; continue; }
  positionals.push(process.argv[i]);
}
const only = positionals[0];

const files = [];
const MAX = 10 * 1024 * 1024; // Cloudinary 免费套餐单文件上限
const COMPRESSED = join(ROOT, '..', '..', '图片素材-压缩版');
if (overrideSrc) {
  for (const f of readdirSync(overrideSrc)) {
    const id = basename(f).replace(/\.jpe?g$/i, '');
    if (only && id !== only) continue;
    const path = join(overrideSrc, f);
    files.push({ path, id, size: statSync(path).size });
  }
} else {
for (const sub of SUBDIRS) {
  for (const f of readdirSync(join(SRC, sub))) {
    if (!f.toLowerCase().endsWith('.jpg')) continue;
    const id = basename(f).replace(/\.jpe?g$/i, '');
    if (only && id !== only) continue;
    let path = join(SRC, sub, f);
    let size = statSync(path).size;
    // 原图超限时改用压缩副本（子文件夹结构一致）
    if (size > MAX) {
      const alt = join(COMPRESSED, sub, f);
      try {
        if (statSync(alt).size <= MAX) {
          path = alt;
          size = statSync(alt).size;
          f._compressed = true;
        }
      } catch { /* 没有压缩副本则保持原图，让它报错 */ }
    }
    files.push({ path, id, size, compressed: f._compressed });
  }
}
}

const sig = (params) => createHash('sha1').update(params + SECRET).digest('hex');

async function exists(id) {
  if (force) return false; // 覆盖模式不做存在性检查
  try {
    const r = await fetch(`https://res.cloudinary.com/${CLOUD}/image/upload/${id}`, { method: 'HEAD' });
    return r.status === 200;
  } catch {
    return false;
  }
}

async function upload({ path, id, size }) {
  const ts = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.append('file', new Blob([readFileSync(path)], { type: 'image/jpeg' }));
  form.append('public_id', id);
  form.append('api_key', KEY);
  form.append('timestamp', String(ts));
  if (force) {
    form.append('overwrite', 'true');
    form.append('invalidate', 'true');
    form.append('signature', sig(`invalidate=true&overwrite=true&public_id=${id}&timestamp=${ts}`));
  } else {
    form.append('signature', sig(`public_id=${id}&timestamp=${ts}`));
  }
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(10 * 60_000),
  });
  const j = await r.json();
  if (r.ok) return { ok: true };
  if (j?.error?.message?.includes('already exists')) return { ok: true, skipped: true };
  return { ok: false, err: j?.error?.message || `HTTP ${r.status}` };
}

let done = 0, fail = 0, skip = 0, bytes = 0;
const t0 = Date.now();
for (const f of files) {
  if (await exists(f.id)) {
    skip++;
    console.log(`跳过(已存在) ${f.id}`);
    continue;
  }
  try {
    const r = await upload(f);
    done++;
    if (r.ok) {
      bytes += f.size;
      console.log(`上传成功 ${f.id} (${(f.size / 1048576).toFixed(1)}MB${f.compressed ? ', 压缩副本' : ''})`);
    } else {
      fail++;
      console.log(`失败 ${f.id}: ${r.err}`);
    }
  } catch (e) {
    fail++;
    console.log(`失败 ${f.id}: ${e.message}`);
  }
}
console.log(
  `=== 完成: 成功${done} 跳过${skip} 失败${fail} 共传${(bytes / 1048576).toFixed(0)}MB 用时${((Date.now() - t0) / 60000).toFixed(1)}分钟 ===`
);
