import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Box, Spinner, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { PasscodeDisplay } from './PasscodeDisplay';

const PASSCODE_LENGTH = 6;

interface PasscodeInputProps {
  onSuccess: any;
  checkStored?: boolean;
  checkAgainst?: number[];
  onError?: any;
  keepLoading?: boolean;
}

export const PasscodeInput: FC<PasscodeInputProps> = observer(
  (props: PasscodeInputProps) => {
    const [inputCode, setInputCode] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const { theme } = useServices();
    const baseTheme = getBaseTheme(theme.currentTheme);

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
          codeIsCorrect = await WalletActions.checkPasscode(newInputCode);
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
            <Text
              variant="body"
              fontSize={1}
              color={baseTheme.colors.text.error}
            >
              That passcode was incorrect.
            </Text>
          </Box>
        </Flex>
      </Flex>
    );
  }
);

export default PasscodeInput;
