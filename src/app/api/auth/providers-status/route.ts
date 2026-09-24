import { NextResponse } from 'next/server';

// Public endpoint — tells the client which auth providers are configured
export async function GET() {
  return NextResponse.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
