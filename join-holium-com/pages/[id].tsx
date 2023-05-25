import { Space, SpaceInvite } from '@prisma/client';
import { GetStaticProps } from 'next';

import { Invite } from '../components/Invite';
import prisma from '../lib/prisma';

export const getServerSideProps: GetStaticProps = async ({ params }) => {
  const inviteId = params?.id as string;

  if (!inviteId) {
    return { notFound: true };
  }

  const invite = await prisma.spaceInvite.findUnique({
    where: {
      id: params?.id as string,
    },
    include: {
      space: true,
    },
  });

  if (!invite) {
    return { notFound: true };
  }

  return { props: { invite: JSON.parse(JSON.stringify(invite)) } };
};

type Props = {
  invite: SpaceInvite & {
    space: Space;
  };
};

const InvitePage = ({ invite }: Props) => {
  return (
    <div>
      <h1>Invite</h1>
      <main>
        <div key={invite.id}>
          <Invite invite={invite} />
        </div>
      </main>
    </div>
  );
};

export default InvitePage;
