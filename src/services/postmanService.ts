const POSTMAN_API_BASE = "https://api.getpostman.com";
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY!;

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "X-Api-Key": POSTMAN_API_KEY,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${POSTMAN_API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(`Postman API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// 🔹 List all collections
export async function listCollections() {
  return request("/collections");
}

// 🔹 Get a single collection
export async function getCollection(uid: string) {
  return request(`/collections/${uid}`);
}

// 🔹 Create a new collection
export async function createCollection(collectionData: any) {
  return request("/collections", {
    method: "POST",
    body: JSON.stringify({ collection: collectionData }),
  });
}

// 🔹 Update an existing collection
export async function updateCollection(uid: string, collectionData: any) {
  return request(`/collections/${uid}`, {
    method: "PUT",
    body: JSON.stringify({ collection: collectionData }),
  });
}

// 🔹 Delete a collection
export async function deleteCollection(uid: string) {
  return request(`/collections/${uid}`, { method: "DELETE" });
}

// 🔹 Export collection as JSON
export async function exportCollection(uid: string) {
  return request(`/collections/${uid}/export`);
}
