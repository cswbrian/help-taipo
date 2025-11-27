import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit map bounds to show all markers
function FitBounds({ locations, coordinates }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0 && coordinates) {
      const bounds = [];
      locations.forEach(location => {
        const coords = findLocationCoordinates(location.name, coordinates);
        if (coords && coords.lat && coords.lng) {
          bounds.push([coords.lat, coords.lng]);
        }
      });
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [locations, coordinates, map]);
  
  return null;
}

// Helper function to find coordinates (same as in App.jsx)
function findLocationCoordinates(locationName, coordinatesMap) {
  if (!locationName || !coordinatesMap) return null;
  
  if (coordinatesMap[locationName]) {
    return coordinatesMap[locationName];
  }
  
  for (const [key, coords] of Object.entries(coordinatesMap)) {
    if (locationName.includes(key) || key.includes(locationName)) {
      return coords;
    }
  }
  
  return null;
}

// Helper function to get status color
function getStatusColor(status) {
  if (!status) return '#gray';
  if (status.includes('✅')) return '#10b981'; // green
  if (status.includes('⚠️')) return '#f59e0b'; // yellow
  if (status.includes('‼️')) return '#ef4444'; // red
  if (status.includes('🤨')) return '#6b7280'; // gray
  return '#3b82f6'; // blue
}

// Custom marker icon with status color
function createCustomIcon(status) {
  const color = getStatusColor(status);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

export default function MapView({ locations, locationCoordinates, statusFilter }) {
  // Filter locations based on status filter
  const filteredLocations = locations.filter(location => {
    if (statusFilter.length === 0) return true;
    
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

  // Calculate center point (average of all locations with coordinates)
  const locationsWithCoords = filteredLocations
    .map(loc => {
      const coords = findLocationCoordinates(loc.name, locationCoordinates);
      return coords ? { ...loc, coords } : null;
    })
    .filter(Boolean);

  const center = locationsWithCoords.length > 0
    ? [
        locationsWithCoords.reduce((sum, loc) => sum + loc.coords.lat, 0) / locationsWithCoords.length,
        locationsWithCoords.reduce((sum, loc) => sum + loc.coords.lng, 0) / locationsWithCoords.length,
      ]
    : [22.45, 114.17]; // Default center (Tai Po area)

  if (locationsWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">沒有可顯示的地點</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds locations={filteredLocations} coordinates={locationCoordinates} />
        
        {filteredLocations.map((location, index) => {
          const coords = findLocationCoordinates(location.name, locationCoordinates);
          if (!coords || !coords.lat || !coords.lng) return null;
          
          const status = location.allItems || '🤨 無資料 No Data';
          const icon = createCustomIcon(status);
          
          return (
            <Marker
              key={index}
              position={[coords.lat, coords.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                  {location.allItems && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">所有物品: </span>
                      <span className="text-sm">{location.allItems}</span>
                    </div>
                  )}
                  {location.categories && location.categories.length > 0 && (
                    <div className="text-xs text-gray-600">
                      {location.categories.length} 個分類
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

