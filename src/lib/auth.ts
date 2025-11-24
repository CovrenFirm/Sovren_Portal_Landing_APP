/**
 * Server-side auth utilities for portal route protection
 * Uses JWT tokens stored in httpOnly cookies by auth backend
 */

import { IncomingMessage } from 'http';
import { GetServerSidePropsContext } from 'next';

const AUTH_COOKIE_NAME = 'sovren_auth_token';

/**
 * Extract auth token from request cookies
 */
export function getAuthToken(req: IncomingMessage): string | null {
  if (!req.headers.cookie) {
    return null;
  }

  const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[AUTH_COOKIE_NAME] || null;
}

/**
 * Verify auth token with backend (optional - can be used for extra validation)
 */
export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const authBaseUrl = process.env.SOVREN_AUTH_BASE_URL;
    if (!authBaseUrl) {
      console.error('[auth] SOVREN_AUTH_BASE_URL not configured');
      return false;
    }

    const response = await fetch(`${authBaseUrl}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[auth] Token verification failed:', error);
    return false;
  }
}

/**
 * Server-side auth guard for getServerSideProps
 * Returns redirect object if not authenticated
 */
export async function requireAuth(context: GetServerSidePropsContext) {
  const token = getAuthToken(context.req);

  if (!token) {
    return {
      redirect: {
        destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  // Token exists - user is authenticated
  // Optionally verify with backend for extra security:
  // const isValid = await verifyAuthToken(token);
  // if (!isValid) {
  //   return { redirect: { destination: '/login', permanent: false } };
  // }

  return { props: {} };
}

/**
 * Extract user data from local storage (client-side)
 * This is a helper for client components
 */
export function getUserFromStorage() {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('sovren_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get tenant ID from user data
 */
export function getTenantId(): string | null {
  const user = getUserFromStorage();
  return user?.tenant_id || null;
}
