import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { ChangeButtonGray } from '../../components/ChangeButton';
import { TABLET_WIDTH } from '../../components/OnboardDialog.styles';
import { maintenanceWindows, maintenanceWindowToString } from '../util';

const ChangeMaintenanceWindowContainer = styled(Flex)`
  width: 100%;
  height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${TABLET_WIDTH}px) {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

type Props = {
  maintenanceWindow: number;
  onClick: () => void;
};

export const ChangeMaintenanceWindow = ({
  maintenanceWindow,
  onClick,
}: Props) => (
  <ChangeMaintenanceWindowContainer>
    <Flex flexDirection="column">
      <AccountDialogDescription style={{ fontSize: 13 }}>
        Your maintenance window is scheduled for:
      </AccountDialogDescription>
      <AccountDialogDescription style={{ fontSize: 13 }}>
        {maintenanceWindowToString(maintenanceWindows[maintenanceWindow])}
      </AccountDialogDescription>
    </Flex>
    <ChangeButtonGray type="button" onClick={onClick}>
      Change
    </ChangeButtonGray>
  </ChangeMaintenanceWindowContainer>
);
