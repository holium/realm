import { FormEvent, ReactNode } from 'react';

import { Flex, Spinner } from '@holium/design-system/general';

import { ThirdEarthShip } from '../onboarding';
import {
  AccountDialogCard,
  AccountDialogInnerCard,
  AccountDialogSubtitle,
  AccountDialogTitle,
} from './AccountDialog.styles';
import { AccountDialogSidebar, SidebarSection } from './AccountDialogSidebar';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId?: number;
  currentSection?: SidebarSection;
  children?: ReactNode;
  customBody?: ReactNode;
  isLoading?: boolean;
  setSelectedShipId: (shipId: number) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onSubmit?: () => void;
  onExit: () => void;
};

export const AccountDialog = ({
  ships,
  selectedShipId,
  currentSection,
  children,
  customBody,
  isLoading,
  setSelectedShipId,
  onClickSidebarSection,
  onSubmit,
  onExit,
}: Props) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <AccountDialogCard onSubmit={handleSubmit}>
      <AccountDialogSidebar
        ships={ships}
        selectedShipId={selectedShipId}
        currentSection={currentSection}
        isLoading={isLoading}
        setSelectedShipId={setSelectedShipId}
        onClickSidebarSection={onClickSidebarSection}
        onExit={onExit}
      />
      {customBody}
      {!customBody && (
        <AccountDialogInnerCard as="div">
          <Flex width="100%" height="100%" flexDirection="column" gap="22.5px">
            <Flex flexDirection="column">
              <AccountDialogSubtitle>Account</AccountDialogSubtitle>
              <AccountDialogTitle>{currentSection}</AccountDialogTitle>
            </Flex>
            {isLoading ? (
              <Flex flex={1} justifyContent="center" alignItems="center">
                <Spinner size={8} />
              </Flex>
            ) : (
              children
            )}
          </Flex>
        </AccountDialogInnerCard>
      )}
    </AccountDialogCard>
  );
};

type AccountDialogSkeletonProps = {
  currentSection?: SidebarSection;
};

export const AccountDialogSkeleton = ({
  currentSection,
}: AccountDialogSkeletonProps) => {
  return (
    <AccountDialog
      ships={[]}
      selectedShipId={0}
      currentSection={currentSection}
      isLoading
      customBody={undefined}
      setSelectedShipId={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  );
};
