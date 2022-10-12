import styled from 'styled-components';
import { Flex } from 'renderer/components';

interface InputProps {
  mode: 'light' | 'dark';
}
export const Input = styled.input<InputProps>`
  -webkit-appearance: none;
  width: ${(props) => (props.width ? props.width : '100px;')};
  background-color: inherit;
  border: 0;
  color: ${(props) =>
    props.mode === 'light' ? '#333333' : '#ffffff'} !important;
  outline: none;
  :focus {
    outline: none !important;
  }
`;

/* @ts-ignore */
export const ContainerFlex = styled(Flex)<ContainerFlexProps>`
  :focus-within {
    /* @ts-ignore */
    border: 1px solid ${(props) => props.focusBorder};
  }
`;

export const FlexHider = styled(Flex)`
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const NoScrollBar = styled(Flex)`
::-webkit-scrollbar {
  display: none;
}
`;
