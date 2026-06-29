// Frappe API Proxy Route
// Proxies requests to Frappe backend to avoid CORS issues in production.
// Frontend can call /api/frappe/... instead of the Frappe URL directly.

import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const frappeUrl = DEFAULT_FRAPPE_URL.replace(/\/+$/, '');
  const pathStr = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${frappeUrl}/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    // Forward authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // Forward cookie for session-based auth
    const cookie = request.headers.get('Cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[Frappe Proxy] GET error:', err);
    return NextResponse.json(
      { error: 'Frappe backend ni dosegljiv', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const frappeUrl = DEFAULT_FRAPPE_URL.replace(/\/+$/, '');
  const pathStr = path.join('/');
  const url = `${frappeUrl}/${pathStr}`;

  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    // Forward authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // Forward cookie for session-based auth
    const cookie = request.headers.get('Cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const body = await request.text();

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[Frappe Proxy] POST error:', err);
    return NextResponse.json(
      { error: 'Frappe backend ni dosegljiv', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const frappeUrl = DEFAULT_FRAPPE_URL.replace(/\/+$/, '');
  const pathStr = path.join('/');
  const url = `${frappeUrl}/${pathStr}`;

  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    const cookie = request.headers.get('Cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const body = await request.text();

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body,
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[Frappe Proxy] PUT error:', err);
    return NextResponse.json(
      { error: 'Frappe backend ni dosegljiv' },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const frappeUrl = DEFAULT_FRAPPE_URL.replace(/\/+$/, '');
  const pathStr = path.join('/');
  const url = `${frappeUrl}/${pathStr}`;

  try {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    const cookie = request.headers.get('Cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[Frappe Proxy] DELETE error:', err);
    return NextResponse.json(
      { error: 'Frappe backend ni dosegljiv' },
      { status: 502 }
    );
  }
}
