import { NextResponse } from "next/server";
import { getCollection, updateCollection, deleteCollection } from "@/services/postmanService";

export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const data = await getCollection(params.uid);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { uid: string } }) {
  try {
    const body = await req.json();
    const data = await updateCollection(params.uid, body);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { uid: string } }) {
  try {
    await deleteCollection(params.uid);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}