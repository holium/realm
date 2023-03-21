export interface MSTAction {
  name: string;
  path: string;
  args: any[];
}
export interface ShipInfoType {
  url: string;
  cookie: string;
  theme?: any;
  wallpaper?: string;
  color?: string | null;
  nickname?: string;
  avatar?: string;
  loggedIn?: boolean;
}

export interface PostType {
  index: string;
  author: string;
  'time-sent': number;
  signatures: any[];
  contents: any[];
  hash: string;
}
// common
export type Patp = string;
//
//
// sur/spaces.hoon
export type SpacePath = string;
export type SpaceAccess = 'public' | 'antechamber' | 'private';
export type SpaceArchetype =
  | 'home'
  | 'tribe'
  | 'creator-dao'
  | 'service-dao'
  | 'investment-dao';
export type SpaceType = 'group' | 'space' | 'our';
//
export interface Invite {
  inviter: Patp;
  path: SpacePath;
  role: MemberRole;
  message: string;
  name: string;
  type: SpaceType;
  invitedAt: Date;
}
export interface SpaceInvitations {
  [patp: Patp]: Invite;
}
export interface IncomingInvitations {
  [path: SpacePath]: Invite;
}
export interface OutgoingInvitations {
  [path: SpacePath]: Members;
}
export interface Invitations {
  incoming: IncomingInvitations;
  outgoing: OutgoingInvitations;
}
//
//
// sur/membership.hoon
export type MemberRole = 'initiate' | 'member' | 'admin' | 'owner';
export type MemberStatus = 'invited' | 'joined' | 'host';
export interface Member {
  roles: MemberRole[];
  status: MemberStatus;
  patp: string;
}
export interface Members {
  [patp: Patp]: Member;
}
export interface Membership {
  [path: SpacePath]: Members;
}

export type RealmInstallationStatus = {
  result: 'success' | 'partial' | 'error';
  desks: string[] | undefined;
  installedDesks: string[] | undefined;
  errorMessage: string | undefined;
};

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
