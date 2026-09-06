const CLOUD_NAME = 'vpodjbvi';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export function originalUrl(id) {
  return `${BASE_URL}/${id}`;
}

// 灯箱大图、首页 Hero 等全屏场景：高分辨率 + 高质量
export function displayUrl(id) {
  return `${BASE_URL}/w_2560,q_auto:best,f_auto/${id}`;
}

// 列表封面、瀑布流缩略图：小图快速加载
export function thumbUrl(id) {
  return `${BASE_URL}/w_800,q_auto:good,f_auto/${id}`;
}

export function downloadUrl(id) {
  return `${BASE_URL}/fl_attachment/${id}`;
}

export function wallpaperUrl(id, device) {
  const transformations = {
    mobile: 'w_1170,h_2532,c_fill,g_auto',
    desktop: 'w_2560,h_1440,c_fill,g_auto',
    tablet: 'w_2048,h_1536,c_fill,g_auto',
  };

  const transform = transformations[device] || transformations.desktop;
  return `${BASE_URL}/${transform}/${id}`;
}
