
export const getToken = () => localStorage.getItem('cc_token');

export const setToken = (t) =>
  t
    ? localStorage.setItem('cc_token', t)
    : localStorage.removeItem('cc_token');

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API_BASE_URL + '/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken()
        ? { Authorization: 'Bearer ' + getToken() }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      (data && data.error) ||
      'Request failed. Please try again.'
    );
  }

  return data;
}
