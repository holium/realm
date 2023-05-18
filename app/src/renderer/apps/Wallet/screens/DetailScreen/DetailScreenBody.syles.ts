import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system';

export const BreadCrumb = styled(Text.Body)`
  transition: var(--transition);

  &:hover {
    transition: var(--transition);
    text-decoration: underline;
  }
`;

export const AddressStyle = styled(Flex)`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 7px;
  gap: 6px;
  background: rgba(var(--rlm-overlay-hover-rgba));
`;
