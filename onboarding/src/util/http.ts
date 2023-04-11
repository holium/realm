export function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  return fetch(input, init).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
}
