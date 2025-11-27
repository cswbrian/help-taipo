import StatusBadge from './StatusBadge';

export default function LocationCard({ location, statusFilter = [] }) {
  if (!location || !location.name) {
    return null;
  }

  // Filter items based on statusFilter (now supports array)
  const shouldShowItem = (itemStatus) => {
    if (!Array.isArray(statusFilter) || statusFilter.length === 0) return true;
    return statusFilter.includes(itemStatus);
  };

  // Filter categories to only show those with visible items
  const filteredCategories = location.categories
    ? location.categories
        .map(category => ({
          ...category,
          items: category.items ? category.items.filter(item => shouldShowItem(item.status)) : []
        }))
        .filter(category => category.items.length > 0)
    : [];

  // Filter volunteers based on statusFilter
  const filteredVolunteers = location.volunteers
    ? location.volunteers.filter(volunteer => shouldShowItem(volunteer.status))
    : [];

  // Show allItems section only if it matches the filter
  const showAllItems = location.allItems && (
    !Array.isArray(statusFilter) || 
    statusFilter.length === 0 || 
    statusFilter.includes(location.allItems)
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-200/50 hover:border-blue-300/50 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-gradient-to-r from-blue-100 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          <h3 className="text-lg font-bold text-gray-900">
            {location.name}
          </h3>
        </div>
      </div>
      
      {/* Overall Status - Prominently displayed first */}
      {showAllItems && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">📦 所有物品 All Items:</span>
            <StatusBadge status={location.allItems} />
          </div>
        </div>
      )}

      {/* Categories with individual items */}
      {filteredCategories.length > 0 && (
        <div className="mb-3 space-y-3">
          {filteredCategories.map((category, catIndex) => (
            <div key={catIndex} className="border-l-4 border-blue-400 pl-3 bg-blue-50/30 rounded-r-lg py-2">
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                <span>📁</span>
                {category.name}
              </h4>
              <div className="space-y-1.5">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2 text-sm bg-white/60 rounded-lg px-2 py-1.5">
                    <span className="text-gray-700 min-w-[80px] font-medium">{item.name}:</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteers */}
      {filteredVolunteers.length > 0 && (
        <div className="mt-3 pt-3 border-t-2 border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            <span>👥</span>
            義工需求:
          </h4>
          <div className="space-y-1.5">
            {filteredVolunteers.map((volunteer, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-purple-50/50 rounded-lg px-2 py-1.5">
                <span className="text-gray-700 min-w-[100px] font-medium">{volunteer.type}:</span>
                <StatusBadge status={volunteer.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
