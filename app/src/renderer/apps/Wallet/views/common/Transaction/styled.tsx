import styled from 'styled-components';
import { Flex } from 'renderer/components';

/* @ts-expect-error */
export const ContainerFlex = styled(Flex)<ContainerFlexProps>`
  background-color: var(--rlm-input-color);
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
