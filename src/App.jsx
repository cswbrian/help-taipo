import { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import FilterBar from './components/FilterBar';

function App() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/locations.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        return response.json();
      })
      .then(data => {
        setLocations(data.locations || []);
        setLastUpdate(data.lastUpdate || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = locations;

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
  }, [locations, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">錯誤: {error}</p>
          <p className="text-gray-600">請稍後再試</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">災後援助地點</h1>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              最後更新: {new Date(lastUpdate).toLocaleString('zh-TW')}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <div className="mb-4 text-gray-600">
          顯示 {filteredLocations.length} / {locations.length} 個地點
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">找不到符合條件的地點</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => (
              <LocationCard key={index} location={location} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
