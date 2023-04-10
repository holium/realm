import { ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Text, Flex, Spinner } from '@holium/design-system';

const ButtonText = styled(Text.Body)`
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  color: rgba(var(--rlm-accent-rgba));
  user-select: none;
`;

type Props = {
  text: string;
  submitting: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  onSubmit?: () => void;
};

export const SubmitButton = ({
  submitting,
  text,
  icon,
  disabled,
  onSubmit,
}: Props) => (
  <Button.TextButton
    as="button"
    padding="5px 8px"
    disabled={submitting || disabled}
    position="relative"
    onClick={onSubmit}
  >
    <Flex opacity={submitting ? 0 : 1}>
      <ButtonText>{text}</ButtonText>
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
