import { ContactModelType } from 'os/services/ship/models/contacts';
import { isValidPatp } from 'urbit-ob';

export const searchPatpOrNickname = (
  search: string,
  contacts: Array<[string, ContactModelType]>,
  selected: Set<string>,
  our?: string
): Array<[string, ContactModelType]> => {
  let results: Array<[string, ContactModelType]> = contacts;
  // results from urbit-ob
  if (isValidPatp(search)) {
    results.push([
      search,
      {
        color: '#000000',
        avatar: null,
        nickname: '',
        status: '',
        bio: '',
        cover: '',
        groups: null,
        'last-updated': 0,
      },
    ]);
  }
  // Results from rolodex
  const filtered: Array<[string, ContactModelType]> = results.filter(
    (el: [string, ContactModelType]) => {
      const patp = el[0].toLocaleLowerCase();
      console.log(patp);
      if (patp === our) {
        return;
      }
      const nickname = el[1].nickname?.toLocaleLowerCase();
      const searchTerm = search.toLocaleLowerCase();
      if (Array.from(selected.values()).includes(patp)) {
        return;
      }

      return patp.includes(searchTerm) || nickname?.includes(searchTerm);
    }
  );

  return filtered;
};
