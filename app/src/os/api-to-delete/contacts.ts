import { Conduit } from '@holium/conduit';
import { cleanNounColor } from '../lib/color';

export const ContactApi = {
  getContact: async (conduit: Conduit, ship: string) => {
    const response = await conduit.scry({
      app: 'contact-store',
      path: `/contact/${ship}`,
    });

    const contact = response['contact-update']?.add.contact;

    return {
      ...contact,
      color: contact.color && cleanNounColor(contact.color),
    };
  },
};
