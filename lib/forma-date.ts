export function formatDate(date: string) {
    const [year, month, day] = new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).split('/');
    return `${year}年${month}月${day}日`;
  }