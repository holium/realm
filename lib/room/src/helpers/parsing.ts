import { Patp } from '../types';

export const providerFromRid = (rid: string) => {
  return rid.split('/')[0];
};

export const ridFromTitle = (provider: Patp, title: string) => {
  const slugified = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-');
  return `${provider}/${slugified}/${Date.now().toString(36).substring(0, 10)}`;
};
