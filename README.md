# **API Hub**

### **Search, Understand, and Chat with Any API Documentation — Powered by Gemini and RAG**

---

## **Overview**

**API Hub** is a developer-focused web application that allows users to search for any API or library (e.g., Stripe, Notion, OpenAI, Twitter) and instantly explore its endpoints, parameters, authentication methods, and examples.

The app automatically discovers and parses documentation from the web—using **Google Custom Search API** and **GitHub Search API**—then extracts and stores endpoint data in a structured way.

It uses **Gemini** and **Retrieval-Augmented Generation (RAG)** to let users ask natural-language questions such as:

* “How do I create a payment with Stripe?”
* “What does the `/v1/messages` endpoint do?”
* “Show me all GET requests for the Notion API.”

The result is an intelligent, searchable, AI-enhanced API documentation explorer that makes learning and integrating APIs effortless.

---

## **Core Features**

### **1. Smart API Discovery**

Automatically finds documentation for any API or library using:

* **GitHub Search API** → Finds `openapi.yaml`, `swagger.json`, or Markdown docs in repositories.
* **Google Custom Search API** → Finds official documentation pages on the web.

### **2. Automated Parsing & Structuring**

Extracts endpoints, methods, parameters, and descriptions from:

* **Swagger / OpenAPI specifications**
* **Markdown / HTML documentation**

### **3. RAG + Gemini Q&A**

Parsed content is stored in a **vector database** (PostgreSQL + pgvector) for retrieval.

When a user asks a question, the system:

1. Embeds the query using Gemini.
2. Retrieves the most relevant documentation chunks.
3. Sends the context and question to Gemini for an accurate, context-aware answer.

### **4. Chat Interface for Developers**

Ask Gemini questions about APIs as if it were a documentation assistant.

Example queries:

* “How do I authenticate with the Twitter API?”
* “List all POST endpoints for the GitHub REST API.”

### **5. OAuth Authentication**

Secure login via:

* **Google OAuth**
* **GitHub OAuth**

### **6. TDD-Driven Development**

The project follows **Test-Driven Development (TDD)** using:

* **Jest** for backend and API testing
* **React Testing Library** for frontend component tests

### **7. Clean, Modern UI**

Built with **Next.js App Router** and **TailwindCSS**, featuring:

* Search bar with autosuggestions
* Endpoint list with filters (GET / POST / PUT / DELETE)
* Chat-style AI assistant

---

## **Architecture**

```
┌────────────────────────────────────┐
│            Frontend (Next.js)      │
│   - Search UI + Chat Interface     │
│   - React + Tailwind + Testing     │
└───────────────┬────────────────────┘
                │
┌───────────────┴────────────────────┐
│         API Layer (Next.js API)    │
│  /api/search → GitHub + Google CSE │
│  /api/parse  → Extract endpoints   │
│  /api/query  → RAG + Gemini Q&A    │
└───────────────┬────────────────────┘
                │
┌───────────────┴────────────────────┐
│     Data & Intelligence Layer      │
│  Drizzle ORM + PostgreSQL + pgvector│
│  - Stores endpoints & embeddings   │
│  Gemini API → embeddings & answers │
└───────────────┬────────────────────┘
                │
┌───────────────┴────────────────────┐
│   Integrations (OAuth + APIs)      │
│  - Google OAuth                    │
│  - GitHub OAuth                    │
│  - Gemini API                      │
│  - Google Custom Search API        │
│  - GitHub Search API               │
└────────────────────────────────────┘
```

---

## **Tech Stack**

### **Frontend**

* Next.js 14 (App Router)
* React 18
* TailwindCSS – responsive, modern styling
* React Testing Library + Jest – TDD for components

### **Backend / Server**

* Next.js API Routes – serverless backend endpoints
* Drizzle ORM – type-safe SQL and migrations
* PostgreSQL – relational data + pgvector for embeddings
* Gemini API (Google Generative AI) – for embeddings and generative answers
* RAG (Retrieval-Augmented Generation) – custom implementation for context-aware responses

### **Authentication**

* NextAuth.js
* OAuth Providers: Google, GitHub

### **Integrations**

* GitHub Search API – discover repositories and documentation files
* Google Custom Search API – find official docs on the web
* Gemini API – generate embeddings and answer questions

### **Testing / DevOps**

* Jest – backend unit & integration tests
* React Testing Library – frontend component tests
* ESLint + Prettier – code quality and linting
* Vercel – deployment (Next.js hosting)
* Neon / Supabase / Railway – PostgreSQL hosting

---

## **Example Use Case**

1. The user logs in with Google or GitHub.
2. Searches for: “Stripe API.”
3. The system:

   * Finds official docs via Google and GitHub.
   * Parses endpoints like `/v1/charges`, `/v1/customers`.
   * Stores them in PostgreSQL.
   * Generates embeddings via Gemini.
4. The user asks: “How do I refund a charge?”

   * RAG retrieves the relevant section (`POST /v1/refunds`).
   * Gemini responds:
     “To refund a charge, send a POST request to `/v1/refunds` with the `charge` parameter and optional `amount`.”

---

## **Database Schema (Simplified)**

| Table             | Columns                                                       | Description              |
| ----------------- | ------------------------------------------------------------- | ------------------------ |
| **users**         | id, name, email, provider                                     | Authenticated users      |
| **api_docs**      | id, library, source, url, content, vector                     | Parsed documentation     |
| **api_endpoints** | id, api_doc_id, path, method, parameters, description, vector | Individual endpoint data |
| **queries**       | id, user_id, question, response                               | Q&A logs                 |

---

## **Testing Examples**

* **searchAPI.test.ts** → validates GitHub + Google API calls return correct URLs
* **parseDocs.test.ts** → checks endpoint extraction accuracy
* **ragQuery.test.ts** → verifies RAG + Gemini pipeline returns relevant context
* **SearchBar.test.tsx** → ensures frontend search behaves correctly

---

## **Future Enhancements**

* SDK Analysis – extract functions from npm packages
* Auto Code Samples – Gemini generates curl, Python, or Node.js examples
* Compare APIs – “Compare Stripe vs Razorpay”
* Rate Limit Tracking – fetch and display per-endpoint rate limits
* Periodic Doc Updates – scheduled re-parsing for freshness

---

## **Why This Project Stands Out**

* Combines web-scale search, structured API parsing, and AI understanding
* Real-world use of RAG architecture with Gemini embeddings
* True full-stack implementation (Next.js backend + frontend)
* Solid software engineering: typed ORM, TDD, OAuth, API integrations
* A genuinely useful and technically robust developer tool

---


Testing Commands
bunx jest __tests__/smoke_test.tsx
bunx jest PopularRepos.test.tsx