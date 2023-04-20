import styled from 'styled-components';
import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import {
  OnboardDialogTitle,
  OnboardDialogDescription,
} from '../components/OnboardDialog.styles';
import { DownloadIcon } from '../icons/DownloadIcon';
import { OnboardDialog } from '../components/OnboardDialog';

const InstallRealmButton = styled(Button.TextButton)`
  position: relative;
  width: 201px;
  margin-top: 12px;
  padding: 10px 8px;
  font-weight: 500;
  font-size: 16px;
  justify-content: space-between;
  border-radius: 4px;
`;

type Props = {
  onInstallRealm: () => Promise<boolean>;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const InstallationDialog = ({
  onInstallRealm,
  onBack,
  onNext,
}: Props) => {
  const installing = useToggle(false);
  const successfullInstall = useToggle(false);

  const handleInstallRealm = async () => {
    installing.toggleOn();

    const result = await onInstallRealm();
    if (result) successfullInstall.toggleOn();

    installing.toggleOff();
  };

  return (
    <OnboardDialog
      icon={<DownloadIcon />}
      body={
        <Flex flexDirection="column" gap={16} marginBottom={30}>
          <OnboardDialogTitle>Installation</OnboardDialogTitle>
          <OnboardDialogDescription maxWidth={380}>
            We need to install Realm as an agent on your server. It handles core
            OS functionality.
          </OnboardDialogDescription>
          <InstallRealmButton
            type="button"
            disabled={installing.isOn}
            onClick={handleInstallRealm}
          >
            Install Realm
            {installing.isOn ? (
              <Flex width={24} height={24} justifyContent="center">
                <Spinner size="20px" />
              </Flex>
            ) : (
              <Icon name="DownloadCircle" size={24} />
            )}
          </InstallRealmButton>
        </Flex>
      }
      onBack={onBack}
      onNext={!installing.isOn && successfullInstall.isOn ? onNext : undefined}
    />
  );
};
