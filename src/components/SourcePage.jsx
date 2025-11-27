export default function SourcePage() {
  const sourceUrl = 'https://docs.google.com/spreadsheets/u/0/d/1W8A40TCVAY5prHNyVk-TqdSv2EumkVvN9l7LoUrY8-w/htmlview#gid=0';
  const editUrl = 'https://docs.google.com/spreadsheets/d/1C0jp45oyC0zMeBq2mcvPxWmkln8lZw3ELxajxdsuhYg/edit?gid=958869926#gid=958869926';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">資料來源</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200/50">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🔗</span>
                資料來源
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                本網站的所有資料均來自以下 Google Sheets：
              </p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span>📋</span>
                開啟 Google Sheets
                <span className="text-xs">↗</span>
              </a>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                關於資料
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>資料會定期從 Google Sheets 同步更新</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>表格由義工團隊維護，確保資訊準確性</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>如有疑問或需要更新資料，請到 <span><a href={editUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Sheets</a></span></span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

