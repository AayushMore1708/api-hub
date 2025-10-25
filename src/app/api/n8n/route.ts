import { NextResponse } from "next/server";
import axios from "axios";

// Your n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N_WEBHOOK_URL environment variable is not set");
    }

    const n8nRes = await axios.post(N8N_WEBHOOK_URL, body);

    return NextResponse.json({ success: true, n8n: n8nRes.data });
  } catch (error: any) {
    console.error('N8N API Error:', error);
    let message = "Unknown error";
    
    if (error.response) {
      if (error.response.status === 404) {
        message = "N8N webhook not found. Please ensure your n8n workflow is active and the webhook URL is correct.";
      } else {
        message = error.response.data?.error || `N8N API error: ${error.response.status}`;
      }
    } else if (error.message) {
      message = error.message;
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
