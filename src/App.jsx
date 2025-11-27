import { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import FilterBar from './components/FilterBar';
import BottomNav from './components/BottomNav';
import SourcePage from './components/SourcePage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [statusFilter, setStatusFilter] = useState(['‼️ 急需 Urgent', '⚠️ 尚需 Still Need']);
  const [itemFilter, setItemFilter] = useState('all');
  const [categoriesWithItems, setCategoriesWithItems] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL;
    fetch(`${baseUrl}data/locations.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        return response.json();
      })
      .then(data => {
        const locs = data.locations || [];
        setLocations(locs);
        setLastUpdate(data.lastUpdate || null);
        setNotification(data.notification || null);
        
        // Extract categories with their items
        const categoriesMap = {};
        
        locs.forEach(location => {
          if (location.categories) {
            location.categories.forEach(category => {
              if (category.items) {
                // Initialize category if not exists
                if (!categoriesMap[category.name]) {
                  categoriesMap[category.name] = new Set();
                }
                
                category.items.forEach(item => {
                  if (item.name) {
                    categoriesMap[category.name].add(item.name);
                  }
                });
              }
            });
          }
        });
        
        // Convert Sets to Arrays and sort items within each category
        const categoriesWithItemsObj = {};
        Object.keys(categoriesMap).sort().forEach(categoryName => {
          categoriesWithItemsObj[categoryName] = Array.from(categoriesMap[categoryName]).sort();
        });
        setCategoriesWithItems(categoriesWithItemsObj);
        
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = locations;

    // Apply item filter first
    if (itemFilter !== 'all') {
      filtered = filtered.filter(location => {
        if (!location.categories) return false;
        
        // Check if location has the selected item
        return location.categories.some(category => 
          category.items && category.items.some(item => item.name === itemFilter)
        );
      });
    }

    // Apply status filter (now supports multiple statuses)
    if (statusFilter.length > 0) {
      filtered = filtered.filter(location => {
        // Check overall status
        if (location.allItems && statusFilter.includes(location.allItems)) return true;
        
        // Check categories and items
        if (location.categories) {
          for (const category of location.categories) {
            if (category.items.some(item => statusFilter.includes(item.status))) {
              return true;
            }
          }
        }
        
        // Check volunteers
        if (location.volunteers) {
          if (location.volunteers.some(v => statusFilter.includes(v.status))) {
            return true;
          }
        }
        
        return false;
      });
    }

    setFilteredLocations(filtered);
  }, [locations, statusFilter, itemFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-200/50 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg font-semibold text-red-600 mb-2">錯誤: {error}</p>
          <p className="text-base text-gray-600">請稍後再試</p>
        </div>
      </div>
    );
  }

  // Render Source Page
  if (currentPage === 'source') {
    return (
      <>
        <SourcePage />
        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
      </>
    );
  }

  // Render Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">大埔物資供應總覽</h1>
              {lastUpdate && (
                <p className="text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    最後更新：{new Date(lastUpdate).toLocaleString('zh-TW')}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📢</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                  {notification}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          itemFilter={itemFilter}
          onItemFilterChange={setItemFilter}
          categoriesWithItems={categoriesWithItems}
        />

        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-lg font-medium text-gray-600">找不到符合條件的地點</p>
            <p className="text-sm text-gray-500 mt-2">請嘗試調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location, index) => (
              <LocationCard key={index} location={location} statusFilter={statusFilter} />
            ))}
          </div>
        )}
      </main>

      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
