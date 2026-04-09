export function formatDate(date: string) {
    const [year, month, day] = new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).split('/');
    return `${year}年${month}月${day}日`;
  }

/** 仅月日（如 4月5日），用于存档卡片等与年份标题搭配的场景 */
export function formatMonthDayOnly(date: string) {
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${Number(iso[2])}月${Number(iso[3])}日`
  }
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getMonth() + 1}月${d.getDate()}日`
}