import { FC, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { NewWalletScreen } from './index';
import { PasscodeInput } from '../../../components/PasscodeInput';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface PasscodeProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  correctPasscode: number[];
}

export const ConfirmPasscode: FC<PasscodeProps> = observer(
  (props: PasscodeProps) => {
    const { theme } = useServices();

    return (
      <>
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <Flex flexDirection="column">
            <Text variant="h5">Confirm passcode</Text>
            <Text mt={3} variant="body">
              Please retype your passcode to confirm.
            </Text>
          </Flex>
          <Flex alignItems="center">
            <PasscodeInput
              checkAgainst={props.correctPasscode}
              onSuccess={() => {
                props.setScreen(NewWalletScreen.FINALIZING);
                WalletActions.watchUpdates();
              }}
            />
          </Flex>
        </Flex>
        <Flex
          position="absolute"
          top="582px"
          zIndex={999}
          onClick={() => props.setScreen(NewWalletScreen.PASSCODE)}
        >
          <Icons
            name="ArrowLeftLine"
            size={2}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
      </>
    );
  }
);
