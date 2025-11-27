export default function FilterBar({ statusFilter, onStatusFilterChange }) {
  const statusOptions = [
    { value: 'all', label: '全部', emoji: '📋' },
    { value: '‼️ 急需 Urgent', label: '急需', emoji: '‼️' },
    { value: '⚠️ 尚需 Still Need', label: '尚需', emoji: '⚠️' },
    { value: '✅ 充足 Enough', label: '充足', emoji: '✅' },
    { value: '🤨 無資料 No Data', label: '無資料', emoji: '🤨' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          狀態篩選
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onStatusFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
