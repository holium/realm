import { FormEvent, ReactNode, useEffect } from 'react';

import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { Select } from '@holium/design-system/inputs';
import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { OnboardingStorage, ThirdEarthShip } from '../onboarding';
import {
  AccountDialogCard,
  AccountDialogInnerCard,
  AccountDialogSidebar,
  AccountDialogSidebarMenu,
  AccountDialogSidebarMenuItemText,
  AccountDialogSubtitle,
  AccountDialogTitle,
} from './AccountDialog.styles';

export enum SidebarSection {
  Hosting = 'Hosting',
  Storage = 'Storage',
  CustomDomain = 'Custom Domain',
  DownloadRealm = 'Download Realm',
  GetHosting = 'Get Hosting',
  GetRealm = 'Get Realm',
}

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId?: number;
  currentSection?: SidebarSection;
  children?: ReactNode;
  customBody?: ReactNode;
  isLoading?: boolean;
  onClickUploadId: () => void;
  onClickPurchaseId: () => void;
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
  onClickUploadId,
  onClickPurchaseId,
  setSelectedShipId,
  onClickSidebarSection,
  onSubmit,
  onExit,
}: Props) => {
  const hasShips = ships ? ships.length > 0 : false;
  const hasCSEK = useToggle(false);

  let sidebarItems: SidebarSection[] = [];

  if (hasShips) {
    const selectedShip = ships.find((ship) => ship.id === selectedShipId);
    const isUploadedIdentity = selectedShip?.product_type === 'byop-p';
    const isFinishedUploading = selectedShip?.ship_type === 'planet';

    if (isUploadedIdentity) {
      if (isFinishedUploading) {
        sidebarItems = [
          SidebarSection.Hosting,
          SidebarSection.CustomDomain,
          SidebarSection.DownloadRealm,
        ];
      } else {
        sidebarItems = [SidebarSection.Hosting];
      }
    } else {
      sidebarItems = [
        SidebarSection.Hosting,
        SidebarSection.Storage,
        SidebarSection.CustomDomain,
        SidebarSection.DownloadRealm,
      ];
    }
  } else if (hasCSEK.isOn) {
    sidebarItems = [SidebarSection.DownloadRealm, SidebarSection.GetHosting];
  } else {
    sidebarItems = [SidebarSection.GetRealm, SidebarSection.GetHosting];
  }

  useEffect(() => {
    hasCSEK.setToggle(Boolean(OnboardingStorage.get().clientSideEncryptionKey));
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const onClickHoliumButton = () => {
    window.location.href = 'https://holium.com';
  };

  return (
    <AccountDialogCard onSubmit={handleSubmit}>
      <AccountDialogSidebar>
        <Flex flexDirection="column" gap="25px">
          <HoliumButton size={26} onClick={onClickHoliumButton} />
          {isLoading && (
            <Flex flexDirection="column" gap="2px">
              <AccountDialogSidebarMenuItemText isOpen={false}>
                ID
              </AccountDialogSidebarMenuItemText>
              <Skeleton height={32} />
            </Flex>
          )}
          {hasShips && !isLoading && (
            <Flex flexDirection="column" gap="2px">
              <AccountDialogSidebarMenuItemText isOpen={false}>
                ID
              </AccountDialogSidebarMenuItemText>
              <Select
                id="ship-selector"
                options={ships.map(({ id, patp, title, product_type }) => {
                  return {
                    value: id,
                    label:
                      product_type === 'byop-p' ? `${title} - ID: ${id}` : patp,
                  };
                })}
                extraSection={
                  <Flex
                    flexDirection="column"
                    mt="8px"
                    pt="8px"
                    gap="8px"
                    borderTop="1px solid rgba(var(--rlm-border-rgba))"
                  >
                    <Button.Transparent width="100%" onClick={onClickUploadId}>
                      <Flex alignItems="center" gap="8px">
                        <Icon name="ArrowRightLine" size={16} />
                        <Text.Body>Upload ID</Text.Body>
                      </Flex>
                    </Button.Transparent>
                    <Button.Transparent
                      width="100%"
                      onClick={onClickPurchaseId}
                    >
                      <Flex alignItems="center" gap="8px">
                        <Icon name="AddCircleLine" size={16} />
                        <Text.Body>Purchase ID</Text.Body>
                      </Flex>
                    </Button.Transparent>
                  </Flex>
                }
                selected={selectedShipId}
                onClick={(newId) => setSelectedShipId(newId as number)}
              />
            </Flex>
          )}
        </Flex>
        <AccountDialogSidebarMenu>
          {sidebarItems.map((section) => (
            <AccountDialogSidebarMenuItemText
              key={section}
              isOpen={section === currentSection}
              onClick={() => onClickSidebarSection(section)}
            >
              {section}
            </AccountDialogSidebarMenuItemText>
          ))}
        </AccountDialogSidebarMenu>
        <Button.Transparent style={{ padding: 0 }} onClick={onExit}>
          <Icon fill="text" opacity={0.5} name="RoomLeave" size={20} />
        </Button.Transparent>
      </AccountDialogSidebar>
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
  const isBlankBody =
    currentSection &&
    [SidebarSection.GetRealm, SidebarSection.DownloadRealm].includes(
      currentSection
    );

  return (
    <AccountDialog
      ships={[]}
      selectedShipId={0}
      currentSection={currentSection}
      isLoading
      customBody={isBlankBody ? <Flex flex={5} /> : undefined}
      setSelectedShipId={() => {}}
      onClickPurchaseId={() => {}}
      onClickUploadId={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  );
};
