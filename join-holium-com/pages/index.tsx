import React from 'react';
import { GetStaticProps } from 'next';

import { Invite, InviteProps } from '../components/Invite';

export const getStaticProps: GetStaticProps = async () => {
  const invites = [
    {
      id: '1',
      from: '~lomder-librun',
      space: {
        name: 'Realm Forerunners',
      },
    },
  ];
  return {
    props: { invites },
    revalidate: 10,
  };
};

type Props = {
  invites: InviteProps[];
};

const Home = ({ invites }: Props) => {
  return (
    <div>
      <h1>Invites</h1>
      <main>
        {invites.map((invite) => (
          <div key={invite.id}>
            <Invite invite={invite} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;
