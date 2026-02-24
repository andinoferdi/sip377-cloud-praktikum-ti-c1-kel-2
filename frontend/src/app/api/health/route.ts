import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!url.pathname) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
