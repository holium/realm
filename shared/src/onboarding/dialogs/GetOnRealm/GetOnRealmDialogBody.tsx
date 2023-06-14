import { Button, Flex, Text } from '@holium/design-system/general';

import { GrayButton } from '../../components/ChangeButton';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';

type Props = {
  onBuyAnId: () => void;
  onMigrateAnId: () => void;
};

export const GetRealmDialogBody = ({ onBuyAnId, onMigrateAnId }: Props) => (
  <Flex flexDirection="column" gap="32px">
    <Flex flexDirection="column" gap="16px">
      <OnboardDialogTitle>Get on Realm</OnboardDialogTitle>
      <OnboardDialogDescription>
        Get instant access to Realm by purchasing or importing an ID to Holium
        hosting.
      </OnboardDialogDescription>
    </Flex>
    <Flex flex={1} gap="12px">
      <Button.Primary
        type="button"
        style={{ width: '200px', height: '36px', justifyContent: 'center' }}
        onClick={onBuyAnId}
      >
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
      <GrayButton
        type="button"
        style={{ width: '200px', height: '36px', justifyContent: 'center' }}
        onClick={onMigrateAnId}
      >
        <Text.Body
          style={{
            fontWeight: 500,
            color: 'inherit',
            margin: '2px',
          }}
        >
          Migrate ID
        </Text.Body>
      </GrayButton>
    </Flex>
  </Flex>
);
