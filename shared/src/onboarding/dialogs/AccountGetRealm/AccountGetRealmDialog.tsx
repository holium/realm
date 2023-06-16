import { Button, Flex } from '@holium/design-system/general';

import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { GrayButton } from '../../components/ChangeButton';
import { JoinWaitlist } from '../../components/JoinWaitlist';
import { OrDivider } from '../../components/OrDivider';
import { GetIdIcon } from '../../icons/GetIdIcon';

type Props = {
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickJoinWaitlist: (email: string) => Promise<boolean>;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountGetRealmDialog = ({
  onClickPurchaseId,
  onClickUploadId,
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
            <GrayButton onClick={onClickUploadId}>Upload ID</GrayButton>
          </Flex>
          <OrDivider maxWidth="180px" />
          <JoinWaitlist onClickJoinWaitlist={onClickJoinWaitlist} />
          <AccountDialogDescription style={{ fontSize: 12 }}>
            Join the waitlist if you don't want to host with Holium.
          </AccountDialogDescription>
        </Flex>
      </Flex>
    }
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
