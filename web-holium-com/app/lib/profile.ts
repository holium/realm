import { ContactInfo } from './types';
import { shipUrl } from './shared';

export async function saveContact(contact: ContactInfo) {
  const response = await fetch(
    `/spider/realm/passport-action/passport-vent/passport-vent`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        'change-contact': contact,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}
