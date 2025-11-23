const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
  
  console.log(`[API] ${method} ${url}`, options.body ? JSON.parse(options.body as string) : '');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log(`[API] Response from ${url}:`, data);

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API] Error ${method} ${url}:`, error);
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
  console.log(`[API] Uploading ${type}:`, file.name, file.size);
  
  // For now, convert to base64. In production, upload to Supabase Storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      console.log(`[API] Media converted to base64, length:`, base64.length);
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

