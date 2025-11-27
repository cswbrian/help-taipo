import { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import FilterBar from './components/FilterBar';

function App() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemFilter, setItemFilter] = useState('all');
  const [allItems, setAllItems] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
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
        
        // Extract all unique items from all locations
        const itemsSet = new Set();
        locs.forEach(location => {
          if (location.categories) {
            location.categories.forEach(category => {
              if (category.items) {
                category.items.forEach(item => {
                  if (item.name) {
                    itemsSet.add(item.name);
                  }
                });
              }
            });
          }
        });
        const uniqueItems = Array.from(itemsSet).sort();
        setAllItems(uniqueItems);
        
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

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(location => {
        // Check overall status
        if (location.allItems === statusFilter) return true;
        
        // Check categories and items
        if (location.categories) {
          for (const category of location.categories) {
            if (category.items.some(item => item.status === statusFilter)) {
              return true;
            }
          }
        }
        
        // Check volunteers
        if (location.volunteers) {
          if (location.volunteers.some(v => v.status === statusFilter)) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">錯誤: {error}</p>
          <p className="text-sm text-gray-600">請稍後再試</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-2xl font-bold text-gray-900">災後援助地點</h1>
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              最後更新: {new Date(lastUpdate).toLocaleString('zh-TW')}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FilterBar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          itemFilter={itemFilter}
          onItemFilterChange={setItemFilter}
          allItems={allItems}
        />

        <div className="mb-2 text-sm text-gray-600">
          顯示 {filteredLocations.length} / {locations.length} 個地點
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">找不到符合條件的地點</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLocations.map((location, index) => (
              <LocationCard key={index} location={location} statusFilter={statusFilter} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
