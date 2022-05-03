import { cleanNounColor } from '../../../renderer/logic/utils/color';
import { Conduit } from '../../conduit';

export const ContactApi = {
  getContact: async (
    ship: string,
    credentials: { url: string; cookie: string }
  ) => {
    try {
      const response = await Conduit.scryFetch(
        credentials.url,
        credentials.cookie,
        'contact-store',
        `/contact/${ship}`
      );
      const contact = response.json?.data['contact-update']?.add.contact;
      // color: newContact.color && cleanNounColor(newContact.color),
      return {
        ...contact,
        color: contact.color && cleanNounColor(contact.color),
      };
    } catch (err: any) {
      console.log(err);
    }
  },
};
