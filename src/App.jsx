import { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import FilterBar from './components/FilterBar';
import BottomNav from './components/BottomNav';
import SourcePage from './components/SourcePage';
import MapView from './components/MapView';

// Helper function to find coordinates for a location using partial matching
function findLocationCoordinates(locationName, coordinatesMap) {
  if (!locationName || !coordinatesMap) return null;
  
  // Try exact match first
  if (coordinatesMap[locationName]) {
    return coordinatesMap[locationName];
  }
  
  // Try partial match - check if location name contains any key or vice versa
  for (const [key, coords] of Object.entries(coordinatesMap)) {
    if (locationName.includes(key) || key.includes(locationName)) {
      return coords;
    }
  }
  
  return null;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Helper function to convert text with URLs to clickable links
function parseNotificationText(text) {
  if (!text) return null;
  
  // URL regex pattern - matches http, https, and www URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    
    // Add the URL as a link
    let url = match[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    parts.push({ type: 'link', content: match[0], url: url });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  
  // If no URLs found, return the original text
  if (parts.length === 0) {
    return [{ type: 'text', content: text }];
  }
  
  return parts;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [statusFilter, setStatusFilter] = useState(['‼️ 急需 Urgent', '⚠️ 尚需 Still Need']);
  const [itemFilter, setItemFilter] = useState('all');
  const [categoriesWithItems, setCategoriesWithItems] = useState({});
  const [locationCoordinates, setLocationCoordinates] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL;
    
    // Create cache-busting query parameter (shared for both fetches)
    const cacheBuster = new URLSearchParams({
      v: new Date().toISOString().split('T')[0], // Date-based version
      t: Date.now() // Timestamp for immediate cache bust
    }).toString();
    
    const fetchOptions = {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    // Load location coordinates with cache-busting
    fetch(`${baseUrl}data/location-coordinates.json?${cacheBuster}`, fetchOptions)
      .then(response => response.json())
      .then(coordsData => {
        setLocationCoordinates(coordsData.locations || {});
      })
      .catch(err => {
        console.warn('Failed to load location coordinates:', err);
        setLocationCoordinates({});
      });
    
    // Load locations data with cache-busting
    fetch(`${baseUrl}data/locations.json?${cacheBuster}`, fetchOptions)
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
    
    // Request user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Don't show error to user, just silently fail
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
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

    // Sort by distance if enabled and user location is available
    if (sortByDistance && userLocation && locationCoordinates) {
      filtered = filtered.map(location => {
        const coords = findLocationCoordinates(location.name, locationCoordinates);
        let distance = null;
        
        if (coords && coords.lat && coords.lng) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coords.lat,
            coords.lng
          );
        }
        
        return { ...location, distance };
      }).sort((a, b) => {
        // Locations with coordinates come first, sorted by distance
        // Locations without coordinates come last
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    setFilteredLocations(filtered);
  }, [locations, statusFilter, itemFilter, sortByDistance, userLocation, locationCoordinates]);

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
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      最後更新（約每5分鐘）：{new Date(lastUpdate).toLocaleString('zh-TW')}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📢</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed break-words">
                  {(() => {
                    const parsed = parseNotificationText(notification);
                    if (!parsed || parsed.length === 0) {
                      return <span>{notification}</span>;
                    }
                    return parsed.map((part, index) => {
                      if (part.type === 'link') {
                        return (
                          <a
                            key={index}
                            href={part.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-semibold break-all"
                          >
                            {part.content}
                          </a>
                        );
                      }
                      return <span key={index}>{part.content}</span>;
                    });
                  })()}
                </div>
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
          sortByDistance={sortByDistance}
          onSortByDistanceChange={setSortByDistance}
          userLocation={userLocation}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'map' ? (
          <div className="h-[calc(100vh-300px)] min-h-[500px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <MapView
              locations={filteredLocations}
              locationCoordinates={locationCoordinates}
              statusFilter={statusFilter}
            />
          </div>
        ) : (
          <>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-lg font-medium text-gray-600">找不到符合條件的地點</p>
                <p className="text-sm text-gray-500 mt-2">請嘗試調整篩選條件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location, index) => (
                  <LocationCard 
                    key={index} 
                    location={location} 
                    statusFilter={statusFilter}
                    coordinates={findLocationCoordinates(location.name, locationCoordinates)}
                    distance={location.distance}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
