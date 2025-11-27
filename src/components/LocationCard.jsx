import StatusBadge from './StatusBadge';

export default function LocationCard({ location }) {
  if (!location || !location.name) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {location.name}
        </h3>
      </div>
      
      {/* Overall Status - Prominently displayed first */}
      {location.allItems && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">所有物品 All Items:</span>
            <StatusBadge status={location.allItems} />
          </div>
        </div>
      )}

      {/* Categories with individual items */}
      {location.categories && location.categories.length > 0 && (
        <div className="mb-3 space-y-3">
          {location.categories.map((category, catIndex) => (
            <div key={catIndex} className="border-l-2 border-blue-200 pl-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {category.name}
              </h4>
              <div className="space-y-1">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 min-w-[100px]">{item.name}:</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteers */}
      {location.volunteers && location.volunteers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">義工需求:</h4>
          <div className="space-y-1">
            {location.volunteers.map((volunteer, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 min-w-[120px]">{volunteer.type}:</span>
                <StatusBadge status={volunteer.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
