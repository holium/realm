import styled from 'styled-components';
import { Flex } from '../../';

const Row = styled(Flex)`
  position: relative;

  flex-direction: row;
  align-items: center;
  width: inherit;
`;

const Col = styled(Flex)`
  position: relative;

  flex-direction: column;
  align-items: center;
  width: inherit;
`;

export const Layout = { Row, Col };
