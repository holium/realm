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

import { OnboardingStorage } from '../onboarding';
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
  identities: string[];
  selectedIdentity: string;
  currentSection?: SidebarSection;
  children?: ReactNode;
  customBody?: ReactNode;
  isLoading?: boolean;
  isUploadedIdentity: boolean;
  onClickUploadId: () => void;
  onClickPurchaseId: () => void;
  setSelectedIdentity: (patp: string) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onSubmit?: () => void;
  onExit: () => void;
};

export const AccountDialog = ({
  identities,
  selectedIdentity,
  currentSection,
  children,
  customBody,
  isLoading,
  isUploadedIdentity,
  onClickUploadId,
  onClickPurchaseId,
  setSelectedIdentity,
  onClickSidebarSection,
  onSubmit,
  onExit,
}: Props) => {
  const hasShips = identities ? identities.length > 0 : false;
  const hasCSEK = useToggle(false);

  let sidebarItems: SidebarSection[] = [];

  if (hasShips) {
    if (isUploadedIdentity) {
      sidebarItems = [
        SidebarSection.Hosting,
        SidebarSection.CustomDomain,
        SidebarSection.DownloadRealm,
      ];
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
                options={identities.map((patp) => ({
                  value: patp,
                  label: patp,
                }))}
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
                selected={selectedIdentity}
                onClick={(newPatp) => setSelectedIdentity(newPatp)}
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
      identities={[]}
      selectedIdentity=""
      currentSection={currentSection}
      isLoading
      isUploadedIdentity={false}
      customBody={isBlankBody ? <Flex flex={5} /> : undefined}
      setSelectedIdentity={() => {}}
      onClickPurchaseId={() => {}}
      onClickUploadId={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  );
};
