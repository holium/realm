import { FormEvent, ReactNode } from 'react';
import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Spinner,
} from '@holium/design-system/general';
import { Select } from '@holium/design-system/inputs';
import { HoliumButton } from '@holium/design-system/os';

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
  S3Storage = 'S3 Storage',
  Statistics = 'Statistics',
  CustomDomain = 'Custom Domain',
  DownloadRealm = 'Download Realm',
  GetHosting = 'Get Hosting',
}

type Props = {
  patps: string[];
  selectedPatp: string;
  currentSection?: SidebarSection;
  children?: ReactNode;
  customBody?: ReactNode;
  isLoading?: boolean;
  setSelectedPatp: (patp: string) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onSubmit?: () => void;
  onExit: () => void;
};

export const AccountDialog = ({
  patps,
  selectedPatp,
  currentSection,
  children,
  customBody,
  isLoading,
  setSelectedPatp,
  onClickSidebarSection,
  onSubmit,
  onExit,
}: Props) => {
  const hasShips = patps ? patps.length > 0 : false;

  const sidebarItems =
    hasShips || isLoading
      ? [
          SidebarSection.Hosting,
          SidebarSection.S3Storage,
          SidebarSection.Statistics,
          SidebarSection.CustomDomain,
          SidebarSection.DownloadRealm,
        ]
      : [SidebarSection.GetHosting, SidebarSection.DownloadRealm];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const onClickHoliumButton = () => {
    window.open('https://holium.com', '_blank');
  };

  return (
    <AccountDialogCard onSubmit={handleSubmit}>
      <AccountDialogSidebar>
        <Flex flexDirection="column" gap="25px">
          <HoliumButton size={26} onClick={onClickHoliumButton} />
          {isLoading && (
            <Flex flexDirection="column" gap="2px">
              <AccountDialogSidebarMenuItemText isOpen={false}>
                Server ID
              </AccountDialogSidebarMenuItemText>
              <Skeleton height={32} />
            </Flex>
          )}
          {hasShips && !isLoading && (
            <Flex flexDirection="column" gap="2px">
              <AccountDialogSidebarMenuItemText isOpen={false}>
                Server ID
              </AccountDialogSidebarMenuItemText>
              <Select
                id="ship-selector"
                options={patps.map((patp) => ({
                  value: patp,
                  label: patp,
                }))}
                selected={selectedPatp}
                onClick={(newPatp) => setSelectedPatp(newPatp)}
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
        <Button.Transparent onClick={onExit}>
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
}: AccountDialogSkeletonProps) => (
  <AccountDialog
    patps={[]}
    selectedPatp=""
    currentSection={currentSection}
    isLoading
    setSelectedPatp={() => {}}
    onClickSidebarSection={() => {}}
    onExit={() => {}}
  />
);
