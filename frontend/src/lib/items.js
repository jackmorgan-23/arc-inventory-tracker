export async function fetchItems() {
  try {
    const response = await fetch('/items_v2.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    return data.map(item => ({
      ...item,
      durability: item.type === 'weapon' ? 100 : undefined,
      quantity: (item.stackLimit && item.stackLimit > 1) ? item.stackLimit : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}
