// 系列中文名映射：数据仍全部来自 photos.json 的 series 字段，这里只做展示层文案转换
const SERIES_LABELS = {
  ustb: '北科大',
  shenzhen: '深圳',
  hongkong: '香港',
};

export function getSeriesLabel(name) {
  return SERIES_LABELS[name.toLowerCase()] ?? name;
}
