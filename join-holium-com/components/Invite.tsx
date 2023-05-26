import React from 'react';

export type InviteProps = {
  id: string;
  from: string;
  space: {
    name: string;
  };
};

type Props = {
  invite: InviteProps;
};

export const Invite = ({ invite }: Props) => (
  <div>
    <h2>Invite to{invite.space.name}</h2>
    <small>ID: {invite.id}</small>
    <small>From: {invite.from}</small>
  </div>
);
