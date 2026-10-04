const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const isPortalContext = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
  const isCustomerEndpoint = normalizedEndpoint.startsWith('/customer/') || (!isPortalContext && normalizedEndpoint.startsWith('/auth/me'));
  const isAdminEndpoint =
    isPortalContext ||
    normalizedEndpoint.startsWith('/admin/') ||
    normalizedEndpoint.startsWith('/portal/') ||
    normalizedEndpoint.startsWith('/staff/') ||
    normalizedEndpoint.startsWith('/audit/') ||
    normalizedEndpoint.startsWith('/orders') ||
    normalizedEndpoint.startsWith('/marketing/');

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    if (isPortalContext || isAdminEndpoint) {
      token = localStorage.getItem('sutradara_token');
    } else if (isCustomerEndpoint) {
      token = localStorage.getItem('accessToken');
    } else {
      // General or public endpoints: check admin token if available, then customer
      token = localStorage.getItem('sutradara_token') || localStorage.getItem('accessToken');
    }
  }

  const isFormData = options.body instanceof FormData || options.data instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  // Only attach Authorization header if not already provided and token is available
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  };

  if (options.data) {
    config.body = isFormData ? (options.data as any) : JSON.stringify(options.data);
  } else if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const response = await fetch(url, config);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // 1. If admin/portal endpoint, attempt token refresh via httpOnly refreshToken cookie
    if (isAdminEndpoint && !normalizedEndpoint.includes('/auth/login') && !normalizedEndpoint.includes('/auth/refresh')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          if (typeof window !== 'undefined') {
            localStorage.setItem('sutradara_token', accessToken);
            window.dispatchEvent(new Event('auth-change'));
          }
          headers['Authorization'] = `Bearer ${accessToken}`;
          const retryRes = await fetch(url, { ...config, headers });
          if (retryRes.ok) {
            return retryRes.json();
          }
        }
      } catch (refreshErr) {
        // Refresh failed -> clear admin session
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('sutradara_token');
        localStorage.removeItem('sutradara_user');
        window.dispatchEvent(new Event('auth-change'));
        if (window.location.pathname.startsWith('/portal') && window.location.pathname !== '/portal/login') {
          window.location.href = '/portal/login';
        }
      }
    }

    // 2. If customer endpoint with 401 -> clear invalid/expired customer token immediately
    if (isCustomerEndpoint && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('customerUser');
      window.dispatchEvent(new Event('customer-auth-expired'));
      if (window.location.pathname.startsWith('/account')) {
        window.location.href = '/login';
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || `HTTP error ${response.status}`;
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.code = errorData.code;
    error.data = errorData;
    error.isAuthError = response.status === 401;
    throw error;
  }

  return response.json();
}

/**
 * Upload a single image to backend disk storage
 */
export async function uploadSingleImage(file: File): Promise<{ url: string; fullUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sutradara_token') || localStorage.getItem('accessToken')
      : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/uploads/single`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    url: data.url,
    fullUrl: data.fullUrl,
    filename: data.file?.filename || '',
  };
}

/**
 * Upload multiple images to backend disk storage
 */
export async function uploadMultipleImages(files: File[]): Promise<{ urls: string[]; files: any[] }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sutradara_token') || localStorage.getItem('accessToken')
      : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/uploads/multiple`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    urls: data.urls || [],
    files: data.files || [],
  };
}
