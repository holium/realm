import { useFormikContext } from 'formik';
import styled from 'styled-components';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { RealmInstallStatus } from '../../types/index';

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

type InstallRealmFields = {
  installed: boolean;
  installing: boolean;
};

type Props = {
  onInstallRealm: () => Promise<RealmInstallStatus>;
};

export const InstallationDialogBody = ({ onInstallRealm }: Props) => {
  const {
    values: { installed, installing },
    setFieldValue,
  } = useFormikContext<InstallRealmFields>();

  const handleInstallRealm = async () => {
    if (installing || installed) return;

    setFieldValue('installing', true);

    const result: RealmInstallStatus = await onInstallRealm();
    if (result.success) setFieldValue('installed', true);

    setFieldValue('installing', false);
  };

  const buttonText = () => {
    if (installed) return 'Installed';
    if (installing) return 'Installing...';
    return 'Install Realm';
  };

  const buttonIcon = () => {
    if (installed) return <Icon name="CheckCircle" size={24} />;
    if (installing) return <Spinner size="20px" />;
    return <Icon name="DownloadCircle" size={24} />;
  };

  return (
    <>
      <OnboardDialogTitle>Installation</OnboardDialogTitle>
      <OnboardDialogDescription maxWidth={380}>
        We need to install Realm as an agent on your server. It handles core OS
        functionality.
      </OnboardDialogDescription>
      <InstallRealmButton
        type="button"
        color={installed ? 'intent-success' : 'accent'}
        disabled={installing}
        onClick={handleInstallRealm}
      >
        {buttonText()}
        <Flex width={24} height={24} justifyContent="center">
          {buttonIcon()}
        </Flex>
      </InstallRealmButton>
    </>
  );
};
