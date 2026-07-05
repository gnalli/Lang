export function formatDate(date: string) {
  const [year, month, day] = new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).split('/');
  return `${year}年${month}月${day}日`;
}

/** 归档卡片右上角：`04.12` */
export function formatDotMonthDay(date: string) {
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${iso[2]}.${iso[3]}`
  }
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${m}.${day}`
}

/** 列表日期（如 `4/10/2026`），用于首页近期博文、运维教程等 */
export function formatDateList(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}
