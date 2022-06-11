import { ContactModelType } from 'core/ship/stores/contacts';
import { isValidPatp } from 'urbit-ob';

export const searchPatpOrNickname = (
  search: string,
  contacts: Array<[string, ContactModelType]>,
  selected: Set<string>
): Array<[string, ContactModelType]> => {
  // Results from rolodex
  const results = contacts.filter((el: [string, ContactModelType]) => {
    const patp = el[0].toLocaleLowerCase();
    const nickname = el[1].nickname?.toLocaleLowerCase();
    const searchTerm = search.toLocaleLowerCase();
    if (Array.from(selected.values()).includes(patp)) {
      return;
    }
    return patp.includes(searchTerm) || nickname?.includes(searchTerm);
  });
  // TODO Results from urbit-ob
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

  return results;
};
