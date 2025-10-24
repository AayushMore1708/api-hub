"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApiTestingPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch all collections
  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/postman");
      if (!res.ok) {
        throw new Error(`Failed to fetch collections: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err: any) {
      console.error(err);
      alert(`Error fetching collections: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single collection
  const fetchCollectionById = async (uid: string) => {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/postman/${uid}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch collection: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setSelectedCollection(data);
    } catch (err: any) {
      console.error(err);
      alert(`Error fetching collection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new collection
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/postman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          info: {
            name: newCollectionName,
            description: "Created via API Tester UI",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
          },
          item: [],
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create collection: ${res.status} ${res.statusText}`);
      }
      await res.json();
      setNewCollectionName("");
      await fetchCollections();
    } catch (err: any) {
      console.error(err);
      alert(`Error creating collection: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Start editing a collection
  const startEdit = (col: any) => {
    setEditingId(col.uid);
    setEditName(col.name);
    setEditDescription(col.info?.description || "");
  };

  // Save edited collection
  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const res = await fetch(`/api/postman/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          info: {
            name: editName,
            description: editDescription,
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
          },
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update collection: ${res.status} ${res.statusText}`);
      }
      await res.json();
      setEditingId(null);
      setEditName("");
      setEditDescription("");
      await fetchCollections();
      if (selectedId === editingId) {
        await fetchCollectionById(editingId);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error updating collection: ${err.message}`);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  // Delete a collection
  const deleteCollection = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/postman/${uid}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete collection: ${res.status} ${res.statusText}`);
      }
      await res.json();
      await fetchCollections();
      if (selectedId === uid) {
        setSelectedId("");
        setSelectedCollection(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error deleting collection: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <section className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <div className="self-start flex space-x-2 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          title="Go back"
        >
          ← Back
        </button>
        <button
          onClick={() => router.push('/')}
          className="p-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
          title="Go to Home"
        >
          Home
        </button>
        <button
          onClick={() => router.push('/api-testing')}
          className="p-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
          title="Go to API Tester"
        >
          API Tester
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-purple-400">Postman API Collections</h1>

      <div className="w-full max-w-5xl bg-[#111] p-6 rounded-lg border border-gray-700 shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-300">Your Collections</h2>
          <button
            onClick={fetchCollections}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {collections.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No collections found. Create one below.
          </p>
        ) : (
          <ul className="space-y-2">
            {collections.map((col) => (
              <li
                key={col.uid}
                className={`p-3 border border-gray-700 rounded-md ${
                  selectedId === col.uid
                    ? "bg-purple-700/30 border-purple-500"
                    : "hover:bg-gray-800/60"
                }`}
              >
                {editingId === col.uid ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      placeholder="Collection name"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedId(col.uid);
                        fetchCollectionById(col.uid);
                      }}
                    >
                      <span className="font-semibold">{col.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{col.uid}</span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => startEdit(col)}
                        className="px-2 py-1 bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCollection(col.uid)}
                        className="px-2 py-1 bg-red-600 rounded-md hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-sm text-gray-300 mb-2">Create New Collection</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
            <button
              onClick={createCollection}
              disabled={creating}
              className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {selectedCollection && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Selected Collection Details
            </h3>
            <pre className="bg-gray-900 p-4 rounded-md text-green-400 text-sm overflow-auto max-h-[400px]">
              {JSON.stringify(selectedCollection, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
