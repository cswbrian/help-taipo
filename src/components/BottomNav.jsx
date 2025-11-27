export default function BottomNav({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'home', label: '首頁' },
    { id: 'source', label: '資料來源' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center py-4 px-6 min-w-[80px] transition-all duration-200 ${
                currentPage === item.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`text-sm font-semibold ${currentPage === item.id ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {currentPage === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

