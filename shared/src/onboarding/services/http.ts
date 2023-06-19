function timeoutPromise<T>(promise: Promise<T>, timeout = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('timeout'));
    }, timeout);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

export function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeout?: number
): Promise<T> {
  return timeoutPromise(
    fetch(input, init).then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    }),
    timeout
  );
}
