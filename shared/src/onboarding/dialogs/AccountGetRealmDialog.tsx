import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../components/AccountDialog.styles';

const BulletPoint = styled(Flex)`
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(var(--rlm-accent-rgba));
  background: rgba(var(--rlm-accent-rgba), 0.12);
`;

const BulletPointRow = styled(Flex)`
  align-items: center;
  gap: 12px;
`;

type Props = {
  onClickGetHosting: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountGetRealmDialog = ({
  onClickGetHosting,
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
          maxWidth="346px"
          flexDirection="column"
          justifyContent="center"
          gap={16}
          margin="32px auto"
        >
          <AccountDialogTitle
            textAlign="center"
            style={{
              fontSize: '20px',
              lineHeight: '24px',
              marginBottom: '18px',
            }}
          >
            There are 3 ways to get Realm access during the alpha.
          </AccountDialogTitle>
          <AccountDialogDescription>
            <BulletPointRow>
              <BulletPoint>1</BulletPoint>
              <div>
                All{' '}
                <u style={{ cursor: 'pointer' }} onClick={onClickGetHosting}>
                  Holium hosting
                </u>{' '}
                members get Realm access.
              </div>
            </BulletPointRow>
          </AccountDialogDescription>
          <AccountDialogDescription>
            <BulletPointRow>
              <BulletPoint>2</BulletPoint>
              All prior ThirdEarth users get Realm access.
            </BulletPointRow>
          </AccountDialogDescription>
          <AccountDialogDescription>
            <BulletPointRow>
              <BulletPoint>3</BulletPoint>
              Join the waitlist and engage with us on Twitter.
            </BulletPointRow>
          </AccountDialogDescription>
        </Flex>
      </Flex>
    }
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
