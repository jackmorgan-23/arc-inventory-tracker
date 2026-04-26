import * as ff from '@google-cloud/functions-framework';
import { Storage } from '@google-cloud/storage';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME || 'arc-raiders-item-cache-arc-492718';

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

ff.http('fnItemSync', async (req, res) => {
  // This is an internal job triggered by Cloud Scheduler
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    console.log('Downloading latest items from GitHub...');
    const repoUrl = 'https://github.com/RaidTheory/arcraiders-data/archive/refs/heads/main.zip';
    const response = await fetch(repoUrl);
    if (!response.ok) throw new Error(`Failed to download repo: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();

    console.log('--- Phase 2: Loading Augment Stats ---');
    const augmentsApi = JSON.parse(fs.readFileSync(path.join(__dirname, 'augments_api.json'), 'utf8'));
    const augmentOverrides = JSON.parse(fs.readFileSync(path.join(__dirname, 'augment_overrides.json'), 'utf8'));
    const augmentStatsMap = {};

    Object.values(augmentsApi.query.pages).forEach(page => {
        if (!page.revisions) return;
        const text = page.revisions[0]['*'];
        const stats = parseWikitextInfobox(text);
        const id = page.title.toLowerCase().replace(/\s/g, '_').replace(/\./g, '');
        augmentStatsMap[id] = stats;
        
        if (augmentOverrides[page.title]) {
            augmentStatsMap[id] = { ...stats, ...augmentOverrides[page.title] };
        }
    });

    Object.keys(augmentOverrides).forEach(title => {
        const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const id = normalize(title);
        augmentStatsMap[id] = { ...(augmentStatsMap[id] || {}), ...augmentOverrides[title] };
    });

    console.log('--- Phase 3: Processing Items & Images ---');
    const processedItems = [];
    const imagesToUpload = new Map(); // imgName -> buffer
    
    // Create a map of paths in the zip for quick lookup
    const zipEntryMap = new Map();
    zipEntries.forEach(e => zipEntryMap.set(e.entryName, e));

    zipEntries.forEach(entry => {
        if (entry.entryName.startsWith('arcraiders-data-main/items/') && entry.entryName.endsWith('.json')) {
            const raw = entry.getData().toString('utf8');
            const data = JSON.parse(raw);

            let uiType = 'material';
            const type = data.type?.toLowerCase() || '';

            if (data.isWeapon) uiType = 'weapon';
            else if (type.includes('ammo')) uiType = 'ammo';
            else if (type.includes('quick use') || type.includes('consumable') || type.includes('gadget') || type === 'utility') uiType = 'consumable';
            else if (type === 'augment') uiType = 'augment';
            else if (type === 'shield') uiType = 'shield';
            else if (type.includes('key')) uiType = 'key';

            const imgName = data.imageFilename?.split('/').pop();
            let iconUrl = null;

            if (imgName) {
                const upscaledPath = `arcraiders-data-main/images/items_upscaled/${imgName}`;
                const standardPath = `arcraiders-data-main/images/items/${imgName}`;

                let imageEntry = zipEntryMap.get(upscaledPath) || zipEntryMap.get(standardPath);
                
                if (imageEntry) {
                    // Store for upload
                    if (!imagesToUpload.has(imgName)) {
                        imagesToUpload.set(imgName, imageEntry.getData());
                    }
                    // Use our bucket URL
                    iconUrl = `https://storage.googleapis.com/${BUCKET_NAME}/images/${imgName}`;
                }
            }

            if (!iconUrl) return; // Skip items without images

            const item = {
                id: data.id,
                name: data.name.en,
                type: uiType,
                subType: data.type,
                rarity: data.rarity.toLowerCase(),
                weight: data.weightKg || 0,
                value: data.value || 0,
                iconUrl: iconUrl,
                stackLimit: data.stackSize || 1,
                description: data.description?.en || '',
                modSlots: data.modSlots || null,
                effects: data.effects || null,
                recipe: data.recipe || null
            };

            if (uiType === 'augment') {
                const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normalizedId = normalize(data.id);
                const statsKey = Object.keys(augmentStatsMap).find(k => normalize(k) === normalizedId);

                if (statsKey) {
                    item.augmentStats = augmentStatsMap[statsKey];
                }
            }

            processedItems.push(item);
        }
    });

    console.log(`--- Phase 4: Uploading ${imagesToUpload.size} images to GCS ---`);
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Upload images in parallel (chunks of 20 to avoid OOM/timeout)
    const imgEntries = Array.from(imagesToUpload.entries());
    const CHUNK_SIZE = 20;
    for (let i = 0; i < imgEntries.length; i += CHUNK_SIZE) {
        const chunk = imgEntries.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async ([name, buffer]) => {
            const file = bucket.file(`images/${name}`);
            await file.save(buffer, {
                contentType: name.endsWith('.webp') ? 'image/webp' : 'image/png',
                resumable: false,
                metadata: {
                    cacheControl: 'public, max-age=31536000, immutable'
                }
            });
        }));
        console.log(`Uploaded ${Math.min(i + CHUNK_SIZE, imgEntries.length)} / ${imgEntries.length} images...`);
    }

    console.log(`--- Finished: Processed ${processedItems.length} items ---`);
    
    // Upload final JSON to GCS
    const jsonFile = bucket.file('items_v2.json');
    await jsonFile.save(JSON.stringify(processedItems, null, 2), {
        contentType: 'application/json',
        metadata: {
            cacheControl: 'public, max-age=3600, s-maxage=3600'
        }
    });

    res.status(200).json({ message: 'Sync complete', count: processedItems.length, images: imagesToUpload.size });
  } catch (err) {
    console.error('Processing failed:', err);
    res.status(500).json({ error: err.message });
  }
});
