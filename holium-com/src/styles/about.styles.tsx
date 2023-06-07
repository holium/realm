import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

export const Section = styled(Flex)`
  flex-direction: column;
  gap: 16px;
`;

export const SectionTitle = styled(Text.H2)`
  font-weight: 300;
  opacity: 0.7;
`;
