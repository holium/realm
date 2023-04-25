import { useEffect, useState } from 'react';
import { Box, Flex, Spinner, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { useShipStore } from 'renderer/stores/ship.store';

import { PasscodeDisplay } from './PasscodeDisplay';

const PASSCODE_LENGTH = 6;

interface PasscodeInputProps {
  onSuccess: any;
  checkStored?: boolean;
  checkAgainst?: number[];
  onError?: any;
  keepLoading?: boolean;
}

export const PasscodeInputPresenter = (props: PasscodeInputProps) => {
  const { walletStore } = useShipStore();
  const [inputCode, setInputCode] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const listener = async (event: KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (inputCode.length) {
        setInputCode(inputCode.slice(0, inputCode.length - 1));
        setError(false);
      }
      return;
    }

    const digit = Number(event.key);
    if (inputCode.length >= PASSCODE_LENGTH || isNaN(digit)) return;

    const newInputCode = [...inputCode, digit];
    setInputCode(newInputCode);

    if (newInputCode.length === PASSCODE_LENGTH) {
      let codeIsCorrect = true;
      if (props.checkStored) {
        setLoading(true);
        codeIsCorrect = await walletStore.checkPasscode(newInputCode);
        if (!props.keepLoading) {
          setLoading(false);
        }
      } else if (props.checkAgainst) {
        codeIsCorrect =
          props.checkAgainst.toString() === newInputCode.toString();
      }

      if (codeIsCorrect) {
        props.onSuccess(newInputCode);
      } else {
        setError(true);
        setInputCode([]);
        props.onError && props.onError();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [inputCode]);

  return (
    <Flex flexDirection="column" alignItems="center">
      <PasscodeDisplay digits={6} filled={inputCode.length} />
      <Flex mt={4} width="80%" justifyContent="center">
        <Box hidden={!loading}>
          <Spinner size={1} />
        </Box>
        <Box hidden={!error}>
          <Text.Body variant="body" fontSize={1}>
            That passcode was incorrect.
          </Text.Body>
        </Box>
      </Flex>
    </Flex>
  );
};

export const PasscodeInput = observer(PasscodeInputPresenter);
