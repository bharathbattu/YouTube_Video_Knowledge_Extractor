/**
 * Next.js Middleware for security headers, rate limiting, and request logging
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { generateRequestId } from '@/lib/utils';
import { RATE_LIMIT_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';

// Initialize rate limiter only if Redis is configured
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIG.REQUESTS_PER_MINUTE,
      `${RATE_LIMIT_CONFIG.WINDOW_SECONDS} s`
    ),
    analytics: true,
    prefix: 'yt-extractor',
  });
}

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
};

// Content Security Policy
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.deepgram.com https://openrouter.ai",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export async function middleware(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Rate limiting
    if (ratelimit) {
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
      const identifier = `${ip}:${pathname}`;

      try {
        const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

        if (!success) {
          console.warn(`[${requestId}] Rate limit exceeded for ${ip} on ${pathname}`);
          
          return NextResponse.json(
            { 
              success: false,
              error: ERROR_MESSAGES.RATE_LIMITED,
              code: 'RATE_LIMITED',
            },
            {
              status: HTTP_STATUS.TOO_MANY_REQUESTS,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
              },
            }
          );
        }

        // Add rate limit headers to successful requests
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
      } catch (error) {
        // If rate limiting fails, log but don't block the request
        console.error(`[${requestId}] Rate limiting error:`, error);
      }
    }
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header
  response.headers.set('Content-Security-Policy', cspDirectives);
  
  // Add request ID for tracing
  response.headers.set('X-Request-ID', requestId);

  // Log request (in production, use proper logging service)
  const duration = Date.now() - startTime;
  console.log(
    `[${requestId}] ${request.method} ${pathname} - ${duration}ms`
  );

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
