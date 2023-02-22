import { RefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Flex } from 'general/Flex/Flex';
import { Text } from 'general/Text/Text';
import { Icon } from 'general/Icon/Icon';

const blankSvgJsxElement = <Icon name="CheckboxBlank" color="icon" />;
const blankSvgString = renderToStaticMarkup(blankSvgJsxElement);
const checkedSvgJsxElement = <Icon name="CheckboxChecked" color="accent" />;
const checkedSvgString = renderToStaticMarkup(checkedSvgJsxElement);

const CheckBoxInput = styled(motion.input)`
  width: 24px;
  height: 24px;
  background-color: transparent;
  outline: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,${blankSvgString}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 18px 18px;

  &:checked {
    background-image: url('data:image/svg+xml;utf8,${checkedSvgString}');
  }
`;

type Props = {
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  innerRef?: RefObject<HTMLInputElement>;
};

export const CheckBox = ({
  label,
  disabled,
  defaultChecked,
  innerRef,
}: Props) => (
  <Flex alignItems="center" gap={4}>
    <CheckBoxInput
      type="checkbox"
      disabled={disabled}
      defaultChecked={defaultChecked}
      ref={innerRef}
    />
    <Text.Label display="flex" alignItems="center" color={'text'}>
      {label}
    </Text.Label>
  </Flex>
);
