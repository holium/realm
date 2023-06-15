import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import {
  ButtonsContainer,
  ButtonText,
  MigrateIdButton,
  PurchaseIdButton,
} from './GetOnRealmDialogBody.styles';

type Props = {
  onMigrateId: () => void;
  onPurchaseId: () => void;
};

export const GetRealmDialogBody = ({ onMigrateId, onPurchaseId }: Props) => (
  <Flex flexDirection="column" gap="32px">
    <Flex flexDirection="column" gap="16px">
      <OnboardDialogTitle>Get on Realm</OnboardDialogTitle>
      <OnboardDialogDescription>
        Get instant access to Realm by purchasing or importing an ID to Holium
        hosting.
      </OnboardDialogDescription>
    </Flex>
    <ButtonsContainer>
      <PurchaseIdButton type="button" onClick={onPurchaseId}>
        <ButtonText>Purchase ID</ButtonText>
      </PurchaseIdButton>
      <MigrateIdButton type="button" onClick={onMigrateId}>
        <ButtonText>Migrate ID</ButtonText>
      </MigrateIdButton>
    </ButtonsContainer>
  </Flex>
);
