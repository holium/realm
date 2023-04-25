import { Flex } from '@holium/design-system';
import styled from 'styled-components';

export const ContainerFlex = styled(Flex)`
  background-color: rgba(var(--rlm-input-rgba));
  :focus-within {
    border: 1px solid rgba(var(--rlm-input-rgba));
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
