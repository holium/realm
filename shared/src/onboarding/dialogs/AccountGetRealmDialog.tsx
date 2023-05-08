import styled from 'styled-components';

import { Button, Flex } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountDialogDescription } from '../components/AccountDialog.styles';
import { GetIdIcon } from '../icons/GetIdIcon';

const DividerSection = styled.div`
  width: 100%;
  max-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Divider = styled.div`
  flex: 1;
  height: 1px;
  margin: 20px auto;
  background-color: var(--rlm-icon-color);
  opacity: 0.3;
`;

type Props = {
  onClickGetHosting: () => void;
  onClickBuyServer: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountGetRealmDialog = ({
  onClickGetHosting,
  onClickBuyServer,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={[]}
    selectedPatp={''}
    setSelectedPatp={() => {}}
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
          <DividerSection>
            <Divider />
            <AccountDialogDescription>or</AccountDialogDescription>
            <Divider />
          </DividerSection>

          <TextInput
            id="waitlist-email"
            name="waitlist-email"
            type="email"
            placeholder="Email"
            width="100%"
            rightAdornment={
              <Button.TextButton>Join waitlist</Button.TextButton>
            }
          />
          <AccountDialogDescription style={{ fontSize: 12 }}>
            Sign up for the waitlist if you aren’t hosted on Holium.
          </AccountDialogDescription>
        </Flex>
      </Flex>
    }
    onClickBuyServer={onClickBuyServer}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
