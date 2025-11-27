import { useState } from 'react';

export default function FilterBar({ statusFilter, onStatusFilterChange, itemFilter, onItemFilterChange, categoriesWithItems, sortByDistance, onSortByDistanceChange, userLocation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const statusOptions = [
    { value: 'all', label: '全部', emoji: '📋' },
    { value: '‼️ 急需 Urgent', label: '急需', emoji: '‼️' },
    { value: '⚠️ 尚需 Still Need', label: '尚需', emoji: '⚠️' },
    { value: '✅ 充足 Enough', label: '充足', emoji: '✅' },
    { value: '🤨 無資料 No Data', label: '無資料', emoji: '🤨' }
  ];

  const handleStatusToggle = (statusValue) => {
    const allStatuses = statusOptions.filter(opt => opt.value !== 'all').map(opt => opt.value);
    const currentFilters = Array.isArray(statusFilter) ? statusFilter : [];
    
    if (statusValue === 'all') {
      // If "all" is clicked, toggle between all selected and all deselected
      const allSelected = allStatuses.every(status => currentFilters.includes(status));
      if (allSelected) {
        // If all are selected, deselect all
        onStatusFilterChange([]);
      } else {
        // If not all are selected, select all
        onStatusFilterChange(allStatuses);
      }
    } else {
      // Toggle individual status
      if (currentFilters.includes(statusValue)) {
        // Remove if already selected
        const newFilters = currentFilters.filter(s => s !== statusValue);
        onStatusFilterChange(newFilters);
      } else {
        // Add if not selected
        onStatusFilterChange([...currentFilters, statusValue]);
      }
    }
  };

  const isStatusSelected = (statusValue) => {
    const currentFilters = Array.isArray(statusFilter) ? statusFilter : [];
    
    if (statusValue === 'all') {
      // "all" is selected if all non-"all" statuses are selected
      const allStatuses = statusOptions.filter(opt => opt.value !== 'all').map(opt => opt.value);
      return allStatuses.length > 0 && allStatuses.every(status => currentFilters.includes(status));
    }
    return currentFilters.includes(statusValue);
  };

  const categories = Object.keys(categoriesWithItems).sort();
  const itemsInSelectedCategory = selectedCategory ? categoriesWithItems[selectedCategory] || [] : [];

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
      onItemFilterChange('all');
    } else {
      setSelectedCategory(category);
      // Don't auto-select an item, let user choose
    }
  };

  const handleItemClick = (item) => {
    if (itemFilter === item) {
      // Deselect if clicking the same item
      onItemFilterChange('all');
      setSelectedCategory(null);
    } else {
      onItemFilterChange(item);
    }
  };

  const handleClearItemFilter = () => {
    onItemFilterChange('all');
    setSelectedCategory(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-4 space-y-4 border border-gray-200/50">
      {/* Item Filter - Hierarchical */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            篩選物資
          </label>
          {itemFilter !== 'all' && (
            <button
              onClick={handleClearItemFilter}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
            >
              ✕ 清除 Clear
            </button>
          )}
        </div>
        
        {/* Parent Buttons - Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Child Buttons - Items in Selected Category */}
        {selectedCategory && itemsInSelectedCategory.length > 0 && (
          <div className="mt-3 pl-4 border-l-4 border-green-400 bg-green-50/30 rounded-r-xl p-3">
            <div className="flex flex-wrap gap-2">
              {itemsInSelectedCategory.map(item => (
                <button
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    itemFilter === item
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-green-100 border border-green-200 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Distance Sort Toggle */}
      {userLocation && (
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>📍</span>
              按距離排序
            </label>
            <button
              onClick={() => onSortByDistanceChange(!sortByDistance)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sortByDistance ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sortByDistance ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
        <label className="text-base font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          篩選狀態
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => {
            const isSelected = isStatusSelected(option.value);
            return (
              <button
                key={option.value}
                onClick={() => handleStatusToggle(option.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <span className="mr-1.5">{option.emoji}</span>
                {option.label}
              </button>
            );
          })}
        </div>
        {Array.isArray(statusFilter) && statusFilter.length === 0 && (
          <p className="text-xs text-gray-500 italic">未選擇任何狀態 - 顯示所有地點</p>
        )}
      </div>
    </div>
  );
}
