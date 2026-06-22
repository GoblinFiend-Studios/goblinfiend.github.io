import { getStore } from "@netlify/blobs";

export default async function handler(req, context) {
  const store = getStore("visitor-counter");

  // Get current count
  let count = 0;
  try {
    const val = await store.get("count");
    count = parseInt(val, 10) || 0;
  } catch (e) {
    count = 0;
  }

  // Increment and save
  count += 1;
  await store.set("count", String(count));

  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export const config = {
  path: "/.netlify/functions/counter",
};
