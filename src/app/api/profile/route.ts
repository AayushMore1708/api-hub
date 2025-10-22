import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Corrected import path
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.image) {
    return NextResponse.json({ image: '/default-avatar.png' });
  }

  return NextResponse.json({ image: session.user.image });
}