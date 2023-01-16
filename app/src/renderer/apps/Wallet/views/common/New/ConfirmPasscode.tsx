import { FC, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';
import { NewWalletScreen } from './index';
import { PasscodeInput } from '../../../components/PasscodeInput';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface PasscodeProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  correctPasscode: number[];
  seedPhrase: string;
}

export const ConfirmPasscode: FC<PasscodeProps> = observer(
  (props: PasscodeProps) => {
    return (
      <Flex width="100%" height="100%" flexDirection="column" flex={5}>
        <Flex flex={1} flexDirection="column">
          <Flex gap={12} flexDirection="column">
            <Text variant="h5">Confirm passcode</Text>
            <Text variant="body">Please retype your passcode to confirm.</Text>
          </Flex>
        </Flex>
        <Flex flex={4} justifyContent="center" alignItems="center">
          <PasscodeInput
            checkAgainst={props.correctPasscode}
            onSuccess={() => {
              props.setScreen(NewWalletScreen.FINALIZING);
              // WalletActions.setMnemonic(props.seedPhrase, props.correctPasscode);
              WalletActions.watchUpdates();
            }}
          />
        </Flex>
      </Flex>
    );
  }
);
