"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApiTestingPage() {
    const router = useRouter();
    const [method, setMethod] = useState("GET");
    const [url, setUrl] = useState("");
    const [body, setBody] = useState("");
    const [headers, setHeaders] = useState([{ key: "", value: "" }]);
    const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const sendRequest = async () => {
        if (!url) return;
        setLoading(true);
        try {
            let finalUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
            // Append query params
            const params = new URLSearchParams();
            queryParams.forEach(param => {
                if (param.key && param.value) params.append(param.key, param.value);
            });
            const paramString = params.toString();
            if (paramString) finalUrl += `?${paramString}`;

            let parsedBody;
            try {
                parsedBody = body.trim() ? JSON.parse(body) : undefined;
            } catch (e) {
                setResponse({ error: "Invalid JSON in request body" });
                setLoading(false);
                return;
            }

            const res = await fetch("/api/test-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: finalUrl,
                    method,
                    body: parsedBody,
                    headers: headers.filter(h => h.key && h.value),
                }),
            });
            const data = await res.json();
            setResponse(data);
        } catch (err: any) {
            setResponse({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
    const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
    const updateHeader = (index: number, field: "key" | "value", value: string) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    const addQueryParam = () => setQueryParams([...queryParams, { key: "", value: "" }]);
    const removeQueryParam = (index: number) => setQueryParams(queryParams.filter((_, i) => i !== index));
    const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
        const newParams = [...queryParams];
        newParams[index][field] = value;
        setQueryParams(newParams);
    };


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
                onClick={() => router.push('/postman-collections')}
                className="p-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                title="Go to Postman Collections"
            >
                Postman Collections
            </button>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-purple-400">API Tester</h1>
          
            <div className="w-full max-w-5xl bg-[#111] p-6 rounded-lg border border-gray-700 shadow relative">
                
                <div className="flex space-x-3 mb-4">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Enter API URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                sendRequest();
                            }
                        }}
                        className="flex-1 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
                    />
                    <button
                        onClick={sendRequest}
                        disabled={loading}
                        className="px-5 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>

                {/* Headers Section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Headers</label>
                        <button onClick={addHeader} className="text-purple-400 hover:text-purple-300 text-sm">+ Add Header</button>
                    </div>
                    {headers.map((header, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Key"
                                value={header.key}
                                onChange={(e) => updateHeader(index, "key", e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={header.value}
                                onChange={(e) => updateHeader(index, "value", e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                            />
                            <button onClick={() => removeHeader(index)} className="text-red-400 hover:text-red-300 px-2">-</button>
                        </div>
                    ))}
                </div>

                {/* Query Parameters Section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Query Parameters</label>
                        <button onClick={addQueryParam} className="text-purple-400 hover:text-purple-300 text-sm">+ Add Param</button>
                    </div>
                    {queryParams.map((param, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Key"
                                value={param.key}
                                onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={param.value}
                                onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                            />
                            <button onClick={() => removeQueryParam(index)} className="text-red-400 hover:text-red-300 px-2">-</button>
                        </div>
                    ))}
                </div>

                {(method === "POST" || method === "PUT" || method === "PATCH") && (
                    <textarea
                        rows={6}
                        placeholder='Request body (JSON)'
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full mb-4 p-3 bg-gray-900 text-gray-200 rounded-md border border-gray-700"
                    />
                )}

                {response && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Output :</h3>
                        <div className="bg-gray-900 border border-gray-700 rounded-md p-4 overflow-auto max-h-[400px]">
                            <div className="mb-2 text-sm text-gray-400">
                                Status: {response.status} | Content-Type: {response.contentType}
                            </div>
                            <pre className="text-green-400 text-sm">
                                {typeof response.data === "string"
                                    ? response.data
                                    : JSON.stringify(response.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
