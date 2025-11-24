const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

export async function fetchJSON<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || 'GET';
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error: any) {
    const errorMsg = error?.message || error?.name || String(error);
    console.error(`[API] ${method} ${url} failed:`, errorMsg);
    throw error;
  }
}

export async function authFetch<T>(
  path: string,
  token: string,
  body?: any
): Promise<T> {
  return fetchJSON<T>(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function uploadMedia(
  file: File,
  type: 'image' | 'gif' | 'audio' | 'video'
): Promise<string> {
  // For now, convert to base64. In production, upload to Supabase Storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

