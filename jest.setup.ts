// 1️⃣ Polyfill TextEncoder/TextDecoder BEFORE anything else
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// 2️⃣ Now import undici (needs those globals)
import { fetch, Headers, Request, Response } from "undici";

// 3️⃣ Then continue with other setup
import "@testing-library/jest-dom";
import dotenv from "dotenv";
import path from "path";

// 4️⃣ Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// 5️⃣ Assign globals
global.fetch = fetch as any;
global.Headers = Headers as any;
global.Request = Request as any;
global.Response = Response as any;

console.log("✅ Environment loaded for Jest from .env.local");
