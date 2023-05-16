import { useEffect, useState } from 'react';

import { Box, Flex, Spinner, Text } from '@holium/design-system/general';

import { PasscodeDisplay } from './PasscodeDisplay';

const PASSCODE_LENGTH = 6;

type Props = {
  checkStored?: boolean;
  checkAgainst?: number[];
  keepLoading?: boolean;
  checkPasscode: (code: number[]) => Promise<boolean>;
  onError?: () => void;
  onSuccess: (code: number[]) => void;
};

export const PasscodeInput = ({
  checkStored,
  checkAgainst,
  keepLoading,
  checkPasscode,
  onError,
  onSuccess,
}: Props) => {
  const [inputCode, setInputCode] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onKeyDown = async (event: KeyboardEvent) => {
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
      if (checkStored) {
        setLoading(true);
        codeIsCorrect = await checkPasscode(newInputCode);
        if (!keepLoading) {
          setLoading(false);
        }
      } else if (checkAgainst) {
        codeIsCorrect = checkAgainst.toString() === newInputCode.toString();
      }

      if (codeIsCorrect) {
        onSuccess(newInputCode);
        setError(false);
      } else {
        setError(true);
        setInputCode([]);
        onError && onError();
      }
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
      <Flex mt={4} width="80%" justifyContent="center">
        <Box hidden={!loading}>
          <Spinner size={1} />
        </Box>
        {error && (
          <Text.Body color="intent-alert" fontSize={1}>
            That passcode was incorrect.
          </Text.Body>
        )}
      </Flex>
    </Flex>
  );
};
