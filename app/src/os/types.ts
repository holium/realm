export type Patp = string;

// sur/membership.hoon
export type MemberRole = 'initiate' | 'member' | 'admin' | 'owner';
export type MemberStatus = 'invited' | 'joined' | 'host';

export type MediaAccessStatus =
  | 'not-determined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unknown';

export type MediaAccess = {
  camera: MediaAccessStatus;
  mic: MediaAccessStatus;
};
