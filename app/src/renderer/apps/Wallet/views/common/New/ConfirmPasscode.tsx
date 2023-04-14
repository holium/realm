import { FC, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from '@holium/design-system';
import { NewWalletScreen } from './index';
import { PasscodeInput } from '../../../components/PasscodeInput';

interface PasscodeProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  correctPasscode: number[];
  onSuccess: any;
  // seedPhrase: string;
}

export const ConfirmPasscode: FC<PasscodeProps> = observer(
  (props: PasscodeProps) => {
    return (
      <Flex width="100%" height="100%" flexDirection="column" flex={5}>
        <Flex flex={1} flexDirection="column">
          <Flex gap={12} flexDirection="column">
            <Text.H5 variant="h5">Confirm passcode</Text.H5>
            <Text.Body variant="body">
              Please retype your passcode to confirm.
            </Text.Body>
          </Flex>
        </Flex>
        <Flex flex={4} justifyContent="center" alignItems="center">
          <PasscodeInput
            checkAgainst={props.correctPasscode}
            onSuccess={(passcode: number[]) => {
              props.onSuccess(passcode);
              props.setScreen(NewWalletScreen.FINALIZING);
            }}
          />
        </Flex>
      </Flex>
    );
  }
);
