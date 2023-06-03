export type CreateSpaceInvitePayload = {
  from: string;
  space: {
    name: string;
    path: string;
    description: string;
    membersCount: number;
    picture: string | null;
    color: string;
    theme: string;
  };
};

export type CreateSpaceInviteResponse = {
  inviteUrl: string;
};

export type DeleteAllSpaceInvitesPayload = {
  path: string;
};
