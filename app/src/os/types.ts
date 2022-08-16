export type MSTAction = {
  name: string;
  path: string;
  args: any[];
};
export type ShipInfoType = {
  url: string;
  cookie: string;
  theme?: any;
  wallpaper?: string;
  color?: string | null;
  nickname?: string;
  avatar?: string;
  loggedIn?: boolean;
};

export type PostType = {
  index: string;
  author: string;
  'time-sent': number;
  signatures: any[];
  contents: any[];
  hash: string;
};
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
export type Invite = {
  inviter: Patp;
  path: SpacePath;
  role: MemberRole;
  message: string;
  name: string;
  type: SpaceType;
  invitedAt: Date;
};
export type SpaceInvitations = {
  [patp: Patp]: Invite;
};
export type IncomingInvitations = {
  [path: SpacePath]: Invite;
};
export type OutgoingInvitations = {
  [path: SpacePath]: Members;
};
export type Invitations = {
  incoming: IncomingInvitations;
  outgoing: OutgoingInvitations;
};
//
//
// sur/membership.hoon
export type MemberRole = 'initiate' | 'member' | 'admin' | 'owner';
export type MemberStatus = 'invited' | 'joined' | 'host';
export type Member = {
  roles: MemberRole[];
  status: MemberStatus;
};
export type Members = {
  [patp: Patp]: Member;
};
export type Membership = {
  [path: SpacePath]: Members;
};

// sur/passports.hoon
