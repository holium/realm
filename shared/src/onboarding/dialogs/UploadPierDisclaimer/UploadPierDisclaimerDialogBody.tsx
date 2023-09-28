import { useFormikContext } from 'formik';

import { Anchor, Flex, Text } from '@holium/design-system/general';
import { CheckBox } from '@holium/design-system/inputs';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

type UploadPierDisclaimerFields = {
  iHaveRead: boolean;
};

export const UploadPierDisclaimerDialogBody = () => {
  const {
    values: { iHaveRead },
    setFieldValue,
  } = useFormikContext<UploadPierDisclaimerFields>();

  return (
    <Flex
      flexDirection="column"
      gap={20}
      marginBottom={30}
      maxWidth={540}
      alignSelf="center"
    >
      <OnboardDialogTitle>Disclaimer</OnboardDialogTitle>
      <Flex flexDirection="column" gap={8}>
        <OnboardDialogDescription>
          <b>Uploading Pier with SFTP</b>
        </OnboardDialogDescription>
        <OnboardDialogDescription>
          This option is for technical users who want to move their existing
          pier with all of its apps, subscriptions, and configurations to Holium
          hosting, as opposed to purchasing a fresh ID.
        </OnboardDialogDescription>
      </Flex>
      <OnboardDialogDescription>
        <b>Required:</b> A compressed archive of your existing pier in a{' '}
        <code>.zip</code> or <code>.tar.gz</code> format which was created after
        the ship was shut down at its current location.
      </OnboardDialogDescription>
      <GrayBox>
        <Flex>
          <CheckBox
            isChecked={iHaveRead}
            onChange={() => setFieldValue('iHaveRead', !iHaveRead)}
          />
          <Flex flex={1} flexDirection="column">
            <Text.Body>
              I have read through{' '}
              <Anchor
                href="https://docs.holium.com/realm/hosting/sftp-byop"
                target="_blank"
              >
                <u>the SFTP guide</u>
              </Anchor>
              .
            </Text.Body>
          </Flex>
        </Flex>
      </GrayBox>
    </Flex>
  );
};
