import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_ROOT = path.join(__dirname, '../../arcraiders-data');
const ITEMS_DIR = path.join(DATA_ROOT, 'items');
const IMAGES_DIR = path.join(DATA_ROOT, 'images/items');
const IMAGES_UPSCALED_DIR = path.join(DATA_ROOT, 'images/items_upscaled');
const AUGMENTS_API_FILE = path.join(__dirname, 'augments_api.json');

const TARGET_JSON = path.join(__dirname, '../public/items_v2.json');
const TARGET_ASSETS = path.join(__dirname, '../public/assets/items');

// Utility to parse Wiki stats from the backup file
function parseWikitextInfobox(text) {
    const stats = {};
    const backpackMatch = text.match(/\| slot_backpack\s*=\s*(\d+)/);
    const quickuseMatch = text.match(/\| slot_quickuse\s*=\s*(\d+)/);
    const safepocketMatch = text.match(/\| slot_safepocket\s*=\s*(\d+)/);
    const wlimitMatch = text.match(/\| wlimit\s*=\s*([\d.]+)/);

    if (backpackMatch) stats.backpack = parseInt(backpackMatch[1], 10);
    if (quickuseMatch) stats.quickUse = parseInt(quickuseMatch[1], 10);
    if (safepocketMatch) stats.safePocket = parseInt(safepocketMatch[1], 10);
    if (wlimitMatch) stats.wlimit = parseFloat(wlimitMatch[1]);

    return stats;
}

async function processData() {
    console.log('--- Phase 1: Initializing Target Directories ---');
    if (!fs.existsSync(TARGET_ASSETS)) {
        fs.mkdirSync(TARGET_ASSETS, { recursive: true });
    }

    console.log('--- Phase 2: Loading Augment Stats ---');
    const augmentsApi = JSON.parse(fs.readFileSync(AUGMENTS_API_FILE, 'utf8'));
    const augmentStatsMap = {};

    Object.values(augmentsApi.query.pages).forEach(page => {
        if (!page.revisions) return;
        const text = page.revisions[0]['*'];
        const stats = parseWikitextInfobox(text);
        // Map "Combat Mk. 1" to "combat_mk1"
        const id = page.title.toLowerCase().replace(/\s/g, '_').replace(/\./g, '');
        augmentStatsMap[id] = stats;
        // console.log(`Mapped stats for ${id}`);
    });

    console.log('--- Phase 3: Processing Items ---');
    const files = fs.readdirSync(ITEMS_DIR).filter(f => f.endsWith('.json'));
    const processedItems = [];
    let imageCount = 0;

    files.forEach(file => {
        const raw = fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8');
        const data = JSON.parse(raw);

        let uiType = 'material';
        const type = data.type?.toLowerCase() || '';

        // Define UI Groups
        if (data.isWeapon) uiType = 'weapon';
        else if (type.includes('ammo')) uiType = 'ammo';
        else if (type.includes('quick use') || type.includes('consumable') || type.includes('gadget') || type === 'utility') uiType = 'consumable';
        else if (type === 'augment') uiType = 'augment';
        else if (type === 'shield') uiType = 'shield';
        else if (type.includes('key')) uiType = 'key';

        // Asset Management
        const imgName = data.imageFilename?.split('/').pop();
        let localIconPath = null;

        if (imgName) {
            const upscaledPath = path.join(IMAGES_UPSCALED_DIR, imgName);
            const standardPath = path.join(IMAGES_DIR, imgName);
            const targetPath = path.join(TARGET_ASSETS, imgName);

            if (fs.existsSync(upscaledPath)) {
                fs.copyFileSync(upscaledPath, targetPath);
                localIconPath = `/assets/items/${imgName}`;
                imageCount++;
            } else if (fs.existsSync(standardPath)) {
                fs.copyFileSync(standardPath, targetPath);
                localIconPath = `/assets/items/${imgName}`;
                imageCount++;
            }
        }

        if (!localIconPath) {
            return; // Skip items without images
        }

        const item = {
            id: data.id,
            name: data.name.en,
            type: uiType,
            subType: data.type,
            rarity: data.rarity.toLowerCase(),
            weight: data.weightKg || 0,
            value: data.value || 0,
            iconUrl: localIconPath, // Local path!
            stackLimit: data.stackSize || 1,
            description: data.description?.en || '',
            modSlots: data.modSlots || null,
            effects: data.effects || null,
            recipe: data.recipe || null
        };

        // Inject Augment Stats if applicable
        if (uiType === 'augment') {
            const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedId = normalize(data.id);
            const statsKey = Object.keys(augmentStatsMap).find(k => normalize(k) === normalizedId);

            if (statsKey) {
                item.augmentStats = augmentStatsMap[statsKey];
            }
        }

        processedItems.push(item);
    });

    console.log(`--- Finished: Processed ${processedItems.length} items and synced ${imageCount} images ---`);
    fs.writeFileSync(TARGET_JSON, JSON.stringify(processedItems, null, 2));
    console.log(`Saved database to ${TARGET_JSON}`);
}

processData().catch(err => {
    console.error('Processing failed:', err);
    process.exit(1);
});
