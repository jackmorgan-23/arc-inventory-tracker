const ITEMS_FN_URL = 'https://fn-items-qfu2armj7q-ue.a.run.app';
const GATEWAY_URL = 'https://arc-inventory-gateway-7sn18qso.ue.gateway.dev';

export async function fetchItems() {
  try {
    // Items are public—fetch them directly without auth headers to avoid CORS preflight issues
    const baseUrl = window.location.hostname === 'localhost' ? ITEMS_FN_URL : GATEWAY_URL;
    const url = baseUrl === GATEWAY_URL ? `${baseUrl}/items` : baseUrl;
    
    const response = await fetch(url);
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
