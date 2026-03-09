import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const DASHBOARD_PATHS = ['/agenda', '/conversations', '/contacts', '/notifications', '/settings'];
const TOKEN_KEY = 'saludates_token';
const CLINIC_ID_KEY = 'saludates_clinic_id';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));
  if (!isDashboard) return NextResponse.next();

  const token = request.cookies.get(TOKEN_KEY)?.value;
  if (!token) return NextResponse.next();

  const payload = decodeJwtPayload(token);
  if (!payload) return NextResponse.next();

  const role = payload['role'] as string;
  const clinicId = request.cookies.get(CLINIC_ID_KEY)?.value ?? (payload['clinicId'] as string | null);

  if (role !== 'CLINIC_USER' || !clinicId) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${API_URL}/clinics/${clinicId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const clinic = await res.json();
      if (!clinic.onboardingDone) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  } catch {
    // Si la API no está disponible, dejamos pasar
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agenda/:path*', '/conversations/:path*', '/contacts/:path*', '/notifications/:path*', '/settings/:path*'],
};
