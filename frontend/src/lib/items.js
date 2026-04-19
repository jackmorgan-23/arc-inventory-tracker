export async function fetchItems() {
  try {
    const response = await fetch('/items_v2.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // We already did most mapping in the process_items.js script.
    // We just return it, ensuring durability/quantity placeholders exist for the UI.
    return data.map(item => ({
      ...item,
      // Provide defaults for legacy UI expectations if missing
      durability: item.type === 'weapon' ? 100 : undefined,
      quantity: (item.type === 'ammo' || item.type === 'material') ? 0 : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}
