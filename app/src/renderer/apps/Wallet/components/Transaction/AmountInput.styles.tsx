import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

export const ContainerFlex = styled(Flex)`
  flex: 1;
  gap: 4px;
  min-width: 0;
  background-color: rgba(var(--rlm-input-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 6px;
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
