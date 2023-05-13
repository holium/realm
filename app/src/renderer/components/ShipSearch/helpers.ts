import { isValidPatp } from 'urbit-ob';

import { FriendType } from 'renderer/stores/models/friends.model';

type ContactMetadata = Omit<
  FriendType,
  'pinned' | 'tags' | 'status' | 'patp' | 'setPinned' | 'setStatus' | 'setTags'
>;

export const searchPatpOrNickname = (
  search: string,
  contacts: Array<[string, ContactMetadata]>,
  selected: Set<string>,
  our?: string
): Array<[string, ContactMetadata]> => {
  const results: Array<[string, ContactMetadata]> = contacts;
  // results from urbit-ob
  if (isValidPatp(search)) {
    results.push([
      search,
      {
        color: '#000000',
        avatar: null,
        nickname: '',
        bio: '',
        cover: '',
      },
    ]);
  }
  // Results from rolodex
  const filtered: Array<[string, ContactMetadata]> = results.filter(
    (el: [string, ContactMetadata]) => {
      const patp = el[0].toLocaleLowerCase();
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
