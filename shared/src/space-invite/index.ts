export type CreateSpaceInvitePayload = {
  from: string;
  space: {
    name: string;
    description: string;
    membersCount: number;
    picture: string;
    theme: string;
  };
};

export type CreateSpaceInviteResponse = {
  inviteUrl: string;
};
