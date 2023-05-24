import { Button, Flex } from '@holium/design-system/general';

import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountDialogDescription } from '../components/AccountDialog.styles';
import { JoinWaitlist } from '../components/JoinWaitlist';
import { OrDivider } from '../components/OrDivider';
import { GetIdIcon } from '../icons/GetIdIcon';

type Props = {
  onClickGetHosting: () => void;
  onClickBuyIdentity: () => void;
  onClickJoinWaitlist: (email: string) => Promise<boolean>;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountGetRealmDialog = ({
  onClickGetHosting,
  onClickBuyIdentity,
  onClickJoinWaitlist,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={[]}
    selectedIdentity={''}
    setSelectedIdentity={() => {}}
    currentSection={SidebarSection.GetRealm}
    customBody={
      <Flex flex={5}>
        <Flex
          width="100%"
          maxWidth="300px"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={16}
          margin="32px auto"
        >
          <GetIdIcon />
          <Button.Primary onClick={onClickGetHosting}>Get an ID</Button.Primary>
          <OrDivider maxWidth="180px" />
          <JoinWaitlist onClickJoinWaitlist={onClickJoinWaitlist} />
          <AccountDialogDescription style={{ fontSize: 12 }}>
            Sign up for the waitlist if you aren’t hosted on Holium.
          </AccountDialogDescription>
        </Flex>
      </Flex>
    }
    onClickBuyIdentity={onClickBuyIdentity}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
