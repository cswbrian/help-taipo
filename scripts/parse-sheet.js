import fs from 'fs';

function parseCSV(csvContent) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentLine.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of line
      currentLine.push(currentField.trim());
      lines.push(currentLine);
      currentLine = [];
      currentField = '';
    } else if (char === '\r') {
      // Ignore carriage return
      continue;
    } else {
      currentField += char;
    }
  }

  // Add last field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  return lines;
}

// Read CSV file
const csvContent = fs.readFileSync('sheet.csv', 'utf-8');
const lines = parseCSV(csvContent);

// Row 6 (index 5): Categories starting from column C (index 2)
const categoryRow = lines[5] || [];
// Row 7 (index 6): Items starting from column D (index 3)
const itemRow = lines[6] || [];
// Row 8 (index 7): Skip (might be empty or notes)
// Row 9+ (index 8+): Location data

// Parse categories from row 6 (starting from column C, index 2)
const categories = [];
let currentCategory = null;

for (let col = 2; col < categoryRow.length; col++) {
  const cell = categoryRow[col]?.trim();
  if (cell && cell !== '') {
    // New category found
    if (currentCategory) {
      currentCategory.endCol = col - 1;
      categories.push(currentCategory);
    }
    currentCategory = {
      name: cell,
      startCol: col,
      endCol: col, // Will be updated when next category is found
      items: []
    };
  }
}
// Add the last category
if (currentCategory) {
  currentCategory.endCol = categoryRow.length - 1;
  categories.push(currentCategory);
}

// Parse items from row 7 and assign them to categories
for (let col = 3; col < itemRow.length; col++) { // Start from column D (index 3)
  const itemName = itemRow[col]?.trim();
  if (!itemName || itemName === '') continue;

  // Find which category this item belongs to
  // Items are in columns starting from D (index 3), categories start from C (index 2)
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (col >= cat.startCol && col <= cat.endCol) {
      cat.items.push({
        name: itemName,
        column: col
      });
      break;
    }
  }
}

// Parse locations starting from row 9 (index 8)
const locations = [];

for (let rowIndex = 8; rowIndex < lines.length; rowIndex++) {
  const row = lines[rowIndex];
  if (!row || row.length === 0) continue;

  const locationName = row[0]?.trim(); // Column A
  if (!locationName || locationName === '') continue;

  const location = {
    name: locationName,
    allItems: row[1]?.trim() || null, // Column B: "所有物品 All Items"
    categories: []
  };

  // Process each category
  categories.forEach(category => {
    const categoryData = {
      name: category.name,
      items: []
    };

    // Process each item in this category
    category.items.forEach(item => {
      const status = row[item.column]?.trim();
      if (status && status !== '' && 
          (status.includes('✅') || status.includes('⚠️') || 
           status.includes('‼️') || status.includes('🤨') ||
           status.includes('🙅🏻') || status.includes('暫停'))) {
        categoryData.items.push({
          name: item.name,
          status: status
        });
      }
    });

    // Only add category if it has items with status
    if (categoryData.items.length > 0) {
      location.categories.push(categoryData);
    }
  });

  // Check for volunteer columns (typically at the end)
  const volunteers = [];
  const volunteerKeywords = ['一般義工', 'General volunteers', '醫護人員', 'medic', '社工', 'social worker', 
                            '心理輔導員', 'psychological counselor', '車手', 'driver'];
  
  for (let col = 2; col < row.length && col < itemRow.length; col++) {
    const header = itemRow[col]?.toLowerCase() || '';
    const status = row[col]?.trim();
    
    if (status && volunteerKeywords.some(keyword => header.includes(keyword.toLowerCase()))) {
      if (status && status !== '' && 
          (status.includes('✅') || status.includes('⚠️') || 
           status.includes('‼️') || status.includes('🤨'))) {
        volunteers.push({
          type: itemRow[col]?.trim() || '',
          status: status
        });
      }
    }
  }

  if (volunteers.length > 0) {
    location.volunteers = volunteers;
  }

  locations.push(location);
}

const output = {
  lastUpdate: new Date().toISOString(),
  locations: locations
};

fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/locations.json', JSON.stringify(output, null, 2));
console.log(`Generated locations.json with ${locations.length} locations`);
console.log(`Categories found: ${categories.map(c => c.name).join(', ')}`);
