import { useEffect } from 'react';

import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from '@holium/design-system/general';
import { Select } from '@holium/design-system/inputs';
import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { OnboardingStorage, ThirdEarthShip } from '../onboarding';
import {
  AccountDialogSidebarContainer,
  AccountDialogSidebarMenu,
  AccountDialogSidebarMenuItemText,
} from './AccountDialogSidebar.styles';

export enum SidebarSection {
  Hosting = 'Hosting',
  Storage = 'Storage',
  CustomDomain = 'Custom Domain',
  DownloadRealm = 'Download Realm',
  CryptoPayment = 'Crypto Payment',
  GetHosting = 'Get Hosting',
  GetRealm = 'Get Realm',
  ContactSupport = 'Contact Support',
}

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId?: number;
  currentSection?: SidebarSection;
  isLoading?: boolean;
  onClickUploadId: () => void;
  onClickPurchaseId: () => void;
  setSelectedShipId: (shipId: number) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountDialogSidebar = ({
  ships,
  selectedShipId,
  currentSection,
  isLoading,
  onClickUploadId,
  onClickPurchaseId,
  setSelectedShipId,
  onClickSidebarSection,
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
          SidebarSection.ContactSupport,
        ];
      } else {
        sidebarItems = [SidebarSection.Hosting, SidebarSection.ContactSupport];
      }
    } else {
      sidebarItems = [
        SidebarSection.Hosting,
        SidebarSection.Storage,
        SidebarSection.CustomDomain,
        SidebarSection.DownloadRealm,
        SidebarSection.ContactSupport,
        SidebarSection.CryptoPayment,
      ];
    }
  } else if (hasCSEK.isOn) {
    sidebarItems = [
      SidebarSection.DownloadRealm,
      SidebarSection.GetHosting,
      SidebarSection.ContactSupport,
    ];
  } else {
    sidebarItems = [
      SidebarSection.GetRealm,
      SidebarSection.GetHosting,
      SidebarSection.ContactSupport,
    ];
  }

  useEffect(() => {
    hasCSEK.setToggle(Boolean(OnboardingStorage.get().clientSideEncryptionKey));
  }, []);

  const onClickHoliumButton = () => {
    window.location.href = 'https://holium.com';
  };

  return (
    <AccountDialogSidebarContainer>
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
              options={ships.map(
                ({ id, patp, title, product_type, ship_type }) => {
                  const isUnfinishedByop =
                    product_type === 'byop-p' && ship_type !== 'planet';

                  return {
                    value: id,
                    label: isUnfinishedByop ? `${title} - ID: ${id}` : patp,
                  };
                }
              )}
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
                      <Text.Body>Upload Pier</Text.Body>
                    </Flex>
                  </Button.Transparent>
                  <Button.Transparent width="100%" onClick={onClickPurchaseId}>
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
    </AccountDialogSidebarContainer>
  );
};
