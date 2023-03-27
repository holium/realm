import styled from 'styled-components';
import { Flex } from 'renderer/components';

export const ContainerFlex = styled(Flex)<{ focusBorder: string }>`
  background-color: rgba(var(--rlm-input-rgba));
  :focus-within {
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
