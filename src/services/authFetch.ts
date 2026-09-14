export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, {
        ...options,
        headers
    });
    return response;
}
