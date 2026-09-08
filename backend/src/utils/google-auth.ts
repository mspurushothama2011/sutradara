/**
 * Google Identity Services (OAuth 2.0 / GIS) Token Verification Utility
 */

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified: boolean;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserPayload | null> {
  if (!idToken || typeof idToken !== 'string') {
    return null;
  }

  // Support local dev mock tokens for automated testing
  if (idToken.startsWith('mock-google-token:')) {
    const email = idToken.replace('mock-google-token:', '').trim();
    return {
      googleId: `google_mock_${Date.now()}`,
      email: email || 'patron@example.com',
      name: (email ? email.split('@')[0] : 'Valued Patron'),
      emailVerified: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[GoogleAuth] Google tokeninfo returned HTTP ${response.status}`);
      return null;
    }

    const payload: any = await response.json();

    if (!payload.email || !payload.sub) {
      return null;
    }

    // Optional verification against GOOGLE_CLIENT_ID if configured
    const configuredClientId = process.env.GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud !== configuredClientId) {
      console.warn(`[GoogleAuth] Token audience '${payload.aud}' does not match configured client ID.`);
      return null;
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      picture: payload.picture,
      emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
    };
  } catch (err: any) {
    console.error('[GoogleAuth] Token validation error:', err.message || err);
    return null;
  }
}
