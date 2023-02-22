import { RefObject } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Box } from '../../general/Box/Box';
import { Text } from '../../general/Text/Text';

type Props = {
  label: string;
  disabled?: boolean;
  innerRef?: RefObject<HTMLInputElement>;
};

const CheckBoxInput = styled(motion.input)`
  width: 14px;
  height: 14px;
  color: var(--rlm-text-color);
  background-color: transparent;
  outline: none;
  border: 2px solid var(--rlm-border-color);
  border-radius: var(--rlm-border-radius-4);
`;

export const CheckBox = ({ label, disabled, innerRef }: Props) => (
  <Box display="flex">
    <Box mr={2}>
      <CheckBoxInput type="checkbox" disabled={disabled} ref={innerRef} />
    </Box>
    <Text.Label display="flex" alignItems="center" color={'text'}>
      {label}
    </Text.Label>
  </Box>
);
