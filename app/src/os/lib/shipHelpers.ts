export interface ShipConnectionData {
  patp: string;
  url: string;
  code: string;
}

export async function getCookie(ship: ShipConnectionData) {
  const response = await fetch(`${ship.url}/~/login`, {
    method: 'POST',
    body: `password=${ship.code.trim()}`,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const cookie = response.headers.get('set-cookie')?.split(';')[0];

  return cookie;
}
