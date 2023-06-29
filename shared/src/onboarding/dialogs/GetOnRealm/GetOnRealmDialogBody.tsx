import { Anchor, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import {
  ButtonsContainer,
  ButtonText,
  PurchaseIdButton,
  UploadIdButton,
} from './GetOnRealmDialogBody.styles';

type Props = {
  onUploadId: () => void;
  onPurchaseId: () => void;
  onAlreadyHaveAccount?: () => void;
};

export const GetRealmDialogBody = ({
  onUploadId,
  onPurchaseId,
  onAlreadyHaveAccount,
}: Props) => (
  <Flex flexDirection="column" gap="32px">
    <Flex flexDirection="column" gap="16px">
      <OnboardDialogTitle>Get on Realm</OnboardDialogTitle>
      <OnboardDialogDescription>
        Get instant access to Realm by purchasing or uploading an ID to Holium
        hosting.
      </OnboardDialogDescription>
    </Flex>
    <ButtonsContainer>
      <PurchaseIdButton type="button" onClick={onPurchaseId}>
        <ButtonText>Purchase ID</ButtonText>
      </PurchaseIdButton>
      <UploadIdButton type="button" onClick={onUploadId}>
        <ButtonText>Upload ID</ButtonText>
      </UploadIdButton>
    </ButtonsContainer>
    {onAlreadyHaveAccount && (
      <OnboardDialogDescription>
        Already have an account?{' '}
        <Anchor onClick={onAlreadyHaveAccount}>Log in</Anchor>.
      </OnboardDialogDescription>
    )}
  </Flex>
);