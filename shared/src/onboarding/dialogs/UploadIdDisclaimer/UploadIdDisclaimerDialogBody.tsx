import { useFormikContext } from 'formik';

import { Anchor, Flex, Text } from '@holium/design-system/general';
import { CheckBox } from '@holium/design-system/inputs';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

type UploadIdDisclaimerFields = {
  iHaveRead: boolean;
};

export const UploadIdDisclaimerDialogBody = () => {
  const {
    values: { iHaveRead },
    setFieldValue,
  } = useFormikContext<UploadIdDisclaimerFields>();

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
          <b>Migrating an ID</b>
        </OnboardDialogDescription>
        <OnboardDialogDescription>
          This option is for people who want to move their existing pier with
          all of its apps, subscriptions, and configurations to Holium hosting.
        </OnboardDialogDescription>
      </Flex>
      <OnboardDialogDescription>
        <b>Requires:</b> A compressed archive of your existing pier in a .zip or
        .tar.gz format which was created after the ship was shut down at its
        current location.
      </OnboardDialogDescription>
      <GrayBox>
        <Flex>
          <CheckBox
            isChecked={iHaveRead}
            onChange={() => setFieldValue('iHaveRead', !iHaveRead)}
          />
          <Flex flex={1} flexDirection="column">
            <Text.Body>
              I have read through the{' '}
              <Anchor>
                <u>migration guide</u>
              </Anchor>{' '}
              and understand that I must have my Urbit updated to the latest
              vere and latest OTA.
            </Text.Body>
          </Flex>
        </Flex>
      </GrayBox>
      <OnboardDialogDescription
        style={{
          fontWeight: 500,
          textAlign: 'center',
          color: 'var(--rlm-intent-alert-color)',
        }}
      >
        IF THE PIER IS OUT OF DATE, IT WILL NOT START PROPERLY IN OUR SYSTEM.
      </OnboardDialogDescription>
    </Flex>
  );
};
