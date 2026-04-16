export async function fetchItems() {
  try {
    const response = await fetch('/ardb_items.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const rawData = await response.json();
    
    const weaponCategories = ['hand cannon', 'battle rifle', 'assault rifle', 'SMG', 'pistol', 'shotgun', 'sniper rifle', 'LMG'];
    
    return rawData.map(item => {
      let uiType = 'material';
      if (weaponCategories.includes(item.type)) uiType = 'weapon';
      else if (item.type === 'ammunition') uiType = 'ammo';
      else if (item.type === 'quick use') uiType = 'consumable';
      
      return {
        id: item.id,
        name: item.name,
        type: uiType,
        subType: item.type,
        rarity: item.rarity || 'common',
        weight: item.weight || (uiType === 'weapon' ? 5.0 : 0.5),
        iconUrl: item.icon ? `https://ardb.app/static${item.icon}` : null,
        icon: 'Box',
        durability: uiType === 'weapon' ? Math.floor(Math.random() * 100) + 12 : undefined,
        quantity: uiType === 'ammo' || uiType === 'material' ? Math.floor(Math.random() * 100) + 1 : undefined,
      };
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}
