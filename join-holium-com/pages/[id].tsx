import { Space, SpaceInvite } from '@prisma/client';
import { GetStaticProps } from 'next';

import { Flex } from '@holium/design-system/general';
import { ThemeType } from '@holium/shared';

import { InviteCard } from '../components/InviteCard';
import { GlobalStyle } from '../lib/globalStyle';
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
  const theme: ThemeType = JSON.parse(invite.space.theme);

  return (
    <Flex
      width="100%"
      height="100vh"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <GlobalStyle theme={theme} />
      <InviteCard invite={invite} />
    </Flex>
  );
};

export default InvitePage;
