import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncArcDB() {
  console.log('Fetching items from https://ardb.app/api/items...');
  try {
    const response = await fetch('https://ardb.app/api/items');
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    const targetPath = path.join(__dirname, '../public/ardb_items.json');
    console.log(`Writing ${data.length} items to ${targetPath}...`);
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    
    console.log('Successfully synced ARDB data!');
  } catch (err) {
    console.error('Error syncing ARDB data:', err);
    process.exit(1);
  }
}

syncArcDB();
