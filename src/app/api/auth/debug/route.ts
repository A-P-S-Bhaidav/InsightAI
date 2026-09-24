import { NextResponse } from 'next/server';

// Debug endpoint to verify OAuth configuration — remove in production
export async function GET() {
  const config = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    AUTH_URL: process.env.AUTH_URL || 'NOT SET',
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
  };

  return NextResponse.json(config);
}
