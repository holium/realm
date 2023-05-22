import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../components/PasscodeInput';

type Props = {
  onClickBack: () => void;
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
};

export const DeleteWalletScreen = ({
  onClickBack,
  checkPasscode,
  onSuccess,
}: Props) => (
  <Flex width="100%" height="100%" flexDirection="column">
    <Button.IconButton size={26} onClick={onClickBack}>
      <Icon name="ArrowLeftLine" size={24} opacity={0.7} />
    </Button.IconButton>
    <Flex
      flex={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Flex flexDirection="column" alignItems="center" gap="24px">
        <Icon name="Locked" size={36} />
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="12px"
        >
          <Text.H3 color="intent-alert">Confirm Delete</Text.H3>
          <Text.Body variant="body">Enter your passcode to continue.</Text.Body>
        </Flex>
        <Flex flexDirection="column" alignItems="center">
          <PasscodeInput
            checkStored
            checkPasscode={checkPasscode}
            onSuccess={onSuccess}
          />
        </Flex>
      </Flex>
    </Flex>
  </Flex>
);
