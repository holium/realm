import { ContactInfo } from './types';
import { shipUrl } from './shared';

export async function saveContact(contact: ContactInfo) {
  const url = `${shipUrl}/spider/realm/passport-action/passport-vent/passport-vent`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      'change-contact': contact,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}
