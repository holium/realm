import { FormEvent, ReactNode, useState } from 'react';
import styled from 'styled-components';

import { Card, ErrorBox, Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import { SubmitButton } from '@holium/shared';

const SettingSectionForm = styled.form`
  display: flex;
  flex-direction: column;
`;

type SettingSectionProps = {
  body: ReactNode;
  title?: string;
  elevation?: 0 | 1 | 2 | 3 | 4;
  onSubmit?: () => void;
};
export const SettingSection = ({
  body,
  title,
  elevation = 1,
  onSubmit,
}: SettingSectionProps) => {
  const submitting = useToggle(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitting.toggleOn();
    setErrorMessage(null);

    // Unfocus all inputs.
    (document.activeElement as HTMLElement)?.blur();

    try {
      const successfull = await onSubmit?.();
      if (!successfull) throw new Error('Something went wrong.');
    } catch (error: any) {
      if (typeof error === 'string') setErrorMessage(error);
      else if (error.message) setErrorMessage(error.message);
      else setErrorMessage('Something went wrong.');

      submitting.toggleOff();
    }
  };

  return (
    <SettingSectionForm onSubmit={onSubmit ? handleSubmit : undefined}>
      {title && (
        <Text.Custom
          fontSize={2}
          textTransform="uppercase"
          fontWeight={500}
          opacity={0.4}
          mb="8px"
          mt="4px"
          ml="2px"
        >
          {title}
        </Text.Custom>
      )}
      <Card p={3} elevation={elevation}>
        <Flex flexDirection="column" gap={16}>
          {body}
          {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
          {onSubmit && (
            <Flex justifyContent="flex-end">
              <SubmitButton text="Save" submitting={submitting.isOn} />
            </Flex>
          )}
        </Flex>
      </Card>
    </SettingSectionForm>
  );
};
