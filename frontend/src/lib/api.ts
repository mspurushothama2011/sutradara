const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const isCustomerEndpoint = endpoint.includes('/customer/');
  
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    if (isCustomerEndpoint) {
      token = localStorage.getItem('accessToken') || localStorage.getItem('sutradara_token');
    } else {
      token = localStorage.getItem('sutradara_token') || localStorage.getItem('accessToken');
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  } else if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, config);

  // Handle 401 Unauthorized (attempt token refresh)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/customer/auth/')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('sutradara_token', accessToken);
        }
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${accessToken}`;
        const retryRes = await fetch(url, { ...config, headers });
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${retryRes.status}`);
        }
        return retryRes.json();
      }
    } catch (refreshErr) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sutradara_token');
        localStorage.removeItem('sutradara_user');
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
    throw error;
  }

  return response.json();
}
