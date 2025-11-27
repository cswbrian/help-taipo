export default function StatusBadge({ status }) {
  const statusConfig = {
    '✅ 充足 Enough': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      emoji: '✅'
    },
    '⚠️ 尚需 Still Need': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      emoji: '⚠️'
    },
    '‼️ 急需 Urgent': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      emoji: '‼️'
    },
    '🤨 無資料 No Data': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      emoji: '🤨'
    },
    '🙅🏻 政府已接手 不需義工物資 Gov has taken control': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      emoji: '🙅🏻'
    },
    '暫停接收物資（現場提供）': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      emoji: '⏸️'
    }
  };

  const config = statusConfig[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    emoji: status?.charAt(0) || '•'
  };

  if (!status || status.trim() === '') {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border ${config.bg} ${config.text} border-opacity-20`}>
      <span className="mr-1.5 text-base">{config.emoji}</span>
      <span className="truncate max-w-[200px]">{status}</span>
    </span>
  );
}

