import { Button, Flex } from '@holium/design-system/general';

import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { GrayButton } from '../../components/ChangeButton';
import { JoinWaitlist } from '../../components/JoinWaitlist';
import { OrDivider } from '../../components/OrDivider';
import { GetIdIcon } from '../../icons/GetIdIcon';

type Props = {
  onClickPurchaseId: () => void;
  onClickMigrateId: () => void;
  onClickJoinWaitlist: (email: string) => Promise<boolean>;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountGetRealmDialog = ({
  onClickPurchaseId,
  onClickMigrateId,
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
          <Flex gap="12px">
            <Button.Primary onClick={onClickPurchaseId}>
              Purchase ID
            </Button.Primary>
            <GrayButton onClick={onClickMigrateId}>Migrate ID</GrayButton>
          </Flex>
          <OrDivider maxWidth="180px" />
          <JoinWaitlist onClickJoinWaitlist={onClickJoinWaitlist} />
          <AccountDialogDescription style={{ fontSize: 12 }}>
            Join waitlist if you don't want to host with Holium.
          </AccountDialogDescription>
        </Flex>
      </Flex>
    }
    onClickPurchaseId={onClickPurchaseId}
    onClickMigrateId={onClickMigrateId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
