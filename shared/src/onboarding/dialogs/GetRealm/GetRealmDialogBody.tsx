import { Button, Flex, Text } from '@holium/design-system/general';

import { GrayButton } from '../../components/ChangeButton';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { OrDivider } from '../../components/OrDivider';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GrayBox } from './GetRealmDialogBody.styles';

type Props = {
  onPurchaseId: () => void;
  onUploadPier: () => void;
};

export const GetRealmDialogBody = ({ onPurchaseId, onUploadPier }: Props) => (
  <>
    <OnboardDialogTitle style={{ marginTop: -29 }}>
      Congratulations, you're on the waitlist!
    </OnboardDialogTitle>
    <OnboardDialogDescription>
      We'll notify you as soon as we open up capacity.{' '}
    </OnboardDialogDescription>
    <OrDivider maxWidth="90%" />
    <GrayBox>
      <Flex flex={1} alignItems="center" justifyContent="center" gap="16px">
        <Flex flexDirection="column" gap="16px" alignItems="center">
          <OnboardDialogDescription>Want in now?</OnboardDialogDescription>
          <Flex gap="12px">
            <Button.Primary type="button" onClick={onPurchaseId}>
              <Text.Body
                style={{
                  fontWeight: 500,
                  color: 'inherit',
                  margin: '2px',
                }}
              >
                Purchase ID
              </Text.Body>
            </Button.Primary>
            <GrayButton onClick={onUploadPier}>
              <Text.Body
                style={{
                  fontWeight: 500,
                  color: 'inherit',
                  margin: '2px',
                }}
              >
                Upload Pier
              </Text.Body>
            </GrayButton>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        flex={1}
        alignItems="center"
        justifyContent="center"
        className="hideonmobile"
      >
        <GetIdIcon size={240} />
      </Flex>
    </GrayBox>
  </>
);
