import { NextResponse } from 'next/server';

/**
 * URY Dashboard Health Check Endpoint
 * Returns system status for monitoring and Docker health checks
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health checks
    const checks: Record<string, 'ok' | 'error'> = {
      dashboard: 'ok',
    };

    // Check Frappe connection if configured
    const frappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
    if (frappeUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        await fetch(`${frappeUrl}/api/method/ping`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        checks.frappe = 'ok';
      } catch {
        checks.frappe = 'error';
      }
    }

    const responseTime = Date.now() - startTime;
    const isHealthy = Object.values(checks).every((v) => v === 'ok');

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        checks,
        environment: process.env.NODE_ENV,
        restaurant: process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'URY Restaurant',
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
