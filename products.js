// netlify/functions/products.js
// Runs server-side on Netlify — your API key is never exposed to visitors.

exports.handler = async () => {
  const PRINTIFY_API_KEY  = process.env.PRINTIFY_API_KEY;
  const SHOP_ID           = process.env.PRINTIFY_SHOP_ID;
  const STORE_HANDLE      = process.env.PRINTIFY_STORE_HANDLE; // e.g. "goblinfiend"

  if (!PRINTIFY_API_KEY || !SHOP_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API credentials. Set env vars in Netlify.' }),
    };
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products.json?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error(`Printify API ${response.status}`);

    const data = await response.json();

    // Only send what the frontend needs — keeps response fast
    const products = data.data
      .filter(p => p.visible) // only show published products
      .map(p => ({
        id:    p.id,
        title: p.title,
        image: p.images?.[0]?.src || null,
        price: Math.min(...p.variants.filter(v => v.is_enabled).map(v => v.price)),
        url:   `https://${STORE_HANDLE}.printify.me/products/${p.id}`,
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // cache 5 min; new drops appear quickly
      },
      body: JSON.stringify(products),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
