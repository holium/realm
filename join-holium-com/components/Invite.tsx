import React from 'react';
import { Space, SpaceInvite } from '@prisma/client';

export type InviteProps = {
  id: string;
  from: string;
  space: {
    name: string;
  };
};

type Props = {
  invite: SpaceInvite & {
    space: Space;
  };
};

export const Invite = ({ invite }: Props) => (
  <div>
    <h2>Invite to{invite.space.name}</h2>
    <small>ID: {invite.id}</small>
    <small>From: {invite.from}</small>
  </div>
);
