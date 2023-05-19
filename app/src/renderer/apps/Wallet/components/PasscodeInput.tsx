import { useEffect, useState } from 'react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { PasscodeDisplay } from './PasscodeDisplay';

const PASSCODE_LENGTH = 6;

type Props = {
  checkStored?: boolean;
  checkAgainst?: number[];
  onClickForgotPasscode?: () => void;
  checkPasscode: (code: number[]) => Promise<boolean>;
  onError?: () => void;
  onSuccess: (code: number[]) => Promise<void>;
};

export const PasscodeInput = ({
  checkStored,
  checkAgainst,
  onClickForgotPasscode,
  checkPasscode,
  onError,
  onSuccess,
}: Props) => {
  const [inputCode, setInputCode] = useState<number[]>([]);

  const loading = useToggle(false);
  const error = useToggle(false);

  const onKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (inputCode.length) {
        setInputCode(inputCode.slice(0, inputCode.length - 1));
        error.toggleOff();
      }
      return;
    }

    const digit = Number(event.key);
    if (inputCode.length >= PASSCODE_LENGTH || isNaN(digit)) return;

    const newInputCode = [...inputCode, digit];
    setInputCode(newInputCode);

    const timeToCheckPasscode = newInputCode.length === PASSCODE_LENGTH;
    if (timeToCheckPasscode) {
      let codeIsCorrect = true;
      loading.toggleOn();

      if (checkStored) {
        codeIsCorrect = await checkPasscode(newInputCode);
      } else if (checkAgainst) {
        codeIsCorrect = checkAgainst.toString() === newInputCode.toString();
      }

      if (codeIsCorrect) {
        await onSuccess(newInputCode);

        error.toggleOff();
      } else {
        error.toggleOn();

        setInputCode([]);
        onError && onError();
      }

      loading.toggleOff();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [inputCode]);

  return (
    <Flex flexDirection="column" alignItems="center">
      <PasscodeDisplay digits={6} filled={inputCode.length} />
      <Flex mt={4} flexDirection="column" justifyContent="center">
        {loading.isOn && <Spinner size={3} />}
        {!loading.isOn && onClickForgotPasscode && (
          <Button.Transparent onClick={onClickForgotPasscode}>
            <Text.Label opacity={0.5}>Forgot passcode?</Text.Label>
          </Button.Transparent>
        )}
        {error.isOn && (
          <Text.Body color="intent-alert" fontSize={1}>
            That passcode was incorrect.
          </Text.Body>
        )}
      </Flex>
    </Flex>
  );
};
