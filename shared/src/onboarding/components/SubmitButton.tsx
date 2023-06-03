import { ReactNode } from 'react';

import { Button, Flex, Spinner } from '@holium/design-system/general';

import { OnboardDialogButtonText } from './OnboardDialog.styles';

type Props = {
  text: string;
  submitting: boolean;
  icon?: ReactNode;
  form?: string;
  disabled?: boolean;
  onSubmit?: () => void;
};

export const SubmitButton = ({
  submitting,
  text,
  icon,
  form,
  disabled,
  onSubmit,
}: Props) => (
  <Button.TextButton
    form={form}
    as="button"
    type="submit"
    padding="5px 8px"
    disabled={submitting || disabled}
    position="relative"
    onClick={onSubmit}
  >
    <Flex opacity={submitting ? 0 : 1}>
      <OnboardDialogButtonText>{text}</OnboardDialogButtonText>
      {icon}
    </Flex>
    {submitting && (
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        style={{
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Spinner size={0} />
      </Flex>
    )}
  </Button.TextButton>
);
