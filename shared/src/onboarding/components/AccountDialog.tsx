import { FormEvent, ReactNode } from 'react';
import {
  Button,
  Flex,
  HoliumButton,
  Icon,
  Select,
} from '@holium/design-system';
import {
  AccountDialogCard,
  AccountDialogSidebar,
  AccountDialogSidebarMenu,
  AccountDialogSidebarMenuItemText,
  AccountDialogInnerCard,
  AccountDialogTitle,
  AccountDialogSubtitle,
} from './AccountDialog.styles';

export enum SidebarSection {
  Hosting = 'Hosting',
  S3Storage = 'S3 Storage',
  Statistics = 'Statistics',
  CustomDomain = 'Custom Domain',
  DownloadRealm = 'Download Realm',
}

type Props = {
  patps: string[];
  selectedPatp: string;
  currentSection: SidebarSection;
  children?: ReactNode;
  customBody?: ReactNode;
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
  setSelectedPatp,
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
      <AccountDialogSidebar>
        <Flex flexDirection="column" gap="25px">
          <HoliumButton size={26} pointer={false} />
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
        </Flex>
        <AccountDialogSidebarMenu>
          {Object.values(SidebarSection).map((section) => (
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
            {children}
          </Flex>
        </AccountDialogInnerCard>
      )}
    </AccountDialogCard>
  );
};
